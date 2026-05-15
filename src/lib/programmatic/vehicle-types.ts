import type { VehicleType } from "./types";

export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: "suv",
    slugFragment: "suv",
    fullName: "SUV",
    shortName: "SUV",
    useCase: "Family transportation with cargo space, AWD options, and high seating position.",
    calgaryFitNote: "AWD SUVs dominate Calgary winter — ground clearance and traction outperform sedans on snow-packed side streets, and a typical Highlander or Pilot keeps three rows of car seats in play.",
  },
  {
    id: "truck",
    slugFragment: "truck",
    fullName: "pickup truck",
    shortName: "truck",
    useCase: "Hauling, towing, and trades work. Open box, factory tow rating.",
    calgaryFitNote: "Calgary's oil-and-gas and trades concentration drives pickup demand higher than the national average; the F-150, Silverado 1500, and RAM 1500 are the top three financed vehicles among NewWheels' Forest Lawn and Strathmore applicants.",
  },
  {
    id: "sedan",
    slugFragment: "sedan",
    fullName: "sedan",
    shortName: "sedan",
    useCase: "Daily driver with low total cost of ownership and high fuel efficiency.",
    calgaryFitNote: "Sedan demand is strongest among first-time buyers and PGWP graduates commuting between NW Calgary and downtown; AWD versions of the Camry, Mazda3, and Corolla outsell FWD on snow-belt routes.",
  },
  {
    id: "minivan",
    slugFragment: "minivan",
    fullName: "minivan",
    shortName: "minivan",
    useCase: "Three-row family transportation with sliding doors and the lowest cost per seat.",
    calgaryFitNote: "Calgary multi-generational households (especially in Saddle Ridge, Martindale, and Skyview) pick the Sienna and Pacifica as the highest-utility family vehicle on the market.",
  },
  {
    id: "crossover",
    slugFragment: "crossover",
    fullName: "crossover",
    shortName: "crossover",
    useCase: "Sedan ride and economy with SUV cargo and seating height.",
    calgaryFitNote: "Top first-time-buyer category in Calgary; the Kicks, HR-V, Trax, and Kona handle SAIT/MRU/U of C commuter routes cheaply year-round.",
  },
  {
    id: "ev",
    slugFragment: "electric-vehicle",
    fullName: "electric vehicle",
    shortName: "EV",
    useCase: "Zero-emission daily driving with the lowest cost per kilometre.",
    calgaryFitNote: "Calgary winter range can drop 20–30% on the coldest days; we walk every EV buyer through real-world Calgary range scenarios on the calculator before financing.",
  },
  {
    id: "hybrid",
    slugFragment: "hybrid",
    fullName: "hybrid vehicle",
    shortName: "hybrid",
    useCase: "Maximum fuel economy with no charging infrastructure required.",
    calgaryFitNote: "RAV4 Hybrid and Tucson Hybrid are Calgary's most-financed hybrids; the engine and battery handle -30°C starts where battery-only EVs lose range.",
  },
  {
    id: "used-car",
    slugFragment: "used-car",
    fullName: "used vehicle",
    shortName: "used car",
    useCase: "Lower upfront cost, less depreciation, broader inventory.",
    calgaryFitNote: "Pre-owned inventory is the largest slice of NewWheels' financed deals; Alberta-only no-PST means buyers stretch the same monthly payment further than buyers in BC or Ontario.",
  },
  {
    id: "new-car",
    slugFragment: "new-car",
    fullName: "new vehicle",
    shortName: "new car",
    useCase: "Full factory warranty, latest tech, and access to OEM finance programs (often the lowest rate available).",
    calgaryFitNote: "Manufacturer-backed newcomer and first-time-buyer programs are routinely cheaper than third-party sub-prime — even for buyers with thin credit — when paired with a brand-new Nissan or Toyota.",
  },
  {
    id: "cpo",
    slugFragment: "certified-pre-owned",
    fullName: "certified pre-owned vehicle",
    shortName: "CPO",
    useCase: "Inspected pre-owned vehicles with extended factory-backed warranty and OEM-backed rates.",
    calgaryFitNote: "CPO Toyota and Honda inventory clears fastest in Calgary; financing rates often beat used-car rates by 2–3 points.",
  },
];

export function vehicleTypeBySlugFragment(fragment: string): VehicleType | undefined {
  return VEHICLE_TYPES.find(v => v.slugFragment === fragment);
}
