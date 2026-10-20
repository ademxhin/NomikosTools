export interface Category {
  menuVisible?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  previousSlugs?: string[];
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  iconName?: string;
  parentId?: string | null;
  groupName?: string;
  level: 1 | 2 | 3;
  order: number;
  active: boolean;
  featured?: boolean;
}

export interface CategoryTreeItem extends Category {
  children?: CategoryTreeItem[];
}
