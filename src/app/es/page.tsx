import type { Metadata } from "next";
import { buildLangMetadata, renderLanguageLanding } from "@/lib/lang/landings";

export const metadata: Metadata = buildLangMetadata("es");

export default function SpanishLanding() {
  return renderLanguageLanding("es");
}
