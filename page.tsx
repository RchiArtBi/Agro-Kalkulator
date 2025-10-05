'use client';

import { useState, useEffect, useActionState, ChangeEvent } from 'react';
import React from 'react';
import {
  getMachines,
  Machine,
  checkAdminAccess,
  deleteMachine,
  updateMachine,
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  User,
} from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddMachineForm } from './add-machine-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import {
  Pencil,
  Trash2,
  Save,
  XCircle,
  Users,
  Tractor,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/header';

function formatCurrency(value?: number) {
  if (typeof value !== 'number' || value === 0) return '-';
  return value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
}

function AdminLoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await checkAdminAccess(password);
      if (result.success) {
        // Store session key in sessionStorage for admin panel persistence
        sessionStorage.setItem('admin-session', password);
        onLoginSuccess();
        toast({ title: 'Zalogowano pomyślnie do panelu admina!' });
      } else {
        setError(result.error || 'Nieprawidłowe hasło.');
      }
    } catch (e) {
      setError('Wystąpił błąd serwera. Spróbuj ponownie.');
      toast({
        variant: 'destructive',
        title: 'Błąd logowania',
        description: 'Wystąpił nieoczekiwany błąd.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Dostęp do panelu admina</CardTitle>
          <CardDescription>
            Proszę podać hasło, aby kontynuować.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="********"
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleLogin}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Spinner className="mr-2" />}
            Zaloguj się
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function MachineManagement() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const { toast } = useToast();
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Machine>>({});

  const fetchMachines = async () => {
    const fetchedMachines = await getMachines();
    setMachines(fetchedMachines);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleEdit = (machine: Machine) => {
    setEditingModel(machine.model);
    setEditedData(JSON.parse(JSON.stringify(machine))); // Deep copy
  };

  const handleCancel = () => {
    setEditingModel(null);
    setEditedData({});
  };

  const handleSave = async (originalModel: string) => {
    if (!editedData) return;

    const result = await updateMachine(originalModel, editedData as Machine);
    if (result.success) {
      toast({ title: 'Sukces', description: 'Maszyna została zaktualizowana.' });
      setEditingModel(null);
      setEditedData({});
      await fetchMachines();
    } else {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: result.error || 'Nie udało się zapisać zmian.',
      });
    }
  };

  const handleDelete = async (model: string) => {
    const result = await deleteMachine(model);
    if (result.success) {
      toast({ title: 'Sukces', description: 'Maszyna została usunięta.' });
      await fetchMachines();
    } else {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: result.error || 'Nie udało się usunąć maszyny.',
      });
    }
  };

  const onEditInputChange = (
    field: keyof Machine | `costs.${keyof Machine['costs']}`,
    value: string
  ) => {
    setEditedData((prev) => {
      const newEditedData = { ...prev };
      if (field.startsWith('costs.')) {
        const costField = field.split('.')[1] as keyof Machine['costs'];
        if (!newEditedData.costs) newEditedData.costs = {} as any;
        (newEditedData.costs[costField] as any) = value;
      } else {
        (newEditedData[field as keyof Machine] as any) = value;
      }
      return newEditedData;
    });
  };

  const renderEditableCell = (
    field: keyof Machine | `costs.${keyof Machine['costs']}`,
    isNumeric: boolean = false
  ) => {
    let value: any = '';
    if (field.startsWith('costs.')) {
      const costField = field.split('.')[1] as keyof Machine['costs'];
      value = editedData.costs?.[costField] ?? '';
    } else {
      value = editedData[field as keyof Machine] ?? '';
    }

    return (
      <Input
        type={isNumeric ? 'number' : 'text'}
        value={value}
        onChange={(e) => onEditInputChange(field, e.target.value)}
        className="h-8"
      />
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Lista Maszyn
            </CardTitle>
            <CardDescription>
              Przeglądaj, edytuj i usuwaj dostępne maszyny oraz ich stawki.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Waga (kg)</TableHead>
                    <TableHead>Stawka</TableHead>
                    <TableHead>Przegląd "0"</TableHead>
                    <TableHead>Składanie</TableHead>
                    <TableHead>Uruchomienie</TableHead>
                    <TableHead>Przegląd 100mtg</TableHead>
                    <TableHead>Przegląd 500mtg</TableHead>
                    <TableHead>Przegląd 1000mtg</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine) => {
                    const isEditing = editingModel === machine.model;
                    return (
                      <TableRow key={machine.model}>
                        <TableCell>
                          {isEditing ? renderEditableCell('type') : machine.type}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell('model')
                            : machine.model}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell('weight', true)
                            : machine.weight.toLocaleString('pl-PL')}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell('rate', true)
                            : formatCurrency(machine.rate)}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell('costs.przeglad_0', true)
                            : formatCurrency(machine.costs.przeglad_0)}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell('costs.skladanie', true)
                            : formatCurrency(machine.costs.skladanie)}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell('costs.uruchomienie', true)
                            : formatCurrency(machine.costs.uruchomienie)}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell(
                                'costs.przeglad_po_100_mtg',
                                true
                              )
                            : formatCurrency(machine.costs.przeglad_po_100_mtg)}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell(
                                'costs.przeglad_po_500_mtg',
                                true
                              )
                            : formatCurrency(machine.costs.przeglad_po_500_mtg)}
                        </TableCell>
                        <TableCell>
                          {isEditing
                            ? renderEditableCell(
                                'costs.przeglad_po_1000_mtg',
                                true
                              )
                            : formatCurrency(
                                machine.costs.przeglad_po_1000_mtg
                              )}
                        </TableCell>
                        <TableCell className="flex gap-2 items-center">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSave(machine.model)}
                              >
                                <Save className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancel}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(machine)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Czy na pewno chcesz usunąć?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Ta operacja jest nieodwracalna. Maszyna "
                                      {machine.model}" zostanie trwale usunięta
                                      z bazy danych.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDelete(machine.model)
                                      }
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Tak, usuń
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <AddMachineForm />
      </div>
    </div>
  );
}

