"use client";

import { X } from "lucide-react";
import { AlertInput } from "./alert-input";
import { AnalyzingLoader } from "./analyzing-loader";

export function NewAlertModal({
  onClose,
  onSubmit,
  isAnalyzing
}: {
  onClose: () => void;
  onSubmit: (text: string) => void;
  isAnalyzing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-void/70 p-4 backdrop-blur-sm sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-3 flex justify-end">
          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {isAnalyzing ? <AnalyzingLoader /> : <AlertInput onSubmit={onSubmit} isAnalyzing={isAnalyzing} />}
      </div>
    </div>
  );
}
