import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <HeroSection />
    </main>
  );
}
