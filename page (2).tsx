'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/icons';
import { useEffect, useState } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Spinner className="mr-2" />}
            Zaloguj się
        </Button>
    );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}


export default function LoginPage() {
    const [loginState, loginAction] = useActionState(login, undefined);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-sm">
              <ClientOnly>
                <form action={loginAction}>
                    <CardHeader>
                        <CardTitle>Witaj w AgroKalkulator</CardTitle>
                        <CardDescription>
                            Zaloguj się, aby kontynuować.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login">Login (Email)</Label>
                            <Input
                                id="login"
                                name="login"
                                type="text"
                                placeholder="np. admin@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Hasło</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="********"
                                required
                            />
                        </div>
                        {loginState?.error && <p className="text-sm font-medium text-destructive">{loginState.error}</p>}
                    </CardContent>
                    <CardFooter>
                       <SubmitButton />
                    </CardFooter>
                </form>
              </ClientOnly>
            </Card>
        </div>
    );
}
