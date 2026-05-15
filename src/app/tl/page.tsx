import type { Metadata } from "next";
import { buildLangMetadata, renderLanguageLanding } from "@/lib/lang/landings";

export const metadata: Metadata = buildLangMetadata("tl");

export default function TagalogLanding() {
  return renderLanguageLanding("tl");
}
