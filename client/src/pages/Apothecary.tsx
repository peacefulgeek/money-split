// Apothecary page — a calm, image-rich field guide of teas, herbs, mushrooms,
// TCM formulas, calming supplements, and gentle ritual tools, each with an
// Amazon affiliate link (peacefulnigh0e-20). Every link is marked "(paid link)".

import { useEffect, useMemo, useState } from "react";

const HERO = "https://money-split.b-cdn.net/images/section-paperwork-light.webp";
const SIDE = "https://money-split.b-cdn.net/images/section-botanical-gold.webp";
const TAG = "peacefulnigh0e-20";

type Item = {
  asin: string;
  title: string;
  category: string;
  intent: string;
};

type Apothecary = { tag: string; items: Item[]; _note?: string };

const CATEGORIES: Array<{ key: string; label: string; copy: string }> = [
  { key: "herbal-tea", label: "Teas for the calm hour", copy: "A boiled kettle is the cheapest, oldest medicine. These are the teas a real apothecary keeps in jars." },
  { key: "loose-herb", label: "Loose herbs & flowers", copy: "Quality dried herb in pound bags, for the cook who blends her own. Store in glass; keep out of light." },
  { key: "tcm-formula", label: "Classical TCM formulas", copy: "Time-honored Chinese formulas for liver qi, restless spirit, blood, and yin. Use under a practitioner's eye when possible." },
  { key: "mushroom", label: "Mushrooms (reishi, lion's mane, cordyceps, chaga, turkey tail, maitake)", copy: "Fungi for calm immunity, stamina, and gentle focus. Dual-extract liquid or whole-body fruiting body where labeled." },
  { key: "mushroom-coffee", label: "Mushroom coffee & cacao", copy: "For the part of the morning that wants warmth without rattling the nervous system." },
  { key: "supplement", label: "Supplements & nervines", copy: "Magnesium, theanine, B-complex, ashwagandha, rhodiola, holy basil, and the rest of the calm cabinet." },
  { key: "remedy", label: "Acute remedies", copy: "Bach Rescue, homeopathic Calms Forte, and Sedalia for the harder hours." },
  { key: "essential-oil", label: "Essential oils", copy: "Lavender, frankincense, bergamot, sweet orange, peppermint. Diffuse, never ingest, always dilute on skin." },
  { key: "tool", label: "Ritual tools", copy: "Diffusers, sound machines, sleep masks, journals, pens. The hardware of a calm bedtime." },
  { key: "comfort", label: "Comfort & nesting", copy: "Weighted blankets, sherpa throws, soft sheepskins. The body asks for these before the mind does." },
];

function amazonHref(asin: string) {
  return `https://www.amazon.com/dp/${asin}/?tag=${TAG}`;
}

export default function Apothecary() {
  const [data, setData] = useState<Apothecary | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [activeCat, setActiveCat] = useState<string>("");

  useEffect(() => {
    fetch("/api/apothecary")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const items = data?.items ?? [];
  const filtered = useMemo(() => {
    let list = items;
    if (activeCat) list = list.filter((i) => i.category === activeCat);
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.intent.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeCat, filter]);

  const grouped = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const i of filtered) {
      const arr = m.get(i.category) || [];
      arr.push(i);
      m.set(i.category, arr);
    }
    return m;
  }, [filtered]);

  return (
    <div className="bg-background">
      <section className="relative">
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(252,247,237,0.92), rgba(252,247,237,0.78))" }} />
        </div>
        <div className="container relative py-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <p className="font-mast">The Apothecary Desk</p>
            <h1 className="mt-3 text-[2.4rem] sm:text-[3rem] leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
              A field guide to small, kind plants and quiet rituals.
            </h1>
            <p className="mt-4 text-muted-foreground" style={{ maxWidth: "60ch", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.05rem" }}>
              Two-hundred-and-forty-six small allies — teas, loose herbs, classical Chinese formulas, mushrooms,
              gentle supplements, essential oils, and a few comfort objects — that have helped real people
              through hard, ordinary nights. Every link is an Amazon affiliate link
              <span className="mx-1">(paid link)</span>; we earn a small commission at no cost to you.
            </p>
          </div>
          <div className="lg:col-span-4">
            <img src={SIDE} alt="" className="w-full h-[300px] object-cover" />
            <p className="font-mast mt-2">Bitter, sweet, warming, cooling — the apothecary speaks four flavors.</p>
          </div>
        </div>
      </section>

      <section className="container py-8 border-y border-border bg-secondary/40">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search by name or intent (e.g. sleep, mood, focus, liver qi)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-border bg-background px-3 py-2 w-full sm:w-96 font-byline"
            style={{ fontFamily: "var(--font-sans)" }}
          />
          <button
            onClick={() => { setFilter(""); setActiveCat(""); }}
            className="font-byline text-sm border border-border px-3 py-2 hover:bg-background"
          >Clear</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat("")}
            className={
              "px-3 py-1 text-xs border " +
              (activeCat === "" ? "bg-[var(--oxblood)] text-[var(--primary-foreground)] border-[var(--oxblood)]" : "bg-background border-border")
            }
          >All</button>
          {CATEGORIES.map((c) => {
            const count = items.filter((i) => i.category === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={
                  "px-3 py-1 text-xs border " +
                  (activeCat === c.key ? "bg-[var(--oxblood)] text-[var(--primary-foreground)] border-[var(--oxblood)]" : "bg-background border-border")
                }
              >{c.label.split(" ")[0]} <span className="opacity-70">{count}</span></button>
            );
          })}
        </div>
      </section>

      <section className="container py-12">
        {CATEGORIES.map((c) => {
          const list = grouped.get(c.key);
          if (!list || list.length === 0) return null;
          return (
            <div key={c.key} className="mb-14">
              <p className="font-mast">{c.label}</p>
              <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{c.label}</h2>
              <p className="mt-2 text-muted-foreground italic" style={{ fontFamily: "var(--font-display)", maxWidth: "70ch" }}>{c.copy}</p>
              <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {list.map((i) => (
                  <li key={i.asin} className="border-t border-border pt-3">
                    <a
                      href={amazonHref(i.asin)}
                      rel="sponsored noopener nofollow"
                      target="_blank"
                      className="font-display text-[1rem] leading-snug hover:underline underline-offset-4"
                      style={{ fontFamily: "var(--font-display)", color: "inherit" }}
                    >
                      {i.title}
                    </a>
                    <p className="text-xs mt-1 text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                      {i.intent} <span className="mx-1">·</span> <span className="opacity-70">(paid link)</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="container py-10 border-t border-border">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)", maxWidth: "70ch" }}>
          Affiliate disclosure: The Money Split is a participant in the Amazon Services LLC Associates Program,
          an affiliate advertising program designed to provide a means for sites to earn fees by linking to Amazon.com
          and affiliated sites. Every link in this apothecary is an affiliate link
          <span className="mx-1">(paid link)</span>; clicking through and purchasing helps fund the journalism on this site.
          Nothing here is medical advice. If a product feels off, return it; the body knows.
        </p>
      </section>
    </div>
  );
}
