"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { LayoutDashboard, FileText, Tag, LogOut, Globe } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { name: "Posts", href: "/admin/posts", icon: <FileText size={20} /> },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Tags", href: "/admin/tags", icon: <Tag size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-default-50">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 z-50 flex flex-col border-r border-divider bg-background shadow-sm">
        <div className="p-6 flex items-center gap-2 font-bold text-xl text-primary">
          <span>Admin Panel</span>
        </div>
        <Divider />
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-default-600 hover:bg-default-100"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
          <Divider className="my-2" />
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-default-600 hover:bg-default-100 transition-colors"
          >
            <Globe size={20} />
            <span>View Site</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-divider">
          <Button
            color="danger"
            variant="flat"
            fullWidth
            startContent={<LogOut size={18} />}
            onPress={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
