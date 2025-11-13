Next.js In-Browser Development with WebContainers
This guide explains how to set up a fully functional Next.js development environment running entirely in the browser using StackBlitz WebContainers. Using WebContainers, you can spin up a Node.js server (like Next.js) inside a browser tab, eliminating the need for a backend or cloud VM[1]. We will walk through embedding a Next.js project preview into a web page – from initial project setup and dependency installation to launching the Next.js development server with hot reloading – all within an embedded WebContainer. The result will be a live Next.js preview running in an <iframe> on your site, with changes hot-reloading instantly as you edit the code.
Table of Contents:
Project Setup in WebContainers
Installing Next.js and Dependencies
Running the Dev Server
Setting Up Hot Reloading
File System Management
Embedding the WebContainer into a Web Page
Tips for Performance and Troubleshooting
Project Setup in WebContainers
To embed a Next.js project in your site via WebContainers, start by adding the WebContainer API to your project. Install the @webcontainer/api package (via npm or Yarn) and import it into your embedding page or application[2]. This API gives you programmatic control to boot a WebContainer (a sandboxed Node.js environment in the browser) and interact with its file system and processes.
1. Configure Cross-Origin Isolation: WebContainers require your page to be cross-origin isolated because they rely on low-level browser features like SharedArrayBuffer. Ensure your page is served with the HTTP headers Cross-Origin-Embedder-Policy: require-corp and Cross-Origin-Opener-Policy: same-origin[3][4]. (These headers are needed in development and production for WebContainers to function properly. When developing on localhost the requirements are relaxed, but you should still set them in production.) If using a hosting service, configure these headers as needed (e.g. via a netlify.toml or vercel.json as shown in WebContainer docs)[4][5]. Without these headers, the WebContainer will fail to start due to browser security restrictions.
2. Boot the WebContainer: With the API imported and headers in place, you can boot a WebContainer instance. This should typically be done once, when your page loads or when you initialize the embed. Booting spawns a fresh Node.js environment in memory. For example:
import { WebContainer } from '@webcontainer/api';

const webcontainerInstance = await WebContainer.boot();
This creates a single WebContainer instance that will host our Next.js project[6]. Important: call WebContainer.boot() only once. The WebContainer API only supports one instance at a time in a page, and calling boot() multiple times will throw an error (e.g. “Proxy has been released and is not usable”)[7][8]. If your embedding app uses hot module reloading (HMR) itself, guard the boot so it doesn’t re-run on every reload.
3. Prepare the Project Files: Next, set up the Next.js project files in the WebContainer’s virtual file system. WebContainers provide an in-memory file system that you can populate programmatically. You can create files and directories by constructing a FileSystemTree object (a nested JavaScript object structure) and mounting it into the container. In this object, each key is a filepath and each value is an object specifying either a file (with contents) or a directory (with nested files)[9][10]. For example, to create a minimal Next.js project structure:
// Define project files (FileSystemTree format)
const projectFiles = {
  // package.json defines our Next.js project and dependencies
  'package.json': { file: { contents: `
    {
      "name": "webcontainer-nextjs",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      },
      "dependencies": {
        "next": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }
  `}},
  // Create a pages directory with a simple index page
  'pages': { directory: {
      'index.js': { file: { contents: `
        export default function Home() {
          return <h1>Hello WebContainers + Next.js 👋</h1>
        }
      `}}
  }}
};

