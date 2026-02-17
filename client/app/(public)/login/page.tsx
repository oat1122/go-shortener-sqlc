"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      // Login successful, redirect to admin dashboard
      login({ username }); // Set user in store
      router.push("/admin/posts");
      // router.refresh(); // No longer needed as state is managed by store
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-content1 antialiased p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />

      <Card className="w-full max-w-sm z-10 shadow-large bg-background/60 backdrop-blur-md border border-white/20">
        <CardHeader className="flex flex-col gap-3 items-center pt-8 pb-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary mb-2">
            <Lock size={28} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-small text-default-500 mt-1">
              Enter your credentials to access the admin panel
            </p>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8 pt-0 overflow-visible">
          {error && (
            <div className="mb-6">
              <Alert
                className="text-small"
                color="danger"
                title="Login Failed"
                variant="faded"
              >
                {error}
              </Alert>
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <Input
              isRequired
              classNames={{
                label: "text-small font-medium text-default-700",
                inputWrapper:
                  "bg-default-100/50 hover:bg-default-200/50 border-default-200 data-[hover=true]:border-default-400 group-data-[focus=true]:border-primary",
              }}
              label="Username"
              labelPlacement="outside"
              placeholder="Enter your username"
              startContent={
                <User className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              value={username}
              variant="bordered"
              onValueChange={setUsername}
            />

            <Input
              isRequired
              classNames={{
                label: "text-small font-medium text-default-700",
                inputWrapper:
                  "bg-default-100/50 hover:bg-default-200/50 border-default-200 data-[hover=true]:border-default-400 group-data-[focus=true]:border-primary",
              }}
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              label="Password"
              labelPlacement="outside"
              placeholder="Enter your password"
              startContent={
                <Lock className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              type={isVisible ? "text" : "password"}
              value={password}
              variant="bordered"
              onValueChange={setPassword}
            />

            <Button
              fullWidth
              className="mt-2 font-medium shadow-lg shadow-primary/40"
              color="primary"
              isLoading={loading}
              size="lg"
              type="submit"
            >
              LogIn
            </Button>
          </form>
        </CardBody>
        <CardFooter className="justify-center pb-6 pt-0">
          <p className="text-tiny text-default-400">
            &copy; 2024 Nutthawut. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
