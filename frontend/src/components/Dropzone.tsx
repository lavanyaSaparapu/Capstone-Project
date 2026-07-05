import React, { useCallback, useState } from 'react';
import { Upload, File, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  success?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  error = null,
  success = false
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Basic size validation
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large! Maximum limit is 5MB.");
        return;
      }
      // Check format
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        alert("Invalid file format. Please upload PDF or DOCX.");
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full h-56 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden select-none cursor-pointer ${
          isDragActive
            ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
            : success
            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
            : error
            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10'
            : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white/40 dark:bg-dark-900/10 backdrop-blur-sm'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-10 h-10 text-brand-500 animate-spin" />
            <span className="font-semibold text-sm">Uploading and Parsing Resume...</span>
            <div className="w-48 h-1.5 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-3 animate-scale-up">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Upload Successful!</span>
            <span className="text-xs text-slate-400">Processing vector analysis...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">Upload Error</span>
            <span className="text-xs text-slate-400 px-6 text-center">{error}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-dark-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-semibold text-sm block">Drag & drop your resume file</span>
              <span className="text-xs text-slate-400 mt-1 block">Supports PDF, DOCX (Max 5MB)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
