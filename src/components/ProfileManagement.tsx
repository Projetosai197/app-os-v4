/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Settings, Bell, Shield, Info, LogOut, 
  Trash2, RotateCcw, AlertTriangle, Check, Mail, Phone, Briefcase
} from "lucide-react";
import { OS, Client, Equipment, Visit, Notification, UserProfile } from "../types";
import BrandLogo from "./BrandLogo";

interface ProfileManagementProps {
  orders: OS[];
  clients: Client[];
  equipments: Equipment[];
  visits: Visit[];
  notifications: Notification[];
  userProfile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onRestoreOS: (osId: string) => void;
  onRestoreClient: (clientId: string) => void;
  onRestoreEquipment: (equipmentId: string) => void;
  onRestoreVisit: (visitId: string) => void;
  onPermanentDeleteOS: (osId: string) => void;
  onPermanentDeleteClient: (clientId: string) => void;
  onPermanentDeleteEquipment: (equipmentId: string) => void;
  onPermanentDeleteVisit: (visitId: string) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onClearNotifications: () => void;
  onLogout: () => void;
}

type ProfileSubTab = "conta" | "lixeira" | "notificacoes" | "sobre";

export default function ProfileManagement({
  orders,
  clients,
  equipments,
  visits,
  notifications,
  userProfile,
  onUpdateProfile,
  onRestoreOS,
  onRestoreClient,
  onRestoreEquipment,
  onRestoreVisit,
  onPermanentDeleteOS,
  onPermanentDeleteClient,
  onPermanentDeleteEquipment,
  onPermanentDeleteVisit,
  onMarkNotificationRead,
  onClearNotifications,
  onLogout
}: ProfileManagementProps) {
  
  // UI Tabs State
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>("conta");

  // Profile Edit fields
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [company, setCompany] = useState(userProfile.company);
  const [role, setRole] = useState(userProfile.role);
  const [successMsg, setSuccessMsg] = useState("");

  // Lists of deleted items
  const deletedOrders = orders.filter(o => o.deletedAt);
  const deletedClients = clients.filter(c => c.deletedAt);
  const deletedEquipments = equipments.filter(e => e.deletedAt);
  const deletedVisits = visits.filter(v => v.deletedAt);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      name,
      email,
      phone,
      company,
      role
    });
    setSuccessMsg("Informações da conta atualizadas com sucesso!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
        <User className="w-6 h-6 text-sky-600" />
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Perfil e Configurações
        </h1>
      </div>

      {/* Profile Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Profile Tabs selector */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1.5">
          
          <button
            onClick={() => setActiveSubTab("conta")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl text-left cursor-pointer transition-colors ${
              activeSubTab === "conta" 
                ? "bg-sky-50 text-sky-700" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            Minha Conta
          </button>

          <button
            onClick={() => setActiveSubTab("notificacoes")}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl text-left cursor-pointer transition-colors ${
              activeSubTab === "notificacoes" 
                ? "bg-sky-50 text-sky-700" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 shrink-0" />
              Notificações
            </span>
            {notifications.some(n => !n.read) && (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("lixeira")}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl text-left cursor-pointer transition-colors ${
              activeSubTab === "lixeira" 
                ? "bg-red-50 text-red-700" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 shrink-0" />
              Lixeira Inteligente
            </span>
            {(deletedOrders.length + deletedClients.length + deletedEquipments.length + deletedVisits.length) > 0 && (
              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-extrabold">
                {deletedOrders.length + deletedClients.length + deletedEquipments.length + deletedVisits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("sobre")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl text-left cursor-pointer transition-colors ${
              activeSubTab === "sobre" 
                ? "bg-sky-50 text-sky-700" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            Sobre o App
          </button>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl text-left cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sair da Conta
            </button>
          </div>

        </div>

        {/* Content Area panel */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          
          <AnimatePresence mode="wait">
            
            {/* SUB-TAB: ACCOUNT DETAILS */}
            {activeSubTab === "conta" && (
              <motion.div
                key="conta"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-sm font-black text-slate-800">Minha Conta Técnico</h2>
                  <p className="text-xs text-slate-500">Configure suas informações básicas profissionais e detalhes da sua empresa.</p>
                </div>

                {successMsg && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail Corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assistência Técnica</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cargo / Especialidade</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-5 rounded-xl text-xs cursor-pointer shadow-md transition-all hover:scale-[1.02]"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* SUB-TAB: NOTIFICATIONS CENTRE */}
            {activeSubTab === "notificacoes" && (
              <motion.div
                key="notifs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-black text-slate-800">Central de Avisos</h2>
                    <p className="text-xs text-slate-500">Notificações e relatórios de distribuição de chamados.</p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-bold hover:underline"
                    >
                      Limpar Todas
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3.5 rounded-xl border flex justify-between items-start cursor-pointer transition-colors ${
                        n.read 
                          ? "bg-slate-50/50 border-slate-100 text-slate-600" 
                          : "bg-sky-50/35 border-sky-100 text-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-sky-600"></span>}
                          <h4 className="text-xs font-extrabold">{n.title}</h4>
                        </div>
                        <p className="text-[11px] mt-1 text-slate-500">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{n.time}</span>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold">Nenhum aviso no momento</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SUB-TAB: SOFT DELETE INTELLIGENT TRASHBIN */}
            {activeSubTab === "lixeira" && (
              <motion.div
                key="lixeira"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                <div className="bg-red-50 p-4 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-extrabold text-red-800 uppercase tracking-wider">Gestão de Dados Segura (Soft Delete)</h3>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      Os registros removidos vão para esta lixeira antes de serem permanentemente eliminados. 
                      Você pode restaurá-los à listagem principal a qualquer momento.
                    </p>
                    <p className="text-[10px] text-red-600 font-bold mt-1.5 uppercase">
                      ⚠️ Limpeza definitiva após 30 dias ativada automaticamente.
                    </p>
                  </div>
                </div>

                {/* Subsections: Deleted OS, Clients, Equipments */}
                <div className="space-y-4">
                  
                  {/* Deleted OS List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                      Ordens de Serviço Deletadas ({deletedOrders.length})
                    </h4>

                    <div className="space-y-2">
                      {deletedOrders.map(os => (
                        <div key={os.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-600">{os.id}</span>
                            <span className="text-slate-800 font-bold ml-2">{os.clientName}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Excluído em: {os.deletedAt ? new Date(os.deletedAt).toLocaleDateString() : "Recente"}</p>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onRestoreOS(os.id)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 border border-sky-200 rounded-lg cursor-pointer transition-colors"
                              title="Restaurar OS"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPermanentDeleteOS(os.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer transition-colors"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {deletedOrders.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic pl-1">Nenhuma OS na lixeira.</p>
                      )}
                    </div>
                  </div>

                  {/* Deleted Clients List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                      Clientes Deletados ({deletedClients.length})
                    </h4>

                    <div className="space-y-2">
                      {deletedClients.map(c => (
                        <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-600">{c.id}</span>
                            <span className="text-slate-800 font-bold ml-2">{c.name}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Excluído em: {c.deletedAt ? new Date(c.deletedAt).toLocaleDateString() : "Recente"}</p>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onRestoreClient(c.id)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 border border-sky-200 rounded-lg cursor-pointer transition-colors"
                              title="Restaurar Cliente"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPermanentDeleteClient(c.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer transition-colors"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {deletedClients.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic pl-1">Nenhum cliente na lixeira.</p>
                      )}
                    </div>
                  </div>

                  {/* Deleted Equipments List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                      Equipamentos Deletados ({deletedEquipments.length})
                    </h4>

                    <div className="space-y-2">
                      {deletedEquipments.map(eq => (
                        <div key={eq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-800 font-bold">{eq.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">S/N: {eq.serialNumber}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Excluído em: {eq.deletedAt ? new Date(eq.deletedAt).toLocaleDateString() : "Recente"}</p>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onRestoreEquipment(eq.id)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 border border-sky-200 rounded-lg cursor-pointer transition-colors"
                              title="Restaurar Equipamento"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPermanentDeleteEquipment(eq.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer transition-colors"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {deletedEquipments.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic pl-1">Nenhum equipamento na lixeira.</p>
                      )}
                    </div>
                  </div>

                  {/* Deleted Visits List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                      Visitas da Agenda Deletadas ({deletedVisits.length})
                    </h4>

                    <div className="space-y-2">
                      {deletedVisits.map(v => (
                        <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-800 font-bold">{v.title}</span>
                            <span className="text-[10px] text-slate-500 ml-2">{v.date} às {v.time}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Excluído em: {v.deletedAt ? new Date(v.deletedAt).toLocaleDateString() : "Recente"}</p>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onRestoreVisit(v.id)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 border border-sky-200 rounded-lg cursor-pointer transition-colors"
                              title="Restaurar Visita"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPermanentDeleteVisit(v.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer transition-colors"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {deletedVisits.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic pl-1">Nenhuma visita na lixeira.</p>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* SUB-TAB: ABOUT APP INFORMATION */}
            {activeSubTab === "sobre" && (
              <motion.div
                key="sobre"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 text-slate-700"
              >
                <div>
                  <h2 className="text-sm font-black text-slate-800">Sobre o App-OS</h2>
                  <p className="text-xs text-slate-500">Informações de licença e arquitetura da plataforma técnica.</p>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-3">
                  <BrandLogo />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">App-OS (Versão 2.0)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Sistemas Operacionais para Equipes de Engenharia</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    O <strong>App-OS v2.0</strong> foi concebido especificamente para responder às demandas dinâmicas 
                    de técnicos de campo e gestores B2B de facilities, climatização, hidráulica e energia.
                  </p>
                  <p>
                    A interface unificada foi estruturada para mitigar gargalos operacionais: o botão de criação expressa 
                    FAB reduz cliques desnecessários e a lixeira inteligente impede a perda acidental de dados críticos 
                    sob sol forte ou conexão intermitente.
                  </p>
                  <div className="pt-4 border-t border-slate-100/80 flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>© 2026 App-OS Inc.</span>
                    <span>Termos de Serviço • Privacidade</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
