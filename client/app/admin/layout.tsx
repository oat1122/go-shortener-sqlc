"use client";

import React from "react";
import { Button } from "@heroui/button";
import { PanelLeft } from "lucide-react";
import clsx from "clsx";

import { Sidebar } from "@/components/sidebar";
import { useAppStore } from "@/store/useAppStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className="flex min-h-screen bg-default-50">
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={clsx(
          "flex-1 p-8 overflow-y-auto h-screen transition-all duration-300 ease-in-out",
          isSidebarOpen ? "lg:ml-64" : "ml-0",
        )}
      >
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 flex items-center gap-4">
            <Button
              isIconOnly
              aria-label="Toggle Sidebar"
              variant="light"
              onPress={toggleSidebar}
            >
              <PanelLeft />
            </Button>
            {/* You can add breadcrumbs or title here if needed */}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
