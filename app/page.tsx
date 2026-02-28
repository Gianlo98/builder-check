import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-grid" />
      <HeroSection />
    </main>
  );
}
