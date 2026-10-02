import { Suspense } from "react";
import type { Metadata } from "next";

import { SecurityInteractive } from "./_components/security-interactive";

export const metadata: Metadata = {
  title: "Live Security News",
  description: "Follow AI-verified war and security news on a live map",
};

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<div className="py-8 text-center text-gray-400">Loading...</div>}>
        <SecurityInteractive />
      </Suspense>
    </div>
  );
}
