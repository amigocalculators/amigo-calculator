'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/supabase/storage';
import { Upload, X } from 'lucide-react';

export default function ImageUploadField({ label, value, onChange, bucket }: {
  label: string; value: string; onChange: (url: string) => void; bucket: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, bucket);
      onChange(url);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {value && (
        <div className="relative w-24 h-24 mb-2 rounded-lg overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder="/Image/... or upload"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-60 whitespace-nowrap">
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
