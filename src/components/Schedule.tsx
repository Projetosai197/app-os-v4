/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, Clock, MapPin, ChevronLeft, ChevronRight, 
  Plus, Check, X, ClipboardList, Info, Filter, Trash2
} from "lucide-react";
import { Visit, Client, VisitType, VisitStatus } from "../types";

interface ScheduleProps {
  visits: Visit[];
  clients: Client[];
  onAddVisit: (newVisit: Visit) => void;
  onUpdateVisit: (updatedVisit: Visit) => void;
  onDeleteVisit: (visitId: string) => void;
}

export default function Schedule({
  visits,
  clients,
  onAddVisit,
  onUpdateVisit,
  onDeleteVisit
}: ScheduleProps) {
  
  // State for Calendar Navigation
  // The system date is July 2026 (July 13, 2026 is Monday)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 6 is July (0-indexed)
  const [selectedDate, setSelectedDate] = useState("2026-07-13"); // July 13, 2026

  // UI Filters
  const [filterType, setFilterType] = useState<string>("TODOS");

  // Modal State
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);

  // New Visit Form States
  const [newVisitClientId, setNewVisitClientId] = useState("");
  const [newVisitTitle, setNewVisitTitle] = useState("");
  const [newVisitDate, setNewVisitDate] = useState("2026-07-13");
  const [newVisitTime, setNewVisitTime] = useState("09:00");
  const [newVisitType, setNewVisitType] = useState<VisitType>("Manutenção");
  const [newVisitNotes, setNewVisitNotes] = useState("");

  const activeVisits = visits.filter(v => !v.deletedAt);
  const activeClients = clients.filter(c => !c.deletedAt);

  // Calendar calculations
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    setSelectedDate(`${currentYear}-${formattedMonth}-${formattedDay}`);
  };

  // Filtered visits for the selected date
  const dayVisits = activeVisits.filter(v => {
    const matchesDate = v.date === selectedDate;
    const matchesType = filterType === "TODOS" || v.type === filterType;
    return matchesDate && matchesType;
  });

  // Check if a day has any visits (for dots in calendar)
  const hasVisitsOnDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return activeVisits.some(v => v.date === dateStr);
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitClientId || !newVisitTitle) return;

    const client = activeClients.find(c => c.id === newVisitClientId);

    const newVisit: Visit = {
      id: `VIS-${Date.now()}`,
      orderId: null,
      clientId: newVisitClientId,
      clientName: client?.name || "Cliente Desconhecido",
      title: newVisitTitle,
      date: newVisitDate,
      time: newVisitTime,
      type: newVisitType,
      notes: newVisitNotes,
      status: "Pendente",
      deletedAt: null
    };

    onAddVisit(newVisit);
    setShowAddVisitModal(false);

    // Reset Form
    setNewVisitClientId("");
    setNewVisitTitle("");
    setNewVisitNotes("");
  };

  const handleToggleStatus = (visit: Visit, newStatus: VisitStatus) => {
    const updated = { ...visit, status: newStatus };
    onUpdateVisit(updated);
  };

  const handleDelete = (id: string) => {
    onDeleteVisit(id);
  };

  // Render Calendar Grid
  const renderDays = () => {
    const dayElements = [];
    
    // Empty blocks before 1st day of month
    for (let i = 0; i < firstDayIndex; i++) {
      dayElements.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedMonth = String(currentMonth + 1).padStart(2, "0");
      const formattedDay = String(day).padStart(2, "0");
      const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === "2026-07-13"; // Hardcoded mockup current day
      const hasVisits = hasVisitsOnDay(day);

      dayElements.push(
        <button
          key={`day-${day}`}
          onClick={() => selectDay(day)}
          className={`h-10 w-full rounded-xl text-xs font-bold relative flex flex-col items-center justify-center transition-all cursor-pointer ${
            isSelected 
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/10 scale-105" 
              : isToday
                ? "bg-sky-50 border border-sky-200 text-sky-700"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100"
          }`}
        >
          <span>{day}</span>
          {hasVisits && (
            <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
              isSelected ? "bg-white" : "bg-sky-500 animate-pulse"
            }`} />
          )}
        </button>
      );
    }

    return dayElements;
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-600" />
          Agenda de Serviços
        </h1>
        
        <button
          onClick={() => {
            setNewVisitDate(selectedDate);
            setShowAddVisitModal(true);
          }}
          className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/10 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> Agendar Atendimento
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Calendar Left View */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm lg:col-span-5 space-y-4">
          
          {/* Month Navigator */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-slate-800">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          {/* Grid Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {renderDays()}
          </div>

          {/* Type filters */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar Tipo de Atendimento
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["TODOS", "Instalação", "Manutenção", "Visita Técnica", "Orçamento"].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    filterType === type 
                      ? "bg-sky-600 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {type === "TODOS" ? "Todos" : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Daily schedule Right View */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Cronograma de Atividades</p>
              <h3 className="text-sm font-black text-slate-800 mt-0.5">
                {selectedDate === "2026-07-13" ? "Hoje, " : ""}
                {selectedDate.split("-").reverse().join("/")}
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">
              {dayVisits.length} Atendimento{dayVisits.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {dayVisits.map(v => (
              <div 
                key={v.id} 
                className="p-4 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl space-y-3 transition-colors relative overflow-hidden"
              >
                {/* Status Indicator strip */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  v.status === "Realizada" ? "bg-emerald-500" :
                  v.status === "Cancelada" ? "bg-red-500" :
                  "bg-amber-400"
                }`}></div>

                <div className="flex justify-between items-start pl-1.5">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        v.type === "Instalação" ? "bg-blue-100 text-blue-800" :
                        v.type === "Manutenção" ? "bg-orange-100 text-orange-800" :
                        v.type === "Visita Técnica" ? "bg-sky-100 text-sky-800" :
                        "bg-purple-100 text-purple-800"
                      }`}>
                        {v.type}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {v.time}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 mt-2 truncate">{v.title}</h4>
                    <p className="text-xs text-sky-950 font-bold truncate mt-0.5">{v.clientName}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 bg-transparent rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Excluir Visita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {v.notes && (
                  <p className="text-[11px] text-slate-500 pl-1.5 leading-relaxed bg-white p-2 border border-slate-100 rounded-xl">
                    <strong className="text-slate-700">Obs:</strong> {v.notes}
                  </p>
                )}

                {/* Status action buttons */}
                <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center pl-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Status: <strong className={
                      v.status === "Realizada" ? "text-emerald-600" :
                      v.status === "Cancelada" ? "text-red-500" :
                      "text-amber-600"
                    }>{v.status}</strong>
                  </span>

                  <div className="flex gap-1.5">
                    {v.status !== "Realizada" && (
                      <button
                        onClick={() => handleToggleStatus(v, "Realizada")}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold rounded-lg border border-emerald-100 transition-colors cursor-pointer flex items-center gap-0.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Concluir
                      </button>
                    )}
                    
                    {v.status !== "Cancelada" && (
                      <button
                        onClick={() => handleToggleStatus(v, "Cancelada")}
                        className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold rounded-lg border border-red-100 transition-colors cursor-pointer flex items-center gap-0.5"
                      >
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    )}

                    {v.status !== "Pendente" && (
                      <button
                        onClick={() => handleToggleStatus(v, "Pendente")}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {dayVisits.length === 0 && (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Info className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Nenhuma visita agendada para este dia.</p>
                <p className="text-[10px]">Aproveite para reavaliar equipamentos ou preencher relatórios pendentes!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: ADD ATENDIMENTO */}
      <AnimatePresence>
        {showAddVisitModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-sky-600" /> Agendar Atendimento
                </h3>
                <button onClick={() => setShowAddVisitModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVisit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente *</label>
                  <select
                    required
                    value={newVisitClientId}
                    onChange={(e) => setNewVisitClientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Selecione o Cliente</option>
                    {activeClients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título do Atendimento / Descrição Breve *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Instalação Ar Split 24000 BTU"
                    value={newVisitTitle}
                    onChange={(e) => setNewVisitTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      value={newVisitDate}
                      onChange={(e) => setNewVisitDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Horário *</label>
                    <input
                      type="time"
                      required
                      value={newVisitTime}
                      onChange={(e) => setNewVisitTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Serviço</label>
                  <select
                    value={newVisitType}
                    onChange={(e) => setNewVisitType(e.target.value as VisitType)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    {["Instalação", "Manutenção", "Visita Técnica", "Orçamento"].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notas Internas de Campo</label>
                  <textarea
                    rows={2}
                    placeholder="Ferramentas a levar, responsável local, observações de acesso..."
                    value={newVisitNotes}
                    onChange={(e) => setNewVisitNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddVisitModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
                  >
                    Agendar Atendimento
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
