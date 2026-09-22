/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, ClipboardList, Trash2,
  MapPin, User, UserPlus,
  Camera, Check, X, FileText, Share2, Award, Globe, MessageCircle, Mail
} from "lucide-react";
import { OS, Client, Equipment, OSStatus, OSPriority, OSType } from "../types";
import { formatClientAddress, calcularTotalHoras } from "../lib/format";
import ClientFormModal from "./shared/ClientFormModal";

interface OSManagementProps {
  orders: OS[];
  clients: Client[];
  equipments: Equipment[];
  onAddOS: (newOS: OS) => void;
  onAddClient: (newClient: Client) => void;
  onUpdateOS: (updatedOS: OS) => void;
  onDeleteOS: (osId: string) => void;
  preselectedFilter: string;
  selectedOSId: string | null;
  onClearSelectedOS: () => void;
}

const OS_TYPES: OSType[] = ["Suporte", "Visita", "Instalação", "Manutenção"];

export default function OSManagement({
  orders,
  clients,
  equipments,
  onAddOS,
  onAddClient,
  onUpdateOS,
  onDeleteOS,
  preselectedFilter,
  selectedOSId,
  onClearSelectedOS
}: OSManagementProps) {
  // Navigation & UI States
  const [activeFilter, setActiveFilter] = useState<string>("TODAS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOS, setSelectedOS] = useState<OS | null>(null);

  // FAB Submenu State
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Modals / Creating Forms States
  const [showNewOSModal, setShowNewOSModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // OS Details Action Modals
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

  // Form Fields - New OS
  const [newOSClientId, setNewOSClientId] = useState("");
  const [newOSEquipmentId, setNewOSEquipmentId] = useState("");
  const [newOSTechnician, setNewOSTechnician] = useState("");
  const [newOSTipo, setNewOSTipo] = useState<OSType>("Suporte");
  const [newOSStatus, setNewOSStatus] = useState<OSStatus>("Rascunho");
  const [newOSPriority, setNewOSPriority] = useState<OSPriority>("Média");
  const [newOSDataEmissao, setNewOSDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [newOSDataAtendimento, setNewOSDataAtendimento] = useState(new Date().toISOString().split('T')[0]);
  const [newOSHorarioInicio, setNewOSHorarioInicio] = useState("");
  const [newOSHorarioTermino, setNewOSHorarioTermino] = useState("");
  const [newOSPrazo, setNewOSPrazo] = useState("");
  const [newOSMaterialRetirado, setNewOSMaterialRetirado] = useState("");
  const [newOSDescription, setNewOSDescription] = useState("");

  // Signature Pad State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState("");

  // Photo uploads simulation State
  const [photoType, setPhotoType] = useState<"before" | "after" | null>(null);

  // Sample Field Service Photos for selection
  const samplePhotos = {
    before: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400", // corroded / broken parts
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400", // loose cables
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"  // dirty AC unit
    ],
    after: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400", // shiny new wiring
      "https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=400", // clean assembled device
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"  // shiny clean housing
    ]
  };

  // Sync with preselected filters from Dashboard
  useEffect(() => {
    if (preselectedFilter) {
      setActiveFilter(preselectedFilter);
    }
  }, [preselectedFilter]);

  // Sync with selected OS from Global Search
  useEffect(() => {
    if (selectedOSId) {
      const foundOS = orders.find(o => o.id === selectedOSId);
      if (foundOS) {
        setSelectedOS(foundOS);
      }
    }
  }, [selectedOSId, orders]);

  // Handle FAB closing when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setFabOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out soft-deleted
  const activeOrders = orders.filter(o => !o.deletedAt);
  const activeClients = clients.filter(c => !c.deletedAt);
  const activeEquipments = equipments.filter(e => !e.deletedAt);

  // Filter OS list based on active filter and query
  const filteredOrders = activeOrders.filter(os => {
    const matchesFilter = activeFilter === "TODAS" || os.status === activeFilter;

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      os.id.toLowerCase().includes(query) ||
      os.clientName.toLowerCase().includes(query) ||
      os.technician.toLowerCase().includes(query) ||
      os.description.toLowerCase().includes(query) ||
      (os.equipmentName && os.equipmentName.toLowerCase().includes(query));

    return matchesFilter && matchesQuery;
  });

  // Signature Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1e1b4b"; // Dark Indigo
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    const pos = getEventPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getEventPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getEventPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedOS) return;

    const signatureDataURL = canvas.toDataURL("image/png");
    const updatedOS = {
      ...selectedOS,
      signature: signatureDataURL,
      signatureName: signerName || "Responsável do Cliente"
    };

    onUpdateOS(updatedOS);
    setSelectedOS(updatedOS);
    setShowSignatureModal(false);
    setSignerName("");
  };

  // Simulated Photo add
  const addSimulatedPhoto = (imgUrl: string) => {
    if (!selectedOS || !photoType) return;

    const updatedOS = { ...selectedOS };
    if (photoType === "before") {
      updatedOS.photosBefore = [...updatedOS.photosBefore, imgUrl];
    } else {
      updatedOS.photosAfter = [...updatedOS.photosAfter, imgUrl];
    }

    onUpdateOS(updatedOS);
    setSelectedOS(updatedOS);
    setPhotoType(null);
  };

  // Submit Creators
  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOSClientId) return;

    const client = activeClients.find(c => c.id === newOSClientId);
    const equip = activeEquipments.find(eq => eq.id === newOSEquipmentId);

    const newOS: OS = {
      id: `OS-${1000 + orders.length + 1}`,
      clientId: newOSClientId,
      clientName: client?.name || "Cliente Desconhecido",
      equipmentId: newOSEquipmentId || undefined,
      equipmentName: equip?.name || undefined,
      technician: newOSTechnician || "Técnico Rodrigo",
      tipo: newOSTipo,
      status: newOSStatus,
      priority: newOSPriority,
      dataEmissao: newOSDataEmissao,
      dataAtendimento: newOSDataAtendimento,
      horarioInicio: newOSHorarioInicio,
      horarioTermino: newOSHorarioTermino,
      prazo: newOSPrazo || null,
      materialRetirado: newOSMaterialRetirado,
      description: newOSDescription,
      photosBefore: [],
      photosAfter: [],
      signature: null,
      signatureName: null,
      notificadoSite: false,
      notificadoWhatsapp: false,
      notificadoEmail: false,
      deletedAt: null
    };

    onAddOS(newOS);

    // Reset Form & Close
    setShowNewOSModal(false);
    setNewOSClientId("");
    setNewOSEquipmentId("");
    setNewOSTechnician("");
    setNewOSDescription("");
    setNewOSHorarioInicio("");
    setNewOSHorarioTermino("");
    setNewOSPrazo("");
    setNewOSMaterialRetirado("");

    // Select the newly created OS details automatically
    setSelectedOS(newOS);
  };

  const handleDelete = (id: string) => {
    onDeleteOS(id);
    setSelectedOS(null);
    onClearSelectedOS();
  };

  const handleShare = (os: OS) => {
    const text = `*Ordem de Serviço ${os.id}* - App-OS\nCliente: ${os.clientName}\nStatus: ${os.status}\nTécnico: ${os.technician}\nDescrição: ${os.description}`;

    if (navigator.share) {
      navigator.share({
        title: `OS ${os.id}`,
        text: text,
      }).catch(err => console.log(err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      alert("Copiado para a área de transferência! Cole no WhatsApp ou e-mail do cliente.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative space-y-4">

      {/* Top action header and search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-sky-600" />
            Ordens de Serviço (OS)
          </h1>

          <div className="flex items-center gap-2">
            {/* Quick Status Filter list (Horizontal scrolling on mobile) */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {["TODAS", "Agendada", "Em andamento", "Concluída", "Cancelada"].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setActiveFilter(status);
                    setSelectedOS(null);
                    onClearSelectedOS();
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    activeFilter === status
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {status === "TODAS" ? "Todas" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Local OS Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquise por OS, Cliente, Técnico ou Equipamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main OS Panel: Split View (List and Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* OS List Panel */}
        <div className={`lg:col-span-5 space-y-3 ${selectedOS ? "hidden lg:block" : "block"}`}>
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Listagem de OS ({filteredOrders.length})
            </p>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredOrders.map(os => (
              <div
                key={os.id}
                onClick={() => setSelectedOS(os)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedOS?.id === os.id
                    ? "bg-sky-50/50 border-sky-200 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{os.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    os.status === "Em andamento" ? "bg-amber-100 text-amber-800" :
                    os.status === "Concluída" ? "bg-emerald-100 text-emerald-800" :
                    os.status === "Aguardando peça" ? "bg-purple-100 text-purple-800" :
                    os.status === "Agendada" ? "bg-blue-100 text-blue-800" :
                    os.status === "Cancelada" ? "bg-red-100 text-red-800" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {os.status}
                  </span>
                </div>

                <h3 className="text-xs font-black text-slate-800 mt-2 truncate">{os.clientName}</h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{os.equipmentName || "Equipamento não especificado"}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[120px]">{os.technician}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block">{os.tipo}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      os.priority === "Crítica" ? "text-red-600" :
                      os.priority === "Alta" ? "text-amber-600" :
                      os.priority === "Média" ? "text-blue-600" :
                      "text-slate-500"
                    }`}>
                      Prioridade {os.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold">Nenhuma Ordem de Serviço encontrada</p>
                <p className="text-xs mt-1">Experimente alterar os filtros ou pesquisar com termos mais simples.</p>
              </div>
            )}
          </div>
        </div>

        {/* OS Details Panel */}
        <div className={`lg:col-span-7 ${selectedOS ? "block" : "hidden lg:block bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center"}`}>
          {selectedOS ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-6">

              {/* Details Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <button
                  onClick={() => {
                    setSelectedOS(null);
                    onClearSelectedOS();
                  }}
                  className="lg:hidden text-sky-600 hover:text-sky-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Voltar
                </button>

                <div className="text-right lg:text-left">
                  <span className="text-[11px] font-mono font-bold text-slate-400 block">Identificador Único</span>
                  <span className="text-xl font-black text-sky-900">{selectedOS.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(selectedOS)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                    title="Compartilhar"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowPDFModal(true)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                    title="Imprimir / PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedOS.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-all cursor-pointer"
                    title="Excluir (Mover para lixeira)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Client Info Card */}
                <div className="p-4 bg-sky-50/20 border border-sky-100/50 rounded-2xl">
                  <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">Cliente Atendido</h3>
                  <p className="text-sm font-black text-slate-800">{selectedOS.clientName}</p>
                  <div className="text-xs text-slate-500 space-y-1 mt-1.5">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {(() => {
                        const c = clients.find(cl => cl.id === selectedOS.clientId);
                        return c ? formatClientAddress(c) : "Não informado";
                      })()}
                    </p>
                  </div>
                </div>

                {/* Equipment Linked Info Card */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Equipamento Vinculado</h3>
                  {selectedOS.equipmentId ? (
                    <div>
                      <p className="text-sm font-black text-slate-800">{selectedOS.equipmentName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        S/N: {equipments.find(e => e.id === selectedOS.equipmentId)?.serialNumber || "N/D"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhum equipamento cadastrado para esta OS.</p>
                  )}
                </div>
              </div>

              {/* Status and priority controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status da Operação</label>
                    <select
                      value={selectedOS.status}
                      onChange={(e) => {
                        const updated = { ...selectedOS, status: e.target.value as OSStatus };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      {["Rascunho", "Agendada", "Em andamento", "Aguardando peça", "Concluída", "Cancelada"].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prioridade</label>
                    <select
                      value={selectedOS.priority}
                      onChange={(e) => {
                        const updated = { ...selectedOS, priority: e.target.value as OSPriority };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      {["Baixa", "Média", "Alta", "Crítica"].map(pr => (
                        <option key={pr} value={pr}>{pr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo de Serviço</label>
                    <select
                      value={selectedOS.tipo}
                      onChange={(e) => {
                        const updated = { ...selectedOS, tipo: e.target.value as OSType };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      {OS_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Técnico Encarregado</span>
                    <input
                      type="text"
                      value={selectedOS.technician}
                      onChange={(e) => {
                        const updated = { ...selectedOS, technician: e.target.value };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-sky-500 text-xs text-slate-800 font-semibold p-1 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data de Emissão</label>
                    <input
                      type="date"
                      value={selectedOS.dataEmissao}
                      onChange={(e) => {
                        const updated = { ...selectedOS, dataEmissao: e.target.value };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data de Atendimento</label>
                    <input
                      type="date"
                      value={selectedOS.dataAtendimento}
                      onChange={(e) => {
                        const updated = { ...selectedOS, dataAtendimento: e.target.value };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horário Início</label>
                    <input
                      type="time"
                      value={selectedOS.horarioInicio}
                      onChange={(e) => {
                        const updated = { ...selectedOS, horarioInicio: e.target.value };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horário Término</label>
                    <input
                      type="time"
                      value={selectedOS.horarioTermino}
                      onChange={(e) => {
                        const updated = { ...selectedOS, horarioTermino: e.target.value };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total de Horas</label>
                    <div className="w-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 p-2 rounded-xl">
                      {calcularTotalHoras(selectedOS.horarioInicio, selectedOS.horarioTermino)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prazo do Chamado</label>
                    <input
                      type="date"
                      value={selectedOS.prazo || ""}
                      onChange={(e) => {
                        const updated = { ...selectedOS, prazo: e.target.value || null };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Material Retirado</label>
                    <input
                      type="text"
                      value={selectedOS.materialRetirado}
                      onChange={(e) => {
                        const updated = { ...selectedOS, materialRetirado: e.target.value };
                        onUpdateOS(updated);
                        setSelectedOS(updated);
                      }}
                      placeholder="Ex: Placa eletrônica danificada"
                      className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 p-2 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Monitoramento de notificação ao solicitante (registro manual) */}
                <div className="pt-2 border-t border-slate-200/60 space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Solicitante notificado via
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <label className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all ${
                      selectedOS.notificadoSite ? "bg-sky-50 border-sky-300 text-sky-700" : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedOS.notificadoSite}
                        onChange={(e) => {
                          const updated = { ...selectedOS, notificadoSite: e.target.checked };
                          onUpdateOS(updated);
                          setSelectedOS(updated);
                        }}
                      />
                      <Globe className="w-3.5 h-3.5" /> Site
                    </label>
                    <label className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all ${
                      selectedOS.notificadoWhatsapp ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedOS.notificadoWhatsapp}
                        onChange={(e) => {
                          const updated = { ...selectedOS, notificadoWhatsapp: e.target.checked };
                          onUpdateOS(updated);
                          setSelectedOS(updated);
                        }}
                      />
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </label>
                    <label className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all ${
                      selectedOS.notificadoEmail ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedOS.notificadoEmail}
                        onChange={(e) => {
                          const updated = { ...selectedOS, notificadoEmail: e.target.checked };
                          onUpdateOS(updated);
                          setSelectedOS(updated);
                        }}
                      />
                      <Mail className="w-3.5 h-3.5" /> E-mail
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Registro manual — envio automático ainda não implementado.</p>
                </div>
              </div>

              {/* Problem Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diagnóstico Técnico / Descrição</span>
                <textarea
                  value={selectedOS.description}
                  onChange={(e) => {
                    const updated = { ...selectedOS, description: e.target.value };
                    onUpdateOS(updated);
                    setSelectedOS(updated);
                  }}
                  rows={3}
                  className="w-full border border-slate-200 focus:border-sky-500 rounded-xl p-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
                  placeholder="Relatório detalhado do problema e solução..."
                />
              </div>

              {/* Photos Panel: Before/After */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> Evidências Fotográficas (Antes / Depois)
                </span>

                <div className="grid grid-cols-2 gap-4">
                  {/* Photos Before */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Antes do Serviço</h4>
                      <button
                        onClick={() => setPhotoType("before")}
                        className="text-[10px] text-sky-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto">
                      {selectedOS.photosBefore.map((p, i) => (
                        <img key={i} src={p} alt="Antes" className="w-14 h-14 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                      ))}
                      {selectedOS.photosBefore.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-3 text-center w-full">Nenhuma foto enviada.</p>
                      )}
                    </div>
                  </div>

                  {/* Photos After */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Depois do Serviço</h4>
                      <button
                        onClick={() => setPhotoType("after")}
                        className="text-[10px] text-sky-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto">
                      {selectedOS.photosAfter.map((p, i) => (
                        <img key={i} src={p} alt="Depois" className="w-14 h-14 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                      ))}
                      {selectedOS.photosAfter.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-3 text-center w-full">Nenhuma foto enviada.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Customer Signature Pad */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Assinatura Digital do Cliente
                  </h4>
                  <button
                    onClick={() => {
                      setShowSignatureModal(true);
                      setTimeout(() => clearCanvas(), 100);
                    }}
                    className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    {selectedOS.signature ? "Re-assinar" : "Coletar Assinatura"}
                  </button>
                </div>

                {selectedOS.signature ? (
                  <div className="flex flex-col items-center bg-white border border-slate-200 rounded-xl p-3">
                    <img src={selectedOS.signature} alt="Assinatura" className="h-16 object-contain" referrerPolicy="no-referrer" />
                    <p className="text-[10px] font-bold text-slate-700 mt-2">Responsável: {selectedOS.signatureName}</p>
                    <p className="text-[9px] text-emerald-600 flex items-center gap-0.5 mt-0.5 font-bold">
                      <Check className="w-3 h-3" /> Assinado Digitalmente via App-OS
                    </p>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center text-slate-400">
                    <p className="text-xs">Assinatura ainda não coletada.</p>
                    <p className="text-[10px] text-slate-500 mt-1">Colete o aval do cliente para finalizar formalmente o encargo.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-2">
              <ClipboardList className="w-16 h-16 text-sky-200 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">Selecione uma OS</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Selecione uma ordem de serviço na listagem lateral ou use a busca global para visualizar e gerenciar detalhes.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* EXPANDABLE FAB BUTTON (Bottom Right Float) */}
      <div className="fixed bottom-24 right-6 z-30" ref={fabRef}>
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.8 }}
              className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 w-48 space-y-1"
            >
              <button
                onClick={() => {
                  setFabOpen(false);
                  setShowNewOSModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 rounded-xl text-left transition-colors cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-sky-500" />
                Nova OS
              </button>

              <button
                onClick={() => {
                  setFabOpen(false);
                  setShowNewClientModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 rounded-xl text-left transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-500" />
                Novo Cliente
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-sky-500/20 shadow-sky-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
          aria-label="Ações rápidas de criação"
        >
          <motion.div
            animate={{ rotate: fabOpen ? 135 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </button>
      </div>

      {/* MODAL: NEW OS */}
      <AnimatePresence>
        {showNewOSModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ClipboardList className="w-5 h-5 text-sky-600" /> Nova Ordem de Serviço (OS)
                </h3>
                <button onClick={() => setShowNewOSModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOS} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente *</label>
                  <select
                    required
                    value={newOSClientId}
                    onChange={(e) => {
                      setNewOSClientId(e.target.value);
                      setNewOSEquipmentId(""); // Reset equipment select as client changes
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Selecione o Cliente</option>
                    {activeClients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Equipamento Relacionado</label>
                  <select
                    disabled={!newOSClientId}
                    value={newOSEquipmentId}
                    onChange={(e) => setNewOSEquipmentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  >
                    <option value="">Selecione o Equipamento</option>
                    {activeEquipments
                      .filter(eq => eq.clientId === newOSClientId)
                      .map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.brand})</option>
                      ))}
                  </select>
                  {!newOSClientId && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block italic">Selecione o cliente primeiro para filtrar os equipamentos.</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Técnico Encarregado</label>
                    <input
                      type="text"
                      placeholder="Ex: Rodrigo Melo"
                      value={newOSTechnician}
                      onChange={(e) => setNewOSTechnician(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Serviço</label>
                    <select
                      value={newOSTipo}
                      onChange={(e) => setNewOSTipo(e.target.value as OSType)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    >
                      {OS_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Emissão</label>
                    <input
                      type="date"
                      value={newOSDataEmissao}
                      onChange={(e) => setNewOSDataEmissao(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Atendimento</label>
                    <input
                      type="date"
                      value={newOSDataAtendimento}
                      onChange={(e) => setNewOSDataAtendimento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Horário Início</label>
                    <input
                      type="time"
                      value={newOSHorarioInicio}
                      onChange={(e) => setNewOSHorarioInicio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Horário Término</label>
                    <input
                      type="time"
                      value={newOSHorarioTermino}
                      onChange={(e) => setNewOSHorarioTermino(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total de Horas</label>
                    <div className="w-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 p-2.5 rounded-xl">
                      {calcularTotalHoras(newOSHorarioInicio, newOSHorarioTermino)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={newOSStatus}
                      onChange={(e) => setNewOSStatus(e.target.value as OSStatus)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    >
                      {["Rascunho", "Agendada", "Em andamento", "Aguardando peça", "Concluída"].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prioridade</label>
                    <select
                      value={newOSPriority}
                      onChange={(e) => setNewOSPriority(e.target.value as OSPriority)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    >
                      {["Baixa", "Média", "Alta", "Crítica"].map(pr => (
                        <option key={pr} value={pr}>{pr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prazo do Chamado</label>
                    <input
                      type="date"
                      value={newOSPrazo}
                      onChange={(e) => setNewOSPrazo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Material Retirado</label>
                    <input
                      type="text"
                      placeholder="Ex: Placa eletrônica danificada"
                      value={newOSMaterialRetirado}
                      onChange={(e) => setNewOSMaterialRetirado(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição do Problema / Serviço</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva detalhadamente o sintoma, testes e soluções..."
                    value={newOSDescription}
                    onChange={(e) => setNewOSDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewOSModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
                  >
                    Gravar Nova OS
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NEW CLIENT (Shared Form) */}
      <ClientFormModal
        open={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onCreated={(newClient) => {
          onAddClient(newClient);
          setNewOSClientId(newClient.id);
        }}
      />

      {/* MODAL: DRAWING SIGNATURE PAD */}
      <AnimatePresence>
        {showSignatureModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-sky-600" /> Assinatura Eletrônica do Cliente
                </h3>
                <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo do Responsável</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Santos - Diretor"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desenhe no painel abaixo:</span>
                <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 bg-white block cursor-crosshair touch-none"
                  />
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="absolute bottom-2 right-2 px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    Limpar Tela
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!signerName}
                  onClick={saveSignature}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                >
                  Salvar Assinatura
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PHOTO PICKER (Simulated) */}
      <AnimatePresence>
        {photoType !== null && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Simulador de Câmera ({photoType === "before" ? "Antes" : "Depois"})
                </h3>
                <button onClick={() => setPhotoType(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Como este é um ambiente de visualização, você pode selecionar uma das fotos de campo simuladas para fins de demonstração:
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {(photoType === "before" ? samplePhotos.before : samplePhotos.after).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => addSimulatedPhoto(img)}
                    className="relative group rounded-xl overflow-hidden aspect-square border-2 border-slate-100 hover:border-sky-500 transition-all cursor-pointer"
                  >
                    <img src={img} alt={`Mock ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-sky-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-[10px] text-white font-extrabold bg-sky-600 px-1.5 py-0.5 rounded-full">Usar</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPhotoType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PDF GENERATOR / RECEIPT PREVIEW */}
      <AnimatePresence>
        {showPDFModal && selectedOS && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 print:hidden">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-sky-600" /> Relatório de Ordem de Serviço (PDF)
                </h3>
                <button onClick={() => setShowPDFModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Document Design */}
              <div id="os-pdf-document" className="border border-slate-300 rounded-2xl p-6 md:p-8 space-y-6 text-slate-800 bg-white">

                {/* PDF Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-100">
                  <div>
                    <h1 className="text-2xl font-black text-sky-950 flex items-center gap-1.5">
                      <ClipboardList className="w-6 h-6 text-sky-600" /> App-OS Solutions
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Sistemas Técnicos e Engenharia de Manutenção</p>
                    <p className="text-[10px] text-slate-400">Suporte Técnico de Alta Performance</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-sky-100 text-sky-900 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                      Ordem de Serviço • {selectedOS.tipo}
                    </span>
                    <h2 className="text-lg font-black text-slate-800 mt-2 font-mono">{selectedOS.id}</h2>
                    <p className="text-xs text-slate-500">Emissão: {selectedOS.dataEmissao} • Atendimento: {selectedOS.dataAtendimento}</p>
                    <p className="text-[10px] text-sky-600 font-bold uppercase">Status: {selectedOS.status}</p>
                  </div>
                </div>

                {/* PDF Body Part 1: Client & Equipment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Dados do Cliente</h3>
                    <p className="text-sm font-extrabold text-slate-900">{selectedOS.clientName}</p>
                    <p className="text-xs text-slate-600">Documento: {clients.find(c => c.id === selectedOS.clientId)?.document || "Não cadastrado"}</p>
                    <p className="text-xs text-slate-600">Endereço: {(() => {
                      const c = clients.find(cl => cl.id === selectedOS.clientId);
                      return c ? formatClientAddress(c) : "Não cadastrado";
                    })()}</p>
                    <p className="text-xs text-slate-600">Telefone: {clients.find(c => c.id === selectedOS.clientId)?.phone || "Não cadastrado"}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Detalhes do Ativo</h3>
                    {selectedOS.equipmentId ? (
                      <>
                        <p className="text-sm font-extrabold text-slate-900">{selectedOS.equipmentName}</p>
                        <p className="text-xs text-slate-600">Modelo: {equipments.find(e => e.id === selectedOS.equipmentId)?.model || "N/A"}</p>
                        <p className="text-xs text-slate-600">Marca: {equipments.find(e => e.id === selectedOS.equipmentId)?.brand || "N/A"}</p>
                        <p className="text-xs text-slate-600">Número de Série: {equipments.find(e => e.id === selectedOS.equipmentId)?.serialNumber || "N/A"}</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhum equipamento cadastrado.</p>
                    )}
                  </div>
                </div>

                {/* PDF Body Part 2: Diagnosis and Details */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Diagnóstico Técnico / Descrição do Serviço</h3>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedOS.description}</p>
                  {selectedOS.materialRetirado && (
                    <p className="text-xs text-slate-700"><strong>Material Retirado:</strong> {selectedOS.materialRetirado}</p>
                  )}
                </div>

                {/* PDF Body Part 3: Execution Window */}
                <div className="flex justify-between items-center py-4 border-t border-b border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Técnico Encarregado</p>
                    <p className="text-xs font-bold text-slate-800">{selectedOS.technician}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Horário Executado</p>
                    <p className="text-sm font-black text-sky-950">
                      {selectedOS.horarioInicio || "—"} às {selectedOS.horarioTermino || "—"} ({calcularTotalHoras(selectedOS.horarioInicio, selectedOS.horarioTermino)})
                    </p>
                  </div>
                </div>

                {/* PDF Body Part 4: Signature / Closure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="border-t border-slate-300 pt-3 text-center">
                    <p className="text-[10px] text-slate-500 font-semibold">{selectedOS.technician}</p>
                    <p className="text-[9px] text-slate-400">Assinatura do Técnico Responsável</p>
                  </div>

                  <div className="pt-3 text-center">
                    {selectedOS.signature ? (
                      <div className="flex flex-col items-center">
                        <img src={selectedOS.signature} alt="Assinatura" className="h-10 object-contain" referrerPolicy="no-referrer" />
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">{selectedOS.signatureName}</p>
                      </div>
                    ) : (
                      <div className="border-t border-slate-300 pt-3">
                        <p className="text-[10px] text-slate-400 italic">Pendente de assinatura</p>
                      </div>
                    )}
                    <p className="text-[9px] text-slate-400">Assinatura Autorizada do Cliente</p>
                  </div>
                </div>

              </div>

              {/* PDF Actions Footer */}
              <div className="pt-3 flex justify-end gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setShowPDFModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Imprimir Documento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
