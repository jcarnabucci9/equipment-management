"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accessibility,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="mb-6 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo and Title */}
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={300}
            height={300}
            priority
            unoptimized
            className="h-12 w-auto"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Equipment Management
            </h1>
            <span className="text-xs text-slate-500">
              Materials Management - Preventive Maintenance Dashboard
            </span>
          </div>
        </Link>

        {/* Right: Navigation Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="text-xs font-medium text-slate-500">
              Navigation
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/diagnosis" className="flex items-center gap-2">
                  <Accessibility className="h-4 w-4" />
                  Diagnose Asset
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/assets" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Asset Management
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Service History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/repair" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Repairs
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 text-slate-600">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
