export type ScannerMode =
  | 'lookup'
  | 'receiving'
  | 'adjustment'
  | 'counting'
  | 'picking'
  | 'packing'
  | 'returns';

export interface ScanResult {
  code: string;
  format?: string;
  timestamp: number;
}

export interface ScannerFeedback {
  type: 'success' | 'warning' | 'error';
  message: string;
}
