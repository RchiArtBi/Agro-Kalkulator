import { z } from "zod";

export const transportCostSchema = z.object({
  distance: z.coerce.number().min(1, { message: "Odległość musi być większa niż 0." }),
  machineWeight: z.coerce.number().min(100, { message: "Waga maszyny musi wynosić co najmniej 100 kg." }),
  dimensions: z.string().regex(/^\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?$/, {
    message: "Podaj wymiary w formacie Dł,Szer,Wys (np. 10,2.5,3).",
  }),
  destination: z.string().min(2, { message: "Miejsce docelowe musi mieć co najmniej 2 znaki." }),
  marketConditions: z.string().optional(),
});

export type TransportCostFormValues = z.infer<typeof transportCostSchema>;
