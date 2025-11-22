"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { WebContainer, FileSystemTree } from "@webcontainer/api";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/config";

type Status =
  | "idle"
  | "fetching"
  | "booting"
  | "mounting"
  | "installing"
  | "starting"
  | "ready"
  | "error";

interface LivePreviewProps {
  sessionId: string;
  enabled: boolean; // when false, defer boot & tear down
  refreshToken?: number; // manual refresh trigger only (no auto reload)
  /**
   * Optional callback that fires the first time the dev server reports "server-ready".
   * Used by the parent to safely trigger actions (like auto-refresh) only after
   * the preview environment has successfully booted at least once.
   */
  onFirstReady?: () => void;
}

export type LivePreviewHandle = {
  exportProject: (path?: string) => Promise<Uint8Array | null>;
};

/**
 * Recursively converts the API response structure into a WebContainer FileSystemTree.
 * The API returns nested objects where string values are file contents and objects are directories.
 */
function parseToFileSystemTree(obj: any): FileSystemTree {
  const tree: FileSystemTree = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // It's a file
      tree[key] = {
        file: {
          contents: value,
        },
      };
    } else if (typeof value === "object" && value !== null) {
      // It's a directory
      tree[key] = {
        directory: parseToFileSystemTree(value),
      };
    }
  }
  return tree;
}

// Global WebContainer instance storage to survive hot reloads and component remounts
let globalWebContainerInstance: WebContainer | null = null;

