"use client";

import React, { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Image } from "@heroui/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Tab, Tabs } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Upload, ImageIcon, Check } from "lucide-react";

import { ImageItem } from "@/types/blog";
import { useImages, useUploadImage } from "@/hooks/useImages";

interface ImagePickerProps {
  value?: string; // Current Image ID
  previewUrl?: string; // Current image URL for preview
  onSelect: (imageId: string, imageUrl: string) => void;
  onClear?: () => void;
}

export default function ImagePicker({
  value,
  previewUrl,
  onSelect,
  onClear,
}: ImagePickerProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: images = [] } = useImages();
  const uploadMutation = useUploadImage();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];

    if (file && file.type.startsWith("image/")) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadAndSelect = async (onClose: () => void) => {
    if (!uploadFile) return;
    try {
      const result = await uploadMutation.mutateAsync({
        file: uploadFile,
        altText,
        title,
      });

      onSelect(result.id, `${apiUrl}${result.urls.medium}`);
      resetForm();
      onClose();
    } catch {
      // toast handled by hook
    }
  };

  const handleSelectExisting = (img: ImageItem) => {
    setSelectedId(img.id);
  };

  const handleConfirmSelection = (onClose: () => void) => {
    if (!selectedId) return;
    const img = images.find((i) => i.id === selectedId);

    if (img) {
      onSelect(img.id, `${apiUrl}${img.urls.medium}`);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setUploadFile(null);
    setUploadPreview("");
    setAltText("");
    setTitle("");
  };

  return (
    <>
      {/* Trigger / Preview */}
      {value && previewUrl ? (
        <div className="relative rounded-lg overflow-hidden aspect-video">
          <Image
            alt="Featured"
            className="object-cover w-full h-full"
            src={previewUrl}
          />
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button color="primary" size="sm" variant="flat" onPress={onOpen}>
              Change
            </Button>
            {onClear && (
              <Button color="danger" size="sm" variant="flat" onPress={onClear}>
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-default-300 rounded-lg p-8 flex flex-col items-center justify-center text-default-400 gap-2 cursor-pointer hover:border-primary hover:text-primary transition-colors"
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpen();
          }}
        >
          <ImageIcon size={32} />
          <span className="text-sm">Select or upload an image</span>
        </div>
      )}

      {/* Picker Modal */}
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="3xl"
        onOpenChange={(open) => {
          onOpenChange();
          if (!open) resetForm();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Select Image</ModalHeader>
              <ModalBody>
                <Tabs aria-label="Image source">
                  {/* Library Tab */}
                  <Tab key="library" title="Library">
                    {images.length === 0 ? (
                      <div className="text-center py-12 text-default-400">
                        <ImageIcon className="mx-auto mb-2" size={40} />
                        <p>No images uploaded yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                        {images.map((img) => (
                          <Card
                            key={img.id}
                            isPressable
                            className={`cursor-pointer transition-all ${
                              selectedId === img.id
                                ? "ring-2 ring-primary ring-offset-2"
                                : "hover:scale-105"
                            }`}
                            onPress={() => handleSelectExisting(img)}
                          >
                            <CardBody className="p-0 relative">
                              <Image
                                alt={img.alt_text || img.original_name}
                                className="object-cover w-full aspect-square"
                                radius="none"
                                src={`${apiUrl}${img.urls.thumb}`}
                              />
                              {selectedId === img.id && (
                                <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                                  <Check className="text-white" size={14} />
                                </div>
                              )}
                              <p className="text-xs text-default-500 truncate px-2 py-1">
                                {img.original_name}
                              </p>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Tab>

                  {/* Upload Tab */}
                  <Tab key="upload" title="Upload New">
                    <div className="space-y-4">
                      {uploadPreview ? (
                        <div className="relative rounded-lg overflow-hidden bg-default-100 flex justify-center p-4">
                          <Image
                            alt="Preview"
                            className="max-h-48 object-contain"
                            src={uploadPreview}
                          />
                          <Button
                            className="absolute top-2 right-2"
                            color="danger"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setUploadFile(null);
                              setUploadPreview("");
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-default-300 rounded-lg p-10 flex flex-col items-center justify-center text-default-400 gap-3 cursor-pointer hover:border-primary hover:text-primary transition-colors"
                          role="button"
                          tabIndex={0}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              fileInputRef.current?.click();
                          }}
                        >
                          <Upload size={36} />
                          <span className="text-sm font-medium">
                            Drop image here or click to browse
                          </span>
                          <span className="text-xs">
                            JPEG, PNG, GIF, WebP — Max 10MB
                          </span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        type="file"
                        onChange={handleFileSelect}
                      />
                      <Input
                        label="Alt Text (SEO)"
                        placeholder="A photo of..."
                        value={altText}
                        variant="bordered"
                        onValueChange={setAltText}
                      />
                      <Input
                        label="Title (SEO)"
                        placeholder="Image title"
                        value={title}
                        variant="bordered"
                        onValueChange={setTitle}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                {selectedId ? (
                  <Button
                    color="primary"
                    onPress={() => handleConfirmSelection(onClose)}
                  >
                    Select Image
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={!uploadFile}
                    isLoading={uploadMutation.isPending}
                    startContent={<Upload size={18} />}
                    onPress={() => handleUploadAndSelect(onClose)}
                  >
                    Upload & Select
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
