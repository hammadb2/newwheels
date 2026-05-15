import type { Metadata } from "next";
import { buildLangMetadata, renderLanguageLanding } from "@/lib/lang/landings";

export const metadata: Metadata = buildLangMetadata("pa");

export default function PunjabiLanding() {
  return renderLanguageLanding("pa");
}
