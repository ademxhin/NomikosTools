import React, { useEffect, useRef, useState } from 'react';
import { Barcode, Camera, CameraOff } from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Button, Field } from './ui';

const SUPPORTED_FORMATS = 'EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, QR';

export function BarcodeScanner({ onDetected }: { onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const startingRef = useRef(false);
  const [value, setValue] = useState('');
  const [camera, setCamera] = useState(false);
  const [error, setError] = useState('');

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    startingRef.current = false;
    setCamera(false);
  };

  useEffect(() => () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  const submitValue = (rawValue: string) => {
    const normalized = rawValue.trim();
    if (!normalized) return;
    onDetected(normalized);
    setValue('');
  };

  const startCamera = async () => {
    if (startingRef.current || controlsRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Η κάμερα δεν υποστηρίζεται από αυτόν τον browser. Χρησιμοποιήστε USB scanner ή πληκτρολογήστε τον κωδικό.');
      setCamera(false);
      return;
    }
    startingRef.current = true;
    try {
      setError('');
      const video = videoRef.current;
      if (!video) throw new Error('video-not-ready');
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromConstraints({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      }, video, (result) => {
        const rawValue = result?.getText();
        if (rawValue) { submitValue(rawValue); stopCamera(); }
      });
      startingRef.current = false;
    } catch (e) {
      stopCamera();
      const message = e instanceof DOMException && e.name === 'NotAllowedError'
        ? 'Η πρόσβαση στην κάμερα απορρίφθηκε. Επιτρέψτε την κάμερα από τις ρυθμίσεις του browser.'
        : 'Δεν ήταν δυνατή η εκκίνηση της κάμερας. Ελέγξτε ότι χρησιμοποιείτε HTTPS και ότι η κάμερα είναι διαθέσιμη.';
      setError(message);
    }
  };

  useEffect(() => {
    if (camera && !controlsRef.current) void startCamera();
  }, [camera]);

  const toggleCamera = () => {
    if (camera) { stopCamera(); return; }
    setCamera(true);
  };

  return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1"><Field label="Scanner SKU / barcode"><input autoComplete="off" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitValue(value); } }} placeholder="Σκανάρετε ή πληκτρολογήστε κωδικό" /></Field></div>
      <Button type="button" secondary onClick={() => submitValue(value)} disabled={!value.trim()}><Barcode size={16} /> Εντοπισμός</Button>
      <Button type="button" secondary onClick={toggleCamera}>{camera ? <CameraOff size={16} /> : <Camera size={16} />} {camera ? 'Κλείσιμο κάμερας' : 'Κάμερα'}</Button>
    </div>
    {camera && <div className="mt-3 overflow-hidden rounded-lg bg-black"><video ref={videoRef} autoPlay muted playsInline className="h-56 w-full object-cover" /><p className="px-3 py-2 text-xs text-white/80">Στοχεύστε το barcode μέσα στο κάδρο. Υποστηρίζονται: {SUPPORTED_FORMATS}.</p></div>}
    {error && <p role="alert" className="mt-2 text-sm text-amber-800">{error}</p>}
  </div>;
}
