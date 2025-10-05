"use server";

import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

// --- CONFIG ---
const machinesFilePath = path.join(process.cwd(), "src/lib/machines.json");
const usersFilePath = path.join(process.cwd(), "src/lib/users.json");
const ADMIN_COOKIE_NAME = 'admin-session-token';

// --- SCHEMAS ---
const machineSchema = z.object({
  type: z.string().min(1, "Typ jest wymagany."),
  model: z.string().min(1, "Model jest wymagany."),
  weight: z.coerce.number().default(0),
  rate: z.coerce.number().default(0),
  costs: z.object({
    przeglad_0: z.coerce.number().default(0),
    skladanie: z.coerce.number().default(0),
    uruchomienie: z.coerce.number().default(0),
    przeglad_po_100_mtg: z.coerce.number().default(0),
    przeglad_po_500_mtg: z.coerce.number().default(0),
    przeglad_po_1000_mtg: z.coerce.number().default(0),
  }),
});

const userSchema = z.object({
    login: z.string().email("Nieprawidłowy format email."),
    hash: z.string().min(1, "Hasło jest wymagane."),
});


export type Machine = z.infer<typeof machineSchema>;
export type User = z.infer<typeof userSchema>;

// --- ADMIN ACCESS ---
export async function checkAdminAccess(password: string): Promise<{ success: boolean; error?: string }> {
  const serverPassword = process.env.ADMIN_PASSWORD;

  if (!serverPassword) {
      console.error("ADMIN_PASSWORD is not set in .env file");
      return { success: false, error: "Błąd konfiguracji serwera." };
  }

  if (password === serverPassword) {
    // In a real app, we'd set a secure, httpOnly cookie here.
    // For this use case, we will handle session in the client with sessionStorage
    // to avoid dealing with cookies which are harder to manage in this context.
    return { success: true };
  }

  return { success: false, error: "Nieprawidłowe hasło." };
}

// --- USER MANAGEMENT ---

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, "utf-8");
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error("Failed to read users.json:", error);
    return [];
  }
}

export async function addUser(prevState: any, formData: FormData) {
    const newUser = {
        login: formData.get("login"),
        hash: formData.get("hash"),
    };

    const validatedUser = userSchema.safeParse(newUser);

    if (!validatedUser.success) {
        return { error: validatedUser.error.flatten().fieldErrors.login?.[0] || validatedUser.error.flatten().fieldErrors.hash?.[0] };
    }
    
    try {
        const users = await getUsers();
        const userExists = users.some(user => user.login.toLowerCase() === validatedUser.data.login.toLowerCase());
        
        if (userExists) {
            return { error: "Użytkownik o tym adresie email już istnieje." };
        }

        users.push(validatedUser.data);
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

        revalidatePath("/admin");
        return { success: true };

    } catch (error) {
        console.error("Failed to add user:", error);
        return { error: "Błąd serwera. Nie udało się dodać użytkownika." };
    }
}

export async function updateUser(originalLogin: string, userData: User) {
    const validatedUser = userSchema.safeParse(userData);
    if (!validatedUser.success) {
        return { success: false, error: "Nieprawidłowe dane użytkownika." };
    }

    try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.login === originalLogin);

        if (userIndex === -1) {
            return { success: false, error: "Nie znaleziono użytkownika do zaktualizowania." };
        }
        
        // Check if new login already exists (and it's not the same user)
        if (originalLogin.toLowerCase() !== validatedUser.data.login.toLowerCase()) {
            const loginExists = users.some(u => u.login.toLowerCase() === validatedUser.data.login.toLowerCase());
            if (loginExists) {
                return { success: false, error: "Użytkownik o tym adresie email już istnieje." };
            }
        }

        users[userIndex] = validatedUser.data;
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
        
        revalidatePath("/admin");
        revalidatePath("/login"); // In case user needs to re-login
        
        return { success: true };
    } catch (e) {
        console.error("Failed to update user:", e);
        return { success: false, error: "Błąd serwera podczas aktualizacji." };
    }
}

export async function deleteUser(login: string) {
    try {
        let users = await getUsers();
        const updatedUsers = users.filter(user => user.login !== login);

        if (users.length === updatedUsers.length) {
            return { success: false, error: "Nie znaleziono użytkownika do usunięcia." };
        }

        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));

        revalidatePath("/admin");
        return { success: true };

    } catch (e) {
        console.error("Failed to delete user:", e);
        return { success: false, error: "Błąd serwera podczas usuwania." };
    }
}


// --- MACHINE MANAGEMENT ---

export async function getMachines(): Promise<Machine[]> {
  try {
    const data = await fs.readFile(machinesFilePath, "utf-8");
    if (!data) return [];
    const machines = JSON.parse(data);
    return machines;
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
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
    let machines: Machine[] = [];
    try {
        const data = await fs.readFile(machinesFilePath, "utf-8");
        machines = JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        // If file doesn't exist, we start with an empty array.
    }
    
    const modelExists = machines.some(machine => machine.model.toLowerCase() === validatedMachine.data.model.toLowerCase());
    if (modelExists) {
        return {
            error: { model: ["Maszyna o tym modelu już istnieje."] }
        };
    }

    machines.push(validatedMachine.data);
    await fs.writeFile(machinesFilePath, JSON.stringify(machines, null, 2));

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to add machine:", error);
    return { error: { form: ["Nie udało się dodać maszyny. Błąd serwera."] } };
  }
}

export async function updateMachine(originalModel: string, machineData: Machine) {
  const validatedMachine = machineSchema.safeParse(machineData);
  if (!validatedMachine.success) {
    // This should ideally not happen if client-side validation is correct
    return { success: false, error: "Nieprawidłowe dane maszyny." };
  }

  try {
    const machines = await getMachines();
    const machineIndex = machines.findIndex(m => m.model === originalModel);
    
    if (machineIndex === -1) {
      return { success: false, error: "Nie znaleziono maszyny do zaktualizowania." };
    }
    
    // Check if new model name already exists (and it's not the same machine)
    if (originalModel.toLowerCase() !== validatedMachine.data.model.toLowerCase()) {
        const modelExists = machines.some(m => m.model.toLowerCase() === validatedMachine.data.model.toLowerCase());
        if (modelExists) {
            return { success: false, error: "Maszyna o tym modelu już istnieje." };
        }
    }

    machines[machineIndex] = validatedMachine.data;
    await fs.writeFile(machinesFilePath, JSON.stringify(machines, null, 2));
    
    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (e) {
    console.error("Failed to update machine:", e);
    return { success: false, error: "Błąd serwera podczas aktualizacji." };
  }
}

export async function deleteMachine(model: string) {
  try {
    let machines = await getMachines();
    const updatedMachines = machines.filter(m => m.model !== model);

    if (machines.length === updatedMachines.length) {
      return { success: false, error: "Nie znaleziono maszyny do usunięcia." };
    }

    await fs.writeFile(machinesFilePath, JSON.stringify(updatedMachines, null, 2));

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (e) {
    console.error("Failed to delete machine:", e);
    return { success: false, error: "Błąd serwera podczas usuwania." };
  }
}
