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

import { Tag } from "@/types/blog";
import { slugify } from "@/lib/utils";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/useTags";

export default function AdminTagsPage() {
  const { data: tags = [], isLoading } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  // Modal State
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const handleOpenCreate = () => {
    setEditingTag(null);
    setFormData({ name: "", slug: "" });
    onOpen();
  };

  const handleOpenEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete", error);
    }
  };

  const handleSave = async (onClose: () => void) => {
    try {
      if (editingTag) {
        await updateMutation.mutateAsync({
          id: editingTag.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save", error);
      alert("Failed to save tag (API might not be implemented yet)");
    }
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => {
      const newData = { ...prev, name: val };

      if (!editingTag) {
        newData.slug = slugify(val);
      }

      return newData;
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleOpenCreate}
        >
          New Tag
        </Button>
      </div>

      <Table aria-label="Tags table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>SLUG</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="No tags found"
          isLoading={isLoading}
          items={tags}
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
                {editingTag ? "Edit Tag" : "New Tag"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Tag Name"
                  value={formData.name}
                  variant="bordered"
                  onValueChange={handleNameChange}
                />
                <Input
                  label="Slug"
                  placeholder="tag-slug"
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