const LivePreview = forwardRef<LivePreviewHandle, LivePreviewProps>(
  ({ sessionId, enabled, refreshToken, onFirstReady }, ref) => {
  const wcRef = useRef<WebContainer | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [fileTree, setFileTree] = useState<FileSystemTree | null>(null);
  const devProcessRef = useRef<any>(null);
  const installProcessRef = useRef<any>(null);
  const bootPromiseRef = useRef<Promise<WebContainer> | null>(null);
  const [bootedOnce, setBootedOnce] = useState(false);
  // Track background hot reload so we don't block the UI
  const [isReloading, setIsReloading] = useState(false);
  // Prevent duplicate initial fetches if component re-mounts
  const startedRef = useRef(false);
  // Track last processed refresh token to prevent duplicate refreshes
  const lastRefreshTokenRef = useRef(0);
  // Track if refresh is in progress
  const refreshingRef = useRef(false);
  // Track whether we've already notified the parent that the dev server is ready
  const hasNotifiedFirstReadyRef = useRef(false);
  // Store functions in refs to avoid dependency issues
  const fetchFilesRef = useRef<typeof fetchFiles | null>(null);
  const ensureBootRef = useRef<typeof ensureBoot | null>(null);
  const { authorizedFetch } = useAuth();

  const sanitize = (chunk: string) =>
    chunk
      .replace(/\x1B\[[0-9;]*[A-Za-z]/g, "")
      .replace(/[\x1B\x07]/g, "")
      .replace(/[\r]/g, "")
      .trimEnd();

  const appendLog = (line: string) => {
    const clean = sanitize(line);
    if (clean) setLogs((l) => [...l, clean]);
  };

  // Preflight: ensure secure context and cross-origin isolation for WebContainer
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Early diagnostics to avoid opaque failures
    if (!window.isSecureContext) {
      const msg = "Preview requires a secure context (https or localhost).";
      setError(msg);
      appendLog(`✗ ${msg}`);
      return;
    }
    // crossOriginIsolated is required for WebContainer (SharedArrayBuffer)
    // Note: value is undefined in some older browsers; treat falsy as not isolated
    if (!(window as any).crossOriginIsolated) {
      const msg =
        "Preview requires cross-origin isolation (COOP/COEP). Ensure Next headers are applied and disable third-party scripts that lack CORP.";
      setError(msg);
      appendLog(`✗ ${msg}`);
    }
  }, []);

  // Fetch files from the API
  const fetchFiles = useCallback(
    async (force = false) => {
      // If we already have the file tree and not forcing, skip network
      if (fileTree && !force) {
        appendLog("⏭ Using cached file tree (skip fetch)");
        return fileTree;
      }

      const maxAttempts = 10;
      const retryDelayMs = 2500;

      setStatus("fetching");
      setError(null);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await authorizedFetch(
            `${API_BASE_URL}/v1/files/get-files`,
            {
              method: "GET",
              headers: {
                "x-session-id": sessionId,
              },
            }
          );

          if (response.status === 404) {
            appendLog(
              `⚠ Files not ready yet (attempt ${attempt}/${maxAttempts}). Retrying in ${
                retryDelayMs / 1000
              }s...`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            continue;
          }

          if (!response.ok) {
            throw new Error(
              `API request failed: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();
          if (!data.files) {
            throw new Error("Invalid API response: missing 'files' property");
          }
          const tree = parseToFileSystemTree(data.files);
          setFileTree(tree);
          appendLog("✓ Files fetched and parsed successfully");
          return tree;
        } catch (e: any) {
          const message = e?.message || String(e);

          if (attempt < maxAttempts) {
            appendLog(
              `⚠ Fetch error (attempt ${attempt}/${maxAttempts}): ${message}. Retrying in ${
                retryDelayMs / 1000
              }s...`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            continue;
          }

          setStatus("error");
          setError(message);
          appendLog(`✗ Fetch error: ${message}`);
          return null;
        }
      }

      return null;
    },
    [sessionId, fileTree, authorizedFetch]
  );

  const killProcesses = () => {
    try {
      installProcessRef.current?.kill?.();
    } catch (e) { /* ignore */ }
    try {
      devProcessRef.current?.kill?.();
    } catch (e) { /* ignore */ }
    installProcessRef.current = null;
    devProcessRef.current = null;
  };

  // Reset function to clean up WebContainer state (but keep the instance)
  const resetWebContainer = useCallback(async () => {
    appendLog("🔄 Resetting WebContainer state...");
    killProcesses();
    
    // Clear all state but keep the WebContainer instance
    setPreviewUrl(null);
    setFileTree(null);
    setStatus("idle");
    setError(null);
    setStarting(false);
    startedRef.current = false;
    setBootedOnce(false);
    appendLog("✓ WebContainer state reset (instance preserved)");
  }, []);

  // Centralized boot helper - always reuse global instance if available
  const ensureBoot = useCallback(async (): Promise<WebContainer> => {
    // First check: use window object (survives hot reloads)
    if ((window as any).__webcontainer_instance) {
      const instance = (window as any).__webcontainer_instance as WebContainer;
      appendLog("✓ Reusing WebContainer instance from window");
      wcRef.current = instance;
      globalWebContainerInstance = instance;
      setBootedOnce(true);
      return instance;
    }
    
    // Second check: use global instance if available
    if (globalWebContainerInstance) {
      appendLog("✓ Reusing global WebContainer instance");
      wcRef.current = globalWebContainerInstance;
      (window as any).__webcontainer_instance = globalWebContainerInstance;
      setBootedOnce(true);
      return wcRef.current;
    }
    
    // Third check: use ref if available
    if (wcRef.current) {
      appendLog("✓ Using existing WebContainer instance");
      globalWebContainerInstance = wcRef.current;
      (window as any).__webcontainer_instance = wcRef.current;
      return wcRef.current;
    }
    
    // Try to boot new instance
    if (!bootPromiseRef.current) {
      setStatus("booting");
      appendLog("Booting WebContainer...");
      bootPromiseRef.current = WebContainer.boot();
    } else {
      appendLog("⚠ Boot already in progress, awaiting existing promise");
    }
    
    try {
      wcRef.current = await bootPromiseRef.current;
      // Store globally for reuse (multiple storage locations for persistence)
      globalWebContainerInstance = wcRef.current;
      // Also store on window object to survive hot reloads
      (window as any).__webcontainer_instance = wcRef.current;
      appendLog("✓ WebContainer booted successfully");
      setBootedOnce(true);
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (msg.includes("Only a single WebContainer instance") || msg.includes("singleton")) {
        appendLog("⚠ Single-instance constraint detected - WebContainer already exists elsewhere");
        bootPromiseRef.current = null;
        
        // Try to find the existing instance through various means
        // Check if there's a way to access it through WebContainer API
        let existingInstance: WebContainer | null = null;
        
        // Method 1: Check if WebContainer has a static method to get instance
        try {
          if (typeof (WebContainer as any).getInstance === 'function') {
            existingInstance = await (WebContainer as any).getInstance();
            appendLog("✓ Found instance via getInstance()");
          }
        } catch {}
        
        // Method 2: Check window object for stored instance (most reliable)
        if (!existingInstance && (window as any).__webcontainer_instance) {
          existingInstance = (window as any).__webcontainer_instance;
          appendLog("✓ Found instance via window.__webcontainer_instance");
        }
        
        // Method 3: Check alternate window location
        if (!existingInstance && (window as any).__webcontainer) {
          existingInstance = (window as any).__webcontainer;
          appendLog("✓ Found instance via window.__webcontainer");
        }
        
        // Method 4: Use global instance if we have it
        if (!existingInstance && globalWebContainerInstance) {
          existingInstance = globalWebContainerInstance;
          appendLog("✓ Found instance via global storage");
        }
        
        if (existingInstance) {
          // We found an instance! Use it and store it everywhere
          wcRef.current = existingInstance;
          globalWebContainerInstance = existingInstance;
          (window as any).__webcontainer_instance = existingInstance;
          appendLog("✓ Reusing existing WebContainer instance");
          setBootedOnce(true);
          return wcRef.current;
        }
        
        // No instance found - we're stuck
        appendLog("⚠ Cannot access existing WebContainer instance");
        appendLog("💡 This usually happens after hot reload. Try 'Reset Preview' to recover.");
        
        // Set error but make it recoverable
        const errorMsg = "WebContainer instance exists but is inaccessible. Click 'Reset Preview' to recover.";
        setError(errorMsg);
        throw new Error(errorMsg);
      } else {
        // Provide clearer guidance for cross-origin isolation issues
        const lower = msg.toLowerCase();
        if (lower.includes("cross-origin") || lower.includes("sharedarraybuffer") || lower.includes("is not isolated")) {
          const help =
            "WebContainer needs cross-origin isolation. Verify COOP/COEP headers are present, remove third-party scripts in dev (e.g., analytics), and hard-reload.";
          appendLog(`✗ ${help}`);
          setError(help);
          throw new Error(help);
        }
        throw e;
      }
    }
    return wcRef.current!;
  }, []);
  
  // Update refs when functions are defined
  useEffect(() => {
    fetchFilesRef.current = fetchFiles;
    ensureBootRef.current = ensureBoot;
  }, [fetchFiles, ensureBoot]);

  const exportProject = useCallback(
    async (path = "/") => {
      try {
        const wc = await ensureBoot();
        if (!wc) throw new Error("WebContainer instance not available");
        appendLog(`⬇️ Exporting workspace at "${path}"...`);
        const data = await wc.export(path, { format: "zip" });
        if (!(data instanceof Uint8Array)) {
          appendLog("⚠ Export did not return zip data. Converting result to JSON.");
          const json = JSON.stringify(data, null, 2);
          return new TextEncoder().encode(json);
        }
        appendLog("✓ Export completed successfully");
        return data;
      } catch (e: any) {
        const message = e?.message || String(e);
        appendLog(`✗ Export failed: ${message}`);
        throw e;
      }
    },
    [ensureBoot]
  );

  useImperativeHandle(
    ref,
    () => ({
      exportProject,
    }),
    [exportProject]
  );

  // Start the WebContainer with fetched files
  const start = useCallback(async () => {
    if (!enabled) return; // guard: do not start until enabled
    // Prevent multiple simultaneous starts
    if (starting) {
      console.log("Start already in progress, skipping");
      return;
    }
    
    // If already ready, don't restart
    if (status === "ready" && previewUrl) {
      console.log("Already running, skipping");
      return;
    }
    
    // Guard against re-running if we've completed startup
    if (startedRef.current && status === "ready") {
      appendLog("⏭ Start skipped (already started and ready)");
      return;
    }

    setStarting(true);
    setError(null);
    try {
      // Fetch files first if not already loaded
      let tree = await fetchFiles();
      if (!tree) throw new Error("Failed to obtain file tree");

      // Ensure booted (centralized boot logic handles races)
      const wc = await ensureBoot();
  appendLog("↪ Proceeding after boot resolution");

      // Mount files
      setStatus("mounting");
      appendLog("Mounting file system...");
  await wc.mount(tree);
      appendLog("✓ Files mounted successfully");

      // Install dependencies
      // Note: npm ci can have issues in WebContainer, so we use npm install with specific flags
      setStatus("installing");
      appendLog("Installing dependencies (this may take 1-2 minutes)...");
      
      // Use npm install with flags that work well in WebContainer
      // --legacy-peer-deps: resolves peer dependency conflicts
      // --no-audit: skips audit to speed up install
      // --no-fund: skips funding messages
      const installProcess = await wc.spawn("npm", [
        "install",
        "--legacy-peer-deps",
        "--no-audit",
        "--no-fund"
      ]);
      installProcessRef.current = installProcess;
      
      // Capture install errors
      let installErrors = "";
      let installOutput = "";
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            appendLog(chunk);
            installOutput += chunk;
            const lower = chunk.toLowerCase();
            if (lower.includes("error") || lower.includes("warn") || lower.includes("failed")) {
              installErrors += chunk + "\n";
            }
          }
        })
      );

      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        const errorMsg = installErrors 
          ? `npm install failed: ${installErrors.slice(0, 500)}`
          : `npm install failed with exit code ${installExitCode}`;
        throw new Error(errorMsg);
      }
      
      // Verify critical packages are installed
      try {
        await wc.fs.readFile("node_modules/next/package.json");
        appendLog("✓ Dependencies installed successfully");
      } catch {
        throw new Error("npm install completed but next.js was not found in node_modules. Output: " + installOutput.slice(-300));
      }

      // Register server-ready handler BEFORE spawning dev server
      // This is critical to avoid race conditions (per WebContainer docs)
      wc.on("server-ready", (port, url) => {
        setStatus("ready");
        setPreviewUrl(url);
        // Clear reloading banner if we were in a hot reload cycle
        setIsReloading(false);
        appendLog(`✓ Dev server ready at ${url} (port ${port})`);
        // Notify parent exactly once that the preview environment is ready
        if (!hasNotifiedFirstReadyRef.current && onFirstReady) {
          hasNotifiedFirstReadyRef.current = true;
          try {
            onFirstReady();
          } catch (e) {
            console.error("[LivePreview] onFirstReady callback error", e);
          }
        }
      });

      // Start dev server with environment variables
      setStatus("starting");
      appendLog("Starting Next.js dev server...");
      const devProcess = await wc.spawn("npm", ["run", "dev"], {
        env: {
          __NEXT_DISABLE_MEMORY_WATCHER: "1",
          FORCE_COLOR: "1"
        }
      });
      devProcessRef.current = devProcess;
      
      // Capture both stdout and stderr
      let errorOutput = "";
      devProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            appendLog(chunk);
            // Capture error-like messages
            const lower = chunk.toLowerCase();
            if (lower.includes("error") || lower.includes("failed") || lower.includes("exception")) {
              errorOutput += chunk + "\n";
            }
          }
        })
      );

      // Monitor dev process exit (but don't block)
      devProcess.exit.then((code) => {
        if (code !== 0) {
          const errorMsg = errorOutput 
            ? `Dev server failed: ${errorOutput.slice(0, 500)}`
            : `Dev server exited unexpectedly with code ${code}`;
          setStatus("error");
          setError(errorMsg);
          appendLog(`✗ ${errorMsg}`);
        }
      });

    } catch (e: any) {
      setStatus("error");
      const errorMsg = e.message || e.toString() || "Unknown error occurred";
      setError(errorMsg);
      appendLog(`✗ Error: ${errorMsg}`);
      // Log the full error object for debugging
      if (e.stack) {
        appendLog(`Stack: ${e.stack}`);
      }
      console.error("WebContainer error:", e);
    } finally {
      setStarting(false);
      startedRef.current = true;
    }
  }, [starting, fetchFiles, enabled, ensureBoot]);

  const reset = useCallback(() => {
    killProcesses();
    // Clear all state
    setLogs([]);
    setError(null);
    setPreviewUrl(null);
    setFileTree(null);
    setStatus("idle");
    setStarting(false);
    startedRef.current = false;
    // Clear refs but don't null the WebContainer (singleton constraint)
    // Boot promise cleared to allow fresh retry
    bootPromiseRef.current = null;
  }, []);

  // Auto-start on mount - only run once
  // Attempt start whenever enabled flips true.
  useEffect(() => {
    if (enabled && !startedRef.current && !starting) {
      start();
    }
    // If disabled and container exists, tear it down to free resources.
    if (!enabled && wcRef.current) {
      console.log('[LivePreview] Disabling preview, tearing down WebContainer instance');
      reset();
    }
  }, [enabled, start, starting, reset]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      killProcesses();
      // Clear the ref but WebContainer singleton persists in browser session
      // Only full page reload truly resets it
      wcRef.current = null;
      startedRef.current = false;
    },
    []
  );
  // Manual refresh only: triggered when refreshToken changes (user clicked button)
  useEffect(() => {
    console.log('[LivePreview] Refresh effect running', { refreshToken, enabled, status, lastToken: lastRefreshTokenRef.current, refreshing: refreshingRef.current });
    
    if (!enabled) {
      console.log('[LivePreview] Refresh blocked: not enabled');
      return;
    }
    if (refreshToken === undefined || refreshToken === 0) {
      console.log('[LivePreview] Refresh blocked: invalid token', refreshToken);
      return;
    }
    // Prevent duplicate refresh if already processing or token unchanged
    if (refreshingRef.current) {
      console.log('[LivePreview] Refresh blocked: already refreshing');
      return;
    }
    if (lastRefreshTokenRef.current === refreshToken) {
      console.log('[LivePreview] Refresh blocked: duplicate token', { current: refreshToken, last: lastRefreshTokenRef.current });
      return;
    }
    
    console.log('[LivePreview] Refresh triggered!', { refreshToken, status, enabled });
    lastRefreshTokenRef.current = refreshToken;
    refreshingRef.current = true;
    
    appendLog(`🔄 Manual refresh triggered (#${refreshToken})`);
    (async () => {
      setIsReloading(true);
      setPreviewUrl(null); // Clear preview URL during refresh
      try {
        if (!fetchFilesRef.current || !ensureBootRef.current) {
          console.error('[LivePreview] Functions not ready yet');
          setIsReloading(false);
          refreshingRef.current = false;
          return;
        }
        console.log('[LivePreview] Fetching files for refresh...');
        const tree = await fetchFilesRef.current(true); // force refetch on manual refresh
        if (!tree) { 
          console.log('[LivePreview] Failed to fetch files');
          setIsReloading(false); 
          refreshingRef.current = false;
          return; 
        }
        console.log('[LivePreview] Files fetched, killing processes and remounting...');
        killProcesses();
        const wc = await ensureBootRef.current();
        await wc.mount(tree);
        appendLog("✓ Files remounted (manual refresh)");
        
        // Register server-ready handler BEFORE spawning dev server (critical for refresh)
        wc.on("server-ready", (port, url) => {
          setStatus("ready");
          setPreviewUrl(url);
          setIsReloading(false);
          refreshingRef.current = false;
          appendLog(`✓ Dev server ready at ${url} (port ${port}) after refresh`);
          // If this is the first time we've reached ready, notify parent
          if (!hasNotifiedFirstReadyRef.current && onFirstReady) {
            hasNotifiedFirstReadyRef.current = true;
            try {
              onFirstReady();
            } catch (e) {
              console.error("[LivePreview] onFirstReady callback error (refresh)", e);
            }
          }
        });
        
        setStatus("starting");
        appendLog("Starting Next.js dev server (refresh)...");
        const devProcess = await wc.spawn("npm", ["run", "dev"], {
          env: { __NEXT_DISABLE_MEMORY_WATCHER: "1", FORCE_COLOR: "1" }
        });
        devProcessRef.current = devProcess;
        let errorOutput = "";
        devProcess.output.pipeTo(new WritableStream({
          write(chunk) {
            appendLog(chunk);
            const lower = chunk.toLowerCase();
            if (lower.includes("error") || lower.includes("failed") || lower.includes("exception")) {
              errorOutput += chunk + "\n";
            }
          }
        }));
        devProcess.exit.then((code: number) => {
          if (code !== 0) {
            const errorMsg = errorOutput ? `Dev server failed after manual refresh: ${errorOutput.slice(0, 500)}` : `Dev server exited unexpectedly (manual refresh) code ${code}`;
            setStatus("error");
            setError(errorMsg);
            appendLog(`✗ ${errorMsg}`);
            setIsReloading(false);
            refreshingRef.current = false;
          } else {
            refreshingRef.current = false;
          }
        });
      } catch (e: any) {
        console.error('[LivePreview] Refresh error:', e);
        setStatus("error");
        const msg = e.message || String(e);
        setError(msg);
        appendLog(`✗ Manual refresh error: ${msg}`);
        setIsReloading(false);
        refreshingRef.current = false;
      }
    })();
  }, [refreshToken, enabled]);


  const statusLabel: Record<Status, string> = {
    idle: "Idle",
    fetching: "Fetching files...",
    booting: "Booting WebContainer...",
    mounting: "Mounting files...",
    installing: "Installing dependencies...",
    starting: "Starting dev server...",
    ready: "Ready",
    error: "Error",
  };

  const isLoading = status !== "ready" && !error && !isReloading;

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-8">
          <div className="flex flex-col items-center gap-6 max-w-2xl w-full">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-black dark:border-t-white rounded-full animate-spin"></div>
            </div>
            {/* Status text */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {statusLabel[status]}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Please wait while we prepare your preview
              </div>
            </div>
            {/* Show recent logs during installation and starting */}
            {(status === "installing" || status === "starting") && logs.length > 0 && (
              <div className="w-full mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-h-64 overflow-y-auto">
                <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {logs.slice(-20).join("\n")}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {isReloading && status === "ready" && !error && (
        <div className="absolute top-2 right-2 z-40 flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900/80 text-xs text-white dark:bg-white/80 dark:text-black shadow">
          <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
          <span>Hot reloading…</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-900">
          <div className="max-w-md p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Failed to load preview
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              {error}
            </p>
            <div className="flex flex-col gap-2">
              {error.includes("singleton") || error.includes("single WebContainer instance") || error.includes("inaccessible") ? (
                <>
                  <button
                    onClick={async () => {
                      console.log('[LivePreview] Reset Preview button clicked');
                      appendLog('🔄 Reset Preview clicked - attempting recovery...');
                      setError(null);
                      
                      // Kill any running processes first
                      killProcesses();
                      
                      // Try to find existing WebContainer instance through multiple methods BEFORE clearing state
                      let foundInstance: WebContainer | null = null;
                      
                      // Method 1: Check global storage (preserve it!)
                      if (globalWebContainerInstance) {
                        foundInstance = globalWebContainerInstance;
                        appendLog('✓ Found instance in global storage');
                      }
                      
                      // Method 2: Check window object (most reliable - survives hot reloads)
                      if (!foundInstance && (window as any).__webcontainer_instance) {
                        foundInstance = (window as any).__webcontainer_instance;
                        appendLog('✓ Found instance in window.__webcontainer_instance');
                        // Store it globally for future use
                        globalWebContainerInstance = foundInstance;
                      }
                      
                      // Method 2b: Check alternate window location
                      if (!foundInstance && (window as any).__webcontainer) {
                        foundInstance = (window as any).__webcontainer;
                        appendLog('✓ Found instance in window.__webcontainer');
                        // Store it globally and in standard location
                        globalWebContainerInstance = foundInstance;
                        (window as any).__webcontainer_instance = foundInstance;
                      }
                      
                      // Method 3: Check if WebContainer has getInstance
                      if (!foundInstance) {
                        try {
                          if (typeof (WebContainer as any).getInstance === 'function') {
                            foundInstance = await (WebContainer as any).getInstance();
                            appendLog('✓ Found instance via getInstance()');
                            globalWebContainerInstance = foundInstance;
                          }
                        } catch (e: any) {
                          appendLog(`⚠ getInstance() failed: ${e.message}`);
                        }
                      }
                      
                      // Method 4: Check wcRef (might still have it)
                      if (!foundInstance && wcRef.current) {
                        foundInstance = wcRef.current;
                        appendLog('✓ Found instance in wcRef');
                        globalWebContainerInstance = foundInstance;
                      }
                      
                      if (foundInstance) {
                        // We found an instance! Use it
                        appendLog('✓ Reusing existing WebContainer instance');
                        wcRef.current = foundInstance;
                        globalWebContainerInstance = foundInstance;
                        bootPromiseRef.current = null;
                        setBootedOnce(true);
                        
                        // Clear state but keep the instance
                        setPreviewUrl(null);
                        setFileTree(null);
                        setStatus("idle");
                        setStarting(false);
                        startedRef.current = false;
                        
                        // Now retry the start process with the existing instance
                        setTimeout(() => {
                          if (enabled) {
                            appendLog('↻ Retrying with existing instance...');
                            start();
                          } else {
                            appendLog('⚠ Preview not enabled, waiting for first message...');
                          }
                        }, 100);
                      } else {
                        // No instance found - clear state and show error
                        appendLog('✗ Cannot find existing WebContainer instance');
                        await resetWebContainer();
                        setError("Cannot recover: WebContainer instance is inaccessible. Please reload the page.");
                      }
                    }}
                    className="px-6 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                  >
                    Reset Preview
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-lg bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 hover:opacity-90 transition text-sm"
                  >
                    Reload Page (last resort)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    reset();
                    if (enabled) {
                      appendLog('↻ Manual retry triggered');
                      // Give state a tick to settle before start
                      setTimeout(() => start(), 150);
                    }
                  }}
                  className="px-6 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!enabled && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
          Waiting for first message...
        </div>
      )}
      {previewUrl && enabled && (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          title="Live Preview"
          className="w-full h-full border-0"
        />
      )}
    </div>
  );
  }
);

export default LivePreview;
