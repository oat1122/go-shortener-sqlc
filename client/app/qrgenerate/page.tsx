"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Slider } from "@heroui/slider";
import {
  QrCode,
  Upload,
  Download,
  Link as LinkIcon,
  RefreshCw,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";

export default function QrGeneratePage() {
  const [longUrl, setLongUrl] = useState("");
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoSize, setLogoSize] = useState(100);
  const [borderRadius, setBorderRadius] = useState(0);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [useGradient, setUseGradient] = useState(false);
  const [gradientStart, setGradientStart] = useState("#FF0000");
  const [gradientEnd, setGradientEnd] = useState("#0000FF");

  const debouncedLogoSize = useDebounce(logoSize, 500);
  const debouncedBorderRadius = useDebounce(borderRadius, 500);
  const debouncedFgColor = useDebounce(fgColor, 500);
  const debouncedBgColor = useDebounce(bgColor, 500);
  const debouncedGradientStart = useDebounce(gradientStart, 500);
  const debouncedGradientEnd = useDebounce(gradientEnd, 500);
  const debouncedUseGradient = useDebounce(useGradient, 100);

  // Auto-regenerate QR code when slider values or colors change (debounced)
  useEffect(() => {
    if (shortCode) {
      const updateQR = async () => {
        try {
          // Silent update - don't set loading state to avoid flickering
          const options: any = {
            logoSize: debouncedLogoSize,
            borderRadius: debouncedBorderRadius,
            bgColor: debouncedBgColor,
          };

          if (debouncedUseGradient) {
            options.gradientStart = debouncedGradientStart;
            options.gradientEnd = debouncedGradientEnd;
          } else {
            options.fgColor = debouncedFgColor;
          }

          const qrBlob = await api.generateQR(
            shortCode,
            logoFile || undefined,
            options,
          );
          const url = URL.createObjectURL(qrBlob);

          setQrBlobUrl(url);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Failed to update QR code:", err);
        }
      };

      updateQR();
    }
  }, [
    debouncedLogoSize,
    debouncedBorderRadius,
    debouncedFgColor,
    debouncedBgColor,
    debouncedGradientStart,
    debouncedGradientEnd,
    debouncedUseGradient,
    shortCode,
    logoFile,
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!longUrl) return;

    setLoading(true);
    setError(null);
    setQrBlobUrl(null);
    setShortCode(null);

    try {
      // 1. Shorten URL
      const shortenRes = await api.shorten(longUrl);

      setShortCode(shortenRes.short_code);

      const options: any = {
        logoSize,
        borderRadius,
        bgColor,
      };

      if (useGradient) {
        options.gradientStart = gradientStart;
        options.gradientEnd = gradientEnd;
      } else {
        options.fgColor = fgColor;
      }

      // 2. Generate QR with Logo
      const qrBlob = await api.generateQR(
        shortenRes.short_code,
        logoFile || undefined,
        options,
      );
      const url = URL.createObjectURL(qrBlob);

      setQrBlobUrl(url);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้าง QR Code");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrBlobUrl) {
      const a = document.createElement("a");

      a.href = qrBlobUrl;
      a.download = `qrcode-${shortCode || "generated"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-600 dark:from-pink-400 dark:to-violet-400">
              สร้าง QR Code
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              แปลงลิงค์ยาวๆ ให้เป็น Short Link และ QR Code สวยๆ
              พร้อมโลโก้ของคุณเอง
            </p>
          </div>

          <Card className="shadow-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardBody className="gap-6 p-6">
              <Input
                classNames={{
                  inputWrapper: "bg-white dark:bg-gray-800",
                }}
                label="ลิงค์ต้นฉบับ (Long URL)"
                placeholder="https://example.com/..."
                size="lg"
                startContent={<LinkIcon className="text-gray-400 w-4 h-4" />}
                value={longUrl}
                variant="bordered"
                onValueChange={setLongUrl}
              />

              {/* Color Customization */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    หมวดสี (Color Mode)
                  </span>
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                      className={`px-3 py-1.5 text-sm rounded-md transition-all ${!useGradient ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                      type="button"
                      onClick={() => setUseGradient(false)}
                    >
                      สีเดียว
                    </button>
                    <button
                      className={`px-3 py-1.5 text-sm rounded-md transition-all ${useGradient ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                      type="button"
                      onClick={() => setUseGradient(true)}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {useGradient ? (
                    <>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor="gradient-start"
                        >
                          สีเริ่มต้น (Top)
                        </label>
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <input
                            className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                            id="gradient-start"
                            type="color"
                            value={gradientStart}
                            onChange={(e) => setGradientStart(e.target.value)}
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                            {gradientStart}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor="gradient-end"
                        >
                          สีสิ้นสุด (Bottom)
                        </label>
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <input
                            className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                            id="gradient-end"
                            type="color"
                            value={gradientEnd}
                            onChange={(e) => setGradientEnd(e.target.value)}
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                            {gradientEnd}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        htmlFor="fg-color"
                      >
                        สี QR Code
                      </label>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <input
                          className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                          id="fg-color"
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {fgColor}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      htmlFor="bg-color"
                    >
                      สีพื้นหลัง
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <input
                        className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                        id="bg-color"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {bgColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="logo-upload"
                >
                  อัพโหลดโลโก้ (ไม่บังคับ)
                </label>
                <div
                  aria-label="Upload logo"
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${logoFile ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700"}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    type="file"
                    onChange={handleFileChange}
                  />

                  {logoFile ? (
                    <div className="flex items-center gap-2 text-primary overflow-hidden max-w-full">
                      <Image
                        alt="Preview"
                        classNames={{
                          wrapper: "w-8 h-8 rounded-full object-cover shrink-0",
                        }}
                        src={URL.createObjectURL(logoFile)}
                      />
                      <span className="text-sm truncate font-medium">
                        {logoFile.name}
                      </span>
                      <Button
                        isIconOnly
                        className="ml-auto"
                        color="danger"
                        size="sm"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Upload className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">
                        คลิกเพื่อเลือกไฟล์รูปภาพ
                      </p>
                    </>
                  )}
                </div>
              </div>

              {logoFile && (
                <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Slider
                    className="max-w-md"
                    getValue={(v) => `${v}px`}
                    label="ขนาดโลโก้ (Logo Size)"
                    maxValue={240}
                    minValue={50}
                    size="sm"
                    step={10}
                    value={logoSize}
                    onChange={(v) => setLogoSize(v as number)}
                  />
                  <Slider
                    className="max-w-md"
                    getValue={(v) => `${v}px`}
                    label="ความมนของขอบ (Border Radius)"
                    maxValue={100}
                    minValue={0}
                    size="sm"
                    step={5}
                    value={borderRadius}
                    onChange={(v) => setBorderRadius(v as number)}
                  />
                </div>
              )}

              <Button
                className="font-semibold bg-gradient-to-r from-pink-500 to-violet-600 shadow-lg shadow-pink-500/30"
                color="secondary"
                isDisabled={!longUrl}
                isLoading={loading}
                size="lg"
                startContent={!loading && <QrCode className="w-5 h-5" />}
                onPress={handleGenerate}
              >
                {loading ? "กำลังสร้าง..." : "สร้าง QR Code"}
              </Button>

              {error && (
                <div className="p-3 bg-danger-50 dark:bg-danger-900/20 text-danger rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Result Display */}
        <div className="flex items-center justify-center min-h-[730px]">
          <AnimatePresence mode="wait">
            {qrBlobUrl ? (
              <motion.div
                key="qr-result"
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-sm"
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="w-full shadow-2xl border-0 bg-white dark:bg-gray-800 overflow-visible relative">
                  {/* Decor elements */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />

                  <CardHeader className="flex-col items-center pb-0 pt-6 px-4">
                    <p className="text-tiny text-gray-500 uppercase font-bold tracking-widest mb-1">
                      YOUR QR CODE
                    </p>
                    <h4 className="font-bold text-large text-gray-900 dark:text-white">
                      {shortCode}
                    </h4>
                  </CardHeader>

                  <CardBody className="overflow-visible py-6 flex items-center justify-center relative z-10">
                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
                      <Image
                        alt="QR Code"
                        className="rounded-lg"
                        height={250}
                        src={qrBlobUrl}
                        width={250}
                      />
                    </div>
                  </CardBody>

                  <div className="p-4 flex gap-3 justify-center pb-8 z-10">
                    <Button
                      className="font-medium"
                      color="primary"
                      startContent={<Download size={18} />}
                      variant="solid"
                      onPress={handleDownload}
                    >
                      ดาวน์โหลด
                    </Button>
                    <Button
                      color="default"
                      startContent={<RefreshCw size={18} />}
                      variant="flat"
                      onPress={() => {
                        setQrBlobUrl(null);
                        setLongUrl("");
                        setLogoFile(null);
                      }}
                    >
                      ทำรายการใหม่
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 space-y-4"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <div className="p-8 border-4 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                  <QrCode size={120} strokeWidth={1} />
                </div>
                <p className="text-lg font-medium">
                  QR Code ของคุณจะปรากฏที่นี่
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
