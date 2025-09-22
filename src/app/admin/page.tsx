'use server';

import { getMachines, Machine } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

function formatCurrency(value?: number) {
  if (typeof value !== 'number' || value === 0) return '-';
  return value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
}

export default async function AdminPage() {
  const machines: Machine[] = await getMachines();

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 py-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Zarządzanie Maszynami
            </CardTitle>
            <CardDescription>
              Przeglądaj i zarządzaj listą dostępnych maszyn i ich stawek.
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine) => (
                    <TableRow key={machine.model}>
                      <TableCell className="font-medium">{machine.type}</TableCell>
                      <TableCell>{machine.model}</TableCell>
                      <TableCell>{machine.weight.toLocaleString('pl-PL')}</TableCell>
                      <TableCell>{formatCurrency(machine.rate)}</TableCell>
                      <TableCell>{formatCurrency(machine.costs.przeglad_0)}</TableCell>
                      <TableCell>{formatCurrency(machine.costs.skladanie)}</TableCell>
                      <TableCell>{formatCurrency(machine.costs.uruchomienie)}</TableCell>
                      <TableCell>{formatCurrency(machine.costs.przeglad_po_100_mtg)}</TableCell>
                      <TableCell>{formatCurrency(machine.costs.przeglad_po_500_mtg)}</TableCell>
                      <TableCell>{formatCurrency(machine.costs.przeglad_po_1000_mtg)}</TableCell>
                    </TableRow>
                  ))}
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
