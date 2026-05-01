import { Link, useLocation } from "wouter";

const NAV: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "Assessments", href: "/assessments" },
  { label: "Apothecary", href: "/apothecary" },
  { label: "Recommended", href: "/recommended" },
  { label: "About", href: "/about" },
];

export default function SiteHeader() {
  const [loc] = useLocation();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <header className="border-b border-border bg-background">
      <div className="container py-3 flex items-center justify-between text-xs">
        <span className="font-mast">Vol. I, Issue {Math.max(1, new Date().getMonth() + 1)} &middot; Calm money &middot; Honest math</span>
        <span className="font-mast hidden sm:inline">{today}</span>
      </div>
      <div className="masthead-rule" />
      <div className="container pt-7 pb-2 text-center">
        <Link href="/">
          <span className="block font-display text-[2.6rem] sm:text-[3.4rem] leading-none tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            The Money <span style={{ color: "var(--oxblood)", fontStyle: "italic", fontWeight: 500 }}>Split</span>
          </span>
        </Link>
        <p className="font-mast mt-3">Calm money &middot; Honest math &middot; A grown-up broadsheet</p>
      </div>
      <div className="masthead-rule" />
      <nav className="container py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.92rem]">
        {NAV.map((n) => {
          const active = loc === n.href || (n.href !== "/" && loc.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href}>
              <span
                className={
                  "font-byline tracking-wide " +
                  (active ? "text-[var(--oxblood)] underline underline-offset-4" : "text-foreground hover:text-[var(--oxblood)]")
                }
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {n.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
