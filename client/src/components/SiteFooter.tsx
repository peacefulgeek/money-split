import { Link } from "wouter";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-24">
      <div className="masthead-rule" />
      <div className="container py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-mast">The Editorial Desk</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            Divorce &amp; Finance is a calm broadsheet for the financial side of starting over. We write
            slowly, cite carefully, and recommend the few small things that actually help.
          </p>
        </div>
        <div>
          <p className="font-mast">Sections</p>
          <ul className="mt-3 space-y-1 text-sm" style={{ fontFamily: "var(--font-sans)" }}>
            <li><Link href="/articles"><span className="hover:text-[var(--oxblood)]">All articles</span></Link></li>
            <li><Link href="/recommended"><span className="hover:text-[var(--oxblood)]">Recommended desk</span></Link></li>
            <li><Link href="/about"><span className="hover:text-[var(--oxblood)]">About the writer</span></Link></li>
            <li><Link href="/privacy"><span className="hover:text-[var(--oxblood)]">Privacy &amp; affiliate disclosure</span></Link></li>
            <li><a href="/rss.xml" className="hover:text-[var(--oxblood)]">RSS feed</a></li>
          </ul>
        </div>
        <div>
          <p className="font-mast">Disclosure</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            We participate in the Amazon Associates program. When you buy through links marked
            "(paid link)" we may earn a small commission, at no cost to you. Nothing here is legal,
            tax, or investment advice. Please call a professional in your state.
          </p>
        </div>
      </div>
      <div className="masthead-rule" />
      <div className="container py-5 text-center font-mast">
        &copy; {year} Divorce &amp; Finance &middot; Set in Spectral, IBM Plex Sans, DM Mono &middot; Made with calm
      </div>
    </footer>
  );
}
