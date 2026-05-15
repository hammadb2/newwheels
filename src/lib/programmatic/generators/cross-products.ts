import type { ProgrammaticPage } from "../types";
import { AUDIENCES } from "../audiences";
import { LOCATIONS } from "../locations";
import { VEHICLE_MAKES } from "../vehicle-makes";

// Curated cross-products. Not the full cartesian (~3,500 pages and Google
// penalises template farms) — just the high-commercial-intent intersections
// where the data actually makes the copy unique:
//
// 1. audience × location  → e.g. /bad-credit-car-loan-airdrie
// 2. audience × make      → e.g. /bad-credit-toyota-financing-calgary
//
// Each page reuses the per-axis attributes (audience rateRange + docs +
// calgarySignal, location landmarks + buyerArchetype, make brandNote + finance
// program) so the body is genuinely different from the single-axis pages.

const AUDIENCE_LOCATION_AUDIENCES = ["bad-credit", "newcomer", "work-permit", "self-employed"];
const AUDIENCE_MAKE_AUDIENCES = ["bad-credit", "newcomer", "work-permit"];
const AUDIENCE_MAKE_MAKES = ["toyota", "honda", "ford", "chevrolet", "hyundai", "kia", "ram", "gmc"];

export function generateAudienceLocationCrossProducts(): ProgrammaticPage[] {
  const out: ProgrammaticPage[] = [];
  for (const a of AUDIENCES.filter(a => AUDIENCE_LOCATION_AUDIENCES.includes(a.id))) {
    for (const l of LOCATIONS) {
      out.push({
        slug: `${a.slugFragment}-car-loan-${l.slugFragment}`,
        kind: "cross",
        category: "Audience × Location",
        metaTitle: `${capitalize(a.shortName)} Car Loan ${l.shortName} | NewWheels`,
        metaDescription: `${capitalize(a.shortName)} car loans in ${l.fullName} — rate range ${a.rateRange}. Apply free with a soft pull. Specialist callback in 1 hour.`,
        h1: `${capitalize(a.shortName)} car loans in ${l.fullName}`,
        tagline: `${capitalize(a.shortName)} × ${l.shortName}`,
        intro: `NewWheels finances ${a.shortName} applicants in ${l.fullName} between ${a.rateRange}. ${l.buyerArchetype} A specialist calls within 1 hour during business hours and approval typically lands within 24.`,
        sections: [
          {
            heading: `Why ${a.shortName} buyers in ${l.shortName} come to NewWheels`,
            paragraphs: [
              `${l.buyerArchetype} ${a.calgarySignal}`,
              `${a.lenderNotes}`,
            ],
          },
          {
            heading: `Documentation we ask ${a.shortName} applicants in ${l.shortName} for`,
            paragraphs: [`The list is short because the right Calgary lender for ${a.shortName} buyers only needs the items below.`],
            bullets: a.docs,
          },
          {
            heading: `Local ${l.shortName} considerations`,
            paragraphs: [
              l.driveTimeNote,
              `${l.shortName} landmarks NewWheels serves: ${l.landmarks.join(", ")}.`,
            ],
          },
        ],
        faq: [
          { question: `Can I get a car loan in ${l.shortName} with ${a.shortName}?`, answer: `Yes. ${capitalize(a.shortName)} applications in ${l.shortName} approve at rates between ${a.rateRange} depending on income, down payment, and lender match. Apply free with a soft pull.` },
          { question: `What documents do ${a.shortName} buyers in ${l.shortName} need?`, answer: a.docs.join("; ") + "." },
          { question: `Does NewWheels serve ${l.fullName}?`, answer: `Yes. ${l.driveTimeNote}` },
          { question: `Will applying hurt my credit?`, answer: `No. Applications use a soft pull. Only final lender submission triggers a hard pull, after you confirm the terms.` },
          { question: `How fast is approval?`, answer: `Approval typically lands within 24 hours. A specialist calls within 1 hour during business hours.` },
          { question: `Does the 6-months-covered offer apply?`, answer: `On qualifying deals, yes. The amount depends on the deal structure.` },
        ],
        related: [
          { href: `/${a.slugFragment}-car-loans-calgary`, label: `${capitalize(a.shortName)} car loans Calgary` },
          { href: `/car-loans-${l.slugFragment}`, label: `Car loans in ${l.shortName}` },
          { href: "/calculator", label: "Estimate your payment" },
          { href: "/how-it-works", label: "How NewWheels works" },
        ],
        ctaHeading: `${capitalize(a.shortName)} car loan in ${l.shortName}. Apply free.`,
        priority: 0.75,
      });
    }
  }
  return out;
}

