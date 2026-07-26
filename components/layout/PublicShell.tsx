import type { ReactNode } from "react";
import { Brand } from "@/components/brand/Brand";
import { PublicHeader } from "./PublicHeader";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">
      <PublicHeader />
      <main>{children}</main>
      <footer className="public-footer">
        <div>
          <Brand compact />
          <p>
            A shared academic coordination prototype for Kerala&apos;s higher
            education ecosystem.
          </p>
        </div>
        <div className="footer-meta">
          <span>Academic year 2026–27</span>
          <span>Accessibility</span>
          <span>Contact secretariat</span>
        </div>
      </footer>
    </div>
  );
}
