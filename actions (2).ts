'use server';

import { cookies } from 'next/headers';
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE_NAME } from '@/middleware';
import { redirect } from 'next/navigation';

const usersFilePath = path.join(process.cwd(), "src/lib/users.json");

type User = {
  login: string;
  hash: string;
}

async function getUsers(): Promise<User[]> {
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

export async function login(prevState: any, formData: FormData) {
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    if (!login || !password) {
        return { error: 'Login i hasło są wymagane.' };
    }

    const users = await getUsers();
    const user = users.find(u => u.login === login && u.hash === password);

    if (!user) {
        return { error: 'Nieprawidłowy login lub hasło.' };
    }

    // Create session
    const sessionToken = `${user.login}:${user.hash}`; // Simple token for demonstration
    cookies().set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });

    revalidatePath('/');
    redirect('/');
}


export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    revalidatePath('/login');
    redirect('/login');
}
