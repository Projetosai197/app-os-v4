/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client } from "../types";

export function formatClientAddress(client: Pick<Client, "endereco" | "numero" | "complemento" | "bairro" | "cidade" | "cep">): string {
  const parts: string[] = [];

  const rua = [client.endereco, client.numero].filter(Boolean).join(", ");
  if (rua) parts.push(client.complemento ? `${rua} - ${client.complemento}` : rua);
  if (client.bairro) parts.push(client.bairro);
  if (client.cidade) parts.push(client.cidade);

  const linha = parts.join(" - ");
  return client.cep ? [linha, `CEP ${client.cep}`].filter(Boolean).join(" • ") : linha || "Endereço não informado";
}

export function calcularTotalHoras(horarioInicio: string, horarioTermino: string): string {
  if (!horarioInicio || !horarioTermino) return "—";

  const [hi, mi] = horarioInicio.split(":").map(Number);
  const [hf, mf] = horarioTermino.split(":").map(Number);
  if ([hi, mi, hf, mf].some((n) => Number.isNaN(n))) return "—";

  let minutos = (hf * 60 + mf) - (hi * 60 + mi);
  if (minutos < 0) minutos += 24 * 60; // atravessou a meia-noite

  const horas = Math.floor(minutos / 60);
  const restoMin = minutos % 60;
  return `${horas}h${restoMin > 0 ? restoMin.toString().padStart(2, "0") : ""}`;
}
