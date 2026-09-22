/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Search, UserPlus, Cpu, ClipboardList, MapPin,
  Mail, Phone, FileText, ChevronRight, Trash2, X, Plus, StickyNote, Contact
} from "lucide-react";
import { Client, Equipment, OS } from "../types";
import { formatClientAddress } from "../lib/format";
import ClientFormModal from "./shared/ClientFormModal";

interface ClientsManagementProps {
  clients: Client[];
  equipments: Equipment[];
  orders: OS[];
  onAddClient: (newClient: Client) => void;
  onAddEquipment: (newEquipment: Equipment) => void;
  onDeleteClient: (clientId: string) => void;
  onDeleteEquipment: (equipmentId: string) => void;
  selectedClientIdFromOutside: string | null;
  onClearSelectedClient: () => void;
}

export default function ClientsManagement({
  clients,
  equipments,
  orders,
  onAddClient,
  onAddEquipment,
  onDeleteClient,
  onDeleteEquipment,
  selectedClientIdFromOutside,
  onClearSelectedClient
}: ClientsManagementProps) {

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Modal State
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  // New Equipment Form fields
  const [newEqName, setNewEqName] = useState("");
  const [newEqBrand, setNewEqBrand] = useState("");
  const [newEqModel, setNewEqModel] = useState("");
  const [newEqSerial, setNewEqSerial] = useState("");
  const [newEqInstallDate, setNewEqInstallDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync selection from outside global search
  useEffect(() => {
    if (selectedClientIdFromOutside) {
      const foundClient = clients.find(c => c.id === selectedClientIdFromOutside);
      if (foundClient) {
        setSelectedClient(foundClient);
        setSelectedEquipment(null); // Reset equipment when client is navigated to
      }
    }
  }, [selectedClientIdFromOutside, clients]);

  // Filter soft-deleted
  const activeClients = clients.filter(c => !c.deletedAt);
  const activeEquipments = equipments.filter(eq => !eq.deletedAt);
  const activeOrders = orders.filter(o => !o.deletedAt);

  // Client list filter based on query
  const filteredClients = activeClients.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      formatClientAddress(c).toLowerCase().includes(query) ||
      c.document.includes(query)
    );
  });

  // Client Equipments
  const clientEquipments = selectedClient
    ? activeEquipments.filter(eq => eq.clientId === selectedClient.id)
    : [];

  // Maintenance history (OS list) for a specific equipment
  const getEquipmentMaintenanceHistory = (eqId: string) => {
    return activeOrders.filter(o => o.equipmentId === eqId);
  };

  // Submit Handlers
  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newEqName) return;

    const newEquipment: Equipment = {
      id: `EQ-${Date.now()}`,
      clientId: selectedClient.id,
      name: newEqName,
      brand: newEqBrand || "Geral",
      model: newEqModel || "Padrão",
      serialNumber: newEqSerial || "N/A",
      installationDate: newEqInstallDate,
      deletedAt: null
    };

    onAddEquipment(newEquipment);
    setShowAddEquipmentModal(false);

    // Reset Form
    setNewEqName("");
    setNewEqBrand("");
    setNewEqModel("");
    setNewEqSerial("");
  };

  const handleDeleteClient = (id: string) => {
    onDeleteClient(id);
    setSelectedClient(null);
    setSelectedEquipment(null);
    onClearSelectedClient();
  };

  const handleDeleteEquipment = (id: string) => {
    onDeleteEquipment(id);
    setSelectedEquipment(null);
  };

  return (
    <div className="space-y-4">
      {/* Top action header and search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Banco de Clientes
          </h1>

          <button
            onClick={() => setShowAddClientModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>

        {/* Local Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquise por Nome, CPF/CNPJ, Telefone ou Endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Clients List panel */}
        <div className={`lg:col-span-4 space-y-3 ${selectedClient ? "hidden lg:block" : "block"}`}>
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Listagem de Clientes ({filteredClients.length})
            </p>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredClients.map(c => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedClient(c);
                  setSelectedEquipment(null);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedClient?.id === c.id
                    ? "bg-emerald-50/40 border-emerald-200 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <h3 className="text-xs font-black text-slate-800 truncate">{c.name}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.document}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[140px]">{c.phone}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-extrabold shrink-0">
                    {equipments.filter(e => e.clientId === c.id && !e.deletedAt).length} Ativos
                  </span>
                </div>
              </div>
            ))}

            {filteredClients.length === 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold">Nenhum cliente correspondente</p>
                <p className="text-xs mt-1">Refine seus termos de busca unificada.</p>
              </div>
            )}
          </div>
        </div>

        {/* Client details & assets panel */}
        <div className={`lg:col-span-8 ${selectedClient ? "block" : "hidden lg:block bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center"}`}>
          {selectedClient ? (
            <div className="space-y-6">

              {/* Back button and profile details */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setSelectedEquipment(null);
                      onClearSelectedClient();
                    }}
                    className="lg:hidden text-emerald-600 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Voltar
                  </button>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{selectedClient.id}</span>
                    <h2 className="text-lg font-black text-sky-950 leading-tight">{selectedClient.name}</h2>
                  </div>

                  <button
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">E-mail de Contato</span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedClient.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">WhatsApp / Telefone</span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedClient.phone}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">CPF ou CNPJ</span>
                    <p className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> {selectedClient.document}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Endereço Operacional</span>
                    <p className="font-semibold text-slate-800">{formatClientAddress(selectedClient)}</p>
                  </div>
                </div>

                {selectedClient.observacoes && (
                  <div className="pt-3 border-t border-slate-50 flex items-start gap-1.5 text-xs text-slate-600">
                    <StickyNote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Observações</span>
                      <p className="font-semibold text-slate-800">{selectedClient.observacoes}</p>
                    </div>
                  </div>
                )}

                {selectedClient.outrosContatos.length > 0 && (
                  <div className="pt-3 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-2">
                      <Contact className="w-3.5 h-3.5" /> Outros Contatos
                    </span>
                    <div className="space-y-2">
                      {selectedClient.outrosContatos.map((contato) => (
                        <div key={contato.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-700">{contato.nome} {contato.cargo && <span className="font-normal text-slate-400">• {contato.cargo}</span>}</p>
                            <p className="text-slate-500 text-[11px]">{contato.telefone || contato.celular} {contato.email && `• ${contato.email}`}</p>
                          </div>
                          {contato.receberNotificacoes && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">Notifica</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nested Assets: Equipment Level Hierarchy */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                {/* Linked Equipments list */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm md:col-span-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-sky-500" /> Ativos do Cliente ({clientEquipments.length})
                    </h3>
                    <button
                      onClick={() => setShowAddEquipmentModal(true)}
                      className="p-1 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors cursor-pointer"
                      title="Adicionar Equipamento"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {clientEquipments.map(eq => (
                      <div
                        key={eq.id}
                        onClick={() => setSelectedEquipment(eq)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                          selectedEquipment?.id === eq.id
                            ? "bg-sky-50/50 border-sky-200"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-100"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{eq.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{eq.brand} • S/N: {eq.serialNumber}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
                      </div>
                    ))}

                    {clientEquipments.length === 0 && (
                      <div className="text-center py-8 text-slate-400 italic text-[11px]">
                        Nenhum equipamento cadastrado. Adicione um clicando no botão (+).
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Equipment: OS History Lifecycle */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm md:col-span-7 space-y-4">
                  {selectedEquipment ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full inline-block">
                            Vida Útil do Ativo
                          </span>
                          <h4 className="text-sm font-black text-slate-800 mt-1.5">{selectedEquipment.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Modelo: <strong className="text-slate-700">{selectedEquipment.model}</strong> • Marca: <strong className="text-slate-700">{selectedEquipment.brand}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">S/N: {selectedEquipment.serialNumber} • Instalação: {selectedEquipment.installationDate}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteEquipment(selectedEquipment.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover Equipamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* OS History per Asset */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5" /> Histórico Técnico de OS ({getEquipmentMaintenanceHistory(selectedEquipment.id).length})
                        </h5>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto">
                          {getEquipmentMaintenanceHistory(selectedEquipment.id).map(os => (
                            <div key={os.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-sky-600">{os.id}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{os.dataEmissao}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">"{os.description}"</p>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <span className={`text-[9px] font-bold block ${
                                  os.status === "Concluída" ? "text-emerald-600" :
                                  os.status === "Cancelada" ? "text-red-500" :
                                  "text-amber-500"
                                }`}>
                                  {os.status}
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-800">{os.tipo}</span>
                              </div>
                            </div>
                          ))}

                          {getEquipmentMaintenanceHistory(selectedEquipment.id).length === 0 && (
                            <p className="text-center py-6 text-[11px] text-slate-400 italic">
                              Nenhuma OS realizada anteriormente neste ativo.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Cpu className="w-8 h-8 text-slate-300 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-500">Clique em um ativo</h4>
                      <p className="text-[10px] max-w-xs mx-auto">
                        Selecione um dos equipamentos vinculados ao cliente para auditar o histórico de manutenção e avaliar a saúde operacional do ativo.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="space-y-2">
              <Users className="w-16 h-16 text-emerald-200 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">Selecione um Cliente</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Selecione um cliente na lista lateral para visualizar suas informações corporativas, faturamento e gerenciar o nível hierárquico de equipamentos vinculados.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD CLIENT (Shared Form) */}
      <ClientFormModal
        open={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onCreated={(newClient) => {
          onAddClient(newClient);
          setSelectedClient(newClient);
          setSelectedEquipment(null);
        }}
      />

      {/* MODAL: ADD EQUIPMENT */}
      <AnimatePresence>
        {showAddEquipmentModal && selectedClient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-5 h-5 text-sky-600" /> Vincular Novo Equipamento
                </h3>
                <button onClick={() => setShowAddEquipmentModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mb-4 bg-sky-50 p-2.5 rounded-xl">
                O equipamento será vinculado hierarquicamente ao cliente: <strong className="text-sky-900">{selectedClient.name}</strong>
              </p>

              <form onSubmit={handleCreateEquipment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Ativo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ar Condicionado Split 12000 BTU"
                    value={newEqName}
                    onChange={(e) => setNewEqName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fabricante / Marca</label>
                    <input
                      type="text"
                      placeholder="Ex: Carrier, Schulz, Toyama"
                      value={newEqBrand}
                      onChange={(e) => setNewEqBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Modelo Comercial</label>
                    <input
                      type="text"
                      placeholder="Ex: TG15000, EcoSplit"
                      value={newEqModel}
                      onChange={(e) => setNewEqModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Número de Série (S/N)</label>
                    <input
                      type="text"
                      placeholder="Ex: SR-4431-XYZ"
                      value={newEqSerial}
                      onChange={(e) => setNewEqSerial(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Instalação</label>
                    <input
                      type="date"
                      value={newEqInstallDate}
                      onChange={(e) => setNewEqInstallDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEquipmentModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
                  >
                    Vincular Equipamento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
