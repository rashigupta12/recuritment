// components/Leads/LoadingState.tsx
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-background)] to-[var(--brand-muted)]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-[var(--brand-muted-foreground)]">
            Loading...
          </p>
        </div>
      </div>
  );
};
