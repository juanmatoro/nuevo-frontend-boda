export interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
  confirmacion: boolean | null;
  bodaId: string;
  listas?: string[];
  respuestas?: {
    preguntaId: string;
    pregunta: string;
    respuesta?: string;
  }[];
  preguntasAsignadas?: Question[];
}
export interface Question {
  _id: string;
  bodaId: string;
  pregunta: string;
  opciones: string[];
  esObligatoria: boolean;
  esConfirmacionAsistencia?: boolean;
  subPregunta?: { pregunta: string; opciones: string[]; texto?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}
