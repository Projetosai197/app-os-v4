/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, Shield, Calendar, Users, Cpu, ArrowRight } from "lucide-react";
import BrandLogo from "./BrandLogo";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const tutorialSteps = [
    {
      title: "Controle Operacional Total",
      description: "Gerencie suas Ordens de Serviço (OS) em tempo real, desde o rascunho inicial até a conclusão com assinatura do cliente.",
      icon: <ClipboardList className="w-16 h-16 text-sky-500" />,
      color: "from-sky-50 to-sky-100"
    },
    {
      title: "Rastreabilidade de Equipamentos",
      description: "Vincule equipamentos diretamente aos clientes e mantenha o histórico completo de todas as manutenções realizadas.",
      icon: <Cpu className="w-16 h-16 text-blue-500" />,
      color: "from-blue-50 to-blue-100"
    },
    {
      title: "Agenda e Campo Sincronizados",
      description: "Acompanhe suas visitas agendadas, manutenções preventivas e instalações em um calendário integrado e intuitivo.",
      icon: <Calendar className="w-16 h-16 text-emerald-500" />,
      color: "from-emerald-50 to-emerald-100"
    },
    {
      title: "Segurança de Dados B2B",
      description: "Exclua registros sem medo com o Soft Delete inteligente. Desfaça exclusões instantaneamente ou recupere na lixeira.",
      icon: <Shield className="w-16 h-16 text-purple-500" />,
      color: "from-purple-50 to-purple-100"
    }
  ];

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  if (loading) {
    return (
      <div id="splash-loading" className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <BrandLogo className="mb-4" />
          <p className="text-slate-400 text-sm mt-1">Versão 2.0</p>
        </motion.div>

        <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-12 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full bg-sky-500"
          />
        </div>
        <p className="text-slate-500 text-xs mt-3">Carregando módulo de campo...</p>
      </div>
    );
  }

  const currentTutorial = tutorialSteps[step];

  return (
    <div id="splash-tutorial" className="fixed inset-0 bg-white flex flex-col justify-between p-6 z-40">
      <div className="flex justify-between items-center pt-2">
        <span className="text-slate-800 font-bold text-lg flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
          App-OS 2.0
        </span>
        <button
          onClick={onComplete}
          className="text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors"
        >
          Pular
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto my-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center px-4"
          >
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${currentTutorial.color} flex items-center justify-center shadow-inner mb-8`}>
              {currentTutorial.icon}
            </div>

            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">
              {currentTutorial.title}
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              {currentTutorial.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-6 pb-6">
        <div className="flex gap-2 justify-center">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === step ? "w-8 bg-sky-600" : "w-2 bg-slate-200"
              }`}
              aria-label={`Ir para etapa ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full max-w-sm bg-sky-600 hover:bg-sky-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {step === tutorialSteps.length - 1 ? "Começar Agora" : "Continuar"}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
