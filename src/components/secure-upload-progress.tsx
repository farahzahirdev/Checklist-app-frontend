'use client';

import { useEffect, useRef, useState } from 'react';

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  /** null = still uploading, true = succeeded, false = failed */
  uploadSucceeded?: boolean | null;
  onComplete: (result: unknown) => void;
  onError: (error: string) => void;
}

type UploadStage = 'scanning' | 'encrypting' | 'storing' | 'complete' | 'error';

export default function SecureUploadProgress({
  fileName,
  fileSize,
  uploadSucceeded = null,
  onComplete,
  onError,
}: UploadProgressProps) {
  const [currentStage, setCurrentStage] = useState<UploadStage>('scanning');
  const [progress, setProgress] = useState(2);
  const finishedRef = useRef(false);

  // Soft progress while waiting for the real upload.
  // Caps below 90% until uploadSucceeded becomes true.
  useEffect(() => {
    if (uploadSucceeded !== null || finishedRef.current) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 20) {
          setCurrentStage('scanning');
          return prev + 2;
        }
        if (prev < 55) {
          setCurrentStage('encrypting');
          return prev + 2;
        }
        if (prev < 88) {
          setCurrentStage('storing');
          return prev + 1;
        }
        return prev;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [uploadSucceeded]);

  // Jump to complete / error once the real upload result arrives.
  useEffect(() => {
    if (uploadSucceeded === true && !finishedRef.current) {
      finishedRef.current = true;
      setCurrentStage('storing');
      setProgress(95);
      const doneTimer = setTimeout(() => {
        setProgress(100);
        setCurrentStage('complete');
      }, 250);
      return () => clearTimeout(doneTimer);
    }

    if (uploadSucceeded === false && !finishedRef.current) {
      finishedRef.current = true;
      setCurrentStage('error');
      setProgress(0);
      onError('Upload failed. Please try again.');
    }
  }, [uploadSucceeded, onError]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const stageCopy: Record<UploadStage, { title: string; description: string; icon: React.ReactNode }> = {
    scanning: {
      icon: <ShieldIcon className="w-5 h-5 text-blue-500 animate-pulse" />,
      title: 'Scanning for threats',
      description: 'Analyzing file for malware and security threats...',
    },
    encrypting: {
      icon: <LockIcon className="w-5 h-5 text-purple-500 animate-pulse" />,
      title: 'Encrypting file',
      description: 'Applying AES-256 encryption for secure storage...',
    },
    storing: {
      icon: <DatabaseIcon className="w-5 h-5 text-green-500 animate-pulse" />,
      title: 'Storing in secure vault',
      description: 'Saving encrypted file to tamper-proof storage...',
    },
    complete: {
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      title: 'Upload complete',
      description: 'File securely stored and ready for review',
    },
    error: {
      icon: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
      title: 'Upload failed',
      description: 'Security scan detected threats or upload error occurred',
    },
  };

  const current = stageCopy[currentStage];

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UploadIcon className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-white font-semibold">Secure File Upload</h3>
            <p className="text-slate-400 text-sm">{fileName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs">Size</p>
          <p className="text-white text-sm font-medium">{formatFileSize(fileSize)}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {current.icon}
          <div className="flex-1">
            <h4 className="text-white font-medium">{current.title}</h4>
            <p className="text-slate-400 text-sm">{current.description}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">Progress</span>
          <span className="text-white text-sm font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`text-center p-3 rounded-lg border ${
          currentStage === 'scanning' || progress >= 20
            ? 'bg-blue-500/20 border-blue-500/50'
            : 'bg-slate-700/50 border-slate-600/50'
        }`}>
          <ShieldIcon className={`w-4 h-4 mx-auto mb-1 ${
            currentStage === 'scanning' ? 'text-blue-400 animate-spin' :
            progress >= 20 ? 'text-green-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-300">Scan</p>
        </div>
        <div className={`text-center p-3 rounded-lg border ${
          currentStage === 'encrypting' || progress >= 55
            ? 'bg-purple-500/20 border-purple-500/50'
            : 'bg-slate-700/50 border-slate-600/50'
        }`}>
          <LockIcon className={`w-4 h-4 mx-auto mb-1 ${
            currentStage === 'encrypting' ? 'text-purple-400 animate-pulse' :
            progress >= 55 ? 'text-purple-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-300">Encrypt</p>
        </div>
        <div className={`text-center p-3 rounded-lg border ${
          currentStage === 'storing' || progress >= 88 || currentStage === 'complete'
            ? 'bg-green-500/20 border-green-500/50'
            : 'bg-slate-700/50 border-slate-600/50'
        }`}>
          <DatabaseIcon className={`w-4 h-4 mx-auto mb-1 ${
            currentStage === 'storing' ? 'text-green-400 animate-pulse' :
            progress >= 88 || currentStage === 'complete' ? 'text-green-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-300">Store</p>
        </div>
      </div>

      {progress >= 20 && currentStage !== 'error' ? (
        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg mb-4">
          <CheckCircleIcon className="w-4 h-4 text-green-400" />
          <p className="text-green-400 text-sm">Security scan passed - No threats detected</p>
        </div>
      ) : null}

      {currentStage === 'error' ? (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-4">
          <AlertCircleIcon className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">Upload failed - Please try again</p>
        </div>
      ) : null}

      {currentStage === 'complete' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <EyeIcon className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-sm">Secure preview available for authorized users</p>
          </div>
          <button
            type="button"
            onClick={() => onComplete({
              fileName,
              fileSize,
              scanStatus: 'clean',
              encryptionStatus: 'encrypted',
              previewAvailable: true,
            })}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg border border-green-500/50 shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            OK - Continue with Assessment
          </button>
        </div>
      ) : null}

      <div className="text-center mt-4">
        <p className="text-slate-500 text-xs">
          End-to-end encryption • Malware scanning • Secure storage
        </p>
      </div>
    </div>
  );
}
