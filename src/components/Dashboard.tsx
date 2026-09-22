/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ClipboardList, Calendar, Clock, CheckCircle, Users, 
  Search, ArrowRight, UserCheck, AlertTriangle, AlertCircle, Eye
} from "lucide-react";
import { OS, Client, Equipment } from "../types";
import { formatClientAddress } from "../lib/format";

interface DashboardProps {
  orders: OS[];
  clients: Client[];
  equipments: Equipment[];
  onNavigateToOSWithFilter: (statusFilter: string) => void;
  onSelectClient: (clientId: string) => void;
  onSelectOS: (osId: string) => void;
  userName: string;
}

export default function Dashboard({
  orders,
  clients,
  equipments,
  onNavigateToOSWithFilter,
  onSelectClient,
  onSelectOS,
  userName
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out soft deleted records
  const activeOrders = orders.filter(o => !o.deletedAt);
  const activeClients = clients.filter(c => !c.deletedAt);
  const activeEquipments = equipments.filter(eq => !eq.deletedAt);

  // Metrics calculating
  const inProgressCount = activeOrders.filter(o => o.status === "Em andamento").length;
  const scheduledCount = activeOrders.filter(o => o.status === "Agendada").length;
  const pendingCount = activeOrders.filter(o => o.status === "Aguardando peça" || o.status === "Rascunho").length;
  const completedCount = activeOrders.filter(o => o.status === "Concluída").length;
  const activeClientsCount = activeClients.length;

  // Global search implementation
  // Searching through OS Number, Client, Phone, Equipment Name, Address
  const getSearchResults = () => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();

    const matchedOS = activeOrders.filter(o => 
      o.id.toLowerCase().includes(query) ||
      o.clientName.toLowerCase().includes(query) ||
      (o.equipmentName && o.equipmentName.toLowerCase().includes(query)) ||
      o.description.toLowerCase().includes(query) ||
      o.technician.toLowerCase().includes(query)
    );

    const matchedClients = activeClients.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      formatClientAddress(c).toLowerCase().includes(query) ||
      c.document.includes(query)
    );

    const matchedEquipments = activeEquipments.filter(eq => 
      eq.name.toLowerCase().includes(query) ||
      eq.brand.toLowerCase().includes(query) ||
      eq.model.toLowerCase().includes(query) ||
      eq.serialNumber.toLowerCase().includes(query)
    );

    return {
      orders: matchedOS,
      clients: matchedClients,
      equipments: matchedEquipments
    };
  };

  const searchResults = getSearchResults();
  const hasResults = searchResults && (
    searchResults.orders.length > 0 || 
    searchResults.clients.length > 0 || 
    searchResults.equipments.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-sky-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <p className="text-sky-200 text-sm font-semibold tracking-wider uppercase">Painel de Controle Técnico</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Olá, {userName}!</h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 max-w-xl">
            Bem-vindo ao seu painel operacional de campo. Visualize e filtre ordens, acompanhe chamados e acesse o histórico instantaneamente.
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Busca Global unificada (Nº da OS, cliente, telefone, equipamento, endereço)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 text-xs font-semibold bg-slate-200/60 px-2 py-1 rounded-md"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Global Search Dropdown Results */}
        {searchQuery.trim() !== "" && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 max-h-[420px] overflow-y-auto p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Resultados da Busca Global
            </h3>

            {!hasResults ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium">Nenhum registro correspondente encontrado</p>
                <p className="text-xs mt-1">Tente pesquisar com outros termos ou números.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Orders Matches */}
                {searchResults.orders.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-sky-600 mb-2">Ordens de Serviço ({searchResults.orders.length})</h4>
                    <div className="space-y-2">
                      {searchResults.orders.map(os => (
                        <div 
                          key={os.id}
                          onClick={() => {
                            setSearchQuery("");
                            onSelectOS(os.id);
                          }}
                          className="p-3 bg-slate-50 hover:bg-sky-50/60 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-700">{os.id}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                os.status === "Em andamento" ? "bg-amber-100 text-amber-800" :
                                os.status === "Concluída" ? "bg-emerald-100 text-emerald-800" :
                                os.status === "Aguardando peça" ? "bg-purple-100 text-purple-800" :
                                "bg-slate-100 text-slate-700"
                              }`}>
                                {os.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 truncate mt-1">{os.clientName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{os.equipmentName || "Sem equipamento vinculado"}</p>
                          </div>
                          <Eye className="w-4 h-4 text-sky-500 shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clients Matches */}
                {searchResults.clients.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 mb-2">Clientes ({searchResults.clients.length})</h4>
                    <div className="space-y-2">
                      {searchResults.clients.map(c => (
                        <div 
                          key={c.id}
                          onClick={() => {
                            setSearchQuery("");
                            onSelectClient(c.id);
                          }}
                          className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{c.phone} • {formatClientAddress(c)}</p>
                          </div>
                          <Eye className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipments Matches */}
                {searchResults.equipments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-blue-600 mb-2">Equipamentos ({searchResults.equipments.length})</h4>
                    <div className="space-y-2">
                      {searchResults.equipments.map(eq => {
                        const client = activeClients.find(c => c.id === eq.clientId);
                        return (
                          <div 
                            key={eq.id}
                            onClick={() => {
                              setSearchQuery("");
                              if (client) onSelectClient(client.id);
                            }}
                            className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{eq.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">S/N: {eq.serialNumber} • Cliente: {client?.name || "Desconhecido"}</p>
                            </div>
                            <Eye className="w-4 h-4 text-blue-500 shrink-0 ml-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Cards Grid (Click to filter OS) */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resumo Operacional (Clique para filtrar)</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Card: Em Andamento */}
          <div 
            onClick={() => onNavigateToOSWithFilter("Em andamento")}
            className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-md cursor-pointer transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div className="flex justify-between items-start">
              <span className="p-2 bg-amber-50 rounded-xl text-amber-500">
                <Clock className="w-5 h-5" />
              </span>
              <span className="text-2xl font-black text-slate-800">{inProgressCount}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                Em Andamento
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Visitas em execução</p>
            </div>
          </div>

          {/* Card: Agendadas */}
          <div 
            onClick={() => onNavigateToOSWithFilter("Agendada")}
            className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start">
              <span className="p-2 bg-blue-50 rounded-xl text-blue-500">
                <Calendar className="w-5 h-5" />
              </span>
              <span className="text-2xl font-black text-slate-800">{scheduledCount}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Agendadas
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Visitas programadas</p>
            </div>
          </div>

          {/* Card: Pendentes */}
          <div 
            onClick={() => onNavigateToOSWithFilter("Aguardando peça")}
            className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-md cursor-pointer transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            <div className="flex justify-between items-start">
              <span className="p-2 bg-purple-50 rounded-xl text-purple-500">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <span className="text-2xl font-black text-slate-800">{pendingCount}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                Pendentes
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Aguardando peças</p>
            </div>
          </div>

          {/* Card: Concluídas */}
          <div 
            onClick={() => onNavigateToOSWithFilter("Concluída")}
            className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md cursor-pointer transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-50"></div>
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-start">
              <span className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                <CheckCircle className="w-5 h-5" />
              </span>
              <span className="text-2xl font-black text-slate-800">{completedCount}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                Concluídas
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Serviços faturados</p>
            </div>
          </div>

          {/* Card: Clientes Ativos */}
          <div 
            onClick={() => onNavigateToOSWithFilter("TODAS")}
            className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md cursor-pointer transition-all duration-300 group col-span-2 md:col-span-1 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
            <div className="flex justify-between items-start">
              <span className="p-2 bg-sky-50 rounded-xl text-sky-500">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-2xl font-black text-slate-800">{activeClientsCount}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-sky-600 transition-colors">
                Clientes Ativos
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Base cadastrada</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Pending Schedules & High Priority Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* High Priority Work Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">OS de Alta Prioridade</h3>
              <p className="text-xs text-slate-500">Chamados técnicos que requerem atenção urgente</p>
            </div>
            <button 
              onClick={() => onNavigateToOSWithFilter("TODAS")}
              className="text-sky-600 hover:text-sky-800 text-xs font-bold flex items-center gap-1 hover:underline"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeOrders
              .filter(o => o.priority === "Alta" || o.priority === "Crítica")
              .slice(0, 4)
              .map(os => (
                <div 
                  key={os.id}
                  onClick={() => onSelectOS(os.id)}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{os.id}</span>
                      <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                        {os.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{os.clientName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{os.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">{os.tipo}</span>
                    <span className="text-[10px] text-sky-600 font-semibold">{os.status}</span>
                  </div>
                </div>
              ))}
            {activeOrders.filter(o => o.priority === "Alta" || o.priority === "Crítica").length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <UserCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Nenhuma emergência pendente!</p>
                <p className="text-xs mt-1 text-slate-400">Tudo em dia com as prioridades críticas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Operational Flow Quick Guide */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Rotina de Atendimento</h3>
            <p className="text-xs text-slate-500 mb-4">Fluxo padrão recomendado para garantir a qualidade de entrega</p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-extrabold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Inicie na Agenda</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Visualize as visitas marcadas para hoje e planeje seus trajetos.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Abra a OS no Local</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Insira fotos do equipamento antes do início do conserto para resguardar o serviço.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Assinatura e Conclusão</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Colete a assinatura digital do responsável diretamente na tela, gere o PDF e compartilhe.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-sky-50/50 rounded-xl border border-sky-100/60 flex items-center gap-3">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-bold">Recurso de Segurança Ativado</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Soft Delete garante recuperação imediata na lixeira caso apague sem querer.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
