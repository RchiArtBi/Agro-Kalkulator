import { CostCalculator } from "@/components/cost-calculator";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <CostCalculator />
          </div>
        </div>
      </main>
    </div>
  );
}
