// Master scope §14D — EEAT prompt fragment.

const CREDENTIALS = {
  'The Oracle Lover': [
    'CDFA-trained financial educator and intuitive guide for people rebuilding after divorce',
    'writer and oracle reader who covers the financial side your attorney did not',
    'spiritual guide and longtime student of post-divorce financial reset',
  ],
};

export function pickCredential(authorName) {
  const list = CREDENTIALS[authorName] || CREDENTIALS['The Oracle Lover'];
  return list[Math.floor(Math.random() * list.length)];
}

export function buildEEATPrompt(authorName, niche) {
  const cred = pickCredential(authorName);
  const today = new Date().toISOString().split('T')[0];

  return `EEAT REQUIREMENTS (mandatory):

1. TL;DR BLOCK at the very top of the body. Exactly:
   <section data-tldr="ai-overview" aria-label="In short">
     <p>Three sentences. Each <=32 words. Declarative. No questions.
     Each sentence directly answers the question implicit in the title.
     Lift-ready as an AI Overview citation.</p>
   </section>

2. SELF-REFERENCING LANGUAGE - at least one sentence using one of:
   "In our experience writing about ${niche}...",
   "Across the dozens of articles we've published on this site...",
   "When I tested...",
   "Over the years I've seen...",
   "In my own practice...",
   "After years of working with people on this...".

3. INTERNAL LINKS - minimum 3, woven into prose with varied anchor text.

4. EXTERNAL AUTHORITATIVE LINK - at least 1 to a .gov, .edu, NIH, CDC,
   WHO, Nature, ScienceDirect, or PubMed source. Format:
   <a href="https://www.ssa.gov/..." target="_blank" rel="nofollow noopener">descriptive anchor</a>

5. LAST-UPDATED DATETIME - inside the byline block.

6. AUTHOR BYLINE BLOCK at the bottom, exactly:
   <aside class="author-byline" data-eeat="author">
     <p><strong>Reviewed by ${authorName}</strong>, ${cred}.
     Last updated <time datetime="${today}">${today}</time>.</p>
     <p>One or two sentences of warm, self-referencing context.</p>
   </aside>`;
}
