import { DEMO_MODE } from './runtime';
// Demo changes never overwrite the original storefront's browser-local data.
export const demoStorage = {
  getItem(key: string): string | null { return DEMO_MODE ? window.localStorage.getItem(`nt-demo-v1:${key}`) : null; },
  setItem(key: string, value: string) { if (DEMO_MODE) { try { window.localStorage.setItem(`nt-demo-v1:${key}`, value); } catch { window.dispatchEvent(new CustomEvent('nt-storage-error')); } } },
  removeItem(key: string) { if (DEMO_MODE) window.localStorage.removeItem(`nt-demo-v1:${key}`); },
};
