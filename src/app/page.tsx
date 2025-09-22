import { CostCalculator } from "@/components/cost-calculator";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <CostCalculator />
      </div>
    </div>
  );
}
