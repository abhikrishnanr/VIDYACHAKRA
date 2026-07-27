"use client";

import type { ReactNode } from "react";
import { Brand } from "@/components/brand/Brand";
import { useDemoState } from "@/lib/demo-state";
import { PublicHeader } from "./PublicHeader";

export function PublicShell({ children }: { children: ReactNode }) {
  const { revisionPublicationState } = useDemoState();
  const activeVersion = revisionPublicationState === "published" ? "1.1" : "1.0";

  return (
    <div className="public-shell">
      <PublicHeader />
      <main>{children}</main>
      <footer className="public-footer">
        <div>
          <Brand compact />
          <p>
            One trusted academic timeline for Kerala higher education.
          </p>
        </div>
        <div className="footer-meta">
          <span>Academic year 2026–27</span>
          <span>Official calendar v{activeVersion}</span>
          <span>Help &amp; accessibility</span>
        </div>
      </footer>
    </div>
  );
}
