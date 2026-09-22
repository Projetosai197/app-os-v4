/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, Mail, Lock, User, Briefcase, Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import BrandLogo from "./BrandLogo";

interface AuthProps {
  onLogin: (email: string, name: string) => void;
  initialEmail?: string;
}

type AuthMode = "login" | "register" | "recovery";

export default function Auth({ onLogin, initialEmail = "projetosai197@gmail.com" }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("123456");
  const [name, setName] = useState("Técnico Rodrigo");
  const [company, setCompany] = useState("App-OS Solutions");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email) {
      setError("Por favor, informe seu e-mail.");
      return;
    }

    if (mode === "login") {
      if (!password) {
        setError("Por favor, digite sua senha.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Successful mock login
        onLogin(email, name || "Técnico de Campo");
      }, 1000);
    } else if (mode === "register") {
      if (!name) {
        setError("Por favor, digite seu nome.");
        return;
      }
      if (!password || password.length < 6) {
        setError("A senha deve conter no mínimo 6 caracteres.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg("Conta criada com sucesso! Faça login para continuar.");
        setMode("login");
      }, 1200);
    } else if (mode === "recovery") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg("Link de redefinição de senha enviado para " + email);
        setTimeout(() => setMode("login"), 3000);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-sky-600 px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10">
            <ClipboardList className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <BrandLogo className="mb-3" />
            <h2 className="text-2xl font-bold tracking-tight text-center">
              {mode === "login" && "Acesse o App-OS"}
              {mode === "register" && "Crie sua conta"}
              {mode === "recovery" && "Recuperação de Senha"}
            </h2>
            <p className="text-sky-200 text-sm mt-1 text-center">
              {mode === "login" && "Gestão de Ordens de Serviço Versão 2.0"}
              {mode === "register" && "Insira suas credenciais técnicas"}
              {mode === "recovery" && "Insira seu e-mail cadastrado"}
            </p>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl border border-red-100 mb-4 font-medium flex gap-2 items-center"
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 text-emerald-700 text-sm p-3.5 rounded-xl border border-emerald-100 mb-4 font-medium flex gap-2 items-center"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rodrigo Melo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Empresa / Assistência Técnica
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ex: App-OS Solutions"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="seu-email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {mode !== "recovery" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Senha
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("recovery")}
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-medium shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : mode === "login" ? (
                "Entrar no Sistema"
              ) : mode === "register" ? (
                "Cadastrar Técnico"
              ) : (
                "Enviar Link de Recuperação"
              )}
            </button>
          </form>

          {/* Switch modes */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
            {mode === "login" ? (
              <p className="text-sm text-slate-500">
                Não possui conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-sky-600 font-bold hover:underline"
                >
                  Cadastre-se grátis
                </button>
              </p>
            ) : mode === "register" ? (
              <p className="text-sm text-slate-500">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sky-600 font-bold hover:underline"
                >
                  Faça seu login
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-sm text-sky-600 font-bold hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para o Login
              </button>
            )}

            {/* Quick Demo Assist */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full mt-2 text-center">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full inline-block mb-1">
                Acesso Demonstrativo
              </span>
              <p className="text-slate-500 text-xs">
                Esta é uma demonstração. Clique em <strong>Entrar</strong> para usar a base de teste pré-carregada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
