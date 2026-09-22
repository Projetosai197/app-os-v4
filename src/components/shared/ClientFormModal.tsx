/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserPlus, X, Plus, Trash2 } from "lucide-react";
import { Client, ContatoAdicional } from "../../types";

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
}

function emptyContato(): ContatoAdicional {
  return {
    id: `CONT-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    nome: "",
    telefone: "",
    celular: "",
    email: "",
    cargo: "",
    receberNotificacoes: true
  };
}

export default function ClientFormModal({ open, onClose, onCreated }: ClientFormModalProps) {
  const [name, setName] = useState("");
  const [document, setDocumentValue] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [outrosContatos, setOutrosContatos] = useState<ContatoAdicional[]>([]);

  const resetForm = () => {
    setName("");
    setDocumentValue("");
    setPhone("");
    setEmail("");
    setCep("");
    setEndereco("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setObservacoes("");
    setOutrosContatos([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newClient: Client = {
      id: `CLI-${Date.now()}`,
      name,
      email: email || "contato@empresa.com",
      phone: phone || "(11) 99999-9999",
      document: document || "00.000.000/0001-00",
      cep,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      observacoes,
      outrosContatos: outrosContatos.filter((c) => c.nome.trim() !== ""),
      deletedAt: null
    };

    onCreated(newClient);
    resetForm();
    onClose();
  };

  const addContato = () => setOutrosContatos((prev) => [...prev, emptyContato()]);
  const removeContato = (id: string) => setOutrosContatos((prev) => prev.filter((c) => c.id !== id));
  const updateContato = (id: string, patch: Partial<ContatoAdicional>) =>
    setOutrosContatos((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-emerald-600" /> Cadastrar Cliente
              </h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Razão Social / Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comercial Silva S.A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    placeholder="Ex: 00.000.000/0001-00"
                    value={document}
                    onChange={(e) => setDocumentValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98888-7777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Endereço estruturado */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CEP</label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bairro</label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Endereço</label>
                    <input
                      type="text"
                      placeholder="Rua / Av."
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Número</label>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observações</label>
                  <textarea
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Outros contatos */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Outros Contatos (recebem notificações)
                  </p>
                  <button
                    type="button"
                    onClick={addContato}
                    className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>

                {outrosContatos.map((contato) => (
                  <div key={contato.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => removeContato(contato.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Nome"
                        value={contato.nome}
                        onChange={(e) => updateContato(contato.id, { nome: e.target.value })}
                        className="bg-white border border-slate-200 text-xs p-2 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Cargo"
                        value={contato.cargo}
                        onChange={(e) => updateContato(contato.id, { cargo: e.target.value })}
                        className="bg-white border border-slate-200 text-xs p-2 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Telefone"
                        value={contato.telefone}
                        onChange={(e) => updateContato(contato.id, { telefone: e.target.value })}
                        className="bg-white border border-slate-200 text-xs p-2 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Celular"
                        value={contato.celular}
                        onChange={(e) => updateContato(contato.id, { celular: e.target.value })}
                        className="bg-white border border-slate-200 text-xs p-2 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={contato.email}
                        onChange={(e) => updateContato(contato.id, { email: e.target.value })}
                        className="col-span-2 bg-white border border-slate-200 text-xs p-2 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                      <input
                        type="checkbox"
                        checked={contato.receberNotificacoes}
                        onChange={(e) => updateContato(contato.id, { receberNotificacoes: e.target.checked })}
                      />
                      Receber notificações automáticas
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer"
                >
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
