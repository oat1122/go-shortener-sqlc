"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  LayoutDashboard,
  FileText,
  Tag,
  LogOut,
  Globe,
  X,
  ChevronLeft,
} from "lucide-react";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { useAppStore } from "@/store/useAppStore";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, setSidebarOpen } = useAppStore();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/login"); // Redirect to login page
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Logout failed", error);
    }
  };

  const iconMap: Record<string, React.ReactNode> = {
    "/admin/posts": <FileText size={20} />,
    "/admin/categories": <LayoutDashboard size={20} />,
    "/admin/tags": <Tag size={20} />,
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-divider bg-background shadow-sm transition-transform duration-300 ease-in-out w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative h-full flex flex-col">
          {/* Close Button - Middle Right */}
          <Button
            isIconOnly
            size="sm"
            variant="solid"
            color="default"
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-50 rounded-full shadow-md border border-divider hidden lg:flex"
            onPress={() => setSidebarOpen(false)}
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="p-6 flex items-center justify-between font-bold text-xl text-primary">
            <span>Admin Panel</span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="lg:hidden"
              onPress={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
          <Divider />
          <nav className="flex-1 p-4 space-y-1">
            {siteConfig.adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-default-600 hover:bg-default-100",
                  )}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile when navigating
                >
                  {iconMap[item.href] || <FileText size={20} />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Divider className="my-2" />
            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-default-600 hover:bg-default-100 transition-colors"
              href="/blog"
              target="_blank"
            >
              <Globe size={20} />
              <span>View Site</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-divider">
            <Button
              fullWidth
              color="danger"
              startContent={<LogOut size={18} />}
              variant="flat"
              onPress={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
