export interface SiteMetadata {
  title: string;
  description: string;
  canonical: string;
  assetPrefix: string;
  structuredData?: Record<string, unknown>;
}
