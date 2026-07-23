import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Next.js blocks cross-origin requests to dev-only resources (HMR, RSC
   * fetches, Server Actions) by default — only the host it was started on
   * (localhost) is trusted. Testing on a phone/tablet over LAN at
   * http://192.168.0.193:3000 hits that block, which silently breaks every
   * client interaction (Add to cart, Refresh price, Compare, ...) even
   * though the buttons render. Allowlist the LAN origin actually used for
   * manual testing; add more entries here if the dev machine's IP changes.
   */
  allowedDevOrigins: ["192.168.0.193"],
};

export default nextConfig;
