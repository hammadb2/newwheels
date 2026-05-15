// Eight resource-hub articles. Hand-written for unique copy + answer-first
// structure. Each one ships under /resources/{slug} via the shared shell.
//
// Length target: 800-1200 words. Skip walls of text — use punchy paragraphs
// and bullets so the AI extractors get clean answer chunks.

import type { ResourceArticle } from "../resources";

const newVsUsed: ResourceArticle = {
  slug: "new-vs-used-car-calgary",
  title: "New vs Used Car in Calgary: Which Makes Sense in 2026",
  shortTitle: "New vs Used Car Calgary",
  description:
    "New vs used cars in Calgary 2026: full breakdown of total cost of ownership, financing rate spread, depreciation, and which option wins for newcomers, bad-credit buyers, and tradespeople.",
  datePublished: "2026-05-01",
  cluster: "process",
  relatedCorePage: { href: "/calculator", label: "Run the Calgary payment calculator" },
  summary:
    "For most Calgary buyers, a 2-3 year-old used vehicle wins on total cost. A new vehicle wins when the financing rate spread is wider than the first-year depreciation — which only happens during specific manufacturer promo windows. NewWheels structures both.",
  faq: [
    { question: "Is buying a used car cheaper than new in Calgary?", answer: "Almost always, yes. A 2-3 year-old vehicle has absorbed the steepest depreciation (typically 20-30% off MSRP) while still offering most of the useful life. Used wins on total cost in 80% of cases." },
    { question: "When does buying new make sense?", answer: "When the manufacturer promotion (cashback, 0% APR, or NewWheels' 6-months-covered) lowers the lifetime cost below what you&rsquo;d pay used. We run the math live during the application." },
    { question: "Do new cars get better financing rates?", answer: "Yes — typically 1.5-3 percentage points lower, plus access to manufacturer promo programs. The rate spread is a major part of the new-vs-used decision." },
    { question: "What about Calgary winters?", answer: "Both new and used can be winter-ready. AWD is the variable that matters more than age. We filter by AWD on every quote." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        For most Calgary buyers in 2026, a 2-3 year-old used vehicle wins on total cost.
        You skip the steepest part of the depreciation curve (usually 20-30% in the first
        24 months) and the vehicle still has 75% of its useful life ahead. The exception is
        when a manufacturer is running an aggressive new-vehicle promotion that closes the
        cost gap — and during those windows, new can win.
      </p>
      <h2>Total cost of ownership: the actual math</h2>
      <ul>
        <li><strong>Purchase price.</strong> Used wins by an average of $8K-$15K on equivalent trim.</li>
        <li><strong>Financing rate.</strong> New wins. New rates run 5.99-9.99% for prime credit; used runs 7.99-13.99%.</li>
        <li><strong>Insurance.</strong> Roughly equivalent in Calgary. Used can be slightly cheaper.</li>
        <li><strong>Maintenance.</strong> New wins. Used in the 50-80K km range starts hitting brakes, tires, and timing-component costs.</li>
        <li><strong>Warranty.</strong> New wins — full 3-year/60K bumper-to-bumper plus 5-year/100K powertrain on most makes.</li>
        <li><strong>6-months-covered.</strong> New wins when this NewWheels offer applies (it makes up most of the rate gap).</li>
      </ul>
      <h2>Calgary-specific factors</h2>
      <p>
        Two things change the math in Calgary:
      </p>
      <ul>
        <li>
          <strong>No PST.</strong> Alberta charges 5% GST only. Saves roughly $1,000 on a
          $20K vehicle vs. Saskatchewan and $1,400 vs. BC. Tilts you slightly toward
          higher-trim or new because the tax burden is smaller.
        </li>
        <li>
          <strong>Winter.</strong> AWD adds $2K-$4K to either path. Skipping AWD to save
          money is a false economy in Calgary; a single insurance claim from a winter
          collision wipes out years of savings.
        </li>
      </ul>
      <h2>Who should buy new in Calgary</h2>
      <p>
        New makes sense when you fall into one of these buckets:
      </p>
      <ul>
        <li>You qualify for the NewWheels 6-months-covered offer on a new model.</li>
        <li>You drive 30K+ km/year and want full warranty coverage for 4+ years.</li>
        <li>You&rsquo;re trading in something on its last legs and want zero downtime.</li>
        <li>You qualify for an OEM 0% APR or sub-3.99% promo and the math works.</li>
      </ul>
      <h2>Who should buy used in Calgary</h2>
      <p>
        Used wins when:
      </p>
      <ul>
        <li>You have any credit damage. Used-vehicle subprime rates are competitive.</li>
        <li>You&rsquo;re a newcomer building Canadian credit. Lower loan amount = better outcome.</li>
        <li>You want a body type that&rsquo;s pricey new (e.g. half-ton truck).</li>
        <li>You&rsquo;re keeping the vehicle 5+ years past the loan term.</li>
      </ul>
    </>
  ),
};

const leaseVsBuy: ResourceArticle = {
  slug: "lease-vs-buy-calgary",
  title: "Lease vs Buy in Calgary: Full Comparison With Numbers",
  shortTitle: "Lease vs Buy Calgary",
  description:
    "Lease vs buy in Calgary: month-by-month payment comparison, mileage caps, end-of-term costs, and the exact buyer profile each path actually wins for.",
  datePublished: "2026-05-02",
  cluster: "process",
  relatedCorePage: { href: "/calculator", label: "Compare lease vs finance numbers" },
  summary:
    "Leasing wins in Calgary if you drive under 24K km/year, want a new vehicle every 3-4 years, and have stable income with prime credit. Financing wins for everyone else — including every newcomer, work-permit holder, and bad-credit buyer.",
  faq: [
    { question: "Can newcomers lease in Calgary?", answer: "Almost never. Lease companies require established Canadian credit (650+) and 12+ months of credit history. Financing through NewWheels is the standard newcomer path." },
    { question: "What&rsquo;s the typical Calgary mileage cap on a lease?", answer: "20,000-24,000 km/year. Overage runs $0.10-$0.20/km. Calgary commuters who drive to fly-out work or Banff weekly almost always exceed the cap." },
    { question: "Does the 6-months-covered offer apply to leases?", answer: "On select OEM lease programs, yes. Most often it appears on finance deals." },
    { question: "Can I buy out a lease in Calgary?", answer: "Yes. The lease residual is the buyout. NewWheels can finance the buyout into a new loan." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        Lease in Calgary if all three are true: you drive under 24K km/year, you have
        prime credit (650+), and you want a new vehicle every 3-4 years. Finance in every
        other scenario. Newcomers, work-permit holders, and anyone with credit damage
        almost never qualifies for a lease in the first place.
      </p>
      <h2>Monthly payment comparison</h2>
      <p>
        Same vehicle, $40K MSRP, 36-month term, 4.99% rate:
      </p>
      <ul>
        <li><strong>Lease</strong>: ~$510/month + ~$2,000 down + GST. End of term, return the vehicle.</li>
        <li><strong>Finance over 60 months</strong>: ~$755/month. End of term, vehicle is yours.</li>
        <li><strong>Finance over 84 months</strong>: ~$565/month. End of term, vehicle is yours.</li>
      </ul>
      <p>
        Leasing gets you the lowest payment short-term. Financing builds equity. The
        finance-84 option matches a lease payment closely while still letting you own.
      </p>
      <h2>Hidden costs of leasing in Calgary</h2>
      <ul>
        <li><strong>Mileage overages.</strong> 20K cap is standard. Calgary fly-out workers, oil-and-gas drivers, and anyone commuting from Airdrie or Cochrane hits 25K-35K easily.</li>
        <li><strong>Wear-and-tear charges.</strong> Calgary winters chip windshields, ding doors, and salt-eat lower body panels. Lease return inspectors charge for all of it.</li>
        <li><strong>Early termination.</strong> Job change, life event, or income drop and you owe the remaining lease payments. Finance can be sold to wholesaler or traded.</li>
      </ul>
      <h2>When financing wins outright</h2>
      <ul>
        <li>You drive 30K+ km/year.</li>
        <li>You have non-prime credit. Lease approvals get denied below 650.</li>
        <li>You&rsquo;re a newcomer, work-permit holder, or self-employed. Lease companies say no.</li>
        <li>You keep vehicles 6+ years. Owning amortises over a much longer useful life.</li>
        <li>You want to modify the vehicle (lift, towing, customisations). Leases prohibit.</li>
      </ul>
    </>
  ),
};

const newcomerCredit: ResourceArticle = {
  slug: "how-to-build-canadian-credit-newcomer",
  title: "How to Build Canadian Credit as a Newcomer: 6-Month Plan",
  shortTitle: "Build Canadian Credit",
  description:
    "Step-by-step Canadian credit-building plan for newcomers in Calgary. Secured credit card, utility account, car loan — the exact stack that gets you to a 680 score within 18 months.",
  datePublished: "2026-05-03",
  cluster: "newcomer",
  relatedCorePage: { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
  summary:
    "Build Canadian credit in 18 months with three accounts: a secured credit card, a utility account in your name, and a small auto loan paid on time. Score lands at 680+ if all three report monthly with no missed payments.",
  faq: [
    { question: "How long does it take to build Canadian credit?", answer: "Most newcomers reach a 650 score in 12 months and 700+ in 18-24 months with three reporting accounts and no missed payments." },
    { question: "Can I get a car loan with no Canadian credit?", answer: "Yes. NewWheels matches newcomer files to lenders who price off employment stability and visa status, not credit score. Rates run 7.99-13.99%." },
    { question: "What&rsquo;s the cheapest secured credit card in Canada?", answer: "Home Trust Secured Visa ($0 annual fee, $500 minimum deposit) and Capital One Guaranteed Secured Mastercard are the two main starting cards. Both report monthly to Equifax and TransUnion." },
    { question: "Do utility bills build credit in Canada?", answer: "Yes, but only if reported. ENMAX in Calgary reports to credit bureaus. Telus mobility plans (not prepaid) also report." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        Build three accounts in your name within your first 6 months in Canada and pay
        them all on time. By month 12 you&rsquo;ll have a score around 650; by month 18-24
        you&rsquo;ll be at 700+. The three accounts: secured credit card, utility account
        (Calgary ENMAX or Telus postpaid mobility), and a small auto loan.
      </p>
      <h2>Month-by-month plan</h2>
      <h3>Month 1-2</h3>
      <ul>
        <li>Open a chequing account at a major Canadian bank (RBC, BMO, TD, Scotia, CIBC, ATB).</li>
        <li>Apply for a secured Visa with a $500-$2000 deposit. Home Trust Secured Visa or Capital One Guaranteed.</li>
        <li>Set up utility (ENMAX in Calgary) in your name. Pay on time, monthly.</li>
      </ul>
      <h3>Month 3-6</h3>
      <ul>
        <li>Use the secured card monthly. Spend 30% or less of the limit. Pay in full before the due date.</li>
        <li>Get a postpaid Telus or Rogers phone plan in your name. Avoid prepaid (no credit reporting).</li>
        <li>Check Equifax and TransUnion. Many newcomers find their file blank — that&rsquo;s fine, two reporting accounts will build it from zero.</li>
      </ul>
      <h3>Month 6-9</h3>
      <ul>
        <li>Apply for a NewWheels car loan. We have lenders for newcomers with 3-6 months of Canadian credit. The auto loan is the single fastest credit-builder on your file.</li>
        <li>Make all car payments on time. Even one missed payment in year one is hard to recover from.</li>
      </ul>
      <h3>Month 9-18</h3>
      <ul>
        <li>Keep the secured card open. Don&rsquo;t close it — credit history length matters.</li>
        <li>After 12 months of on-time auto-loan payments, you can refinance to a lower rate at NewWheels.</li>
        <li>Once your score crosses 660, ask the bank to convert your secured card to an unsecured one (refund of deposit).</li>
      </ul>
      <h2>Common mistakes that delay credit-building</h2>
      <ul>
        <li><strong>Missing one payment.</strong> A single missed payment in your first 12 months can hold your score under 600 for years.</li>
        <li><strong>Maxing the secured card.</strong> Utilisation above 50% drags your score even with on-time payments. Stay under 30%.</li>
        <li><strong>Prepaid mobile plans.</strong> No reporting. Switch to postpaid for credit-building.</li>
        <li><strong>Co-signing too early.</strong> If a co-signer defaults, both files take the hit. Build your own first.</li>
      </ul>
    </>
  ),
};

const ownershipCosts: ResourceArticle = {
  slug: "calgary-car-ownership-costs",
  title: "Calgary Car Ownership Costs: Insurance, Registration, Maintenance",
  shortTitle: "Calgary Ownership Costs",
  description:
    "Calgary car ownership costs broken down: monthly insurance, annual registration, fuel at $1.45/L average, oil-change and tire-rotation schedule, and what to budget annually.",
  datePublished: "2026-05-04",
  cluster: "process",
  relatedCorePage: { href: "/calculator", label: "Add ownership costs to your payment estimate" },
  summary:
    "Budget $4,200-$6,500/year in Calgary ownership costs on top of your loan payment: $1,800-$3,000 insurance, $93 registration, $2,200 fuel at average use, $400-$800 maintenance, $300 winter tire amortisation.",
  faq: [
    { question: "How much is car insurance in Calgary per month?", answer: "$150-$250/month is typical for a 30-something Calgary driver with a clean record and a 2-5 year-old vehicle. Newcomers without Canadian driving history pay $300-$450/month for the first 12 months." },
    { question: "What&rsquo;s the annual registration cost in Alberta?", answer: "$93/year for a passenger vehicle as of 2026. Higher for commercial plates." },
    { question: "Do I need winter tires in Calgary?", answer: "Not legally required, but functionally yes. Calgary&rsquo;s freeze-thaw cycles destroy all-seasons; winter tires cut stopping distance roughly in half on cold pavement. Budget $300-$600/year amortised over 5 winters." },
    { question: "What&rsquo;s the cheapest neighbourhood for Calgary insurance?", answer: "Suburban quadrants (NW, SW) generally beat NE and downtown by 5-10%. Postal code matters." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        Budget $4,200-$6,500/year in total ownership costs on top of your monthly loan
        payment. That covers Alberta insurance, $93 annual registration, fuel for a
        normal commuter (15K-20K km/year at $1.45/L average), routine oil changes and
        brake-pad maintenance, and amortised winter-tire cost.
      </p>
      <h2>Annual breakdown for a typical Calgary commuter</h2>
      <ul>
        <li><strong>Insurance.</strong> $1,800-$3,000/year for a 30-something clean record. $3,500-$5,500/year for newcomers without Canadian driving history.</li>
        <li><strong>Registration.</strong> $93/year (Alberta passenger plate, 2026 schedule).</li>
        <li><strong>Fuel.</strong> $2,200/year if you drive 18K km in a 9 L/100km vehicle at $1.45/L average.</li>
        <li><strong>Maintenance.</strong> $400-$800/year — oil changes, brake pads, fluid flushes, tire rotation.</li>
        <li><strong>Winter tires.</strong> $300/year amortised ($1,500 for a set of 4, replaced every 5 years).</li>
        <li><strong>Random.</strong> $200/year average — chips, wipers, one-off repairs.</li>
      </ul>
      <h2>Calgary-specific insurance facts</h2>
      <ul>
        <li><strong>Direct compensation.</strong> Alberta has no-fault elements, which keeps Calgary rates lower than Ontario.</li>
        <li><strong>Hail.</strong> Calgary&rsquo;s worst hailstorm of 2020 was a $1.2B insurance event. Get comprehensive coverage; the premium difference is small.</li>
        <li><strong>Newcomer rate decay.</strong> After 12-24 months of clean Canadian driving, your rates drop 30-50%.</li>
      </ul>
    </>
  ),
};

const winterCars: ResourceArticle = {
  slug: "best-cars-for-calgary-winters",
  title: "Best Cars for Calgary Winters: AWD Ranking 2026",
  shortTitle: "Best Cars Calgary Winters",
  description:
    "Best cars for Calgary winters 2026: AWD-ranked. RAV4, CR-V, Tucson, Outback, and where each one wins. Plus how to finance an AWD vehicle with bad credit or as a newcomer.",
  datePublished: "2026-05-05",
  cluster: "process",
  relatedCorePage: { href: "/calculator", label: "Compare AWD vehicle payments" },
  summary:
    "The best Calgary winter vehicles in 2026 are the Toyota RAV4 Hybrid AWD, Subaru Outback, Honda CR-V Hybrid AWD, and Hyundai Tucson Hybrid AWD. All four handle -30°C cold-starts, deep snow, and Calgary freeze-thaw with no compromise.",
  faq: [
    { question: "Do I need AWD in Calgary?", answer: "Functionally yes for any commute outside the urban core. AWD pairs with winter tires; together they roughly halve your stopping distance on cold pavement and add real traction in deep snow." },
    { question: "Is a Subaru Outback better than a RAV4 for Calgary?", answer: "Outback wins on ground clearance for Bragg Creek and weekend ski trips. RAV4 Hybrid wins on fuel economy and resale. Both are excellent." },
    { question: "Can I finance an AWD vehicle with bad credit?", answer: "Yes. AWD versions of any model price 8-12% higher than FWD. The lender doesn&rsquo;t care about drivetrain — what matters is income and the down payment." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        For Calgary winters in 2026, the AWD vehicles that combine cold-start
        reliability, deep-snow traction, fuel economy, and decent resale are: Toyota
        RAV4 Hybrid AWD, Subaru Outback, Honda CR-V Hybrid AWD, Hyundai Tucson Hybrid
        AWD. The Mazda CX-50 AWD is the dark-horse pick for SE/SW Calgary buyers who
        also want a more premium interior.
      </p>
      <h2>The Calgary winter ranking</h2>
      <ol>
        <li><strong>Toyota RAV4 Hybrid AWD.</strong> Calgary&rsquo;s most-financed winter vehicle through NewWheels. 6.5 L/100km combined. -40°C cold-starts confirmed. Resale loss after 5 years: ~32%.</li>
        <li><strong>Subaru Outback.</strong> Ground clearance and the symmetric AWD system handle Bragg Creek, Kananaskis, and snowdrift unplowed routes. Heavier on fuel (9.8 L/100km) but unmatched for true winter use.</li>
        <li><strong>Honda CR-V Hybrid AWD.</strong> Quiet, smooth, well-priced. The cargo area is the biggest in the segment.</li>
        <li><strong>Hyundai Tucson Hybrid AWD.</strong> Aggressive financing programs, lowest monthly payment in the AWD-hybrid class. 10-year/200K powertrain warranty.</li>
        <li><strong>Mazda CX-50 AWD.</strong> If interior quality matters and you don&rsquo;t need hybrid economy.</li>
      </ol>
      <h2>What to avoid in Calgary</h2>
      <ul>
        <li>Pure RWD vehicles. Forget them unless they&rsquo;re a weekend car. RWD + cold pavement + Crowchild Trail is a bad pairing.</li>
        <li>Performance summer tires. They harden below 7°C. Even on an AWD vehicle, summer tires nullify the AWD advantage.</li>
        <li>Vehicles without remote-start. Calgary -30°C mornings are tolerable with remote-start; brutal without.</li>
      </ul>
    </>
  ),
};

const tradeIn: ResourceArticle = {
  slug: "how-to-trade-in-car-alberta",
  title: "How to Trade In a Car in Alberta: Maximise Value Step-by-Step",
  shortTitle: "Trade In Car Alberta",
  description:
    "How to trade in a car in Alberta: the exact prep steps, paperwork, and negotiation that maximise your trade-in value. Plus how to roll negative equity into a new NewWheels deal.",
  datePublished: "2026-05-06",
  cluster: "process",
  relatedCorePage: { href: "/calculator", label: "Estimate the payment on your next car" },
  summary:
    "To trade in a car in Alberta: clean it inside and out, gather the registration and any service records, get three competing offers (NewWheels, AutoTrader, dealer), and negotiate the trade separately from the new vehicle price.",
  faq: [
    { question: "Do I get more if I sell privately instead of trading in?", answer: "Usually 8-15% more, but it takes 4-12 weeks and exposes you to no-show buyers, financing chargebacks, and AMVIC bill-of-sale risk. Trade-in is faster and the GST credit on the trade-in value often closes the gap." },
    { question: "What&rsquo;s the Alberta GST trade-in credit?", answer: "Alberta charges 5% GST on the difference between the new vehicle and the trade-in. A $20K trade against a $40K new vehicle means you pay GST on $20K only — saves $1,000." },
    { question: "Can I trade in a car I still owe money on?", answer: "Yes. NewWheels pays off the existing loan and rolls any negative equity into the new financing. We tell you exactly how much negative equity you&rsquo;re carrying before you sign." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        Trade-in value depends on prep, timing, and which buyer you give the chance to bid.
        Get three offers (NewWheels, AutoTrader Instant Cash Offer, one dealer), clean the
        vehicle inside and out, bring the registration and any service records, and
        negotiate the trade as a separate transaction from the new-vehicle price.
      </p>
      <h2>The 7-step prep</h2>
      <ol>
        <li>Run a CARFAX or VHR report yourself first. Know what the buyer is going to see.</li>
        <li>Clean inside and out. A $40 detail at Co-op or a hand-wash adds $200-$500 in offers on a $20K trade.</li>
        <li>Fix obvious cosmetic damage if cost is under $300. Touch-up paint on chips, missing trim, broken wipers.</li>
        <li>Pull your registration document and any service records you have.</li>
        <li>If you still owe on the loan, get the exact 10-day payoff figure from your lender.</li>
        <li>Get three quotes. NewWheels gives a written trade quote that&rsquo;s good for 7 days.</li>
        <li>Negotiate trade and new-vehicle price as separate numbers. Don&rsquo;t let a dealer mix them.</li>
      </ol>
      <h2>The GST trade-in credit (Alberta specific)</h2>
      <p>
        Alberta&rsquo;s 5% GST is calculated on the price difference between the new vehicle
        and the trade-in. Selling privately for $1,000 more nets you $0 if you lose the
        $1,000 GST credit. Math the trade against the private-sale price including the
        GST credit before you decide.
      </p>
    </>
  ),
};

const refinancing: ResourceArticle = {
  slug: "how-to-refinance-car-loan-canada",
  title: "How to Refinance a Car Loan in Canada: When It Saves You Money",
  shortTitle: "Refinance Car Loan Canada",
  description:
    "Refinance a car loan in Canada step-by-step. When refinancing actually saves you money, when it costs you more, and how to refinance a NewWheels loan after 12 months of on-time payments.",
  datePublished: "2026-05-07",
  cluster: "process",
  relatedCorePage: { href: "/calculator", label: "Compare your current vs refinanced payment" },
  summary:
    "Refinance your car loan if your credit score has improved by 60+ points, current rates are at least 2 points lower than your existing rate, and you have 24+ months left on the term. NewWheels refinances files we originated after 12 on-time payments.",
  faq: [
    { question: "How long should I wait to refinance a car loan?", answer: "Wait 12-18 months from the original loan. Credit-builder refinancing is most effective when you have 12+ months of perfect payment history showing on your file." },
    { question: "Does refinancing hurt my credit?", answer: "Briefly, by 5-15 points from the hard pull. The new account becomes a positive history-builder within 60 days." },
    { question: "Can I refinance a NewWheels loan?", answer: "Yes. We refinance loans we originated after 12 on-time payments. Newcomer and subprime files often shave 4-8 percentage points off the rate by month 18." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        Refinance when three things are true: your score has improved 60+ points since
        the original loan, market rates are at least 2 points below your current rate,
        and you have 24+ months remaining on the term. Outside those conditions, the
        cost of the refinance (hard pull, new origination, slightly extended term) eats
        the savings.
      </p>
      <h2>When refinancing actually saves money</h2>
      <ul>
        <li>You opened a subprime loan at 16% with thin credit. Twelve on-time payments later, your file refinances at 9.99%.</li>
        <li>Bank-of-Canada rate has dropped at least 1 point since you signed.</li>
        <li>You can shorten the term (e.g. 84 → 60 months) at a similar payment because the rate dropped.</li>
      </ul>
      <h2>When refinancing costs you more</h2>
      <ul>
        <li>Loan term has under 18 months left. Closing costs and prepayment penalties exceed the interest savings.</li>
        <li>The refinance extends the term significantly to lower the payment — you pay less monthly but more total.</li>
        <li>Your credit score hasn&rsquo;t improved. Lenders price refinance off current score, not original.</li>
      </ul>
    </>
  ),
};

const lostJob: ResourceArticle = {
  slug: "what-happens-to-car-loan-if-you-lose-job",
  title: "What Happens to Your Car Loan if You Lose Your Job?",
  shortTitle: "Lost Job and Car Loan",
  description:
    "What to do with your car loan if you lose your job in Calgary. The exact 30-day action plan, lender hardship programs, GAP insurance, and refinancing options that prevent repossession.",
  datePublished: "2026-05-08",
  cluster: "process",
  relatedCorePage: { href: "/", label: "Get help with a car loan situation" },
  summary:
    "If you lose your job and have a car loan, call your lender within 14 days and request a hardship deferral (1-3 months of payments paused). File for EI immediately. Trade or sell the vehicle if hardship doesn&rsquo;t bridge to your next role. Default damages credit for 6+ years.",
  faq: [
    { question: "Can I pause car payments if I lose my job?", answer: "Most Canadian auto lenders offer 1-3 months of hardship deferral. You must request it before you miss a payment, not after." },
    { question: "Does Alberta have job-loss protection on car loans?", answer: "GAP insurance and credit-disability/job-loss insurance cover specific scenarios. Most NewWheels deals include the option to add this at signing. If you skipped it, call your lender about hardship programs immediately." },
    { question: "Should I sell my car if I lose my job?", answer: "Sell if you have positive equity and a 3+ month job search ahead. Trade through NewWheels if you need to downsize to a cheaper vehicle — we can refinance into something with a lower payment." },
  ],
  Body: () => (
    <>
      <h2>The short answer</h2>
      <p>
        Call your lender within 14 days of the job loss and request a hardship deferral.
        File for Employment Insurance the same week. If hardship doesn&rsquo;t bridge to your
        next role, contact NewWheels for a refinance to a lower payment or a trade-down
        to a cheaper vehicle. Defaulting damages your credit for 6+ years and triggers
        repossession costs that destroy your equity.
      </p>
      <h2>The 30-day action plan</h2>
      <h3>Day 1-7</h3>
      <ul>
        <li>File for EI online. Don&rsquo;t wait — every week of delay costs you a week of benefits.</li>
        <li>Call your lender. Ask specifically about a hardship deferral, skip-a-pay, or deferred payment plan.</li>
        <li>Cancel non-essential subscriptions and discretionary expenses.</li>
      </ul>
      <h3>Day 8-21</h3>
      <ul>
        <li>If hardship was approved, set a reminder for the resumption date. Lender may report the deferral to credit bureaus depending on program.</li>
        <li>Check whether you have credit-disability or job-loss insurance on the loan. Many NewWheels files include the option.</li>
        <li>Job search. Take stopgap work if it bridges to your next role.</li>
      </ul>
      <h3>Day 22-30</h3>
      <ul>
        <li>If the job search will take 60+ more days, talk to NewWheels about a refinance to lower the monthly payment or a trade-down.</li>
        <li>Avoid missing a payment. The first missed payment is the start of the credit damage clock — defer first, never default.</li>
      </ul>
    </>
  ),
};

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  newVsUsed,
  leaseVsBuy,
  newcomerCredit,
  ownershipCosts,
  winterCars,
  tradeIn,
  refinancing,
  lostJob,
];

export function findResource(slug: string): ResourceArticle | undefined {
  return RESOURCE_ARTICLES.find(a => a.slug === slug);
}
