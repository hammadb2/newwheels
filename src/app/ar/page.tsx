import type { Metadata } from "next";
import { buildLangMetadata, renderLanguageLanding } from "@/lib/lang/landings";

export const metadata: Metadata = buildLangMetadata("ar");

export default function ArabicLanding() {
  return renderLanguageLanding("ar");
}
