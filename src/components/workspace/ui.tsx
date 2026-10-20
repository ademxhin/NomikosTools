import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export const Button = ({ secondary, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) => <button type="button" {...props} className={`nt-button ${secondary ? 'nt-button-secondary' : ''} ${props.className ?? ''}`} />;
export const Panel = ({ title, children }: { title?: string; children: React.ReactNode }) => <section className="nt-panel">{title && <h2 className="mb-4 text-lg font-bold">{title}</h2>}{children}</section>;
export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="nt-field"><span>{label}</span>{children}</label>;
export const Empty = ({ children }: { children: React.ReactNode }) => <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">{children}</p>;
export const Badge = ({ children }: { children: React.ReactNode }) => <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold">{children}</span>;
export function Dialog({ title, children, onClose, fullPage = false }: { title: string; children: React.ReactNode; onClose: () => void; fullPage?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement; if (fullPage) ref.current?.show(); else ref.current?.showModal(); return () => { ref.current?.close(); previous?.focus(); }; }, [fullPage]);
  return <dialog ref={ref} className={`nt-dialog ${fullPage ? 'nt-dialog-full-page' : ''}`} onCancel={e => { e.preventDefault(); onClose(); }}><header className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} aria-label="Κλείσιμο" className="rounded-lg p-2 hover:bg-neutral-100"><X /></button></header>{children}</dialog>;
}
export function Pager({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  return <div className="mt-4 flex items-center justify-end gap-3 text-sm"><Button secondary disabled={page <= 1} onClick={() => onChange(page - 1)}>Προηγούμενη</Button><span>{page} / {Math.max(total, 1)}</span><Button secondary disabled={page >= total} onClick={() => onChange(page + 1)}>Επόμενη</Button></div>;
}