// Mount the files into the WebContainer's filesystem
await webcontainerInstance.mount(projectFiles);
In this snippet, we define a package.json file with the necessary scripts and dependencies for a Next.js app (using the latest versions) and a basic pages/index.js that exports a simple React component. The mount() call copies these files into the WebContainer’s virtual file system[11]. Mounting a whole file tree at once is very efficient – it “hydrates” the in-browser filesystem with all files in one go[12]. After this step, the WebContainer now contains our Next.js project files (except for node_modules, which we will install next). You can verify file structure via WebContainer’s file API (e.g. using webcontainerInstance.fs.readdir('/') to list root files, if needed).
Installing Next.js and Dependencies
With the project files mounted (especially the package.json), the next step is to install the project’s dependencies inside the WebContainer. WebContainers come with a Node.js runtime and a package manager (StackBlitz’s Turbo npm client) that can install packages into the isolated file system. We’ll use the WebContainer’s process API to run the equivalent of npm install in our container.
1. Install Dependencies: Spawn a new process to run npm install using the webcontainerInstance.spawn() method. This method executes a command inside the WebContainer’s Node environment, just like running it in a terminal. For example:
// Install all dependencies from package.json
const installProcess = await webcontainerInstance.spawn('npm', ['install']);
const installExitCode = await installProcess.exit;  // Wait for completion

if (installExitCode !== 0) {
  throw new Error('Failed to install dependencies');
}
This code launches the npm install process and waits for it to exit[13]. If the exit code is 0, the installation was successful; otherwise, we throw an error (in a real app, you might display an error message to the user). When npm install runs, it reads the package.json we mounted (with Next, React, etc.) and installs those packages into a new node_modules directory in the WebContainer’s file system. This may take a moment, as it’s downloading packages, but it runs completely in the browser.
Tip: To speed up installation, you can also mount a package-lock.json (or yarn.lock) along with your files to leverage deterministic dependency resolution. Having a lockfile allows the Turbo package manager to skip generating one and go straight to downloading, improving boot time[14]. In advanced cases, you could even pre-bundle or cache node_modules (by mounting them or using a service worker cache), but typically including a lockfile is sufficient to boost performance.
After this step, your in-browser environment now has Next.js and all its dependencies installed. Essentially, you’ve set up a full Node.js project in memory. Now it’s time to run the Next.js development server.
Running the Dev Server
With the dependencies in place, you can start the Next.js development server inside the WebContainer just as you would on a local machine. This is accomplished by spawning the npm run dev script. In a Next.js project, npm run dev invokes the Next development server (usually on port 3000 by default).
1. Start Next.js in WebContainer: Use webcontainerInstance.spawn() to run the dev script:
// Start the Next.js development server
await webcontainerInstance.spawn('npm', ['run', 'dev']);

