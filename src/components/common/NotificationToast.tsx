import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const NotificationToast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div
      id="system-notification-toast"
      className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#1e1e1e] text-white border border-[#3a3a3a] shadow-2xl rounded p-3.5 flex items-center space-x-3 transition-all animate-fade-in"
    >
      {getIcon()}
      <div className="flex-1 text-xs font-medium leading-snug">{toast.message}</div>
    </div>
  );
};
