"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records where the visit came from (lib/attribution.ts). Lives in the root
 * layout, which stays mounted across client-side navigation, so this runs once
 * per full page load: exactly the loads that can bring UTMs, click IDs or an
 * outside referrer. Navigation inside the site brings none of those.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
