"use client";

import React, { useState, useRef } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
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
import { Chip } from "@heroui/chip";
import { Plus, Edit, Trash2, Upload, ImageIcon, Copy } from "lucide-react";
import { addToast } from "@heroui/toast";

import { ImageItem } from "@/types/blog";
import {
  useImages,
  useUploadImage,
  useUpdateImage,
  useDeleteImage,
} from "@/hooks/useImages";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminImagesPage() {
  const { data: images = [], isLoading } = useImages();
  const uploadMutation = useUploadImage();
  const updateMutation = useUpdateImage();
  const deleteMutation = useDeleteImage();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Upload Modal
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onOpenChange: onUploadOpenChange,
  } = useDisclosure();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editTitle, setEditTitle] = useState("");

  // Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];

    if (file && file.type.startsWith("image/")) {
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (onClose: () => void) => {
    if (!uploadFile) return;
    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        altText: uploadAltText,
        title: uploadTitle,
      });
      resetUploadForm();
      onClose();
    } catch {
      // toast handled by hook
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadAltText("");
    setUploadTitle("");
    setPreviewUrl("");
  };

  // Edit Handlers
  const handleOpenEdit = (img: ImageItem) => {
    setEditingImage(img);
    setEditAltText(img.alt_text);
    setEditTitle(img.title);
    onEditOpen();
  };

  const handleSaveEdit = async (onClose: () => void) => {
    if (!editingImage) return;
    try {
      await updateMutation.mutateAsync({
        id: editingImage.id,
        data: { alt_text: editAltText, title: editTitle },
      });
      onClose();
    } catch {
      // toast handled by hook
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // toast handled by hook
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(`${apiUrl}${url}`);
    addToast({
      title: "Copied",
      description: "Image URL copied to clipboard",
      color: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Images</h1>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={onUploadOpen}
        >
          Upload Image
        </Button>
      </div>

      <Table aria-label="Images table">
        <TableHeader>
          <TableColumn width={80}>PREVIEW</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>SEO</TableColumn>
          <TableColumn width={120}>SIZE</TableColumn>
          <TableColumn width={120}>DIMENSIONS</TableColumn>
          <TableColumn width={150}>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="No images uploaded"
          isLoading={isLoading}
          items={images}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Image
                  alt={item.alt_text || item.original_name}
                  className="object-cover rounded-md"
                  height={48}
                  src={`${apiUrl}${item.urls.thumb}`}
                  width={48}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{item.original_name}</p>
                  <p className="text-xs text-default-400">{item.id}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {item.alt_text ? (
                    <Chip color="success" size="sm" variant="flat">
                      alt ✓
                    </Chip>
                  ) : (
                    <Chip color="warning" size="sm" variant="flat">
                      alt missing
                    </Chip>
                  )}
                  {item.title ? (
                    <Chip color="success" size="sm" variant="flat">
                      title ✓
                    </Chip>
                  ) : (
                    <Chip color="warning" size="sm" variant="flat">
                      title missing
                    </Chip>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-default-500 text-sm">
                {formatBytes(item.size_bytes)}
              </TableCell>
              <TableCell className="text-default-500 text-sm">
                {item.width} × {item.height}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleCopyUrl(item.urls.original)}
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    color="primary"
                    size="sm"
                    variant="light"
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        size="lg"
        onOpenChange={(open) => {
          onUploadOpenChange();
          if (!open) resetUploadForm();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Upload Image</ModalHeader>
              <ModalBody>
                {previewUrl ? (
                  <div className="relative rounded-lg overflow-hidden bg-default-100 flex justify-center p-4">
                    <Image
                      alt="Preview"
                      className="max-h-48 object-contain"
                      src={previewUrl}
                    />
                    <Button
                      className="absolute top-2 right-2"
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setUploadFile(null);
                        setPreviewUrl("");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-default-300 rounded-lg p-12 flex flex-col items-center justify-center text-default-400 gap-3 cursor-pointer hover:border-primary hover:text-primary transition-colors"
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
                    <Upload size={40} />
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
                  description="Descriptive text for screen readers and image search"
                  label="Alt Text (SEO)"
                  placeholder="A photo of..."
                  value={uploadAltText}
                  variant="bordered"
                  onValueChange={setUploadAltText}
                />
                <Input
                  description="Title attribute for hover tooltips"
                  label="Title (SEO)"
                  placeholder="Image title"
                  value={uploadTitle}
                  variant="bordered"
                  onValueChange={setUploadTitle}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={!uploadFile}
                  isLoading={uploadMutation.isPending}
                  startContent={<ImageIcon size={18} />}
                  onPress={() => handleUpload(onClose)}
                >
                  Upload
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Image SEO</ModalHeader>
              <ModalBody>
                {editingImage && (
                  <div className="flex justify-center mb-4">
                    <Image
                      alt={editingImage.alt_text}
                      className="max-h-32 object-contain rounded-lg"
                      src={`${apiUrl}${editingImage.urls.medium}`}
                    />
                  </div>
                )}
                <Input
                  description="Descriptive text for screen readers and image search"
                  label="Alt Text"
                  placeholder="A photo of..."
                  value={editAltText}
                  variant="bordered"
                  onValueChange={setEditAltText}
                />
                <Input
                  description="Title attribute for hover tooltips"
                  label="Title"
                  placeholder="Image title"
                  value={editTitle}
                  variant="bordered"
                  onValueChange={setEditTitle}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={updateMutation.isPending}
                  onPress={() => handleSaveEdit(onClose)}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