function AddUserForm({ onUserAdded }: { onUserAdded: () => void }) {
  const [state, formAction] = useActionState(addUser, undefined);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Sukces!',
        description: 'Nowy użytkownik został dodany.',
      });
      formRef.current?.reset();
      onUserAdded();
    } else if (state?.error) {
      toast({ variant: 'destructive', title: 'Błąd', description: state.error });
    }
  }, [state, toast, onUserAdded]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj Nowego Użytkownika</CardTitle>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Login (Email)</Label>
            <Input
              id="login"
              name="login"
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hash">Hasło</Label>
            <div className="relative">
              <Input
                id="hash"
                name="hash"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Dodaj Użytkownika
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [editingLogin, setEditingLogin] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  const fetchUsers = async () => {
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setEditingLogin(user.login);
    setEditedUser(user);
  };

  const handleCancelUserEdit = () => {
    setEditingLogin(null);
    setEditedUser({});
  };

  const handleSaveUser = async (originalLogin: string) => {
    if (!editedUser || !editedUser.login || !editedUser.hash) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Wszystkie pola są wymagane.',
      });
      return;
    }
    const result = await updateUser(originalLogin, editedUser as User);
    if (result.success) {
      toast({
        title: 'Sukces!',
        description: 'Dane użytkownika zostały zaktualizowane.',
      });
      setEditingLogin(null);
      setEditedUser({});
      fetchUsers();
    } else {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description:
          result.error || 'Nie udało się zaktualizować użytkownika.',
      });
    }
  };

  const handleDeleteUser = async (login: string) => {
    const result = await deleteUser(login);
    if (result.success) {
      toast({ title: 'Sukces', description: 'Użytkownik został usunięty.' });
      fetchUsers();
    } else {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: result.error || 'Nie udało się usunąć użytkownika.',
      });
    }
  };

  const onUserEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Lista Użytkowników</CardTitle>
            <CardDescription>
              Zarządzaj dostępami do aplikacji.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Login (Email)</TableHead>
                  <TableHead>Hasło</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isEditing = editingLogin === user.login;
                  return (
                    <TableRow key={user.login}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            name="login"
                            value={editedUser.login || ''}
                            onChange={onUserEditChange}
                            className="h-8"
                          />
                        ) : (
                          user.login
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            name="hash"
                            type="password"
                            value={editedUser.hash || ''}
                            onChange={onUserEditChange}
                            className="h-8"
                            placeholder="Nowe hasło"
                          />
                        ) : (
                          '**********'
                        )}
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveUser(user.login)}
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelUserEdit}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Czy na pewno chcesz usunąć tego użytkownika?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Ta operacja jest nieodwracalna. Użytkownik "
                                    {user.login}" zostanie trwale usunięty.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.login)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Tak, usuń
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <AddUserForm onUserAdded={fetchUsers} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifyAccess() {
      // For admin, we use session storage to persist the session *during the browser session only*
      const adminSession = sessionStorage.getItem('admin-session');
      if (adminSession) {
        const hasAccess = await checkAdminAccess(adminSession);
        setIsAuthenticated(hasAccess.success);
      } else {
        setIsAuthenticated(false);
      }
    }
    verifyAccess();
  }, []);

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {!isAuthenticated ? (
            <AdminLoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Tabs defaultValue="machines" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="machines">
                  <Tractor className="mr-2" /> Zarządzanie Maszynami
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="mr-2" /> Zarządzanie Użytkownikami
                </TabsTrigger>
              </TabsList>
              <TabsContent value="machines" className="mt-6">
                <MachineManagement />
              </TabsContent>
              <TabsContent value="users" className="mt-6">
                <UserManagement />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
