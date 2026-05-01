export default function Privacy() {
  return (
    <div className="container py-12 prose-broadsheet max-w-3xl">
      <p className="font-mast">Site policies</p>
      <h1 style={{ fontFamily: "var(--font-display)" }}>Privacy &amp; affiliate disclosure</h1>
      <p className="text-muted-foreground italic">Last reviewed {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2>What we collect</h2>
      <p>
        Divorce &amp; Finance is a small editorial site. We use first-party privacy-respecting analytics to
        count visits in aggregate, and we never sell or share personal data. We do not run third-party
        ad networks. We do not place cross-site tracking pixels. If you write to us, we keep your email
        only as long as we need to write back.
      </p>

      <h2>Cookies</h2>
      <p>
        We set a single first-party session cookie for analytics. You can clear it at any time from your
        browser. Nothing on this site requires cookies to read.
      </p>

      <h2>Affiliate disclosure</h2>
      <p>
        As an Amazon Associate we earn from qualifying purchases. Outbound links to Amazon are marked
        <em>(paid link)</em> in line with the program's operating agreement. We earn a small commission
        when you buy through one of these links, at no cost to you. We only recommend things we'd put on
        our own desk; we don't accept payment for placement.
      </p>

      <h2>Editorial independence</h2>
      <p>
        No advertiser, affiliate program, or vendor reviews our articles before publication. The Editorial
        Desk decides what to write and how to write it. Mistakes are ours to fix; please write in if you
        find one.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Articles are journalism, not legal, tax, or investment advice. Divorce law and tax law vary by
        state and by year. Please consult a licensed attorney, CPA, or financial planner in your state
        before acting on anything you read here.
      </p>

      <h2>Contact</h2>
      <p>
        Editorial: <em>desk at this site's domain</em>. Corrections: <em>corrections at this site's
        domain</em>. We answer within a week.
      </p>
    </div>
  );
}
