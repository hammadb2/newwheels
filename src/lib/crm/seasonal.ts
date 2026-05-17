// Seasonal intelligence alerts — Calgary automotive calendar.
//
// Pre-loaded events with CEO-dismissible banner alerts 3 weeks before each event.

export type SeasonalEvent = {
  id: string;
  name: string;
  start_month: number;
  end_month: number;
  recommended_action: string;
  custom?: boolean;
};

export const CALGARY_AUTO_CALENDAR: SeasonalEvent[] = [
  {
    id: "tax_refund",
    name: "Tax Refund Season",
    start_month: 2,
    end_month: 4,
    recommended_action: "Increase ad spend on down-payment messaging. Many applicants will have refund cash for down payments.",
  },
  {
    id: "summer",
    name: "Summer Buying Season",
    start_month: 5,
    end_month: 6,
    recommended_action: "Ramp up lead generation. Peak vehicle demand — road trips, family upgrades, new arrivals settling in.",
  },
  {
    id: "back_to_school",
    name: "Back to School",
    start_month: 8,
    end_month: 8,
    recommended_action: "Target students and newcomers. Post-secondary starts soon — reliable transportation is a priority.",
  },
  {
    id: "winter",
    name: "Winter Prep Season",
    start_month: 10,
    end_month: 10,
    recommended_action: "Push AWD/4WD vehicle content. Calgary winters drive demand for capable vehicles.",
  },
  {
    id: "year_end",
    name: "Year-End Clearance",
    start_month: 11,
    end_month: 12,
    recommended_action: "Promote year-end deals. Dealers clearing inventory creates better financing options for buyers.",
  },
];

export function getUpcomingAlerts(now: Date = new Date()): (SeasonalEvent & { days_until: number })[] {
  const alerts: (SeasonalEvent & { days_until: number })[] = [];
  const currentYear = now.getFullYear();

  for (const event of CALGARY_AUTO_CALENDAR) {
    // Calculate event start date
    const eventStart = new Date(currentYear, event.start_month - 1, 1);
    if (eventStart < now) {
      eventStart.setFullYear(currentYear + 1);
    }

    const daysUntil = Math.floor((eventStart.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    // Show alert 3 weeks (21 days) before
    if (daysUntil >= 0 && daysUntil <= 21) {
      alerts.push({ ...event, days_until: daysUntil });
    }
  }

  return alerts;
}
