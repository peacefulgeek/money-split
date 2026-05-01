import { Link, useParams } from "wouter";
import { Streamdown } from "streamdown";
import { useArticles, useArticle, formatDate, type Article } from "@/lib/useArticles";
import { useEffect } from "react";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const all = useArticles();
  const article = useArticle(slug);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — The Money Split`;
    }
  }, [article]);

  if (all === null) {
    return (
      <div className="container py-20 text-center font-mast">Loading the page slowly…</div>
    );
  }

  if (!article) {
    return (
      <div className="container py-20">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>We couldn't find that piece.</h1>
        <p className="mt-3 text-muted-foreground">It may have been retitled. <Link href="/articles"><span className="underline text-[var(--oxblood)]">Browse the full archive</span></Link>.</p>
      </div>
    );
  }

  const related = (all || []).filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 3);
  const fallback = (all || []).filter((a) => a.slug !== article.slug).slice(0, 3);
  const sidebar = (related.length ? related : fallback) as Article[];

  return (
    <article className="bg-background">
      <header className="container pt-10 pb-2">
        <p className="font-mast">{article.category} &middot; {formatDate(article.published_at)} &middot; {article.reading_minutes} min read</p>
        <h1 className="mt-3 text-[2.4rem] sm:text-[3rem] leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>{article.title}</h1>
        <p className="mt-4 text-xl text-muted-foreground italic" style={{ fontFamily: "var(--font-display)", maxWidth: "60ch" }}>{article.dek}</p>
        <p className="mt-6 font-byline">
          By <span className="text-foreground">{article.author?.name}</span> &middot; {article.author?.title}
        </p>
      </header>

      {article.hero_image && (
        <div className="container mt-6">
          <img src={article.hero_image} alt="" className="w-full max-h-[520px] object-cover" loading="eager" />
          <p className="font-mast mt-2">An editorial still life for the day's piece.</p>
        </div>
      )}

      <div className="container py-10 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          {/* TL;DR card */}
          {article.tldr && article.tldr.length > 0 && (
            <aside className="border-l-4 border-[var(--oxblood)] pl-5 py-4 mb-10 bg-[var(--sage-50)]">
              <p className="font-mast">TL;DR — read this if you only have a minute</p>
              <ul className="mt-3 space-y-1.5 list-disc pl-5" style={{ fontFamily: "var(--font-display)" }}>
                {article.tldr.map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </aside>
          )}

          <div className="prose-broadsheet dropcap max-w-none">
            <Streamdown>{article.body}</Streamdown>
          </div>

          {/* Author closing card */}
          <aside className="mt-14 border-t border-border pt-8">
            <p className="font-mast">About the writer</p>
            <p className="mt-2" style={{ fontFamily: "var(--font-display)" }}>
              <strong>{article.author?.name}</strong> &mdash; {article.author?.title}.
            </p>
            <p className="mt-2 text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{article.author?.bio}</p>
            <p className="mt-4 font-byline">Last reviewed {formatDate(article.updated_at)}</p>
          </aside>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          <section>
            <p className="font-mast">More from this section</p>
            <ul className="mt-3 space-y-4">
              {sidebar.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`}>
                    <span className="block">
                      {a.hero_image && <img src={a.hero_image} alt="" className="w-full h-28 object-cover mb-2" loading="lazy" />}
                      <p className="font-mast">{a.category} &middot; {a.reading_minutes} min</p>
                      <p className="mt-1 hover:text-[var(--oxblood)]" style={{ fontFamily: "var(--font-display)" }}>{a.title}</p>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="border-t border-border pt-6">
            <p className="font-mast">Affiliate note</p>
            <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              Links marked <em>(paid link)</em> are Amazon Associate links. If you buy through them we may
              earn a small commission, at no cost to you. We only recommend things we'd put on our own desk.
            </p>
          </section>
        </aside>
      </div>
    </article>
  );
}
