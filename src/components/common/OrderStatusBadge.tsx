import React from 'react';
import { OrderStatus } from '../../types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Νέα':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Επιβεβαιωμένη':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Σε Προετοιμασία':
      case 'Σε Picking':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Έτοιμη για Συσκευασία':
      case 'Συσκευασμένη':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Απεστάλη':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Παραδόθηκε':
        return 'bg-emerald-200 text-emerald-950 border-emerald-400 font-bold';
      case 'Ακυρώθηκε':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'Επιστροφή':
      case 'Επιστροφή Χρημάτων':
        return 'bg-neutral-200 text-neutral-800 border-neutral-400';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-spec font-bold border ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
};
