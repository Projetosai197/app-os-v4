/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OSStatus = "Rascunho" | "Agendada" | "Em andamento" | "Aguardando peça" | "Concluída" | "Cancelada";
export type OSPriority = "Baixa" | "Média" | "Alta" | "Crítica";
export type OSType = "Suporte" | "Visita" | "Instalação" | "Manutenção";

export interface OS {
  id: string;
  clientId: string;
  clientName: string;
  equipmentId?: string;
  equipmentName?: string;
  technician: string;
  tipo: OSType;
  status: OSStatus;
  priority: OSPriority;
  dataEmissao: string; // YYYY-MM-DD
  dataAtendimento: string; // YYYY-MM-DD
  horarioInicio: string; // HH:MM
  horarioTermino: string; // HH:MM
  prazo: string | null; // YYYY-MM-DD — prazo de conclusão do chamado
  materialRetirado: string;
  description: string;
  photosBefore: string[]; // Base64 data URLs
  photosAfter: string[];  // Base64 data URLs
  signature: string | null; // Signature SVG/Canvas drawing data URL
  signatureName: string | null;
  notificadoSite: boolean; // registro manual: solicitante foi avisado pelo site
  notificadoWhatsapp: boolean; // registro manual: solicitante foi avisado por WhatsApp
  notificadoEmail: boolean; // registro manual: solicitante foi avisado por e-mail
  deletedAt: string | null; // Soft delete timestamp
}

export interface ContatoAdicional {
  id: string;
  nome: string;
  telefone: string;
  celular: string;
  email: string;
  cargo: string;
  receberNotificacoes: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  observacoes: string;
  outrosContatos: ContatoAdicional[];
  deletedAt: string | null; // Soft delete timestamp
}

export interface Equipment {
  id: string;
  clientId: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate: string; // YYYY-MM-DD
  deletedAt: string | null; // Soft delete timestamp
}

export type VisitType = "Instalação" | "Manutenção" | "Visita Técnica" | "Orçamento";
export type VisitStatus = "Pendente" | "Realizada" | "Cancelada";

export interface Visit {
  id: string;
  orderId: string | null;
  clientId: string;
  clientName: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: VisitType;
  notes: string;
  status: VisitStatus;
  deletedAt: string | null; // Soft delete timestamp
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  phone: string;
  avatar: string;
}
