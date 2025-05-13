import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import VariableChip from "./VariableChip";
import { useEffect } from "react";

interface Props {
  initialContent: string;
  onChange: (html: string) => void;
}
export function TemplateEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose focus:outline-none p-4 min-h-[10rem]" },
    },
  });

  useEffect(() => {
    if (editor && initialContent) editor.commands.setContent(initialContent);
  }, [editor, initialContent]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <VariableChip label="{nombreInvitado}" />
        <VariableChip label="{magicUrl}" />
      </CardHeader>
      <CardContent>
        <EditorContent editor={editor} />
      </CardContent>
    </Card>
  );
}
