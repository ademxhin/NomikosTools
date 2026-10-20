import React, { useEffect, useRef, useState } from 'react';
import { Barcode, Camera, CameraOff } from 'lucide-react';
import { Button, Field } from './ui';

export function BarcodeScanner({ onDetected }: { onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null); const [value, setValue] = useState(''); const [camera, setCamera] = useState(false); const [error, setError] = useState('');
  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), []);
  const toggleCamera = async () => {
    if (camera) { streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; setCamera(false); return; }
    try {
      if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) throw new Error('Η κάμερα δεν υποστηρίζεται. Χρησιμοποιήστε USB scanner ή πληκτρολογήστε τον κωδικό.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); streamRef.current = stream; setCamera(true); setError('');
      if (videoRef.current) videoRef.current.srcObject = stream;
      type Detector = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
      const DetectorCtor = (window as Window & { BarcodeDetector: new (options?: { formats?: string[] }) => Detector }).BarcodeDetector;
      const detector = new DetectorCtor({ formats: ['ean_13', 'ean_8', 'code_128', 'qr_code'] });
      const scan = async () => { if (!streamRef.current || !videoRef.current) return; try { const found = await detector.detect(videoRef.current); if (found[0]?.rawValue) { onDetected(found[0].rawValue); streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; setCamera(false); return; } } catch { /* frame unavailable while focusing */ } window.requestAnimationFrame(scan); }; window.requestAnimationFrame(scan);
    } catch (e) { setError((e as Error).message); }
  };
  return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"><div className="flex flex-wrap items-end gap-3"><div className="min-w-56 flex-1"><Field label="Scanner SKU / barcode"><input autoComplete="off" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && value.trim()) { e.preventDefault(); onDetected(value.trim()); setValue(''); } }} placeholder="Σκανάρετε ή πληκτρολογήστε κωδικό" /></Field></div><Button type="button" secondary onClick={() => { if (value.trim()) { onDetected(value.trim()); setValue(''); } }}><Barcode size={16} /> Εντοπισμός</Button><Button type="button" secondary onClick={toggleCamera}>{camera ? <CameraOff size={16} /> : <Camera size={16} />} {camera ? 'Κλείσιμο κάμερας' : 'Κάμερα'}</Button></div>{camera && <video ref={videoRef} autoPlay muted playsInline className="mt-3 h-40 w-full rounded-lg bg-black object-cover" />}{error && <p role="alert" className="mt-2 text-sm text-amber-800">{error}</p>}</div>;
}
