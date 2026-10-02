import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Economy | Huginn",
  description: "Economic trends and market analysis",
};

export default function EconomyPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Economy</h1>
      <p className="text-gray-300">Economic trends and market analysis will appear here.</p>
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Coming soon.</p>
      </div>
    </div>
  );
}
