"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/icons";
import { getMachines, Machine } from "@/app/admin/actions";
import { Download, Trash2, Wand2 } from "lucide-react";
import { calculateDistanceWithLLM } from "@/ai/flows/calculate-distance-with-llm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ReportTemplate, ReportData } from "./report-template";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const machineSelectionSchema = z.object({
  machineType: z.string().nonempty("Proszę wybrać typ maszyny."),
  machineModel: z.string().nonempty("Proszę wybrać model maszyny."),
  additionalCosts: z.array(z.string()).optional(),
});

const formSchema = z.object({
  machines: z.array(machineSelectionSchema).min(1, "Proszę dodać przynajmniej jedną maszynę."),
  distance: z.coerce.number().min(1, "Ilość km musi być większa od 0."),
  startPostalCode: z.string().optional(),
  endPostalCode: z.string().optional(),
  manualAdditionalCost: z.coerce.number().optional().default(0),
});

export type FormValues = z.infer<typeof formSchema>;

const MANDATORY_COSTS = ['przeglad_0', 'skladanie', 'uruchomienie'];

export type CostSummary = {
  transportCost: number;
  additionalServicesCost: number;
  manualAdditionalCost: number;
  totalCost: number;
};

type HistoryEntry = {
  id: string;
  date: string;
  data: FormValues;
  summary: CostSummary;
};

const MAX_HISTORY_ENTRIES = 5;

type HistoryDialogProps = {
  trigger: React.ReactNode;
}

