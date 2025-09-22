"use server";

import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const machineSchema = z.object({
  type: z.string().min(1, "Typ jest wymagany."),
  model: z.string().min(1, "Model jest wymagany."),
  weight: z.coerce.number().min(1, "Waga musi być większa od 0."),
  rate: z.coerce.number().min(0.1, "Stawka musi być większa od 0."),
  costs: z.object({
    przeglad_0: z.coerce.number().default(0),
    skladanie: z.coerce.number().default(0),
    uruchomienie: z.coerce.number().default(0),
    przeglad_po_100_mtg: z.coerce.number().default(0),
    przeglad_po_500_mtg: z.coerce.number().default(0),
    przeglad_po_1000_mtg: z.coerce.number().default(0),
  }),
});

export type Machine = z.infer<typeof machineSchema>;

const filePath = path.join(process.cwd(), "src/lib/machines.json");

export async function getMachines(): Promise<Machine[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    if (!data) return [];
    const machines = JSON.parse(data);
    return machines;
  } catch (error) {
    console.error("Failed to read machines.json:", error);
    return [];
  }
}

export async function addMachine(prevState: any, formData: FormData) {
  const newMachineData = {
    type: formData.get("type"),
    model: formData.get("model"),
    weight: formData.get("weight"),
    rate: formData.get("rate"),
    costs: {
      przeglad_0: formData.get("przeglad_0"),
      skladanie: formData.get("skladanie"),
      uruchomienie: formData.get("uruchomienie"),
      przeglad_po_100_mtg: formData.get("przeglad_po_100_mtg"),
      przeglad_po_500_mtg: formData.get("przeglad_po_500_mtg"),
      przeglad_po_1000_mtg: formData.get("przeglad_po_1000_mtg"),
    },
  };

  const validatedMachine = machineSchema.safeParse(newMachineData);

  if (!validatedMachine.success) {
    return {
      error: validatedMachine.error.flatten().fieldErrors,
    };
  }

  try {
    const machines = await getMachines();
    
    const modelExists = machines.some(machine => machine.model.toLowerCase() === validatedMachine.data.model.toLowerCase());
    if (modelExists) {
        return {
            error: { model: ["Maszyna o tym modelu już istnieje."] }
        };
    }

    machines.push(validatedMachine.data);
    await fs.writeFile(filePath, JSON.stringify(machines, null, 2));

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to add machine:", error);
    return { error: { form: ["Nie udało się dodać maszyny."] } };
  }
}
