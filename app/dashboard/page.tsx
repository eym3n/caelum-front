"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Download,
  ExternalLink,
  Filter,
  Globe,
  Layout,
  MoreHorizontal,
  Plus,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLandingPages } from "@/hooks/useLandingPages";
import type { LandingPageRecord } from "@/lib/types/landing-page";

function formatDate(input?: string | null) {
  if (!input) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(input));
  } catch {
    return input;
  }
}

function statusVariant(status: LandingPageRecord["status"]) {
  switch (status) {
    case "generated":
      return "default";
    case "failed":
      return "destructive";
    case "generating":
      return "secondary";
    default:
      return "outline";
  }
}

function StatusBadge({ status }: { status: LandingPageRecord["status"] }) {
  const styles = {
    generated: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    failed: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    generating: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    pending: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
  };

  const label = {
    generated: "Live",
    failed: "Failed",
    generating: "Building",
    pending: "Draft",
  };

  const className = styles[status] || styles.pending;
  const text = label[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {status === "generated" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />}
      {text}
    </span>
  );
}

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { items, loading, error } = useLandingPages({ pageSize: 50 });

  const generatedCount = React.useMemo(
    () => items.filter((page) => page.status === "generated").length,
    [items]
  );
  const totalViews = React.useMemo(() => items.length * 124, [items]); // Mock data
  const conversionRate = React.useMemo(() => "3.2%", []); // Mock data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your landing pages and view performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/create">
              <Plus className="h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Pages"
          value={items.length.toString()}
          icon={Layout}
          trend="+12% from last month"
        />
        <StatsCard
          title="Published"
          value={generatedCount.toString()}
          icon={Globe}
          trend="+4% from last month"
        />
        <StatsCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Zap}
          trend="+24% from last month"
        />
        <StatsCard
          title="Conversion Rate"
          value={conversionRate}
          icon={ExternalLink} // Placeholder for a chart/graph icon
          trend="+1.2% from last month"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10" asChild>
                <Link href="/dashboard/landing-pages">View All</Link>
            </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Project Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Updated</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                      No projects found. Create one to get started.
                   </td>
                </tr>
              ) : (
                items.slice(0, 5).map((page) => (
                  <tr key={page.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Layout className="h-4 w-4" />
                         </div>
                         <div>
                            <div className="font-medium">{page.business_data?.campaign?.productName || "Untitled Project"}</div>
                            <div className="text-xs text-muted-foreground">{page.business_data?.branding?.theme || "No theme"}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={page.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(page.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/builder/${page.session_id}`}>Edit in Builder</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild disabled={!page.deployment_url}>
                            <Link href={page.deployment_url || "#"} target="_blank">Visit Site</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: any;
  trend: string;
}) {
  return (
    <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
         <span className="text-green-600 font-medium">{trend}</span>
      </div>
    </Card>
  );
}
