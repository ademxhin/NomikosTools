export interface AuditLogEntry {
  id: string;
  user: string;
  userRole: string;
  action: string;
  entity: 'product' | 'order' | 'inventory' | 'category' | 'discount' | 'settings' | 'import';
  entityId: string;
  entityName?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
}
