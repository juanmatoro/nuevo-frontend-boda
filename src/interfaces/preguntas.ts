export interface EditarPreguntaPayload {
  pregunta?: string;
  opciones?: string[];
  esObligatoria?: boolean;
  esConfirmacionAsistencia?: boolean;
  subPregunta?: SubPregunta | null;
}

export interface SubPregunta {
  pregunta: string;
  opciones: string[];
  texto: string; // Add the 'texto' property to match the usage in the component
}

export interface CrearPreguntaPayload {
  bodaId: string;
  pregunta: string;
  opciones: string[];
  esObligatoria?: boolean;
  esConfirmacionAsistencia?: boolean;
  subPregunta?: {
    texto: string;
    opciones: string[];
  } | null;
}

export interface EditarPreguntaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pregunta: Question;
  onGuardar: () => void;
  onSave?: () => void;
}

// Pregunta completa tal como se guarda en la base de datos
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

// Payload para crear una nueva pregunta
export interface CrearPreguntaPayload {
  bodaId: string;
  pregunta: string;
  opciones: string[];
  esObligatoria?: boolean;
  esConfirmacionAsistencia?: boolean;
  subPregunta?: { texto: string; opciones: string[] } | null;
}

// Payload para editar una pregunta existente
export interface EditarPreguntaPayload {
  pregunta?: string;
  opciones?: string[];
  esObligatoria?: boolean;
  esConfirmacionAsistencia?: boolean;
  subPregunta?: SubPregunta | null;
}
export interface CrearPreguntaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreguntaCreada: () => void;
}
