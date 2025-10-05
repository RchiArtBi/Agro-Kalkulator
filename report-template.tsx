"use client";

import React from 'react';
import { CostSummary } from './cost-calculator';
import { TractorIcon } from './icons';

type ReportMachineDetail = {
    name: string;
    weight: number;
}

export type ReportData = {
    inputs: {
        distance: number;
        machines: ReportMachineDetail[];
        startPostalCode?: string;
        endPostalCode?: string;
    },
    summary: CostSummary
}

interface ReportTemplateProps {
  data: ReportData;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
}

export const ReportTemplate = React.forwardRef<HTMLDivElement, ReportTemplateProps>(({ data }, ref) => {
    const { inputs, summary } = data;
    const generationDate = new Date().toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const finalTotal = summary.transportCost + summary.manualAdditionalCost;

  return (
    <div ref={ref} className="bg-white text-gray-800 font-sans" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Roboto, sans-serif' }}>
        <div className="p-12 relative flex flex-col justify-between h-full" style={{minHeight: '297mm'}}>
            
            {/* Background watermark */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
                <TractorIcon className="w-96 h-96 text-gray-100 opacity-50 transform -rotate-12" />
            </div>

            <main>
                {/* Header */}
                <header className="flex justify-between items-start pb-8 border-b-2 border-primary mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-primary">AgroKalkulator</h1>
                        <p className="text-gray-500">Szacunkowa Wycena Transportu</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">Data wygenerowania</p>
                        <p className="text-gray-600">{generationDate}</p>
                    </div>
                </header>

                {/* Calculation Details */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4 text-gray-700">Podsumowanie zapytania</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-600">Dystans transportu:</p>
                            <p className="text-lg">{inputs.distance} km</p>
                        </div>
                        {(inputs.startPostalCode || inputs.endPostalCode) && (
                            <div>
                                <p className="font-semibold text-gray-600">Trasa (kody pocztowe):</p>
                                <p className="text-lg">{inputs.startPostalCode || 'Brak'} &rarr; {inputs.endPostalCode || 'Brak'}</p>
                            </div>
                        )}
                         <div>
                            <p className="font-semibold text-gray-600">Liczba maszyn:</p>
                            <p className="text-lg">{inputs.machines.length}</p>
                        </div>
                    </div>
                     <div className="mt-4">
                        <h3 className="font-semibold text-gray-600 mb-2">Transportowane maszyny:</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {inputs.machines.map((machine, index) => (
                                <li key={index}>
                                    {machine.name} (waga: {machine.weight.toLocaleString('pl-PL')} kg)
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                
                {/* Final Summary */}
                <section>
                    <div className="bg-primary/10 p-6 rounded-lg mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-lg text-gray-700">Koszt transportu:</p>
                            <p className="text-lg font-medium">{formatCurrency(summary.transportCost)}</p>
                        </div>
                        {summary.manualAdditionalCost > 0 && (
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-lg text-gray-700">Dodatkowe koszty:</p>
                                <p className="text-lg font-medium">{formatCurrency(summary.manualAdditionalCost)}</p>
                            </div>
                        )}
                        <div className="border-t border-gray-400 border-dashed my-4"></div>
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-2xl font-bold text-primary">SUMA CAŁKOWITA (NETTO)</p>
                            <p className="text-3xl font-bold text-primary">{formatCurrency(finalTotal)}</p>
                        </div>
                    </div>
                </section>
            </main>
            

            {/* Footer */}
            <footer className="text-center text-xs text-gray-500 pt-8 mt-auto">
                <p>
                    Niniejsza kalkulacja ma charakter wyłącznie szacunkowy i informacyjny. Nie stanowi ona oferty handlowej w rozumieniu art. 66 §1 Kodeksu Cywilnego.
                    Ostateczna cena może ulec zmianie i zostanie potwierdzona w wiążącej ofercie.
                </p>
                <p className="mt-2 font-semibold">AgroKalkulator &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    </div>
  );
});

ReportTemplate.displayName = "ReportTemplate";
