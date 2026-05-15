// Language-specific landing pages (/tl, /pa, /ar, /es).
//
// Phase 1 declared hreflang alternates for these locales in `buildMetadata`,
// but until now there was no page at the alternate URL — Google would happily
// follow the alternates and 404, which kills the entire alternate cluster.
// These pages give each language alternate a real 200, with a translated
// answer-first paragraph, a direct CTA back to the English funnel, and a
// crawlable list of every page on the site (mirror of the English nav).
//
// The four static folders under `src/app/tl|pa|ar|es/page.tsx` are thin —
// they each call `renderLanguageLanding(<code>)`. We can't share a single
// `[lang]/page.tsx` because that would collide with the existing `[slug]`
// catchall (two sibling dynamic segments). Static folders also take routing
// precedence and are listed in `RESERVED_SLUGS` so the programmatic engine
// won't re-emit them.

import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { BUSINESS, LANGUAGE_HREFLANG, PAGES, SITE_URL } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  localBusinessSchema,
  organizationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";

export type LangCode = "tl" | "pa" | "ar" | "es";

type LangContent = {
  hreflang: string;
  langName: string;
  flag: string;
  ogLocale: string;
  // Direction is set on the body wrapper to give Arabic correct RTL flow.
  dir: "ltr" | "rtl";
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  h1: string;
  intro: string;
  // 1-2 paragraph "what we do" answer block.
  body: string[];
  applyCta: string;
  callCta: string;
  navHeading: string;
  navIntro: string;
  // Short translation of the most common questions for the FAQ block.
  faq: { q: string; a: string }[];
};

