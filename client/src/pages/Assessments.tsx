// Assessments page — 11 lovely, nurturing self-assessments.
// Each assessment is a small modal-style multi-question survey with a calm
// outcome paragraph (no scoring shame, no fear-mongering, no hard calls).
// Data lives in this file so we never depend on a backend for this feature.

import { useMemo, useState } from "react";
import { Link } from "wouter";

const HERO = "https://money-split.b-cdn.net/images/section-botanical-gold.webp";
const SIDE = "https://money-split.b-cdn.net/images/hero-walking-forward.webp";

type Question = { q: string; choices: string[] };
type Assessment = {
  slug: string;
  title: string;
  dek: string;
  intent: string;
  questions: Question[];
  outcome: (score: number) => { headline: string; body: string; nextSteps: string[] };
};

const SCALE5: string[] = [
  "Not at all",
  "A little",
  "Sometimes",
  "Often",
  "Almost always",
];

const ASSESSMENTS: Assessment[] = [
  {
    slug: "money-clarity",
    title: "Money Clarity Check",
    dek: "Do you know where your money actually lives, right now, on a regular Tuesday?",
    intent: "A gentle audit of how clearly you can see the household's accounts, balances, and obligations.",
    questions: [
      { q: "I can list, from memory, every checking and savings account in my name and our names.", choices: SCALE5 },
      { q: "I know the current balance of each account within a few hundred dollars.", choices: SCALE5 },
      { q: "I have logged into our credit-card portals in the last 30 days.", choices: SCALE5 },
      { q: "I can find every recurring bill we have.", choices: SCALE5 },
      { q: "I know which accounts have only my spouse's name on them.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "You see your money clearly. That is rare and beautiful." : s >= 12 ? "You see most of it. The rest is reachable in an afternoon." : "There is a fog here. The good news: fog lifts.",
      body: "Clarity comes from looking, not from being told. Spend one quiet hour with a notebook this week and write down every account by hand. The act of writing builds memory.",
      nextSteps: [
        "Open one bank statement you have not opened in months.",
        "Write each account on a single page, balances rounded to the nearest hundred.",
        "Read [Net-worth statement, day one](/articles/net-worth-statement-day-one).",
      ],
    }),
  },
  {
    slug: "credit-confidence",
    title: "Credit Confidence Check",
    dek: "How calm are you when someone says the words \"credit score\"?",
    intent: "A gentle look at whether your credit feels like a tool you use, or a thing that uses you.",
    questions: [
      { q: "I have pulled a free credit report from annualcreditreport.gov in the last 12 months.", choices: SCALE5 },
      { q: "I know my credit score within 25 points.", choices: SCALE5 },
      { q: "I know which credit cards have my name on them, jointly or solely.", choices: SCALE5 },
      { q: "I can describe what would happen to my credit if a card I am an authorized user on went unpaid.", choices: SCALE5 },
      { q: "I have placed, or know how to place, a free credit freeze.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "Your credit is a tool, not a tyrant." : s >= 12 ? "You are halfway there. Most of this is twenty minutes of reading." : "Credit feels scary right now. That softens the moment you look.",
      body: "A credit report is a long shopping list. It is not a moral document. Pull it; read it slowly; mark what looks wrong with a pencil; come back tomorrow.",
      nextSteps: [
        "Pull your free credit report this week.",
        "Read [Rebuilding credit, the calm 90-day plan](/articles/credit-reset-90-day-plan).",
        "If anything feels frightening, write it down. Naming it will help.",
      ],
    }),
  },
  {
    slug: "documents-ready",
    title: "Document Readiness Check",
    dek: "If you needed your tax returns, mortgage statement, and retirement statements by Friday, could you find them?",
    intent: "A practical, no-shame check on the basic paper trail.",
    questions: [
      { q: "I can find our last three years of tax returns in under fifteen minutes.", choices: SCALE5 },
      { q: "I can find every retirement account statement (401(k), IRA, pension) for the last quarter.", choices: SCALE5 },
      { q: "I have a copy of our most recent mortgage statement.", choices: SCALE5 },
      { q: "I have a copy of our marriage certificate stored somewhere I trust.", choices: SCALE5 },
      { q: "I have any prenuptial or postnuptial agreement saved digitally.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "Your paper trail is intact. You can move quickly when you need to." : s >= 12 ? "Most documents are findable. A weekend afternoon will close the gaps." : "Paper feels scattered. That is normal. Start with one folder.",
      body: "If a single sheet of paper is missing, the rest of the work still gets done. The point is reachability, not perfection. A folder, real or digital, is enough.",
      nextSteps: [
        "Create one folder labeled FINANCIAL today.",
        "Drop the last three tax returns in it.",
        "Read [The financial documents you need before you file](/articles/qdro-101-getting-your-share).",
      ],
    }),
  },
  {
    slug: "support-network",
    title: "Support Network Check",
    dek: "Who picks up the phone when the inbox gets heavy?",
    intent: "A gentle inventory of the people you can call, calmly, when the financial side feels loud.",
    questions: [
      { q: "I have a trusted friend I can call to talk about money without judgment.", choices: SCALE5 },
      { q: "I know at least one professional (CPA, financial planner, or attorney) I could reach this week.", choices: SCALE5 },
      { q: "I have someone who can sit with me while I open hard mail.", choices: SCALE5 },
      { q: "I have an online or in-person community where I feel less alone in this.", choices: SCALE5 },
      { q: "I take walks, breaths, or naps when the planning gets heavy.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "You are well held. That alone is a financial asset." : s >= 12 ? "Your circle is real. There is room for one more name." : "It is quiet right now. One phone call this week will change that.",
      body: "Money work is not done alone. The most expensive mistakes happen in private. One trusted ear cuts every problem in half before any pen has touched paper.",
      nextSteps: [
        "Text one person today and say, \"I'm working on the money side. Can I talk it through with you Sunday?\"",
        "Save the phone number of one professional you trust.",
        "Read [A calm to-do for the first 30 days after divorce](/articles/single-bank-account-30-days).",
      ],
    }),
  },
  {
    slug: "income-foundation",
    title: "Income Foundation Check",
    dek: "Could you make rent, alone, this month?",
    intent: "A direct, kind look at your income picture today.",
    questions: [
      { q: "I have at least one income stream that does not depend on my spouse.", choices: SCALE5 },
      { q: "I know my monthly take-home pay within 10%.", choices: SCALE5 },
      { q: "I know my monthly minimum living costs within 10%.", choices: SCALE5 },
      { q: "I know what my income would look like if alimony or child support changed.", choices: SCALE5 },
      { q: "I have a way to earn an extra $300 a month if I had to.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "Your income foundation is real and visible." : s >= 12 ? "The bones are there. The numbers want a quiet hour to firm up." : "There is real fragility here. You have not failed. You are just early.",
      body: "Income is the platform every other plan rests on. A single, honest spreadsheet of inflows and outflows will turn most fears into manageable problems.",
      nextSteps: [
        "Write one column of inflows and one column of outflows on a piece of paper.",
        "Read [Budgeting on one income, without misery](/articles/budgeting-on-one-income).",
        "If income looks short, read [Return to work, with a salary you can defend](/articles/return-to-work-salary-negotiation).",
      ],
    }),
  },
  {
    slug: "retirement-clarity",
    title: "Retirement Clarity Check",
    dek: "Do you know what \"yours\" looks like in retirement, separate from \"ours\"?",
    intent: "A long-horizon assessment that does not ask you to feel ready, only to look.",
    questions: [
      { q: "I know whether each retirement account is in my name, my spouse's, or joint.", choices: SCALE5 },
      { q: "I know the most recent balance of each retirement account within a few thousand dollars.", choices: SCALE5 },
      { q: "I have an idea of what age I would like to retire.", choices: SCALE5 },
      { q: "I know what a QDRO is.", choices: SCALE5 },
      { q: "I have a sense of whether Social Security on my own record or my ex's would be larger at 67.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "You can see the long road. Most people cannot." : s >= 12 ? "The picture is forming. A single afternoon turns it into a real plan." : "Retirement feels far away. That is okay. Let the future wait while you read.",
      body: "Retirement planning is mostly arithmetic and patience. Once you see what you have, the next decade plans itself in modest, repeating moves.",
      nextSteps: [
        "Pull the most recent statement from every retirement account.",
        "Read [QDRO 101: how to actually get your share of his 401(k)](/articles/qdro-101-getting-your-share).",
        "Read [Social Security on an ex-spouse's record](/articles/social-security-ex-record).",
      ],
    }),
  },
  {
    slug: "estate-care",
    title: "Estate-Care Check",
    dek: "If something happened tomorrow, would the people you love be cared for, on paper?",
    intent: "A tender check on wills, beneficiaries, and powers of attorney, with no rush.",
    questions: [
      { q: "I have an up-to-date will.", choices: SCALE5 },
      { q: "I have updated beneficiary designations on retirement and life-insurance accounts since the separation.", choices: SCALE5 },
      { q: "I have a financial power of attorney named.", choices: SCALE5 },
      { q: "I have a healthcare power of attorney named.", choices: SCALE5 },
      { q: "Someone I trust knows where these documents live.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "The people you love are held by your paperwork. That is real love made legal." : s >= 12 ? "Most of the framework is there. One short visit to a lawyer closes the gap." : "It is quiet right now. The next thirty days can change that.",
      body: "Estate documents are not about death. They are about who picks up your dog when you are in surgery. Treat the paperwork as a love letter to your future household.",
      nextSteps: [
        "Take ten minutes this week to write down a beneficiary update list.",
        "Read [The thirty-minute beneficiary update](/articles/beneficiary-updates-30-minutes).",
        "Read [Estate plan reset week](/articles/estate-plan-reset-week).",
      ],
    }),
  },
  {
    slug: "housing-decision",
    title: "Housing Decision Check",
    dek: "Should you keep the house, sell it, or refinance? A quiet look before any decision.",
    intent: "A gentle audit of the financial story behind the most emotional asset in many divorces.",
    questions: [
      { q: "I know the current Zillow estimate of our home, and the most recent appraisal.", choices: SCALE5 },
      { q: "I know our remaining mortgage balance.", choices: SCALE5 },
      { q: "I know whether I could qualify for a refinance on my income alone.", choices: SCALE5 },
      { q: "I know what I would owe in capital-gains tax if we sold this year.", choices: SCALE5 },
      { q: "I have visualized a different house I would actually like.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "You are ready to choose, not from fear, but from facts." : s >= 12 ? "The math is forming. Two phone calls finish the picture." : "It is okay to not know yet. Keep, sell, and refinance are all real doors.",
      body: "Houses are emotional. The math, however, will let your heart make the call without regret. Start with the appraisal, then the refinance pre-qualification, then the after-tax sale number.",
      nextSteps: [
        "Pull a current mortgage statement and an online estimate.",
        "Read [The marital home: keep, sell, or buy out, the actual math](/articles/house-buyout-math).",
        "Read [Refinancing the marital home, on one income](/articles/refinance-marital-home).",
      ],
    }),
  },
  {
    slug: "tax-readiness",
    title: "Tax-Readiness Check",
    dek: "Does April still feel like a surprise, or is it a quiet month on the calendar?",
    intent: "A practical look at how prepared you are to file, alone, this year.",
    questions: [
      { q: "I know what filing status I will use this year.", choices: SCALE5 },
      { q: "I have a CPA, enrolled agent, or trusted DIY plan I trust.", choices: SCALE5 },
      { q: "I know whether my refund will be larger or smaller than last year.", choices: SCALE5 },
      { q: "I know which child-related credits I can claim.", choices: SCALE5 },
      { q: "I have a sense of how alimony or support is taxed in my situation.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "You walk into April with shoulders down." : s >= 12 ? "You are mostly ready. The remaining gaps are easily named." : "Taxes feel loud. They will quiet down once a real human looks at them with you.",
      body: "Most tax fear lives in the imagined version. The real tax return, line by line, is dull. Get a person on the phone before March.",
      nextSteps: [
        "Read [Filing status, year one](/articles/filing-status-first-year).",
        "Read [Alimony and taxes after the 2018 rule change](/articles/alimony-and-taxes-2018).",
        "Schedule one twenty-minute call with a tax professional this week.",
      ],
    }),
  },
  {
    slug: "kids-money-care",
    title: "Kids-and-Money Care Check",
    dek: "If a child asked you tonight, gently, what is happening with money, what would you say?",
    intent: "A soft check on how the financial story is being held inside the home, for them.",
    questions: [
      { q: "I have a calm phrase I use when kids ask money questions.", choices: SCALE5 },
      { q: "I have a plan for child-related expenses outside of court-ordered support.", choices: SCALE5 },
      { q: "I know what 529 or other college accounts exist for the kids.", choices: SCALE5 },
      { q: "I know who claims each child on taxes.", choices: SCALE5 },
      { q: "I have a co-parent expense tracking system, on paper or in an app.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "Your children are held in the calm story you tell." : s >= 12 ? "You are tending it well. A small system removes the rest of the friction." : "It is okay. Children sense calm; they do not require explanations.",
      body: "Children do not need numbers. They need to know that the person caring for them has a plan, and is at peace. That is a financial gift no spreadsheet can replace.",
      nextSteps: [
        "Read [The child-support math you can do at the kitchen table](/articles/child-support-math).",
        "Read [Co-parenting expenses, in one shared spreadsheet](/articles/co-parenting-spreadsheet).",
        "Read [529 plans after divorce](/articles/529-plans-after-divorce).",
      ],
    }),
  },
  {
    slug: "fresh-start-readiness",
    title: "Fresh-Start Readiness Check",
    dek: "When the dust settles, what does the next year look like?",
    intent: "A horizon-line assessment for the slow rebuild, with no shame about pace.",
    questions: [
      { q: "I have an emergency fund equal to one month of essential expenses.", choices: SCALE5 },
      { q: "I have one financial goal for the next twelve months I can describe in a sentence.", choices: SCALE5 },
      { q: "I have a small ritual that helps me look at money calmly each week.", choices: SCALE5 },
      { q: "I have one new skill I am learning, on or off the job.", choices: SCALE5 },
      { q: "I am sleeping a little better than I was three months ago.", choices: SCALE5 },
    ],
    outcome: (s) => ({
      headline: s >= 18 ? "A fresh start is no longer a metaphor for you. It is a calendar." : s >= 12 ? "The garden is planted. The harvest will come quietly." : "It is okay if today is just survival. The slow days still count.",
      body: "Fresh starts arrive in increments. A weekly money-look, a single emergency fund, one quiet goal: these are the entire technology of recovery. You are right where you are.",
      nextSteps: [
        "Read [The financial fresh-start checklist](/articles/credit-reset-90-day-plan).",
        "Read [Emergency fund after divorce](/articles/emergency-fund-after-divorce).",
        "Pick one Sunday morning a month and call it Money Sunday.",
      ],
    }),
  },
];

