"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand/Brand";

const links = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Academic Calendar" },
  { href: "/#journey", label: "Academic Journey" },
  { href: "/#institutions", label: "Institutions" },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Brand />
        <nav className="public-nav" aria-label="Public navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="public-header-actions">
          <Link className="button button-quiet public-signin" href="/login">
            Institution Workspace
          </Link>
          <button
            className="icon-button mobile-menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="mobile-public-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Institution Workspace
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
