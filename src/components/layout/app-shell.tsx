"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ShieldCheck,
  Radio,
  LifeBuoy,
  Newspaper,
  BadgeCheck,
  Bot,
  MessageSquareText,
  Plug,
  Settings,
  Moon,
  Sun,
  Languages,
  Bell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nav } from "@/lib/labels";
import { useBeacon } from "@/lib/store";
import { activeEvent } from "@/lib/mock/scenario";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, TooltipProvider } from "@/components/ui/misc";
import { BeaconLogo } from "@/components/layout/logo";
import { fmtTime, SCENARIO_NOW } from "@/lib/time";

const items = [
  { href: "/", key: "overview", icon: LayoutDashboard, group: "ops" },
  { href: "/prepare", key: "prepare", icon: ShieldCheck, group: "ops" },
  { href: "/respond", key: "respond", icon: Radio, group: "ops" },
  { href: "/recover", key: "recover", icon: LifeBuoy, group: "ops" },
  { href: "/intel", key: "intel", icon: Newspaper, group: "intel" },
  { href: "/press", key: "press", icon: BadgeCheck, group: "intel" },
  { href: "/agents", key: "agents", icon: Bot, group: "ai" },
  { href: "/copilot", key: "copilot", icon: MessageSquareText, group: "ai" },
  { href: "/integrations", key: "sources", icon: Plug, group: "admin" },
  { href: "/settings", key: "settings", icon: Settings, group: "admin" },
] as const;

const groups = { ops: "Operations", intel: "Intelligence", ai: "AI", admin: "Admin" } as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const lang = useBeacon((s) => s.lang);
  return (
    <nav className="flex flex-col gap-4 px-3">
      {(Object.keys(groups) as (keyof typeof groups)[]).map((g) => (
        <div key={g} className="flex flex-col gap-0.5">
          <div className="font-display px-2 pb-1 text-[10.5px] font-bold tracking-[.09em] text-muted-foreground uppercase">
            {groups[g]}
          </div>
          {items
            .filter((i) => i.group === g)
            .map((i) => {
              const active = i.href === "/" ? pathname === "/" : pathname.startsWith(i.href);
              const Icon = i.icon;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {nav[lang][i.key as keyof (typeof nav)["en"]]}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );
}

function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-60 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-14 items-center gap-2 px-5">
        <BeaconLogo />
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <NavList />
      </div>
      <div className="border-sidebar-border bg-secondary m-3 rounded-lg border p-3 text-xs">
        <div className="text-muted-foreground font-display text-[10.5px] font-bold tracking-[.09em] uppercase">Late Light Labs</div>
        <div className="text-sidebar-primary font-medium">Steady light for uncertain hours.</div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { lang, setLang } = useBeacon();
  const pending = useBeacon(
    (s) => s.tasks.filter((t) => t.status === "pending_approval").length + s.claims.filter((c) => c.status === "needs_review" || c.status === "conflict").length
  );
  return (
    <header className="bg-card sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-64 p-0">
          <SheetTitle className="flex h-14 items-center px-5">
            <BeaconLogo />
          </SheetTitle>
          <NavList />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative flex size-2.5">
          <span className="bg-destructive absolute inline-flex size-full animate-ping rounded-full opacity-60" />
          <span className="bg-destructive relative inline-flex size-2.5 rounded-full" />
        </span>
        <span className="font-display truncate text-[15px] font-bold">{activeEvent.name}</span>
        <Badge variant="danger" className="hidden sm:inline-flex">
          Severity {activeEvent.severity}/5
        </Badge>
        {activeEvent.simulated && (
          <span className="demotag hidden md:inline-block" title="Simulated exercise — all data on screen is synthetic">
            Simulation
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-muted-foreground hidden font-mono text-[12.5px] whitespace-nowrap lg:inline">{fmtTime(SCENARIO_NOW)} BST</span>
        <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "bn" : "en")} aria-label="Toggle language">
          <Languages />
          <span className="text-xs">{lang === "en" ? "বাংলা" : "EN"}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Moon className="hidden dark:block" />
          <Sun className="dark:hidden" />
        </Button>
        <Button variant="ghost" size="icon" asChild aria-label="Approvals">
          <Link href="/press" className="relative">
            <Bell />
            {pending > 0 && (
              <span className="bg-destructive text-white absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full text-[10px] font-bold">
                {pending}
              </span>
            )}
          </Link>
        </Button>
        <Avatar className="ml-1">
          <AvatarFallback>DO</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
