import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech | Huginn",
  description: "Technology trends and IT news",
};

export default function TechPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Tech</h1>
      <p className="text-gray-300">Technology trends and IT news will appear here.</p>
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Coming soon.</p>
      </div>
    </div>
  );
}
