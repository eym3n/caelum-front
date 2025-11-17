export type LandingPageStatus = "pending" | "generating" | "generated" | "failed";

export interface LandingPageRecord {
  id: string;
  user_id: string;
  session_id: string;
  status: LandingPageStatus;
  preview_url?: string | null;
  deployment_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandingPagesResponse {
  items: LandingPageRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

