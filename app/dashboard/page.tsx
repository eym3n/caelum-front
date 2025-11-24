"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Clock,
  ExternalLink,
  Trash2,
  Copy
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
  const isPublished = status === 'generated'; // Mapping 'generated' to 'published' for UI consistency
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs ${
      isPublished 
        ? 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400' 
        : 'bg-gray-100 text-gray-800 dark:bg-gray-500/15 dark:text-gray-300'
    }`}>
      {isPublished ? '● Published' : '● Draft'}
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
  const totalConversions = React.useMemo(() => items.length * 12, [items]); // Mock data
  const conversionRate = React.useMemo(() => "3.2%", []); // Mock data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border-b border-border -mx-8 -mt-6 px-8 py-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-semibold">Landing Pages</h1>
            <p className="text-muted-foreground">Manage and track your landing pages</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Sort
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button 
              className="bg-[#7269F8] hover:bg-[#5d56e0] text-white"
              asChild
            >
              <Link href="/create">
                <Plus className="w-4 h-4 mr-2" />
                Create New Landing Page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          trend="+12.5% from last month"
        />
        <StatsCard
          title="Total Conversions"
          value={totalConversions.toString()} // Placeholder mock data mismatch correction
          icon={Users}
          iconBg="bg-green-500/10"
          iconColor="text-green-600 dark:text-green-400"
          trend="+8.2% from last month"
        />
        <StatsCard
          title="Avg. Conversion Rate"
          value={conversionRate}
          icon={TrendingUp}
          iconBg="bg-[#7269F8]/10"
          iconColor="text-[#7269F8]"
          trend="+2.1% from last month"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-foreground font-medium">Your Landing Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">URL</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">Views</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">Conversions</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">Conv. Rate</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">Created</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 rounded-full bg-[#7269F8]/10 flex items-center justify-center mb-4">
                          <Plus className="w-8 h-8 text-[#7269F8]" />
                        </div>
                        <h3 className="text-foreground mb-2 font-medium">No landing pages yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first AI-powered landing page in minutes</p>
                        <Button 
                          asChild
                          className="bg-[#7269F8] hover:bg-[#5d56e0] text-white"
                        >
                          <Link href="/create">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Landing Page
                          </Link>
                        </Button>
                      </div>
                   </td>
                </tr>
              ) : (
                items.slice(0, 5).map((page) => (
                  <tr key={page.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-foreground font-medium">{page.business_data?.campaign?.productName || "Untitled Project"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={page.deployment_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7269F8] hover:text-[#5d56e0] flex items-center gap-1 text-sm"
                      >
                        {page.deployment_url ? new URL(page.deployment_url).host : "Pending..."}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={page.status} />
                    </td>
                    <td className="px-6 py-4 text-foreground text-sm">
                      {/* Mock data for views */}
                      {(Math.floor(Math.random() * 10000) + 1000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-foreground text-sm">
                      {/* Mock data for conversions */}
                      {(Math.floor(Math.random() * 500) + 50).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {/* Mock data for rate */}
                      <span className="text-foreground">{(Math.random() * 5 + 2).toFixed(2)}%</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(page.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
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
                      </div>
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
  iconBg,
  iconColor,
  trend,
}: {
  title: string;
  value: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  trend: string;
}) {
  return (
    <Card className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground">{title}</p>
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <h2 className="text-foreground text-2xl font-semibold">{value}</h2>
      <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
        <TrendingUp className="w-3 h-3 mr-1" />
        {trend}
      </p>
    </Card>
  );
}
