const PORTRAIT = "https://money-split.b-cdn.net/images/hero-walking-forward.webp";
const BOTANY = "https://money-split.b-cdn.net/images/section-botanical-gold.webp";

export default function About() {
  return (
    <div>
      <header className="container pt-10 pb-6 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <p className="font-mast">About the desk</p>
          <h1 className="mt-2 text-4xl sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            A small, slow broadsheet for the financial side of starting over.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground italic max-w-2xl" style={{ fontFamily: "var(--font-display)" }}>
            We write for the spouse who is sitting at the kitchen table at six in the morning with a folder
            and a cup of tea, trying to remember the password to the joint account.
          </p>
        </div>
        <div className="lg:col-span-5">
          <img src={PORTRAIT} alt="" className="w-full h-[420px] object-cover" loading="lazy" />
        </div>
      </header>
      <div className="masthead-rule" />

      <section className="container py-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 prose-broadsheet">
          <h2>Why this desk exists</h2>
          <p>
            Divorce is rarely about the documents. It's about the small, dignified habits that put a life
            back on its rails. Open the folder. Make the call. Update the beneficiary. Set aside the
            quarterly tax. We write to those small habits, slowly, the way a Sunday paper used to.
          </p>
          <h2>Who writes here</h2>
          <p>
            <strong>The Editorial Desk</strong> is a small group of writers who have, between them, lived
            through long marriages, mediated separations, contested settlements, and quiet years of
            rebuilding. Bylines below each article tell you which of us is writing, and why we're qualified
            to write it. None of us is a lawyer or accountant in your state, and we say so on every piece.
          </p>
          <h2>What we won't do</h2>
          <p>
            We won't shout. We won't sell you a course. We won't pretend money is a personality test.
            Affiliate links are marked <em>(paid link)</em> in line with Amazon's program rules. The
            recommendations are pieces of paper, pens, folders, calculators &mdash; the boring tools that
            make the boring tasks possible.
          </p>
          <h2>How to read us</h2>
          <p>
            Pick one piece. Read it twice. Do the smallest thing it suggests. Come back next week. The
            archive is built for slow rereading, not for binging.
          </p>
        </div>
        <aside className="lg:col-span-5 space-y-8">
          <div>
            <p className="font-mast">A masthead, of sorts</p>
            <ul className="mt-3 space-y-3" style={{ fontFamily: "var(--font-display)" }}>
              <li><strong>M. Wynn</strong> &middot; <span className="text-muted-foreground">Editor &amp; founder</span></li>
              <li><strong>R. Patel, CFP&reg;</strong> &middot; <span className="text-muted-foreground">Money correspondent</span></li>
              <li><strong>J. Okafor, JD</strong> &middot; <span className="text-muted-foreground">Legal explainer</span></li>
              <li><strong>D. Reyes, EA</strong> &middot; <span className="text-muted-foreground">Tax desk</span></li>
            </ul>
          </div>
          <img src={BOTANY} alt="" className="w-full h-64 object-cover" loading="lazy" />
          <p className="font-byline italic">"Write the slow piece. Write the small piece. Write the piece your reader will be grateful for at six in the morning."</p>
        </aside>
      </section>
    </div>
  );
}
