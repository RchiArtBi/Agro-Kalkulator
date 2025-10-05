"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
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
import { logout } from "@/app/login/actions";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
  }

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
            <nav className="flex flex-col gap-4 py-4 mt-8 text-lg font-medium">
              <HistoryDialog trigger={
                  <button
                    className="flex items-center hover:text-primary transition-colors"
                  >
                  Historia Obliczeń
                </button>
              } />
              <SheetClose asChild>
                <Link href="/" className="flex items-center hover:text-primary transition-colors">
                  Kalkulator
                </Link>
              </SheetClose>
               <SheetClose asChild>
                <Link href="/admin" className="flex items-center hover:text-primary transition-colors">
                  Admin
                </Link>
              </SheetClose>
               <SheetClose asChild>
                <Link href="/terms-of-use" className="flex items-center hover:text-primary transition-colors">
                  Warunki Użytkowania
                </Link>
              </SheetClose>
            </nav>
            <div className="absolute bottom-6 left-6 right-6">
                <form action={handleLogout}>
                    <Button variant="outline" className="w-full">
                        <LogOut className="mr-2 h-5 w-5"/>
                        Wyloguj
                    </Button>
                </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
