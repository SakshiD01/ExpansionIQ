"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {MODULES.map((mod) => {
        const active =
          mod.href === "/workspace"
            ? pathname === "/workspace"
            : pathname.startsWith(mod.href);
        return (
          <Link
            key={mod.href}
            href={mod.href}
            onClick={onNavigate}
            className={cn("nav-link", active && "nav-link-active")}
          >
            <span className="truncate">{mod.short}</span>
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-12 items-center justify-between border-b border-line bg-bg-elev px-4 lg:hidden">
        <Link href="/" className="font-display text-base font-semibold">
          Expansion<span className="text-accent">IQ</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-md border border-line p-2 text-ink-muted"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Close overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-bg-elev transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-line px-4 py-4">
          <Link href="/" className="block" onClick={() => setOpen(false)}>
            <div className="font-display text-lg font-semibold tracking-tight text-ink">
              Expansion<span className="text-accent">IQ</span>
            </div>
            <p className="mt-0.5 text-[11px] text-ink-faint">Harborstack → Germany</p>
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>
        <div className="border-t border-line p-3">
          <Link href="/" className="btn-ghost w-full text-xs" onClick={() => setOpen(false)}>
            ← Marketing site
          </Link>
        </div>
      </aside>
    </>
  );
}
