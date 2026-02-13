"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Copy, Check, Link as LinkIcon, AlertCircle } from "lucide-react";

export default function ShortenerPage() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!url) return;

    setLoading(true);
    setShortUrl(null);
    setError(null);
    setCopied(false);

    try {
      const data = await api.shorten(url);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      setShortUrl(`${origin}/${data.short_code}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            Shorten Your Link
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Paste your long URL below to get a short, shareable link.
          </p>
        </div>

        <Card className="shadow-xl border border-gray-200 dark:border-gray-800">
          <CardBody className="gap-6 p-6">
            <div className="flex flex-col gap-4">
              <Input
                size="lg"
                label="Long URL"
                placeholder="https://example.com/very/long/url..."
                value={url}
                onValueChange={setUrl}
                startContent={<LinkIcon className="text-gray-400 w-4 h-4" />}
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-white dark:bg-gray-900",
                }}
              />

              <Button
                color="primary"
                size="lg"
                onPress={handleShorten}
                isLoading={loading}
                className="font-semibold bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/30"
              >
                {loading ? "Shortening..." : "Shorten URL"}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-danger-50 dark:bg-danger-900/20 text-danger rounded-xl text-sm border border-danger-200 dark:border-danger-800 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {shortUrl && (
              <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl border border-success-200 dark:border-success-800 animate-appearance-in">
                <p className="text-xs font-semibold text-success mb-2 uppercase tracking-wider">
                  Your Short Link
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white dark:bg-gray-900 p-3 rounded-lg border border-success-100 dark:border-success-800/50 font-mono text-sm truncate select-all">
                    {shortUrl}
                  </div>
                  <Button
                    isIconOnly
                    color={copied ? "success" : "default"}
                    variant="flat"
                    onPress={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
