const TAG = "peacefulnigh0e-20";
const HEAD_IMG = "https://money-split.b-cdn.net/images/section-paperwork-light.webp";

type Item = {
  asin: string;
  title: string;
  why: string;
};

const ITEMS: Item[] = [
  { asin: "B0DWQ5RXCQ", title: "Stalogy 365 Days Notebook (B6)", why: "A dated notebook that doesn't make you feel guilty about the days you skipped. Doubles as a divorce diary, a tax-doc index, and a brain-dump." },
  { asin: "B0CYJN7HKJ", title: "LIHIT LAB Twin Ring Binder (A5)", why: "A small, dignified binder for QDRO drafts, decree pages, and beneficiary forms. The rings open without snapping. The cover wipes clean." },
  { asin: "B07K7Q8L2N", title: "Pilot Custom 74 fountain pen", why: "Signing a settlement is easier with a pen that doesn't smudge. This one is the boring, reliable choice that lasts decades." },
  { asin: "B07YLDGD8K", title: "Casio HR-170RC printing calculator", why: "When the math matters, paper tape matters. You can hand a tape to a mediator and they can read your work." },
  { asin: "B08K9CSV9G", title: "Avery Heavy-Duty View Binder (3-inch)", why: "For the closing folder: decree, QDRO, account closures, name-change docs. Three inches because year one really is that thick." },
  { asin: "B09KGPLRGW", title: "Brother P-touch label maker", why: "Boring magic. Label the file box. Label the binder. Label the folder of \"things to ask the CPA\". Future-you sleeps better." },
];

export default function Recommended() {
  return (
    <div>
      <header className="container pt-10 pb-6 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <p className="font-mast">The Recommended Desk</p>
          <h1 className="mt-2 text-4xl sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            Six small things on a calm desk.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground italic max-w-2xl" style={{ fontFamily: "var(--font-display)" }}>
            We don't recommend many things. We recommend the things that make a hard year a little less
            chaotic. Each link is an Amazon Associate link, marked <em>(paid link)</em>. We earn a small
            commission, at no cost to you, if you buy through it.
          </p>
        </div>
        <div className="lg:col-span-5">
          <img src={HEAD_IMG} alt="" className="w-full h-[400px] object-cover" loading="lazy" />
        </div>
      </header>
      <div className="masthead-rule" />

      <section className="container py-10 grid md:grid-cols-2 gap-10">
        {ITEMS.map((it) => {
          const url = `https://www.amazon.com/dp/${it.asin}?tag=${TAG}`;
          return (
            <article key={it.asin} className="border-t border-border pt-6">
              <p className="font-mast">Recommended</p>
              <h2 className="mt-1 text-2xl" style={{ fontFamily: "var(--font-display)" }}>{it.title}</h2>
              <p className="mt-3 text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{it.why}</p>
              <p className="mt-4">
                <a
                  href={url}
                  rel="sponsored noopener"
                  target="_blank"
                  className="inline-block border border-[var(--oxblood)] text-[var(--oxblood)] px-4 py-2 hover:bg-[var(--oxblood)] hover:text-[var(--primary-foreground)] transition-colors"
                  style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.06em", fontSize: "0.85rem" }}
                >
                  View on Amazon (paid link)
                </a>
              </p>
            </article>
          );
        })}
      </section>

      <section className="container pb-16 border-t border-border pt-10">
        <p className="font-mast">Affiliate disclosure</p>
        <p className="mt-2 max-w-2xl text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
          As an Amazon Associate we earn from qualifying purchases. Recommendations are independent and
          based on what we'd actually keep on our own desks during a divorce year. Nothing here is legal,
          tax, or investment advice; please call a professional in your state.
        </p>
      </section>
    </div>
  );
}
