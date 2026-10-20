import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_MODE } from '../../services/runtime';
import { roleNames } from '../../services/workspacePolicy';
import { AdminRole } from '../../types/user';
import { Panel, Button } from './ui';
export function DemoLogin({ admin = false, onNavigate }: { admin?: boolean; onNavigate: (route: string) => void }) {
  const { login } = useAuth();
  return <div className="mx-auto max-w-xl px-4 py-12"><Panel title={admin ? 'Περιβάλλον διαχείρισης' : 'Ο λογαριασμός μου'}>
    {DEMO_MODE ? <><p className="mb-6 text-sm leading-relaxed text-neutral-600">Δοκιμαστικό περιβάλλον. Επιλέξτε προφίλ για να δοκιμάσετε τις ροές. Δεν δημιουργείται πραγματικός λογαριασμός και δεν απαιτείται κωδικός.</p><div className="grid gap-2">{admin ? (Object.keys(roleNames) as AdminRole[]).map(role => <Button secondary key={role} onClick={() => { login('staff@example.test', 'admin', role); onNavigate('/admin'); }}>{roleNames[role]}</Button>) : <Button onClick={() => { login('customer@example.test'); onNavigate('/account'); }}>Είσοδος ως δοκιμαστικός πελάτης</Button>}</div><Button secondary className="mt-4" onClick={() => onNavigate(admin ? '/account' : '/admin')}>{admin ? 'Περιοχή πελάτη' : 'Δοκιμή διαχείρισης'}</Button></> : <p className="text-sm text-neutral-600">Η σύνδεση λογαριασμού δεν είναι διαθέσιμη ακόμη. Απαιτείται ενεργοποίηση της υπηρεσίας ταυτοποίησης.</p>}
  </Panel></div>;
}
