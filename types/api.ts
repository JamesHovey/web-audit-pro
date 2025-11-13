/**
 * Type definitions for API request and response bodies
 */

export interface AuditConfiguration {
  enableLighthouse: boolean;
  enableViewport: boolean;
  enableImageOptimization: boolean;
  enableSEO: boolean;
  enableEmail: boolean;
}

export interface AuditRequestBody {
  url: string;
  sections: string[];
  scope?: 'single' | 'multi' | 'all' | 'custom';
  auditView?: 'executive' | 'technical';
  country?: string;
  isUKCompany?: boolean;
  pages?: string[];
  pageLimit?: number | null; // Max pages to analyze (null = use smart default based on tier)
  excludedPaths?: string[];
  maxPagesPerSection?: number; // Override per-section page limits (keywords, technical, etc.)
  useSmartSampling?: boolean; // Enable intelligent page selection (default: true)
  auditConfiguration?: AuditConfiguration;
  enableEmailNotification?: boolean;
}

export interface BusinessContentRequestBody {
  prompt: string;
}

export interface ViewportAuditRequestBody {
  url: string;
  auditId: string;
}

export interface CompetitionAnalysisRequestBody {
  url: string;
  country?: string;
  businessContext?: unknown;
}

export interface CostingRequestBody {
  sections: string[];
  scope?: 'single' | 'multi';
  pageCount?: number;
}

export interface DomainAuthorityRequestBody {
  domain: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequestBody {
  token: string;
  password: string;
}

export interface DiscoverPagesRequestBody {
  url: string;
}