// When the server is ready, WebContainers will emit a "server-ready" event
webcontainerInstance.on('server-ready', (port, url) => {
  console.log(`Dev server running at ${url}`);
  iframeEl.src = url;
});
In the above example, we spawn the dev server process and then listen for the WebContainer’s server-ready event. WebContainers emit a server-ready event when an HTTP server inside the container starts listening on a port[15]. The event provides the port number and a local url for that server. We then take that URL and assign it to our preview <iframe> (here referenced by iframeEl), so that the Next.js app is displayed to the user[16]. The iframeEl.src = url line is what actually embeds the running Next.js preview into our page.
At this point, the Next.js app is up and running inside the browser. The url provided is typically something like http://localhost:3000 (or another port if 3000 was in use) and is routed internally via WebContainers’ virtual network. Under the hood, WebContainers map the Node.js server’s networking to a Service Worker, so the server is accessible locally and even works offline[17]. The user can now interact with the Next.js app in the iframe as they would with any web page.
2. Viewing the Preview: Make sure you have an <iframe> element in your HTML (for example, <iframe id="preview" title="Next.js Preview"></iframe> in your page). You might want to style this iframe (set width/height or use CSS flexbox) to show it alongside code editors or other UI. Once the iframe’s src is set to the WebContainer’s server URL, you should see your Next.js application’s homepage load inside it. For our minimal example, it would display the “Hello WebContainers + Next.js 👋” message from the Home component we created.
3. Development vs Production URLs: The preview URL from WebContainers will use http:// and will work on localhost or over HTTPS on your deployed site. If you deploy your embedding page on a real domain, ensure it’s served over HTTPS. Browsers require cross-origin isolated pages to be secure, and features like Service Workers (used by WebContainers for networking) also require HTTPS. In local development you can use http://localhost, but in production your page must be on HTTPS (localhost is an exception)[18]. In short, host your embedding page on HTTPS for everything to function correctly.
Setting Up Hot Reloading
One of the biggest benefits of using Next.js’s development server is the built-in Fast Refresh hot reloading. Fast Refresh allows you to see code changes in real-time without losing the state of your React components[19]. When embedding a Next.js dev environment in a WebContainer, you get this hot reload capability working inside the browser, just as it would on a local machine.
Next.js Fast Refresh is enabled by default in development mode (for Next 9.4 and newer), so you typically don’t need any special configuration to use it[20]. The main thing is to ensure that when you edit your Next.js app’s files, those changes are written to the WebContainer’s file system – Next.js will detect the file updates and automatically trigger the refresh.
1. Enabling Live Edits: To take advantage of hot reloading, integrate a code editor or input mechanism in your embedding. For example, you might have a text editor component or even a simple <textarea> for editing code. You can use the WebContainer FS APIs to write changes from the editor into the container’s files. For instance, if you want to live-edit the pages/index.js file from a text editor, you could do:
async function updateFile(path, newContent) {
  await webcontainerInstance.fs.writeFile(path, newContent);
}
This helper uses fs.writeFile to overwrite the file’s content with the new text[21]. You would call updateFile('/pages/index.js', content) whenever the user makes changes in your editor UI. For example, if using a <textarea id="code"> bound to the file content, you can listen to its input event:
const textarea = document.getElementById('code');
textarea.addEventListener('input', (e) => {
  updateFile('/pages/index.js', e.target.value);
});
Now, as the user types or modifies the code, the changes are saved to the WebContainer’s filesystem in real-time[22]. The Next.js dev server running inside will pick up these file changes and trigger Fast Refresh to update the app in the preview iframe. Within a second or two (often almost instantly), the iframe will reflect the new code, and thanks to Fast Refresh, it will preserve the React component state in many cases[19] (for example, if you have a counter on the page, editing text elsewhere won’t reset it).
2. Verifying Hot Reload: Try making a change to the Next.js page (for example, change the text in the <h1> of index.js to something else). You should see the update propagate to the preview without a full page reload. The browser’s developer console may show logs from Next.js indicating it compiled the change and refreshed the module. Fast Refresh ensures that most edits update the page live, while maintaining state for functional components and hooks where possible[23][24].
No manual refresh or server restart is needed — your in-browser Next.js environment behaves just like npm run dev on a local machine, providing immediate feedback as you develop. This makes for a truly interactive embedded coding experience.
File System Management
WebContainers provide a virtual file system (FS) that lives in the browser’s memory. This FS behaves much like a normal Node.js file system, with support for reading, writing, creating directories, etc., but it is ephemeral by default (cleared when the page is refreshed or closed)[25]. Managing files in this environment is critical for a smooth development experience.
1. File Structure and Access: The WebContainer file system starts empty, and we populate it using the mount() method (as shown earlier) or by creating files on the fly. The file system is structured as a tree of directories and files. WebContainer’s API exposes an fs object (webcontainerInstance.fs) with methods to manipulate files. Key methods include[26]:
fs.readFile(path, encoding?) – Read a file’s content (returns a Promise with the file data as a string or Buffer).
fs.writeFile(path, content, encoding?) – Write or overwrite a file with the given content[27]. Creates the file if it doesn’t exist.
fs.mkdir(path) – Create a new directory at the specified path.
fs.readdir(path) – List the entries in a directory (similar to fs.readdir in Node, returns an array of filenames).
fs.rm(path, options) – Remove a file or directory (options can specify recursive deletes, etc.).
Using these, you can build out file management features in your embedded app (for example, a file explorer tree, the ability to add/delete files, etc.). In our context, we primarily used mount() for initial load and writeFile for updating files with edits, but all of these are available for your needs.
2. Mounting vs. Manual File Creation: The mount() method is the preferred way to load a large number of files initially[12]. It takes a structured object (as demonstrated earlier with projectFiles) and efficiently copies all those files into the container. This is much faster than writing many files one-by-one in a loop. For instance, frameworks like SvelteKit have leveraged mount() to quickly load entire template projects in WebContainers for their tutorials[28]. Once the initial mount is done, you can still create or modify files at runtime using the fs methods.
For example, if a user adds a new page or component via your UI, you can call fs.mkdir('/pages/newpage') or fs.writeFile('/pages/newpage.js', '...') to add it. If you need to read files (say, to show the current content in an editor), you can call fs.readFile('/pages/index.js', 'utf-8') to get its text content.
3. Persistence Considerations: By default, the WebContainer’s filesystem is not persisted once the browser tab closes or refreshes (it lives in memory)[25]. This is usually fine for ephemeral previews or tutorials. If you want to allow saving progress, you have a couple of options: - Export: You can read the files (or even zip them up) and prompt the user to download them to their local machine. For example, iterate over your project directories, use fs.readFile to get content, and create a ZIP blob for download.
- Persist between sessions: You could store the file data in localStorage or IndexedDB on unload and reload it on startup (mounting from stored data). The WebContainer API itself doesn’t automatically persist, but you have full access to the file data to implement a custom persistence if needed.
For most embedding scenarios (like docs or tutorials), you might not need persistence beyond the session. But it’s good to be aware of how you could implement it.
Embedding the WebContainer into a Web Page
Example of an embedded WebContainer environment with a code editor (left) and live preview (right) in a web page.
Integrating the WebContainer-based Next.js preview into your web page involves coordinating the WebContainer instance, the preview iframe, and any UI (like editors) that you provide. Here’s a summary of how to embed the environment into a site (as opposed to using it standalone on stackblitz.com):
1. HTML Setup: In your web page, include an element to host the preview (e.g., an <iframe id="preview">) and any elements for your editor or controls. You might structure your page with a split pane – one for code editing (if you allow it) and one for the preview iframe. For example:
<div class="editor-pane">
  <!-- Code editor or textarea for code input -->
  <textarea id="code"></textarea>
