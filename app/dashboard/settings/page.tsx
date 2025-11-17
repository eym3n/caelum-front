"use client";

import { LogOut, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

function formatDate(input?: string) {
  if (!input) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(input));
  } catch {
    return input;
  }
}

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account settings</h1>
        <p className="text-sm text-muted-foreground">
          Update your profile details or sign out of caelum.ai.
        </p>
      </div>

      <Card className="space-y-6 border-border/70 bg-card/60 p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Profile</h2>
          <p className="text-sm text-muted-foreground">We&apos;ll use these details for personalized prompts and billing later.</p>
        </div>
        <Separator />
        <div className="space-y-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Full name</span>
            <span className="text-base text-foreground">{user?.full_name || "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Email</span>
            <span className="inline-flex items-center gap-2 text-base text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {user?.email}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Member since</span>
            <span className="inline-flex items-center gap-2 text-base text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(user?.created_at)}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Need to switch accounts? Signing out will take you back to the authentication screen.
          </p>
          <Button variant="destructive" className="gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}

