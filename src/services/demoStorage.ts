import { DEMO_MODE } from './runtime';
// Demo changes never overwrite the original storefront's browser-local data.
const volatileStore = new Map<string, string>();
let storageErrorNotified = false;
export const demoStorage = {
  getItem(key: string): string | null {
    if (!DEMO_MODE) return null;
    return volatileStore.get(key) ?? window.localStorage.getItem(`nt-demo-v1:${key}`);
  },
  setItem(key: string, value: string) {
    if (!DEMO_MODE) return;
    try {
      window.localStorage.setItem(`nt-demo-v1:${key}`, value);
      volatileStore.delete(key);
    } catch {
      volatileStore.set(key, value);
      if (!storageErrorNotified) {
        storageErrorNotified = true;
        window.dispatchEvent(new CustomEvent('nt-storage-error'));
      }
    }
  },
  removeItem(key: string) {
    volatileStore.delete(key);
    if (DEMO_MODE) window.localStorage.removeItem(`nt-demo-v1:${key}`);
  },
};