</div>
<div class="preview-pane">
  <!-- Iframe to show the Next.js app -->
  <iframe id="preview" title="App Preview"></iframe>
</div>
Include any necessary scripts: your bundle that uses @webcontainer/api or a direct script tag for the WebContainer API (if you prefer a CDN approach). Remember, if using a script tag, it must be of type module (since @webcontainer/api is an ES module). For instance: <script type="module" src="https://unpkg.com/@webcontainer/api"></script> (adjust to a valid CDN). If using a bundler, just ensure the code from previous sections runs after the DOM is ready.
2. Initializing on Page Load: When the page loads, initialize the WebContainer and your app logic. This means: - Boot the WebContainer (as shown in Project Setup). Make sure the COOP/COEP headers are set on this page (as discussed) so that booting succeeds.
- Mount the project files (package.json, etc.) into the container. You might have these files hard-coded (like our example) or fetch them from somewhere – but since we want the latest Next.js, defining them with "next": "latest" in package.json is a simple approach.
- Run npm install inside the container to install dependencies. You can display a loading indicator or logs to the user while this happens, as it might take a few seconds. For a smoother UX, you could preload some message like "Installing dependencies, please wait..." and then clear it when done.
- Spawn the Next.js dev server (npm run dev). As soon as you spawn it, set up the event listener for server-ready to know when the server is up[16]. - When you receive the server-ready event with the URL, set your preview iframe’s src attribute to that URL. The iframe will then load the Next.js app directly from the in-browser server.
At this point, the user will see the Next.js app running in the iframe. If you mounted a basic example project as we did, they’ll see the "Hello WebContainers + Next.js" message. They can interact with this iframe just like any web page – navigate between Next.js routes, click links, etc., and all requests are handled by the Node.js server inside the WebContainer.
3. Integrating the Editor (Optional): If your goal is to provide an interactive coding environment (e.g., in documentation or tutorials), you should also integrate the code editor portion: - Load the initial code into the editor (e.g., set the textarea’s value to the contents of index.js that you mounted). In our earlier code, we can retrieve the content string we used for index.js and set textarea.value = ... on load[29]. - Set up the event listener so that changes in the editor call fs.writeFile (as described in Setting Up Hot Reloading). This ensures that as the user types, the file in the container updates and triggers Next.js to refresh the preview. - You could use a more sophisticated editor (like Monaco or CodeMirror) for better UX, but the principle is the same: on each change (or on save action), write the new file content into the WebContainer. Next.js will handle the rest by recompiling/reloading the app.
4. Considerations for Embed Security: If you plan to embed this entire setup in another site (for example, if someone else wanted to embed your embed as an <iframe> on their domain), you need to ensure cross-origin isolation at both levels. Both the parent and child frames need the proper COOP/COEP headers (set to require-corp), and the iframe tag that hosts the cross-origin content must include allow="cross-origin-isolated" attribute[30]. This is an advanced scenario; usually, if you control the page and are just embedding the preview iframe within the same page, you’re already covered since everything is happening on your domain. But it’s good to know if cross-domain embedding comes up.
In summary, embedding a WebContainer is about orchestrating the environment setup (boot, mount, install, run) and linking the container’s output (the Next.js dev server) to a visible iframe. The user interacts with the Next.js app in that iframe as if it were deployed, when in reality it’s served from within the browser. Meanwhile, you have full control to expose code editing or other interactive controls around it.
Tips for Performance and Troubleshooting
Running a Node.js environment and a Next.js build process in the browser is cutting-edge, so here are some tips and common issues to be aware of:
Optimize Initial Load: To reduce the time it takes for the dev server to be ready, include a package-lock.json (or yarn lockfile) in your mounted files if possible[14]. This allows the WebContainer’s package installer to skip resolving dependency versions and use the lockfile directly, speeding up npm install. Each dependency installation happens via the browser’s network, so a lockfile (or preloading commonly used packages via service worker cache) can help a lot.
Preload Dependencies (Advanced): In some cases, you might consider pre-bundling node_modules. For example, the SvelteKit team bundles dependency files so they can be written straight into the WebContainer FS, avoiding an install step[28]. This can be complex, but a simpler approach is to cache the node_modules from a previous session (e.g., store in IndexedDB) and mount them on a new session to avoid re-downloading. This is not built-in, but you can implement it if your use case warrants persistent environments.
One Container at a Time: As mentioned, don’t call WebContainer.boot() more than once per page load[8]. If you need to restart the environment, you should refresh the page or implement logic to shut down the current container (WebContainers do not yet have a formal "destroy" method, so a page reload is the straightforward way to reset). Also, ensure that if your host app does HMR (like a React app embedding this), it doesn’t accidentally spawn multiple containers during its lifecycle.
Check Browser Compatibility: WebContainers currently work best in Chromium-based browsers (like Chrome, Edge, Opera) and have support in Safari 16+ and recent Firefox (behind some flags). Always test in your target browsers. If you encounter issues with WebContainers not starting at all, it could be a browser limitation or configuration issue. For example, older or mobile Safari browsers might not support the needed features. Refer to StackBlitz’s browser support documentation for the latest details.
Browser Extensions and Blocking: If the WebContainer fails to load or hangs, check for content blockers or security extensions. Some privacy extensions or corporate proxies can block the WebContainer’s operation (because it uses web workers, service workers, and sometimes tries to load wasm binaries). A telltale sign is an error like failing to transfer a SharedArrayBuffer or a postMessage failure[31]. Make sure self.crossOriginIsolated is true (you can check crossOriginIsolated in the console) – if not, the COOP/COEP headers might not be set correctly or some resource was loaded without them. Also, cookie-blocking extensions have been known to break WebContainers[32] – you may need to disable those or add an exception.
Serve Over HTTPS in Production: As noted before, always host your embedding page on HTTPS (except during local development on localhost). Many WebContainer features (especially anything related to networking and Service Workers) will simply not work on an insecure context. If you see issues with the preview iframe not loading when your site is deployed, double-check the protocol (and that the COOP/COEP headers are present on the deployed page).
Expose Logs to Users: By default, any output from the processes (like console.log from your Next.js server or build) will go to the browser’s DevTools console. You might want to surface this in your page UI, especially for a teaching environment. You can do this by tapping into the process’s output stream. Every process from spawn() has an output property which is a ReadableStream<string> of the stdout/stderr[33]. You can pipe this to a writable stream that appends to a console panel in your page. For example:
const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);
devProcess.output.pipeTo(new WritableStream({
  write(data) {
    appendToConsoleUI(data); // your function to display logs
  }
}));
This will let your users see build messages, console logs, or errors from Next.js inside the page, which can be very helpful for debugging in an embedded context[34]. If you don’t do this, you can still instruct users to open their browser DevTools, but that’s not as user-friendly for a guided embedding.
Memory and Limits: Keep in mind that everything is running in the user’s browser process. Complex Next.js projects with lots of data or very heavy builds could strain the browser’s CPU or memory. Try to keep the demo project light if possible (perhaps disable source maps or large data sets if not needed). WebContainers have certain resource limits for safety. If you hit those (for instance, if a process spawns too many threads or uses too much memory), the WebContainer might terminate or throw an error. This is usually not an issue with typical Next.js apps, but it’s something to be mindful of.
Troubleshooting Errors: The WebContainer API provides an on('error', ...) event on the instance to catch internal errors[35]. Attach a handler to log or display these errors – it can help identify issues like missing headers, blocked resources, etc. Also, the browser console is your friend; error messages about COOP/COEP or SharedArrayBuffer will be logged there if configuration is wrong[31].
Community and Support: StackBlitz and the WebContainer team maintain a Discord and GitHub for feedback. If you run into obscure issues, it’s worth checking the official Troubleshooting guide[36] or searching their community forums. Common fixes often involve adjusting headers or polyfills as described above.
By following this guide, you should have a Next.js project running entirely in-browser with live reload capabilities. You’ve essentially embedded a mini IDE + preview into your site: the WebContainer serves the Next.js app in an iframe, and your surrounding page can provide the editing interface and any other controls. This setup is powerful for documentation, tutorials, workshops, or any scenario where you want users to experience coding and running a Next.js application instantly, without any setup on their machine. Happy coding!
Sources: The information and code examples in this guide were adapted from the official StackBlitz WebContainer documentation and guides[26][16], which provide details on file system handling, process management, and best practices for running Node.js (and thus Next.js) inside the browser. Additional insights on performance and configuration come from the WebContainers troubleshooting guide and community tips[14][31], as well as Next.js documentation for Fast Refresh[19]. These sources are cited throughout the text for reference. Enjoy building with WebContainers and Next.js!

[1] Stackblitz WebContainers: Run Next.js inside the browser - LogRocket Blog
https://blog.logrocket.com/stackblitz-webcontainers-nextjs-browser/
[2] [3] [6] [7] [11] [12] [13] [16] [18] [26] Quickstart | WebContainers
https://webcontainers.io/guides/quickstart
[4] [5] Configuring Headers | WebContainers
https://webcontainers.io/guides/configuring-headers
[8] [14] [28] [30] [31] [32] [36] Troubleshooting | WebContainers
https://webcontainers.io/guides/troubleshooting
[9] [10] [27] Working with the File System | WebContainers
https://webcontainers.io/guides/working-with-the-file-system
[15] [33] [34] [35] Running Processes | WebContainers
https://webcontainers.io/guides/running-processes
[17] [25] WebContainer API is here.
https://blog.stackblitz.com/posts/webcontainer-api-is-here/
[19] [20] [23] [24] Architecture: Fast Refresh | Next.js
https://nextjs.org/docs/architecture/fast-refresh
[21] [22] [29] Editing a file and updating the iframe in WebContainers | WebContainers
https://webcontainers.io/tutorial/5-editing-a-file-updating-the-iframe