export function HistoryDialog({ trigger }: HistoryDialogProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const storedHistory = localStorage.getItem("calculationHistory");
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
            window.addEventListener('storage', handleStorageChange);
            return () => {
                window.removeEventListener('storage', handleStorageChange);
            }
        }
    }, []);

    const handleStorageChange = () => {
        const storedHistory = localStorage.getItem("calculationHistory");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        } else {
            setHistory([]);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem("calculationHistory");
        setHistory([]);
    };
    
    const handleTriggerClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDialogOpen(true);
    };

    if (!isClient) {
        return null;
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild onClick={handleTriggerClick}>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Historia Obliczeń</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                {history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((entry) => (
                            <div key={entry.id} className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleString('pl-PL')}</p>
                                <p><strong>Dystans:</strong> {entry.data.distance} km</p>
                                <p><strong>Maszyny:</strong></p>
                                <ul className="list-disc pl-5">
                                    {entry.data.machines.map((m, i) => <li key={i}>{m.machineType} {m.machineModel}</li>)}
                                </ul>
                                <div className="mt-2 p-2 bg-green-50 rounded-md">
                                    <p className="font-bold">Całkowity koszt: {entry.summary.totalCost.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Brak historii obliczeń.</p>
                )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={clearHistory} disabled={history.length === 0}>
                        Wyczyść historię
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export function CostCalculator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [allMachines, setAllMachines] = useState<Machine[]>([]);
  const [machineTypes, setMachineTypes] = useState<string[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [lastSubmittedData, setLastSubmittedData] = useState<FormValues | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      machines: [{ machineType: '', machineModel: '', additionalCosts: [] }],
      distance: 100,
      startPostalCode: "",
      endPostalCode: "",
      manualAdditionalCost: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "machines",
  });

  useEffect(() => {
    async function fetchMachines() {
      const fetchedMachines = await getMachines();
      setAllMachines(fetchedMachines);
      const types = [...new Set(fetchedMachines.map(m => m.type))];
      setMachineTypes(types);
    }
    fetchMachines();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const watchedMachines = form.watch("machines");
  const watchedMachineModels = watchedMachines.map(m => m.machineModel);

  const getMachineModelsForType = (type: string) => allMachines.filter(m => m.type === type) || [];
  
  const getSelectedMachine = (modelName: string) => allMachines.find(m => m.model === modelName);

  const getAdditionalCostsForMachine = (modelName?: string) => {
    const machine = getSelectedMachine(modelName || '');
    if (!machine) return [];
    return Object.entries(machine.costs)
      .map(([id, price]) => ({
        id,
        label: id.replace(/_/g, ' ').replace('przeglad', 'Przegląd').replace('po', 'po ').replace('mtg','mtg'),
        price: price as number,
      }))
      .filter(cost => cost.price > 0);
  };

  const addToHistory = (data: FormValues, summary: CostSummary) => {
    const storedHistory = localStorage.getItem("calculationHistory");
    const history: HistoryEntry[] = storedHistory ? JSON.parse(storedHistory) : [];

    const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        data,
        summary,
    };

    const newHistory = [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem("calculationHistory", JSON.stringify(newHistory));
    window.dispatchEvent(new Event("storage"));
  };
    
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name && name.includes('machineModel') && type === 'change') {
        const parts = name.split('.');
        const index = parseInt(parts[1], 10);
        
        form.setValue(`machines.${index}.additionalCosts`, []);

        const model = form.getValues(`machines.${index}.machineModel`);
        const selectedMachine = getSelectedMachine(model);
        if (selectedMachine) {
          const additionalCosts = getAdditionalCostsForMachine(model);
          const mandatoryCostIds = additionalCosts
            .filter(cost => MANDATORY_COSTS.includes(cost.id))
            .map(cost => cost.id);
          
          form.setValue(`machines.${index}.additionalCosts`, mandatoryCostIds);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, allMachines]);


  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setCostSummary(null);
    setLastSubmittedData(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let highestRate = 0;
      values.machines.forEach(machineData => {
        const selectedMachine = getSelectedMachine(machineData.machineModel);
        if (selectedMachine && selectedMachine.rate > highestRate) {
          highestRate = selectedMachine.rate;
        }
      });
      const totalTransportCost = values.distance * highestRate;

      let machineServicesCost = 0;
      values.machines.forEach(machineData => {
        const selectedMachine = getSelectedMachine(machineData.machineModel);
        if (!selectedMachine) {
          throw new Error(`Nie znaleziono maszyny: ${machineData.machineModel}`);
        }
        
        const machineAdditionalCosts = getAdditionalCostsForMachine(selectedMachine.model);
        const selectedAddCosts = machineData.additionalCosts?.reduce((acc, costId) => {
          const cost = machineAdditionalCosts.find(c => c.id === costId);
          return acc + (cost ? cost.price : 0);
        }, 0) || 0;

        machineServicesCost += selectedAddCosts;
      });
      
      const manualCost = values.manualAdditionalCost || 0;
      
      const summary = {
        transportCost: totalTransportCost,
        additionalServicesCost: machineServicesCost,
        manualAdditionalCost: manualCost,
        totalCost: totalTransportCost + machineServicesCost + manualCost,
      };

      setCostSummary(summary);
      setLastSubmittedData(values);
      addToHistory(values, summary);

    } catch (error) {
      console.error("Błąd obliczania kosztów:", error);
      toast({
        variant: "destructive",
        title: "Wystąpił błąd",
        description: "Nie udało się obliczyć kosztów. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAiDistanceCalculation = async () => {
    const startPostalCode = form.getValues("startPostalCode");
    const endPostalCode = form.getValues("endPostalCode");

    if (!startPostalCode || !endPostalCode) {
      toast({
        variant: "destructive",
        title: "Brak danych",
        description: "Proszę podać kod pocztowy początkowy i końcowy.",
      });
      return;
    }

    setIsCalculatingDistance(true);
    try {
      const result = await calculateDistanceWithLLM({ startPostalCode, endPostalCode });
      const distanceInBothWays = result.distance * 2;
      form.setValue("distance", distanceInBothWays, { shouldValidate: true });
      toast({
        title: "Sukces!",
        description: `Oszacowano ${result.distance} km w jedną stronę. W obie strony: ${distanceInBothWays} km.`,
      });
    } catch (error) {
      console.error("Błąd obliczania odległości przez AI:", error);
      toast({
        variant: "destructive",
        title: "Błąd AI",
        description: "Nie udało się obliczyć odległości. Spróbuj ponownie.",
      });
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
        const canvas = await html2canvas(reportRef.current, {
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        const width = pdfWidth;
        const height = width / ratio;
        
        pdf.addImage(imgData, 'PNG', 0, 0, width, height > pdfHeight ? pdfHeight : height);
        pdf.save(`raport-agro-kalkulator-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
            variant: "destructive",
            title: "Błąd PDF",
            description: "Nie udało się wygenerować raportu PDF. Spróbuj ponownie.",
        });
    } finally {
        setIsGeneratingPdf(false);
    }
};

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
  }

  const getTransportCalculationData = () => {
    const machineWithHighestRate = watchedMachines
        .map(m => getSelectedMachine(m.machineModel))
        .filter((m): m is Machine => !!m)
        .reduce((prev, current) => (prev && prev.rate > current.rate) ? prev : current, null);

    return machineWithHighestRate;
  }
  
  const getReportData = (): ReportData | null => {
    if (!lastSubmittedData || !costSummary) return null;

    const machineDetails = lastSubmittedData.machines.map(m => {
        const details = getSelectedMachine(m.machineModel);
        if (!details) return { name: 'Nieznana maszyna', weight: 0 };
        return {
            name: `${details.type} ${details.model}`,
            weight: details.weight || 0,
        }
    });

    return {
        inputs: {
            distance: lastSubmittedData.distance,
            machines: machineDetails,
            startPostalCode: lastSubmittedData.startPostalCode,
            endPostalCode: lastSubmittedData.endPostalCode,
        },
        summary: costSummary
    }
  }

  const transportData = getTransportCalculationData();
  const reportData = getReportData();


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Kalkulacja kosztów</CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {allMachines.length === 0 ? (
             <div className="flex justify-center items-center h-40">
                <Spinner className="h-8 w-8" />
             </div>
          ) : (
          <>
            <div className="space-y-4">
              {fields.map((item, index) => {
                  const selectedMachineType = watchedMachines[index]?.machineType;
                  const machineModels = getMachineModelsForType(selectedMachineType);

                  return (
                    <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Typ maszyny</Label>
                          <Controller
                            name={`machines.${index}.machineType`}
                            control={form.control}
                            render={({ field }) => (
                              <Select onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue(`machines.${index}.machineModel`, '');
                                  form.setValue(`machines.${index}.additionalCosts`, []);
                                  setCostSummary(null);
                                }} 
                                value={field.value}
                                >
                                <SelectTrigger>
                                  <SelectValue placeholder="WYBIERZ TYP" />
                                </SelectTrigger>
                                <SelectContent>
                                  {machineTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div>
                          <Label>Model maszyny</Label>
                          <Controller
                            name={`machines.${index}.machineModel`}
                            control={form.control}
                            render={({ field }) => (
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setCostSummary(null);
                                }} 
                                value={field.value}
                                disabled={!selectedMachineType}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Wybierz model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {machineModels.map((model) => (
                                    <SelectItem key={model.model} value={model.model}>{model.model}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  );
              })}
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append({ machineType: '', machineModel: '', additionalCosts: [] })}
            >
              + Dodaj kolejną maszynę
            </Button>
            
            {transportData && (
                <div className="p-4 bg-slate-100 rounded-md text-sm text-gray-600 space-y-2">
                    <p className="font-medium text-gray-800">Dane do obliczenia transportu:</p>
                    <p>Model z najwyższą stawką: {transportData.model}</p>
                    <p>Waga: {transportData.weight.toLocaleString()} kg</p>
                    <p>Stawka transportu: {transportData.rate.toFixed(2)} zł/km</p>
                     <div className='pt-2'>
                        <Label htmlFor="manualAdditionalCost" className="text-gray-800">Dodatkowe koszty:</Label>
                        <Input 
                            id="manualAdditionalCost" 
                            type="number" 
                            placeholder="np. 500" 
                            {...form.register("manualAdditionalCost")} 
                            className="mt-1 bg-white hide-spin-buttons"
                        />
                    </div>
                </div>
            )}

             <div>
              <Label htmlFor="distance">Ilość km w obie strony</Label>
              <Input id="distance" type="number" placeholder="np. 100" {...form.register("distance")} />
              {form.formState.errors.distance && <p className="text-red-500 text-sm mt-1">{form.formState.errors.distance.message}</p>}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="p-4 border rounded-lg text-base font-medium">Oblicz odległość (AI)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 border-t-0 border rounded-b-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startPostalCode">Kod pocztowy (start)</Label>
                            <Input id="startPostalCode" placeholder="np. 00-001" {...form.register("startPostalCode")} />
                        </div>
                        <div>
                            <Label htmlFor="endPostalCode">Kod pocztowy (meta)</Label>
                            <Input id="endPostalCode" placeholder="np. 30-079" {...form.register("endPostalCode")} />
                        </div>
                    </div>
                    <Button type="button" onClick={handleAiDistanceCalculation} disabled={isCalculatingDistance} className="w-full">
                        {isCalculatingDistance ? <Spinner className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isCalculatingDistance ? "Obliczanie..." : "Oblicz odległość z AI"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-4">
              <Label className="text-base font-medium">Koszty dodatkowe maszyn:</Label>
              {watchedMachines.map((machine, index) => {
                 const selectedMachine = getSelectedMachine(machine.machineModel);
                 if (!selectedMachine) return null;
                 const additionalCosts = getAdditionalCostsForMachine(selectedMachine.model);
                 if (additionalCosts.length === 0) return null;

                 return (
                  <div key={fields[index].id} className="space-y-2">
                    <h4 className="font-semibold">{selectedMachine.type} {selectedMachine.model}</h4>
                    <div className="space-y-2">
                      {additionalCosts.map((cost) => {
                        const isMandatory = MANDATORY_COSTS.includes(cost.id);
                        return (
                        <div key={cost.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                            <div className="flex items-center">
                              <Controller
                                  name={`machines.${index}.additionalCosts`}
                                  control={form.control}
                                  render={({ field }) => (
                                      <Checkbox
                                          id={`${fields[index].id}-${cost.id}`}
                                          checked={field.value?.includes(cost.id)}
                                          disabled={isMandatory}
                                          onCheckedChange={(checked) => {
                                            setCostSummary(null);
                                            if (!isMandatory) {
                                              const newValue = checked
                                                  ? [...(field.value || []), cost.id]
                                                  : field.value?.filter((value) => value !== cost.id);
                                              field.onChange(newValue);
                                            }
                                          }}
                                      />
                                  )}
                              />
                              <Label htmlFor={`${fields[index].id}-${cost.id}`} className="ml-2 capitalize">{cost.label}</Label>
                            </div>
                            <span>{cost.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2})} zł</span>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                 )
              })}
            </div>

          {costSummary !== null && (
             <div className="p-4 border rounded-lg space-y-2 bg-green-50 animate-fade-in-up">
                <h3 className="text-center font-bold text-lg mb-4">Podsumowanie kosztów</h3>
                <div className="flex justify-between items-center text-gray-700">
                    <p>Koszt transportu:</p>
                    <p className="font-medium">{formatCurrency(costSummary.transportCost)}</p>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                    <p>Suma kosztów dodatkowych:</p>
                    <p className="font-medium">{formatCurrency(costSummary.additionalServicesCost + costSummary.manualAdditionalCost)}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-200 rounded-md mt-2">
                    <p className="font-bold text-lg text-green-800">Całkowity koszt końcowy:</p>
                    <p className="font-bold text-xl text-green-800">{formatCurrency(costSummary.totalCost)}</p>
                </div>
                <Button 
                    type="button" 
                    onClick={handleGeneratePdf} 
                    disabled={isGeneratingPdf} 
                    className="w-full mt-4"
                >
                    {isGeneratingPdf ? <Spinner className="mr-2" /> : <Download className="mr-2"/>}
                    {isGeneratingPdf ? "Generowanie PDF..." : "Pobierz PDF z ofertą"}
                </Button>
            </div>
          )}
          </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || allMachines.length === 0} className="w-full bg-primary hover:bg-primary/90 text-white">
            {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {isLoading ? "Obliczanie..." : "Oblicz"}
          </Button>
        </CardFooter>
      </form>
      {/* Hidden component for PDF generation */}
      <div className="absolute -z-10 -left-[9999px] top-0">
          {reportData && <ReportTemplate ref={reportRef} data={reportData} />}
      </div>
    </Card>
  );
}