export const LANG_CONTENT: Record<LangCode, LangContent> = {
  tl: {
    hreflang: "tl-CA",
    langName: "Tagalog",
    flag: "🇵🇭",
    ogLocale: "tl_PH",
    dir: "ltr",
    metaTitle: "Pautang sa Sasakyan sa Calgary | NewWheels para sa Pilipino",
    metaDescription:
      "Pautang sa sasakyan para sa mga Pilipino sa Calgary. Walang Canadian credit, work permit, o caregiver pathway — pwede pa rin. Tatawagan ng espesyalista sa loob ng isang oras.",
    tagline: "Para sa Pilipino sa Calgary",
    h1: "Pautang sa sasakyan sa Calgary — para sa Pilipino",
    intro:
      "Tulong sa pautang ng sasakyan para sa mga Pilipinong nasa Calgary, kahit walang Canadian credit, may PGWP, o caregiver pathway. Soft credit pull lang ang aplikasyon, libre, at may tumatawag na espesyalista sa loob ng isang oras tuwing araw ng trabaho.",
    body: [
      "Marami sa mga Pilipinong customer namin ay caregiver, PGWP, o bagong PR na nasa Falconridge, Saddle Ridge, Martindale, at Forest Lawn. Tinutulungan namin kayo na makakuha ng pautang gamit ang lender na alam ang sitwasyon ng newcomer at caregiver — hindi yung pangkalahatang bangko na laging hindi pumapayag.",
      "Kahit walang Canadian credit history, may mga partner kaming lender na pumapayag base sa employment at down payment. Ang NewWheels ay nakikipagtulungan lamang sa mga AMVIC-licensed na dealer partner sa buong Alberta at sineserve ang buong Calgary metro, kasama ang Airdrie, Cochrane, Okotoks, at Chestermere.",
    ],
    applyCta: "Mag-apply nang libre",
    callCta: "Tumawag sa NewWheels",
    navHeading: "Mga pahina sa English",
    navIntro: "Buong English navigation. Indexed din para sa Tagalog speakers via hreflang.",
    faq: [
      {
        q: "May Canadian credit ba kailangan?",
        a: "Hindi. May lender kaming partner na pumapayag para sa mga newcomer na wala pang Canadian credit. Kailangan lang ang stable employment at down payment.",
      },
      {
        q: "Sasaktan ba ang credit score ko sa application?",
        a: "Hindi. Soft credit pull lang ang aplikasyon — hindi ito babawas sa credit score. Hard pull lamang kapag kayo na ang pumili at pumayag sa terms.",
      },
      {
        q: "Gaano katagal ang approval?",
        a: "Karaniwan, may sagot sa loob ng 24 oras. May tumatawag na espesyalista sa loob ng isang oras kung araw ng trabaho.",
      },
    ],
  },
  pa: {
    hreflang: "pa-CA",
    langName: "Punjabi",
    flag: "🇮🇳",
    ogLocale: "pa_IN",
    dir: "ltr",
    metaTitle: "ਕੈਲਗਰੀ ਵਿੱਚ ਕਾਰ ਲੋਨ | NewWheels ਪੰਜਾਬੀ ਲਈ",
    metaDescription:
      "ਕੈਲਗਰੀ ਵਿੱਚ ਪੰਜਾਬੀ ਪਰਿਵਾਰਾਂ ਲਈ ਕਾਰ ਫਾਇਨੈਂਸਿੰਗ। ਨਵੇਂ ਆਏ, ਮਾੜਾ ਕ੍ਰੈਡਿਟ, ਟਰੱਕ ਡਰਾਈਵਰ, ਕੋ-ਸਾਈਨਰ — ਸਾਰੇ ਚੱਲਦੇ ਹਨ। ਇੱਕ ਘੰਟੇ ਅੰਦਰ ਫ਼ੋਨ।",
    tagline: "ਕੈਲਗਰੀ ਦੇ ਪੰਜਾਬੀ ਭਾਈਚਾਰੇ ਲਈ",
    h1: "ਕੈਲਗਰੀ ਵਿੱਚ ਕਾਰ ਲੋਨ — ਪੰਜਾਬੀਆਂ ਲਈ",
    intro:
      "ਕੈਲਗਰੀ ਵਿੱਚ ਪੰਜਾਬੀ ਪਰਿਵਾਰਾਂ ਲਈ ਕਾਰ ਫਾਇਨੈਂਸਿੰਗ। ਨਵੇਂ ਆਏ ਪੀ.ਆਰ., ਵਰਕ ਪਰਮਿਟ, ਮਾੜੇ ਕ੍ਰੈਡਿਟ ਜਾਂ ਟਰੱਕ ਡਰਾਈਵਰ NOA — ਸਾਡੇ ਕੋਲ ਹਰ ਫ਼ਾਈਲ ਲਈ ਸਹੀ ਲੈਂਡਰ ਹੈ। ਅਰਜ਼ੀ ਮੁਫ਼ਤ ਹੈ, ਸਿਰਫ਼ ਸੌਫ਼ਟ ਪੁਲ, ਅਤੇ ਇੱਕ ਘੰਟੇ ਅੰਦਰ ਫ਼ੋਨ।",
    body: [
      "ਸਾਡੇ ਪੰਜਾਬੀ ਗਾਹਕ ਜ਼ਿਆਦਾਤਰ Saddle Ridge, Martindale, Skyview, Cornerstone, ਅਤੇ Genesis (Airdrie) ਵਿੱਚ ਰਹਿੰਦੇ ਹਨ। ਅਸੀਂ ਫ਼ੈਮਿਲੀ-ਕੋ-ਸਾਈਨਰ ਫ਼ਾਈਲਾਂ, ਲੌਂਗ-ਹੌਲ ਟਰੱਕ ਡਰਾਈਵਰ NOA ਅਤੇ ਨਵੀਂਆਂ PR ਫ਼ਾਈਲਾਂ ਨੂੰ ਸਪੈਸ਼ਲਾਈਜ਼ ਕਰਦੇ ਹਾਂ।",
      "NewWheels ਸਿਰਫ਼ ਅਲਬਰਟਾ ਦੇ AMVIC-licensed ਡੀਲਰ ਪਾਰਟਨਰਾਂ ਨਾਲ ਕੰਮ ਕਰਦਾ ਹੈ ਅਤੇ ਪੂਰਾ ਕੈਲਗਰੀ ਮੈਟਰੋ, Airdrie, Cochrane, Okotoks ਅਤੇ Chestermere ਨੂੰ ਸਰਵ ਕਰਦਾ ਹੈ। ਅਰਜ਼ੀ ਮੁਫ਼ਤ ਹੈ, ਕੋਈ ਜ਼ਿੰਮੇਵਾਰੀ ਨਹੀਂ।",
    ],
    applyCta: "ਮੁਫ਼ਤ ਅਪਲਾਈ ਕਰੋ",
    callCta: "NewWheels ਨੂੰ ਫ਼ੋਨ ਕਰੋ",
    navHeading: "English ਵਿੱਚ ਪੇਜ",
    navIntro: "ਪੂਰਾ English navigation। ਪੰਜਾਬੀ ਬੋਲਣ ਵਾਲਿਆਂ ਲਈ hreflang ਰਾਹੀਂ ਇੰਡੈਕਸ ਕੀਤਾ।",
    faq: [
      {
        q: "ਕੀ ਕੈਨੇਡੀਅਨ ਕ੍ਰੈਡਿਟ ਚਾਹੀਦਾ ਹੈ?",
        a: "ਨਹੀਂ। ਸਾਡੇ ਕੋਲ ਨਵੇਂ ਆਏ ਲੋਕਾਂ ਲਈ ਪਾਰਟਨਰ ਲੈਂਡਰ ਹਨ ਜੋ ਰੋਜ਼ਗਾਰ ਅਤੇ ਡਾਊਨ ਪੇਮੈਂਟ ਉੱਤੇ ਅਪਰੂਵ ਕਰਦੇ ਹਨ।",
      },
      {
        q: "ਕੀ ਅਰਜ਼ੀ ਕ੍ਰੈਡਿਟ ਸਕੋਰ ਨੂੰ ਨੁਕਸਾਨ ਪਹੁੰਚਾਏਗੀ?",
        a: "ਨਹੀਂ। ਅਰਜ਼ੀ ਸਿਰਫ਼ ਸੌਫ਼ਟ ਪੁਲ ਹੈ — ਸਕੋਰ ਨਹੀਂ ਡਿੱਗਦਾ। ਹਾਰਡ ਪੁਲ ਤਾਂ ਹੀ ਹੁੰਦੀ ਹੈ ਜਦੋਂ ਤੁਸੀਂ ਟਰਮਾਂ ਉੱਤੇ ਸਹਿਮਤ ਹੁੰਦੇ ਹੋ।",
      },
      {
        q: "ਕਿੰਨੀ ਜਲਦੀ ਅਪਰੂਵਲ ਮਿਲਦੀ ਹੈ?",
        a: "ਜ਼ਿਆਦਾਤਰ ਫ਼ਾਈਲਾਂ 24 ਘੰਟਿਆਂ ਅੰਦਰ ਜਵਾਬ ਦੇ ਦਿੰਦੀਆਂ ਹਨ। ਕੰਮ ਦੇ ਦਿਨ ਇੱਕ ਘੰਟੇ ਅੰਦਰ ਫ਼ੋਨ ਆਉਂਦੀ ਹੈ।",
      },
    ],
  },
  ar: {
    hreflang: "ar-CA",
    langName: "Arabic",
    flag: "🇸🇦",
    ogLocale: "ar_AE",
    dir: "rtl",
    metaTitle: "قروض السيارات في كالغاري | NewWheels للعملاء الناطقين بالعربية",
    metaDescription:
      "تمويل السيارات في كالغاري للمجتمع الناطق بالعربية. الوافدون الجدد، تصاريح العمل، الائتمان الضعيف — جميعها مقبولة. اتصال خلال ساعة واحدة.",
    tagline: "للمجتمع الناطق بالعربية في كالغاري",
    h1: "قروض السيارات في كالغاري — للناطقين بالعربية",
    intro:
      "تمويل السيارات للأسر الناطقة بالعربية في كالغاري. الوافدون الجدد، تصاريح العمل، اللاجئون، الائتمان الضعيف، والعاملون لحسابهم الخاص — كلهم مقبولون. الطلب مجاني بسحب ائتماني ناعم فقط، ويتصل بك أخصائي خلال ساعة واحدة في أيام العمل.",
    body: [
      "نخدم بشكل أساسي العملاء الناطقين بالعربية في Forest Lawn و Marlborough و Saddle Ridge و Martindale و Pineridge. لدينا شركاء مقرضون يقبلون ملفات اللاجئين والوافدين الجدد بدون تاريخ ائتماني كندي، ويعتمدون على استقرار التوظيف والدفعة المقدمة.",
      "تعمل NewWheels حصرياً مع شركاء تجار مرخصين من AMVIC في ألبرتا وتخدم منطقة كالغاري الكبرى بالكامل، بما في ذلك Airdrie و Cochrane و Okotoks و Chestermere. الطلب مجاني بدون أي التزام.",
    ],
    applyCta: "قدّم طلبك مجاناً",
    callCta: "اتصل بـ NewWheels",
    navHeading: "الصفحات باللغة الإنجليزية",
    navIntro: "التنقل الكامل بالإنجليزية. مفهرس أيضاً للناطقين بالعربية عبر hreflang.",
    faq: [
      {
        q: "هل أحتاج إلى تاريخ ائتماني كندي؟",
        a: "لا. لدينا شركاء مقرضون يوافقون على ملفات الوافدين الجدد بناءً على استقرار التوظيف والدفعة المقدمة، حتى بدون تاريخ ائتماني كندي.",
      },
      {
        q: "هل سيؤثر الطلب على درجة الائتمان الخاصة بي؟",
        a: "لا. الطلب هو سحب ائتماني ناعم فقط — لا يؤثر على درجتك. السحب الصعب يحدث فقط بعد تأكيدك للشروط.",
      },
      {
        q: "كم من الوقت تستغرق الموافقة؟",
        a: "معظم الملفات تحصل على رد خلال 24 ساعة. يتصل بك أخصائي خلال ساعة واحدة في أيام العمل.",
      },
    ],
  },
  es: {
    hreflang: "es-CA",
    langName: "Spanish",
    flag: "🇪🇸",
    ogLocale: "es_ES",
    dir: "ltr",
    metaTitle: "Préstamos para Autos en Calgary | NewWheels para Hispanohablantes",
    metaDescription:
      "Financiamiento de autos en Calgary para la comunidad hispanohablante. Recién llegados, permisos de trabajo, mal crédito — todos bienvenidos. Te llamamos en menos de una hora.",
    tagline: "Para la comunidad hispanohablante de Calgary",
    h1: "Préstamos para autos en Calgary — para hispanohablantes",
    intro:
      "Financiamiento de autos para familias hispanohablantes en Calgary. Recién llegados a Canadá, refugiados, permisos de trabajo, mal crédito y trabajadores independientes — todos son aprobados a través del prestamista correcto. La solicitud es gratuita, sólo verificación suave de crédito, y un especialista llama dentro de una hora en días hábiles.",
    body: [
      "Atendemos principalmente a clientes hispanohablantes en Forest Lawn, Marlborough, Falconridge, Marlborough Park y Pineridge. Tenemos prestamistas socios que aprueban a recién llegados sin historial crediticio canadiense, basándose en empleo estable y enganche.",
      "NewWheels trabaja exclusivamente con concesionarios asociados con licencia AMVIC en Alberta y sirve a toda el área metropolitana de Calgary, incluyendo Airdrie, Cochrane, Okotoks y Chestermere. La solicitud es gratuita y sin compromiso.",
    ],
    applyCta: "Aplica gratis",
    callCta: "Llama a NewWheels",
    navHeading: "Páginas en inglés",
    navIntro: "Navegación completa en inglés. Indexada para hispanohablantes vía hreflang.",
    faq: [
      {
        q: "¿Necesito historial crediticio canadiense?",
        a: "No. Tenemos prestamistas que aprueban a recién llegados sin historial crediticio canadiense, basados en empleo estable y enganche.",
      },
      {
        q: "¿Aplicar afectará mi puntaje de crédito?",
        a: "No. La solicitud es una verificación suave — no afecta tu puntaje. La verificación dura sólo ocurre después de que confirmas los términos.",
      },
      {
        q: "¿Cuánto tarda la aprobación?",
        a: "La mayoría de los archivos tienen una respuesta dentro de 24 horas. Un especialista llama dentro de una hora en días hábiles.",
      },
    ],
  },
};

