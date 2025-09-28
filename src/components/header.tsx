"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet";
import { useState } from "react";
import { HistoryDialog } from "./cost-calculator";
import { HistoryIcon } from "./icons";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary ml-4">
          AgroKalkulator
        </Link>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Nawigacja główna aplikacji
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4 mt-8">
              <HistoryDialog trigger={
                  <button
                    className="flex items-center text-lg font-medium hover:text-primary transition-colors"
                  >
                  Historia Obliczeń
                </button>
              } />
              <SheetClose asChild>
                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                  Kalkulator
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/admin" className="text-lg font-medium hover:text-primary transition-colors">
                  Admin
                </Link>
              </SheetClose>
               <SheetClose asChild>
                <Link href="/terms-of-use" className="text-lg font-medium hover:text-primary transition-colors">
                  Warunki Użytkowania
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
