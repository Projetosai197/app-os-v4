/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Equipment, OS, Visit, Notification } from "../types";

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "CLI-1",
    name: "Silva & Santos Alimentos Ltda",
    email: "contato@silvasantos.com.br",
    phone: "(11) 98765-4321",
    document: "12.345.678/0001-90",
    cep: "01310-100",
    endereco: "Av. Paulista",
    numero: "1000",
    complemento: "",
    bairro: "Bela Vista",
    cidade: "São Paulo / SP",
    observacoes: "",
    outrosContatos: [],
    deletedAt: null
  },
  {
    id: "CLI-2",
    name: "Condomínio Edifício Vista Alegre",
    email: "administracao@vistaalegre.com.br",
    phone: "(21) 99888-7766",
    document: "98.765.432/0001-10",
    cep: "22240-030",
    endereco: "Rua das Laranjeiras",
    numero: "450",
    complemento: "",
    bairro: "Laranjeiras",
    cidade: "Rio de Janeiro / RJ",
    observacoes: "",
    outrosContatos: [],
    deletedAt: null
  },
  {
    id: "CLI-3",
    name: "Clínica Sorriso Perfeito Eireli",
    email: "financeiro@sorrisoperfeito.com.br",
    phone: "(31) 98877-6655",
    document: "45.678.901/0001-23",
    cep: "30130-909",
    endereco: "Av. Afonso Pena",
    numero: "1200",
    complemento: "",
    bairro: "Centro",
    cidade: "Belo Horizonte / MG",
    observacoes: "",
    outrosContatos: [],
    deletedAt: null
  },
  {
    id: "CLI-4",
    name: "Indústria Metalúrgica Ferro Forte",
    email: "manutencao@ferroforte.ind.br",
    phone: "(19) 3456-7890",
    document: "55.444.333/0001-22",
    cep: "13469-002",
    endereco: "Rodovia Anhanguera, Km 120",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "Americana / SP",
    observacoes: "",
    outrosContatos: [],
    deletedAt: null
  }
];

export const INITIAL_EQUIPMENTS: Equipment[] = [
  {
    id: "EQ-101",
    clientId: "CLI-1",
    name: "Ar Condicionado Split Industrial 24000 BTU",
    brand: "Carrier",
    model: "EcoSplit X Pro",
    serialNumber: "CAR-98231A-2024",
    installationDate: "2024-02-15",
    deletedAt: null
  },
  {
    id: "EQ-102",
    clientId: "CLI-1",
    name: "Gerador Trifásico de Emergência 15kVA",
    brand: "Toyama",
    model: "TG15000T-C",
    serialNumber: "TOY-44312-B",
    installationDate: "2023-11-10",
    deletedAt: null
  },
  {
    id: "EQ-201",
    clientId: "CLI-2",
    name: "Bomba Hidráulica de Recalque 2HP",
    brand: "Schneider",
    model: "BC-92S (Duplex)",
    serialNumber: "SCH-00912-X",
    installationDate: "2025-01-20",
    deletedAt: null
  },
  {
    id: "EQ-301",
    clientId: "CLI-3",
    name: "Compressor de Ar Odontológico Silencioso 1HP",
    brand: "Schulz",
    model: "MSV 6/30 Isento Óleo",
    serialNumber: "SZ-88712-O",
    installationDate: "2024-08-05",
    deletedAt: null
  }
];

