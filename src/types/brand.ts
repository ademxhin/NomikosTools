export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  country: string;
  active: boolean;
  featured: boolean;
  website?: string;
  warrantyInfo?: string;
}
