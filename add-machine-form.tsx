"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMachine } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/icons";
import { useFormStatus } from "react-dom";

type FormValuesKeys = 
  | 'type' 
  | 'model' 
  | 'weight' 
  | 'rate' 
  | 'przeglad_0' 
  | 'skladanie' 
  | 'uruchomienie' 
  | 'przeglad_po_100_mtg' 
  | 'przeglad_po_500_mtg' 
  | 'przeglad_po_1000_mtg'
  | 'form';

type InitialState = {
  error?: Partial<Record<FormValuesKeys, string[]>>;
  success?: boolean;
};

const initialState: InitialState = {};

function SubmitButton() {
    const { pending } = useFormStatus(); 
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Spinner className="mr-2 h-4 w-4" />}
            Dodaj Maszynę
        </Button>
    );
}

export function AddMachineForm() {
  const [state, formAction] = useActionState(addMachine, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Sukces!",
        description: "Nowa maszyna została dodana.",
      });
      formRef.current?.reset();
    } else if (state?.error?.form) {
       toast({ 
         variant: "destructive", 
         title: "Błąd", 
         description: state.error.form[0] 
       });
    }
  }, [state, toast]);

  const renderInput = (id: FormValuesKeys, label: string, type: string = 'text', placeholder: string, step?: string) => (
    <div>
        <Label htmlFor={id}>{label}</Label>
        <Input 
            id={id} 
            name={id}
            type={type} 
            placeholder={placeholder}
            defaultValue=""
            step={step}
            className={type === 'number' ? 'hide-spin-buttons' : ''}
        />
         {state?.error?.[id] && <p className="text-red-500 text-sm mt-1">{state.error[id]}</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj Nową Maszynę</CardTitle>
        <CardDescription>
          Wypełnij poniższy formularz, aby dodać nową maszynę do bazy.
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={formAction} >
        <CardContent className="space-y-4">
          {renderInput('type', 'Typ Maszyny', 'text', 'np. CIĄGNIK')}
          {renderInput('model', 'Model Maszyny', 'text', 'np. Arion 420')}
          {renderInput('weight', 'Waga (kg)', 'number', 'np. 5000')}
          {renderInput('rate', 'Stawka (zł/km)', 'number', 'np. 5.20', '0.01')}
          <h3 className="font-medium pt-2">Koszty dodatkowe (opcjonalne)</h3>
          {renderInput('przeglad_0', 'Przegląd "0"', 'number', 'np. 1280')}
          {renderInput('skladanie', 'Składanie', 'number', 'np. 1000')}
          {renderInput('uruchomienie', 'Uruchomienie', 'number', 'np. 256')}
          {renderInput('przeglad_po_100_mtg', 'Przegląd po 100 mtg', 'number', 'np. 3293')}
          {renderInput('przeglad_po_500_mtg', 'Przegląd po 500 mtg', 'number', 'np. 3477')}
          {renderInput('przeglad_po_1000_mtg', 'Przegląd po 1000 mtg', 'number', 'np. 7494')}
        </CardContent>
        <CardFooter>
            <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
