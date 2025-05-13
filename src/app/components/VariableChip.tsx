import { Badge } from "@/app/components/ui/badge";
interface Props {
  label: string;
}
export default function VariableChip({ label }: Props) {
  return (
    <Badge className="bg-muted text-xs cursor-not-allowed select-none">
      {label}
    </Badge>
  );
}
