"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@heroui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import ImagePicker from "@/components/ImagePicker";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync content from parent when it changes (e.g., after async fetch)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-default-200 rounded-lg overflow-hidden bg-content1 shadow-sm">
      {/* Toolbar */}
      <div className="bg-default-100 p-2 flex flex-wrap gap-1 border-b border-default-200">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bold") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("italic") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("heading", { level: 1 }) ? "solid" : "light"}
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "solid" : "light"}
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bulletList") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("orderedList") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("blockquote") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={18} />
        </Button>
        <Button isIconOnly size="sm" variant="light" onPress={setLink}>
          <LinkIcon size={18} />
        </Button>
        <ImagePicker
          onSelect={(id, url) => {
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
        >
          <Button isIconOnly size="sm" variant="light">
            <ImageIcon size={18} />
          </Button>
        </ImagePicker>
        <div className="flex-grow" />
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => editor.chain().focus().undo().run()}
        >
          <Undo size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => editor.chain().focus().redo().run()}
        >
          <Redo size={18} />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="p-4 bg-background min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