export const INITIAL_ORDERS: OS[] = [
  {
    id: "OS-1001",
    clientId: "CLI-1",
    clientName: "Silva & Santos Alimentos Ltda",
    equipmentId: "EQ-101",
    equipmentName: "Ar Condicionado Split Industrial 24000 BTU",
    technician: "Rodrigo Melo",
    tipo: "Manutenção",
    status: "Em andamento",
    priority: "Alta",
    dataEmissao: "2026-07-13",
    dataAtendimento: "2026-07-13",
    horarioInicio: "09:00",
    horarioTermino: "11:30",
    prazo: "2026-07-15",
    materialRetirado: "",
    description: "Equipamento apresentando ruído elevado na evaporadora interna e queda repentina no rendimento térmico. Provável microvazamento de gás refrigerante nas conexões flangeadas.",
    photosBefore: [],
    photosAfter: [],
    signature: null,
    signatureName: null,
    notificadoSite: true,
    notificadoWhatsapp: false,
    notificadoEmail: false,
    deletedAt: null
  },
  {
    id: "OS-1002",
    clientId: "CLI-2",
    clientName: "Condomínio Edifício Vista Alegre",
    equipmentId: "EQ-201",
    equipmentName: "Bomba Hidráulica de Recalque 2HP",
    technician: "Carla Souza",
    tipo: "Manutenção",
    status: "Agendada",
    priority: "Crítica",
    dataEmissao: "2026-07-14",
    dataAtendimento: "2026-07-14",
    horarioInicio: "14:00",
    horarioTermino: "",
    prazo: "2026-07-16",
    materialRetirado: "",
    description: "Revisão geral preventiva e alinhamento do acoplamento flexível do conjunto motobomba nº 1. Troca de gaxetas de vedação devido a gotejamento excessivo no selo mecânico.",
    photosBefore: [],
    photosAfter: [],
    signature: null,
    signatureName: null,
    notificadoSite: false,
    notificadoWhatsapp: true,
    notificadoEmail: false,
    deletedAt: null
  },
  {
    id: "OS-1003",
    clientId: "CLI-3",
    clientName: "Clínica Sorriso Perfeito Eireli",
    equipmentId: "EQ-301",
    equipmentName: "Compressor de Ar Odontológico Silencioso 1HP",
    technician: "Lucas Lima",
    tipo: "Suporte",
    status: "Aguardando peça",
    priority: "Média",
    dataEmissao: "2026-07-10",
    dataAtendimento: "2026-07-10",
    horarioInicio: "",
    horarioTermino: "",
    prazo: null,
    materialRetirado: "Pressostato de controle danificado (aguardando substituição)",
    description: "Substituição emergencial do pressostato de controle que apresentou falha elétrica de fadiga por arco elétrico. Aguardando chegada do componente original Schulz de 10 BAR.",
    photosBefore: [],
    photosAfter: [],
    signature: null,
    signatureName: null,
    notificadoSite: false,
    notificadoWhatsapp: false,
    notificadoEmail: false,
    deletedAt: null
  },
  {
    id: "OS-1004",
    clientId: "CLI-1",
    clientName: "Silva & Santos Alimentos Ltda",
    equipmentId: "EQ-102",
    equipmentName: "Gerador Trifásico de Emergência 15kVA",
    technician: "Rodrigo Melo",
    tipo: "Manutenção",
    status: "Concluída",
    priority: "Baixa",
    dataEmissao: "2026-07-08",
    dataAtendimento: "2026-07-08",
    horarioInicio: "08:00",
    horarioTermino: "10:15",
    prazo: "2026-07-09",
    materialRetirado: "",
    description: "Manutenção periódica de rotina de 250 horas. Troca do lubrificante mineral, filtro de óleo lubrificante, limpeza do copo sedimentador de diesel e inspeção geral das baterias de partida de 12V.",
    photosBefore: [],
    photosAfter: [],
    signature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,25 Q30,10 50,30 T90,15' fill='none' stroke='black' stroke-width='2'/></svg>",
    signatureName: "Marcos Silva - Gerente de Operações",
    notificadoSite: true,
    notificadoWhatsapp: true,
    notificadoEmail: true,
    deletedAt: null
  }
];

export const INITIAL_VISITS: Visit[] = [
  {
    id: "VIS-1",
    orderId: "OS-1001",
    clientId: "CLI-1",
    clientName: "Silva & Santos Alimentos Ltda",
    title: "Vazamento Ar Condicionado",
    date: "2026-07-13",
    time: "10:30",
    type: "Manutenção",
    notes: "Técnico Rodrigo Melo designado. Levar nitrogênio para teste de estanqueidade e manifold.",
    status: "Pendente",
    deletedAt: null
  },
  {
    id: "VIS-2",
    orderId: "OS-1002",
    clientId: "CLI-2",
    clientName: "Condomínio Edifício Vista Alegre",
    title: "Alinhamento Bomba Hidráulica",
    date: "2026-07-14",
    time: "14:00",
    type: "Manutenção",
    notes: "Técnico Carla Souza designada. Requer chave de boca e alinhador a laser para o acoplamento.",
    status: "Pendente",
    deletedAt: null
  },
  {
    id: "VIS-3",
    orderId: null,
    clientId: "CLI-4",
    clientName: "Indústria Metalúrgica Ferro Forte",
    title: "Orçamento de Ar Comprimido",
    date: "2026-07-15",
    time: "09:00",
    type: "Orçamento",
    notes: "Levantamento de carga térmica e projeto para nova rede de ar comprimido da fábrica.",
    status: "Pendente",
    deletedAt: null
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "NOT-1",
    title: "Nova OS Agendada",
    message: "A OS-1002 para 'Condomínio Edifício Vista Alegre' foi atribuída à Carla Souza.",
    time: "Hoje, 08:30",
    read: false
  },
  {
    id: "NOT-2",
    title: "Aviso de Peça Chegando",
    message: "O pressostato Schulz para a OS-1003 foi despachado pelo fornecedor.",
    time: "Ontem, 16:15",
    read: true
  }
];
