export type AdminRole =
  | 'Super Admin'
  | 'Administrator'
  | 'Catalog Manager'
  | 'Warehouse Operator'
  | 'Order Manager'
  | 'Support Agent'
  | 'Read Only';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  adminRole?: AdminRole;
  phone?: string;
  isB2B?: boolean;
  companyName?: string;
  vatNumber?: string;
  taxOffice?: string;
}
