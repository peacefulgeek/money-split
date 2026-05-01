import { Link } from "wouter";
import { useArticles, formatDate } from "@/lib/useArticles";
import { useMemo, useState } from "react";

export default function Articles() {
  const articles = useArticles() || [];
  const [filter, setFilter] = useState<string>("all");
  const categories = useMemo(() => {
    const s = new Set<string>();
    articles.forEach((a) => s.add(a.category));
    return ["all", ...Array.from(s).sort()];
  }, [articles]);
  const visible = filter === "all" ? articles : articles.filter((a) => a.category === filter);

  return (
    <div>
      <header className="container pt-10 pb-6">
        <p className="font-mast">The full archive</p>
        <h1 className="mt-2 text-4xl sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          Every piece, slowly written.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          A quiet index of every article. Sorted by date, filterable by section. Each one is meant to be read once, then returned to.
        </p>
      </header>
      <div className="masthead-rule" />
      <div className="container py-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={
              "px-3 py-1 text-xs border " +
              (filter === c ? "border-[var(--oxblood)] text-[var(--oxblood)] bg-[var(--sage-50)]" : "border-border text-muted-foreground hover:text-[var(--oxblood)]")
            }
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="container pb-16 grid md:grid-cols-2 gap-x-12 gap-y-12">
        {visible.map((a) => (
          <article key={a.slug} className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              {a.hero_image && <img src={a.hero_image} alt="" className="w-full h-32 object-cover" loading="lazy" />}
            </div>
            <div className="col-span-7">
              <p className="font-mast">{a.category} &middot; {formatDate(a.published_at)}</p>
              <Link href={`/articles/${a.slug}`}>
                <span>
                  <h2 className="mt-1 text-xl leading-snug hover:text-[var(--oxblood)]" style={{ fontFamily: "var(--font-display)" }}>
                    {a.title}
                  </h2>
                </span>
              </Link>
              <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                {a.dek}
              </p>
              <p className="mt-3 font-byline">By {a.author?.name} &middot; {a.reading_minutes} min</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
