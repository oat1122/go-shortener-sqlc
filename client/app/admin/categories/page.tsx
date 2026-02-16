"use client";

import React, { useState } from "react";
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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Plus, Edit, Trash2 } from "lucide-react";

import { Category } from "@/types/blog";
import { slugify } from "@/lib/utils";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Modal State
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "" });
    onOpen();
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Are you sure? This might affect posts linked to this category.")
    )
      return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete", error);
      alert("Failed to delete category");
    }
  };

  const handleSave = async (onClose: () => void) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save", error);
      alert("Failed to save category");
    }
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => {
      const newData = { ...prev, name: val };

      // Auto slug if creating new
      if (!editingCategory) {
        newData.slug = slugify(val);
      }

      return newData;
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleOpenCreate}
        >
          New Category
        </Button>
      </div>

      <Table aria-label="Categories table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>SLUG</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="No categories found"
          isLoading={isLoading}
          items={categories}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-default-500">{item.slug}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    color="primary"
                    size="sm"
                    variant="light"
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDelete(item.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editingCategory ? "Edit Category" : "New Category"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Category Name"
                  value={formData.name}
                  variant="bordered"
                  onValueChange={handleNameChange}
                />
                <Input
                  label="Slug"
                  placeholder="category-slug"
                  value={formData.slug}
                  variant="bordered"
                  onValueChange={(val) =>
                    setFormData({ ...formData, slug: val })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isSaving}
                  onPress={() => handleSave(onClose)}
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
