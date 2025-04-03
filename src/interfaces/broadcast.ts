// src/interfaces/broadcast.ts

export interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
}

export interface BroadcastList {
  _id: string;
  bodaId: string;
  nombre: string;
  invitados: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NuevaListaDifusion {
  nombre: string;
  invitados: string[]; // Array de IDs de invitados
}