export function generateAudienceMakeCrossProducts(): ProgrammaticPage[] {
  const out: ProgrammaticPage[] = [];
  for (const a of AUDIENCES.filter(a => AUDIENCE_MAKE_AUDIENCES.includes(a.id))) {
    for (const m of VEHICLE_MAKES.filter(m => AUDIENCE_MAKE_MAKES.includes(m.id))) {
      out.push({
        slug: `${a.slugFragment}-${m.slugFragment}-financing-calgary`,
        kind: "cross",
        category: "Audience × Make",
        metaTitle: `${capitalize(a.shortName)} ${m.fullName} Financing Calgary | NewWheels`,
        metaDescription: `${capitalize(a.shortName)} financing for a ${m.fullName} in Calgary. Rate range ${a.rateRange}. Apply free; soft pull; specialist callback in 1 hour.`,
        h1: `${capitalize(a.shortName)} ${m.fullName} financing in Calgary`,
        tagline: `${capitalize(a.shortName)} × ${m.shortName}`,
        intro: `NewWheels finances ${m.fullName} vehicles for ${a.shortName} applicants in Calgary at rates between ${a.rateRange}. ${m.brandNote}`,
        sections: [
          {
            heading: `Why ${a.shortName} ${m.fullName} files come to NewWheels`,
            paragraphs: [
              `${m.calgaryNote}`,
              `${a.lenderNotes}`,
            ],
          },
          {
            heading: `${m.fullName} models we finance for ${a.shortName} applicants`,
            paragraphs: [`Models we approve for ${a.shortName} buyers most often:`],
            bullets: m.topModels.map(model => `${m.fullName} ${model}`),
          },
          {
            heading: `What ${a.shortName} ${m.fullName} applicants need`,
            paragraphs: [`Documentation is short — exactly what the right ${m.shortName} financing program looks for.`],
            bullets: a.docs,
          },
        ],
        faq: [
          { question: `Can I finance a ${m.fullName} in Calgary with ${a.shortName}?`, answer: `Yes. ${capitalize(a.shortName)} financing on a ${m.fullName} approves at rates between ${a.rateRange}. Apply free with a soft pull.` },
          { question: `What ${m.fullName} models does NewWheels handle?`, answer: `${m.topModels.slice(0, 6).join(", ")}.` },
          { question: `Do you finance used ${m.fullName}s for ${a.shortName} buyers?`, answer: `Yes. Used and certified-pre-owned ${m.fullName}s are financed through the same application.` },
          { question: `How fast is approval?`, answer: `Approval typically lands within 24 hours. A specialist calls within 1 hour during business hours.` },
          { question: `Does the 6-months-covered offer apply?`, answer: `On qualifying deals, yes. The amount depends on the deal structure.` },
          { question: `Is the soft-pull application really free?`, answer: `Yes. Free, no obligation, no credit damage.` },
        ],
        related: [
          { href: `/${a.slugFragment}-car-loans-calgary`, label: `${capitalize(a.shortName)} car loans Calgary` },
          { href: `/${m.slugFragment}-financing-calgary`, label: `${m.fullName} financing Calgary` },
          { href: "/calculator", label: "Estimate your payment" },
          { href: "/how-it-works", label: "How NewWheels works" },
        ],
        ctaHeading: `${capitalize(a.shortName)} ${m.fullName} in Calgary. Apply free.`,
        priority: 0.72,
      });
    }
  }
  return out;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
