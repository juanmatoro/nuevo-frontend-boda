export interface MessageTemplate {
  _id: string; // ID de MongoDB
  nombre: string; // Nombre descriptivo de la plantilla
  contenido: string; // El cuerpo del mensaje con los shortcodes (ej. "Hola [nombreInvitado]")

  // 'slug' es útil para identificar plantillas del sistema con un propósito especial.
  slug?:
    | "primer-contacto"
    | "recordatorio-rsvp"
    | "agradecimiento"
    | "personalizado";

  // 'cuerpo' es un campo de tu schema original, inclúyelo si tiene un propósito distinto a 'contenido'.
  cuerpo?: string;

  // El ID del usuario "novio" que es dueño de esta plantilla.
  creadorId: string;

  // El ID de la boda a la que pertenece esta plantilla.
  bodaId: string;

  // Si esta plantilla puede ser editada por el usuario o es una plantilla fija del sistema.
  editable?: boolean;

  // Campos opcionales que discutimos para mayor flexibilidad:
  messageType?:
    | "INITIAL_INVITATION"
    | "REMINDER"
    | "THANK_YOU"
    | "CUSTOM_INDIVIDUAL"
    | "CUSTOM_LIST"
    | "OTHER";
  isDefault?: boolean;
  availableShortcodes?: string[];

  // Timestamps que Mongoose añade automáticamente
  createdAt?: string;
  updatedAt?: string;
}
