/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardList, Users, Calendar, User, Home, 
  RotateCcw, CheckCircle, Bell, Shield, Info, LogOut, Menu, X
} from "lucide-react";

import { OS, Client, Equipment, Visit, Notification, UserProfile } from "./types";
import { 
  INITIAL_CLIENTS, INITIAL_EQUIPMENTS, INITIAL_ORDERS, 
  INITIAL_VISITS, INITIAL_NOTIFICATIONS 
} from "./data/mockData";

import Splash from "./components/Splash";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import OSManagement from "./components/OSManagement";
import ClientsManagement from "./components/ClientsManagement";
import Schedule from "./components/Schedule";
import ProfileManagement from "./components/ProfileManagement";
import BrandLogo from "./components/BrandLogo";

function readStored<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export default function App() {
  // 1. Entry States
  const [splashCompleted, setSplashCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem("os_splash_seen");
    return saved === "true";
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("os_logged_in");
    return saved === "true";
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return readStored("os_user_profile", {
      name: "Técnico Rodrigo",
      email: "projetosai197@gmail.com",
      role: "Engenheiro de Climatização Senior",
      company: "App-OS Solutions & Refrigeração",
      phone: "(11) 98765-4321",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
    });
  });

  // 2. Database States
  const [orders, setOrders] = useState<OS[]>(() => {
    return readStored("os_orders", INITIAL_ORDERS);
  });

  const [clients, setClients] = useState<Client[]>(() => {
    return readStored("os_clients", INITIAL_CLIENTS);
  });

  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    return readStored("os_equipments", INITIAL_EQUIPMENTS);
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    return readStored("os_visits", INITIAL_VISITS);
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return readStored("os_notifications", INITIAL_NOTIFICATIONS);
  });

  // 3. UI Navigation States
  const [activeTab, setActiveTab] = useState<"Home" | "OS" | "Clientes" | "Agenda" | "Perfil">("Home");
  const [preselectedOSFilter, setPreselectedOSFilter] = useState<string>("TODAS");
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // 4. Soft Delete Undo Snackbar State
  const [undoToast, setUndoToast] = useState<{
    message: string;
    actionType: "os" | "client" | "equipment" | "visit";
    targetId: string;
    timerId: any;
  } | null>(null);

  // Sync state modifications with Local Storage
  useEffect(() => {
    localStorage.setItem("os_splash_seen", String(splashCompleted));
  }, [splashCompleted]);

  useEffect(() => {
    localStorage.setItem("os_logged_in", String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("os_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("os_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("os_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("os_equipments", JSON.stringify(equipments));
  }, [equipments]);

  useEffect(() => {
    localStorage.setItem("os_visits", JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem("os_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Clean soft-deleted items older than 30 days (Simulated on mount)
  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const cleanOlderThan30Days = <T extends { deletedAt: string | null }>(list: T[]): T[] => {
      return list.filter(item => {
        if (!item.deletedAt) return true;
        const delDate = new Date(item.deletedAt);
        return delDate > thirtyDaysAgo;
      });
    };

    setOrders(prev => cleanOlderThan30Days(prev));
    setClients(prev => cleanOlderThan30Days(prev));
    setEquipments(prev => cleanOlderThan30Days(prev));
    setVisits(prev => cleanOlderThan30Days(prev));
  }, []);

  // Login handler
  const handleLoginComplete = (email: string, name: string) => {
    setUserProfile(prev => ({ ...prev, email, name }));
    setIsLoggedIn(true);
    // Push welcome notice
    const welcomeNotif: Notification = {
      id: `NOT-${Date.now()}`,
      title: "Sessão Técnica Iniciada",
      message: `Bem-vindo de volta, ${name}. Suas ordens de serviço sincronizadas.`,
      time: "Agora mesmo",
      read: false
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("os_logged_in");
  };

  // 5. Database Manipulations (CRUD & Soft Delete)
  const addOrder = (newOS: OS) => {
    setOrders(prev => [newOS, ...prev]);
    // Notify
    const notif: Notification = {
      id: `NOT-${Date.now()}`,
      title: "Nova OS Emitida",
      message: `Ordem ${newOS.id} criada para o cliente '${newOS.clientName}'.`,
      time: "Agora",
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const addClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
  };

  const addEquipment = (newEq: Equipment) => {
    setEquipments(prev => [newEq, ...prev]);
  };

  const addVisit = (newVisit: Visit) => {
    setVisits(prev => [newVisit, ...prev]);
  };

  const updateOrder = (updatedOS: OS) => {
    setOrders(prev => prev.map(o => o.id === updatedOS.id ? updatedOS : o));
  };

  const updateVisit = (updatedVisit: Visit) => {
    setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
  };

  // SOFT DELETIONS (move to trash bin and show toast)
  const deleteOrderSoft = (osId: string) => {
    const deletedTime = new Date().toISOString();
    setOrders(prev => prev.map(o => o.id === osId ? { ...o, deletedAt: deletedTime } : o));
    triggerUndoToast("Ordem de serviço movida para a lixeira.", "os", osId);
  };

  const deleteClientSoft = (clientId: string) => {
    const deletedTime = new Date().toISOString();
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, deletedAt: deletedTime } : c));
    triggerUndoToast("Cliente movido para a lixeira.", "client", clientId);
  };

  const deleteEquipmentSoft = (eqId: string) => {
    const deletedTime = new Date().toISOString();
    setEquipments(prev => prev.map(e => e.id === eqId ? { ...e, deletedAt: deletedTime } : e));
    triggerUndoToast("Equipamento movido para a lixeira.", "equipment", eqId);
  };

  const deleteVisitSoft = (visitId: string) => {
    const deletedTime = new Date().toISOString();
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, deletedAt: deletedTime } : v));
    triggerUndoToast("Visita da agenda movida para a lixeira.", "visit", visitId);
  };

  // RESTORATIONS FROM TRASH BIN
  const restoreOrder = (osId: string) => {
    setOrders(prev => prev.map(o => o.id === osId ? { ...o, deletedAt: null } : o));
  };

  const restoreClient = (clientId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, deletedAt: null } : c));
  };

  const restoreEquipment = (eqId: string) => {
    setEquipments(prev => prev.map(e => e.id === eqId ? { ...e, deletedAt: null } : e));
  };

  const restoreVisit = (visitId: string) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, deletedAt: null } : v));
  };

  // HARD PERMANENT DELETIONS
  const permanentDeleteOrder = (osId: string) => {
    setOrders(prev => prev.filter(o => o.id !== osId));
  };

  const permanentDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const permanentDeleteEquipment = (eqId: string) => {
    setEquipments(prev => prev.filter(e => e.id !== eqId));
  };

  const permanentDeleteVisit = (visitId: string) => {
    setVisits(prev => prev.filter(v => v.id !== visitId));
  };

  // Toast Control
  const triggerUndoToast = (message: string, type: "os" | "client" | "equipment" | "visit", targetId: string) => {
    if (undoToast?.timerId) {
      clearTimeout(undoToast.timerId);
    }

    const timer = setTimeout(() => {
      setUndoToast(null);
    }, 6000); // 6 seconds to undo

    setUndoToast({
      message,
      actionType: type,
      targetId,
      timerId: timer
    });
  };

  const handleUndoAction = () => {
    if (!undoToast) return;
    
    if (undoToast.actionType === "os") {
      restoreOrder(undoToast.targetId);
    } else if (undoToast.actionType === "client") {
      restoreClient(undoToast.targetId);
    } else if (undoToast.actionType === "equipment") {
      restoreEquipment(undoToast.targetId);
    } else if (undoToast.actionType === "visit") {
      restoreVisit(undoToast.targetId);
    }

    clearTimeout(undoToast.timerId);
    setUndoToast(null);
  };

  // 6. Navigation Bridges
  const handleNavigateToOSWithFilter = (status: string) => {
    setPreselectedOSFilter(status);
    setSelectedOSId(null);
    setActiveTab("OS");
  };

  const handleSelectOSFromSearch = (osId: string) => {
    setSelectedOSId(osId);
    setPreselectedOSFilter("TODAS");
    setActiveTab("OS");
  };

  const handleSelectClientFromSearch = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab("Clientes");
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Guard rails
  if (!splashCompleted) {
    return <Splash onComplete={() => setSplashCompleted(true)} />;
  }

  if (!isLoggedIn) {
    return <Auth onLogin={handleLoginComplete} initialEmail={userProfile.email} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-16 md:pb-0 font-sans text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900">
      
      {/* SIDEBAR NAVIGATION (Desktop size >= md) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0 h-screen sticky top-0 p-5 justify-between">
        <div className="space-y-6">
          <BrandLogo />

          <nav className="space-y-1">
            {[
              { name: "Home", tab: "Home", icon: <Home className="w-4 h-4" /> },
              { name: "Ordens de Serviço", tab: "OS", icon: <ClipboardList className="w-4 h-4" /> },
              { name: "Clientes e Ativos", tab: "Clientes", icon: <Users className="w-4 h-4" /> },
              { name: "Agenda de Campo", tab: "Agenda", icon: <Calendar className="w-4 h-4" /> },
              { name: "Perfil & Configs", tab: "Perfil", icon: <User className="w-4 h-4" /> }
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab as any);
                  if (item.tab !== "OS") setSelectedOSId(null);
                  if (item.tab !== "Clientes") setSelectedClientId(null);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                  activeTab === item.tab
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* User Card inside Sidebar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[140px] truncate">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-900 font-bold shrink-0">
              {userProfile.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white leading-tight truncate">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 leading-tight truncate">{userProfile.company}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* TOP HEADER (Mobile size) */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
          <BrandLogo compact />

        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <span className="truncate max-w-[110px] font-semibold text-white">{userProfile.name}</span>
          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-red-400"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT WINDOW */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === "Home" && (
            <Dashboard
              orders={orders}
              clients={clients}
              equipments={equipments}
              onNavigateToOSWithFilter={handleNavigateToOSWithFilter}
              onSelectClient={handleSelectClientFromSearch}
              onSelectOS={handleSelectOSFromSearch}
              userName={userProfile.name}
            />
          )}

          {activeTab === "OS" && (
            <OSManagement
              orders={orders}
              clients={clients}
              equipments={equipments}
              onAddOS={addOrder}
              onAddClient={addClient}
              onUpdateOS={updateOrder}
              onDeleteOS={deleteOrderSoft}
              preselectedFilter={preselectedOSFilter}
              selectedOSId={selectedOSId}
              onClearSelectedOS={() => setSelectedOSId(null)}
            />
          )}

          {activeTab === "Clientes" && (
            <ClientsManagement
              clients={clients}
              equipments={equipments}
              orders={orders}
              onAddClient={addClient}
              onAddEquipment={addEquipment}
              onDeleteClient={deleteClientSoft}
              onDeleteEquipment={deleteEquipmentSoft}
              selectedClientIdFromOutside={selectedClientId}
              onClearSelectedClient={() => setSelectedClientId(null)}
            />
          )}

          {activeTab === "Agenda" && (
            <Schedule
              visits={visits}
              clients={clients}
              onAddVisit={addVisit}
              onUpdateVisit={updateVisit}
              onDeleteVisit={deleteVisitSoft}
            />
          )}

          {activeTab === "Perfil" && (
            <ProfileManagement
              orders={orders}
              clients={clients}
              equipments={equipments}
              visits={visits}
              notifications={notifications}
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              onRestoreOS={restoreOrder}
              onRestoreClient={restoreClient}
              onRestoreEquipment={restoreEquipment}
              onRestoreVisit={restoreVisit}
              onPermanentDeleteOS={permanentDeleteOrder}
              onPermanentDeleteClient={permanentDeleteClient}
              onPermanentDeleteEquipment={permanentDeleteEquipment}
              onPermanentDeleteVisit={permanentDeleteVisit}
              onMarkNotificationRead={handleMarkNotificationRead}
              onClearNotifications={handleClearNotifications}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR (Mobile size < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-400 flex justify-around py-1.5 z-40">
        {[
          { name: "Início", tab: "Home", icon: <Home className="w-5 h-5" /> },
          { name: "OS", tab: "OS", icon: <ClipboardList className="w-5 h-5" /> },
          { name: "Clientes", tab: "Clientes", icon: <Users className="w-5 h-5" /> },
          { name: "Agenda", tab: "Agenda", icon: <Calendar className="w-5 h-5" /> },
          { name: "Perfil", tab: "Perfil", icon: <User className="w-5 h-5" /> }
        ].map(item => (
          <button
            key={item.tab}
            onClick={() => {
              setActiveTab(item.tab as any);
              if (item.tab !== "OS") setSelectedOSId(null);
              if (item.tab !== "Clientes") setSelectedClientId(null);
            }}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 w-14 cursor-pointer transition-colors ${
              activeTab === item.tab ? "text-sky-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* GLOBAL UNDO SNACKBAR TOAST */}
      <AnimatePresence>
        {undoToast && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                <p className="font-semibold text-slate-100">{undoToast.message}</p>
              </div>
              <button
                onClick={handleUndoAction}
                className="text-sky-400 hover:text-sky-300 font-extrabold flex items-center gap-1 shrink-0 uppercase tracking-wider text-[11px] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Desfazer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