export function buildLangMetadata(lang: LangCode): Metadata {
  const content = LANG_CONTENT[lang];
  const meta = buildMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: `/${lang}`,
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      locale: content.ogLocale,
    },
  };
}

export function renderLanguageLanding(lang: LangCode) {
  const content = LANG_CONTENT[lang];
  const corePages = PAGES.filter(p => ["situation", "core", "info"].includes(p.group));

  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          organizationSchema(),
          websiteSchema(),
          webPageSchema({
            name: content.metaTitle,
            description: content.metaDescription,
            path: `/${lang}`,
            about: [content.langName, "Calgary", "Vehicle financing", "Newcomers to Canada"],
            mentions: ["NewWheels", "Calgary", "Alberta", content.langName],
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: content.langName, path: `/${lang}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: LANGUAGE_HREFLANG[content.hreflang],
            mainEntity: content.faq.map(f => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <section className="section-deep relative overflow-hidden" dir={content.dir}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(217,255,78,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          className="relative mx-auto max-w-5xl px-4 pb-14 pt-10 md:pb-20 md:pt-14"
          lang={content.hreflang}
        >
          <span className="chip-accent">
            {content.flag} {content.tagline}
          </span>
          <h1 className="display-headline mt-4 text-hero font-extrabold uppercase text-white">
            {content.h1}
          </h1>
          <p
            data-intro
            data-speakable
            className="mt-5 max-w-2xl text-lg text-white/85"
          >
            {content.intro}
          </p>
          {content.body.map((paragraph, idx) => (
            <p key={idx} className="mt-4 max-w-2xl text-base text-white/75">
              {paragraph}
            </p>
          ))}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/#apply" className="btn-primary-dark text-sm">
              {content.applyCta}
            </Link>
            <a href={`tel:${BUSINESS.phoneHref}`} className="btn-ghost-dark text-sm">
              {content.callCta} {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-brand-creamSoft" dir={content.dir}>
        <div className="mx-auto max-w-5xl px-4 py-12" lang={content.hreflang}>
          <h2 className="display-headline text-2xl font-extrabold uppercase tracking-tight text-brand-ink">
            FAQ
          </h2>
          <ul className="mt-6 space-y-5">
            {content.faq.map((f, idx) => (
              <li
                key={idx}
                className="rounded-3xl bg-white p-6 ring-1 ring-brand-line"
              >
                <p className="text-base font-bold text-brand-ink">{f.q}</p>
                <p className="mt-2 text-sm text-brand-ink/80">{f.a}</p>
              </li>
            ))}
          </ul>

          <h2 className="display-headline mt-12 text-2xl font-extrabold uppercase tracking-tight text-brand-ink">
            {content.navHeading}
          </h2>
          <p className="mt-2 text-sm text-brand-ink/70">
            {content.navIntro}
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2" lang="en-CA">
            {corePages.map(p => (
              <li key={p.slug}>
                <Link
                  href={p.slug}
                  className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-ink ring-1 ring-brand-line transition hover:bg-brand-cream"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-brand-ink/60">
            <Link href={SITE_URL} className="underline">
              English (canonical) →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