function AssessmentRunner({ a }: { a: Assessment }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<number[]>(() => a.questions.map(() => -1));
  const score = useMemo(() => answers.reduce((acc, n) => acc + (n >= 0 ? n + 1 : 0), 0), [answers]);
  const allAnswered = answers.every((n) => n >= 0);
  const result = allAnswered ? a.outcome(score) : null;
  return (
    <div>
      {!open ? (
        <button
          className="font-byline text-[var(--oxblood)] underline underline-offset-4 hover:no-underline"
          onClick={() => setOpen(true)}
        >
          Begin this assessment &rarr;
        </button>
      ) : (
        <div className="mt-4 border border-border bg-secondary/50 p-5">
          <ol className="space-y-4">
            {a.questions.map((q, i) => (
              <li key={i}>
                <p className="font-display text-[1.05rem]" style={{ fontFamily: "var(--font-display)" }}>{i + 1}. {q.q}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.choices.map((c, j) => (
                    <button
                      key={c}
                      onClick={() => setAnswers((prev) => prev.map((v, k) => (k === i ? j : v)))}
                      className={
                        "px-3 py-1 text-xs border " +
                        (answers[i] === j
                          ? "bg-[var(--oxblood)] text-[var(--primary-foreground)] border-[var(--oxblood)]"
                          : "bg-background border-border hover:border-[var(--oxblood)]")
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {result && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="font-mast">Your reflection</p>
              <h4 className="mt-1 text-xl" style={{ fontFamily: "var(--font-display)" }}>{result.headline}</h4>
              <p className="mt-2 text-muted-foreground" style={{ maxWidth: "60ch" }}>{result.body}</p>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                {result.nextSteps.map((s, i) => {
                  const m = /\[([^\]]+)\]\((\/articles\/[^)]+)\)/.exec(s);
                  if (m) {
                    return (
                      <li key={i}>
                        <Link href={m[2]}><span className="underline underline-offset-4 text-[var(--oxblood)]">{m[1]}</span></Link>
                        {s.replace(m[0], "")}
                      </li>
                    );
                  }
                  return <li key={i}>{s}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Assessments() {
  return (
    <div className="bg-background">
      <section className="relative">
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(252,247,237,0.92), rgba(252,247,237,0.78))" }} />
        </div>
        <div className="container relative py-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <p className="font-mast">The Assessments Desk</p>
            <h1 className="mt-3 text-[2.4rem] sm:text-[3rem] leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Eleven gentle self-assessments, designed to be reread, never to be graded.
            </h1>
            <p className="mt-4 text-muted-foreground" style={{ maxWidth: "60ch", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.05rem" }}>
              These are not quizzes. They are mirrors. Each one is short, kind, and points to one or two articles you can lean on while you tend to yourself.
            </p>
          </div>
          <div className="lg:col-span-4">
            <img src={SIDE} alt="" className="w-full h-[300px] object-cover" />
            <p className="font-mast mt-2">A slow walk forward, one Sunday at a time.</p>
          </div>
        </div>
      </section>

      <section className="container py-12 grid md:grid-cols-2 gap-10">
        {ASSESSMENTS.map((a, i) => (
          <article key={a.slug} className="border-t border-border pt-6">
            <p className="font-mast">{String(i + 1).padStart(2, "0")} &middot; The {a.title.split(" ").slice(-2).join(" ")}</p>
            <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{a.title}</h2>
            <p className="mt-2 text-muted-foreground italic" style={{ fontFamily: "var(--font-display)", maxWidth: "60ch" }}>{a.dek}</p>
            <p className="mt-3 text-foreground" style={{ maxWidth: "60ch" }}>{a.intent}</p>
            <div className="mt-4">
              <AssessmentRunner a={a} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
