import { Link } from "wouter";
import { useArticles, formatDate, type Article } from "@/lib/useArticles";

const HERO_IMG = "https://money-split.b-cdn.net/images/hero-dawn-window.webp";
const SECTION_PAPER = "https://money-split.b-cdn.net/images/section-paperwork-light.webp";
const SECTION_WALK = "https://money-split.b-cdn.net/images/hero-walking-forward.webp";
const SECTION_BOTANY = "https://money-split.b-cdn.net/images/section-botanical-gold.webp";

export default function Home() {
  const all = useArticles();
  const articles = (all || []) as Article[];
  const lead = articles[0];
  const second = articles[1];
  const third = articles[2];
  const grid = articles.slice(3, 9);
  const recent = articles.slice(9, 17);

  return (
    <div className="bg-background">
      {/* HERO masthead-photo block */}
      <section className="relative">
        <div className="container pt-8 pb-2 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="font-mast">The lede &middot; {lead ? formatDate(lead.published_at) : ""}</p>
            <h1 className="mt-4 text-[2.4rem] sm:text-[3.2rem] lg:text-[3.6rem] leading-[1.05] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              {lead ? lead.title : "Money, after the marriage."}
            </h1>
            {lead?.dek && (
              <p className="mt-5 text-[1.15rem] text-muted-foreground italic" style={{ fontFamily: "var(--font-display)", maxWidth: "60ch" }}>
                {lead.dek}
              </p>
            )}
            <p className="mt-6 font-byline">
              {lead ? `By ${lead.author?.name || "The Editorial Desk"}` : "By the Editorial Desk"}
              {lead?.author?.title ? ` · ${lead.author.title}` : ""}
            </p>
            {lead && (
              <Link href={`/articles/${lead.slug}`}>
                <span className="inline-block mt-6 border border-[var(--oxblood)] text-[var(--oxblood)] px-5 py-2 hover:bg-[var(--oxblood)] hover:text-[var(--primary-foreground)] transition-colors" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em", fontSize: "0.85rem" }}>
                  Read the full piece &rarr;
                </span>
              </Link>
            )}
          </div>
          <div className="lg:col-span-5">
            <figure className="relative">
              <img src={lead?.hero_image || HERO_IMG} alt="" className="w-full h-[420px] object-cover" loading="eager" />
              <figcaption className="font-mast mt-2">A small ritual: open the window, open the folder.</figcaption>
            </figure>
          </div>
        </div>
        <div className="container">
          <div className="masthead-rule mt-10" />
        </div>
      </section>

      {/* Two-up second tier */}
      <section className="container py-12 grid md:grid-cols-2 gap-12">
        {[second, third].filter(Boolean).map((a) => (
          <article key={a!.slug} className="group">
            <Link href={`/articles/${a!.slug}`}>
              <span>
                <img src={a!.hero_image || SECTION_PAPER} alt="" className="w-full h-72 object-cover" loading="lazy" />
                <p className="font-mast mt-4">{a!.category} &middot; {formatDate(a!.published_at)} &middot; {a!.reading_minutes} min</p>
                <h2 className="mt-2 text-2xl leading-snug group-hover:text-[var(--oxblood)]" style={{ fontFamily: "var(--font-display)" }}>{a!.title}</h2>
                <p className="mt-2 text-muted-foreground" style={{ maxWidth: "60ch" }}>{a!.dek}</p>
              </span>
            </Link>
          </article>
        ))}
      </section>

      {/* Calm pull-quote band over botanical image */}
      <section className="relative py-16">
        <div className="absolute inset-0">
          <img src={SECTION_BOTANY} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(252,247,237,0.92), rgba(252,247,237,0.78))" }} />
        </div>
        <div className="container relative">
          <p className="font-mast">An editor's note</p>
          <p className="pull-quote mt-4" style={{ maxWidth: "44ch" }}>
            Money is not a moral test. It is a set of small, repeatable habits, and a few brave phone calls, made on quiet mornings.
          </p>
          <p className="font-byline">M. Wynn, Editor &middot; Set in Spectral italic, 28pt</p>
        </div>
      </section>

      {/* Six-up grid */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>Around the desk</h3>
          <Link href="/articles"><span className="font-mast hover:text-[var(--oxblood)]">All articles &rarr;</span></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {grid.map((a) => (
            <article key={a.slug}>
              <Link href={`/articles/${a.slug}`}>
                <span>
                  <img src={a.hero_image || SECTION_PAPER} alt="" className="w-full h-44 object-cover" loading="lazy" />
                  <p className="font-mast mt-3">{a.category} &middot; {a.reading_minutes} min</p>
                  <h4 className="mt-1 text-lg leading-snug hover:text-[var(--oxblood)]" style={{ fontFamily: "var(--font-display)" }}>{a.title}</h4>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Recent column with woman-walking-forward sidebar */}
      <section className="container py-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <img src={SECTION_WALK} alt="" className="w-full h-[420px] object-cover" loading="lazy" />
          <p className="font-mast mt-3">Forward, slowly</p>
          <p className="mt-2 text-muted-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
            One quiet morning at a time. The point is not to feel ready. The point is to do the next small thing.
          </p>
        </div>
        <div className="lg:col-span-8">
          <h3 className="text-2xl mb-4" style={{ fontFamily: "var(--font-display)" }}>Recently filed</h3>
          <ol className="divide-y divide-border">
            {recent.map((a, i) => (
              <li key={a.slug} className="py-4 flex gap-6 items-start">
                <span className="font-mast w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <Link href={`/articles/${a.slug}`}>
                    <span>
                      <h4 className="text-lg hover:text-[var(--oxblood)]" style={{ fontFamily: "var(--font-display)" }}>{a.title}</h4>
                      <p className="font-byline mt-1">{a.category} &middot; {formatDate(a.published_at)}</p>
                    </span>
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
