"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";

export default function TestConnectionPage() {
  const [url, setUrl] = useState("https://google.com");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShorten = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await api.shorten(url);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 gap-4 px-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold">API Connection Test</h1>

      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col gap-4">
          <Input
            label="URL to Shorten"
            placeholder="https://example.com"
            value={url}
            onValueChange={setUrl}
          />

          <Button color="primary" onPress={handleShorten} isLoading={loading}>
            Shorten URL
          </Button>

          {result && (
            <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg text-sm font-mono overflow-auto border border-success-200 dark:border-success-800">
              <p className="font-bold text-success mb-2">Success!</p>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div className="p-3 bg-danger-50 dark:bg-danger-900/20 text-danger rounded-lg text-sm border border-danger-200 dark:border-danger-800">
              <p className="font-bold mb-1">Error:</p>
              {error}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="text-small text-default-500 max-w-md text-center">
        Ensure your backend server is running on localhost:8080 and CORS is
        configured correctly.
      </div>
    </div>
  );
}
