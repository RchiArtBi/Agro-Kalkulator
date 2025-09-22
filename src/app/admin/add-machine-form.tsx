"use client";

import { useActionState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const formSchema = z.object({
    type: z.string().min(1, "Typ jest wymagany."),
    model: z.string().min(1, "Model jest wymagany."),
    weight: z.coerce.number().min(1, "Waga musi być większa od 0."),
    rate: z.coerce.number().min(0.1, "Stawka musi być większa od 0."),
    przeglad_0: z.coerce.number().default(0),
    skladanie: z.coerce.number().default(0),
    uruchomienie: z.coerce.number().default(0),
    przeglad_po_100_mtg: z.coerce.number().default(0),
    przeglad_po_500_mtg: z.coerce.number().default(0),
    przeglad_po_1000_mtg: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

type InitialState = {
  error?: {
    [key: string]: string[] | undefined;
  };
  success?: boolean;
};

const initialState: InitialState = {};

function SubmitButton() {
    // This hook is not available in useFormState, but we can use it here
    // const { pending } = useFormStatus(); 
    return (
        <Button type="submit" className="w-full" >
            {/* {pending && <Spinner className="mr-2 h-4 w-4" />} */}
            Dodaj Maszynę
        </Button>
    );
}

export function AddMachineForm() {
  const [state, formAction] = useActionState(addMachine, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      model: "",
      weight: 0,
      rate: 0,
      przeglad_0: 0,
      skladanie: 0,
      uruchomienie: 0,
      przeglad_po_100_mtg: 0,
      przeglad_po_500_mtg: 0,
      przeglad_po_1000_mtg: 0,
    },
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Sukces!",
        description: "Nowa maszyna została dodana.",
      });
      formRef.current?.reset();
      form.reset();
    } else if (state.error) {
       const fieldErrors = Object.entries(state.error).map(([field, errors]) => `${field}: ${errors?.join(', ')}`).join('; ');
      toast({
        variant: "destructive",
        title: "Błąd walidacji",
        description: fieldErrors || "Proszę poprawić błędy w formularzu.",
      });
    }
  }, [state, toast, form]);

  const renderInput = (id: keyof FormValues, label: string, type: string = 'text', placeholder: string) => (
    <div>
        <Label htmlFor={id}>{label}</Label>
        <Input 
            id={id} 
            name={id}
            type={type} 
            placeholder={placeholder}
            {...form.register(id)}
        />
        {form.formState.errors[id] && <p className="text-red-500 text-sm mt-1">{form.formState.errors[id]?.message}</p>}
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
          {renderInput('rate', 'Stawka (zł/km)', 'number', 'np. 5.20')}
          <h3 className="font-medium pt-2">Koszty dodatkowe (opcjonalne)</h3>
          {renderInput('przeglad_0', 'Przegląd "0"', 'number', '0')}
          {renderInput('skladanie', 'Składanie', 'number', '0')}
          {renderInput('uruchomienie', 'Uruchomienie', 'number', '0')}
          {renderInput('przeglad_po_100_mtg', 'Przegląd po 100 mtg', 'number', '0')}
          {renderInput('przeglad_po_500_mtg', 'Przegląd po 500 mtg', 'number', '0')}
          {renderInput('przeglad_po_1000_mtg', 'Przegląd po 1000 mtg', 'number', '0')}
          {state?.error?.form && <p className="text-red-500 text-sm mt-1">{state.error.form}</p>}
        </CardContent>
        <CardFooter>
            <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
