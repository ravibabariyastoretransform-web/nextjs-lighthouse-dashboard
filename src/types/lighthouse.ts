export interface MetricDetail {
  displayValue: string;
  numericValue: number; // in ms, or ratio, etc.
  score: number; // 0 to 1
  status: 'good' | 'needs-improvement' | 'poor';
}

export interface CoreWebVitals {
  lcp: MetricDetail;
  cls: MetricDetail;
  inp: MetricDetail;
  fcp: MetricDetail;
  speedIndex: MetricDetail;
  tbt: MetricDetail;
}

export interface AuditItem {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  details?: any;
}

export interface ResourceSummaryItem {
  resourceType: string;
  count: number;
  size: number; // in bytes
}

export interface NetworkRequestItem {
  url: string;
  startTime: number;
  endTime: number;
  transferSize: number;
  resourceType: string;
  statusCode: number;
}

export interface AssetSizeItem {
  url: string;
  totalBytes: number;
}

export interface JSExecTimeItem {
  url: string;
  duration: number; // in ms
}

export interface PerformanceAnalytics {
  opportunities: AuditItem[];
  diagnostics: AuditItem[];
  resourceSummary: ResourceSummaryItem[];
  networkRequests: NetworkRequestItem[];
  javascriptExecutionTime: JSExecTimeItem[];
  largestAssets: AssetSizeItem[];
}

export interface SEOAnalytics {
  passed: AuditItem[];
  failed: AuditItem[];
  metadata: {
    hasTitle: boolean;
    hasMetaDescription: boolean;
    hasViewport: boolean;
    hasH1: boolean;
    isIndexable: boolean;
  };
  structuredData: {
    valid: boolean;
    detectedTypes: string[];
  };
}

export interface AccessibilityAnalytics {
  passed: AuditItem[];
  failed: AuditItem[];
  colorContrast: { passed: boolean; score: number; details?: string };
  ariaValidation: { passed: boolean; score: number; details?: string };
}

export interface BestPracticesAnalytics {
  passed: AuditItem[];
  failed: AuditItem[];
  security: {
    https: boolean;
    noUnsafeLinks: boolean;
    noConsoleErrors: boolean;
    modernLibs: boolean;
  };
  imageOptimization: {
    score: number;
    opportunities: Array<{ url: string; size: number; wastedBytes: number }>;
  };
}

export interface AuditReport {
  id: string;
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    overall: number;
  };
  coreWebVitals: CoreWebVitals;
  performanceAnalytics: PerformanceAnalytics;
  seoAnalytics: SEOAnalytics;
  accessibilityAnalytics: AccessibilityAnalytics;
  bestPracticesAnalytics: BestPracticesAnalytics;
}
