"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function TipTapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "blog-img" } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-tiptap min-h-[300px] max-w-none p-4 focus:outline-none font-mono text-sm",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. when loading an existing post).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border border-[var(--color-border)] min-h-[300px] p-4 text-xs text-[var(--color-text-muted)]">
        loading editor...
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-border)]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickImage() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, "portfolio/inline");
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = prompt("URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>B</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><i>I</i></Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><s>S</s></Btn>
      <Sep />
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}>P</Btn>
      <Sep />
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>•</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1.</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>&gt;</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>{"{}"}</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>`</Btn>
      <Sep />
      <Btn editor={editor} cmd={addLink} active={editor.isActive("link")}>LINK</Btn>
      <label className="px-2 py-1 text-xs font-bold border border-[var(--color-border)] cursor-pointer">
        {uploading ? "..." : "IMG"}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={onPickImage}
        />
      </label>
      <Sep />
      <Btn editor={editor} cmd={() => editor.chain().focus().undo().run()}>UNDO</Btn>
      <Btn editor={editor} cmd={() => editor.chain().focus().redo().run()}>REDO</Btn>
    </div>
  );
}

function Btn({
  cmd,
  active,
  children,
}: {
  editor: Editor;
  cmd: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={cmd}
      className={`px-2 py-1 text-xs font-bold border ${
        active
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
          : "border-[var(--color-border)]"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px bg-[var(--color-border)] mx-1" />;
}
