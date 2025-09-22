"use client";

import { type CalculateTransportCostWithLLMOutput } from "@/ai/flows/calculate-transport-cost-with-llm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface ResultDisplayProps {
  result: CalculateTransportCostWithLLMOutput;
}

export function ResultDisplay({ result }: ResultDisplayProps) {

  const handlePrint = () => {
    window.print();
  };

  const formattedCost = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: result.currency,
  }).format(result.estimatedCost);

  return (
    <Card id="print-section" className="print-container">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Szacowany Koszt Transportu</CardTitle>
        <CardDescription>Poniżej znajduje się podsumowanie kosztów.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between rounded-lg bg-muted p-4">
          <span className="text-muted-foreground">Całkowity koszt</span>
          <p className="text-3xl font-bold text-primary">{formattedCost}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">Podział kosztów:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.costBreakdown}</p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 sm:flex-row sm:justify-end">
        <Button onClick={handlePrint} className="no-print bg-accent text-accent-foreground hover:bg-accent/90">
          <Printer className="mr-2 h-4 w-4" />
          Drukuj Raport
        </Button>
      </CardFooter>
    </Card>
  );
}
