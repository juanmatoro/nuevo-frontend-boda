import { useState, useEffect } from "react";
import { TemplateEditor } from "./TemplateEditor";
import { Button } from "@/app/components/ui/button";
import { useTemplates } from "@/hooks/useTemplates";
import { enviarPrimerContacto } from "@/services/mensajePrimerContacto";
import { useToast } from "@/app/components/ui/use-toast";

interface Props {
  bodaId: string;
}
export default function PrimerContactoForm({ bodaId }: Props) {
  const { fetchAll, save } = useTemplates(bodaId);
  const [template, setTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const t = await fetchAll();
      const pc = t.find((tpl: any) => tpl.slug === "primer-contacto");
      setTemplate(
        pc || {
          bodaId,
          slug: "primer-contacto",
          cuerpo: "Hola {nombreInvitado}, …\n{magicUrl}",
        }
      );
    })();
  }, [fetchAll, bodaId]);

  const handleSend = async () => {
    if (!template?._id) {
      const saved = await save(template);
      setTemplate(saved);
    }
    setLoading(true);
    try {
      await enviarPrimerContacto(bodaId, template._id);
      toast({
        title: "Mensaje encolado",
        description: "Se está enviando el primer contacto",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!template) return <p>Cargando…</p>;

  return (
    <div className="space-y-4">
      <TemplateEditor
        initialContent={template.cuerpo}
        onChange={(html) => setTemplate({ ...template, cuerpo: html })}
      />
      <Button onClick={handleSend} disabled={loading}>
        {loading ? "Enviando…" : "Enviar a todos los invitados"}
      </Button>
    </div>
  );
}
