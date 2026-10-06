export type Availability = true | false | null;

export interface CheckResult {
  platform: string;
  category: "domain" | "social" | "app" | "trademark" | "company" | "tech";
  url: string;
  available: Availability;
  status: "available" | "taken" | "warning" | "unknown" | "error";
  detail?: string;
  matches?: string[];
}

export interface BrandCheckOptions {
  domains?: boolean;
  social?: boolean;
  apps?: boolean;
  trademark?: boolean;
  company?: boolean;
  tech?: boolean;
}
