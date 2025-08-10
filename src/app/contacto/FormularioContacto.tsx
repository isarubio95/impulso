"use client"

import { useState } from "react";
import CTA from "@/components/CTA"
import { FiSend } from "react-icons/fi";

export default function FormularioContacto() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Formulario enviado:\n${nombre} - ${email} - ${telefono}\n${mensaje}`);
    setNombre('');
    setEmail('');
    setTelefono('');
    setMensaje('');
  };
    return (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-md shadow-sm p-6 space-y-4"
        >
          <h2 className="text-center text-md text-stone-800 mb-6">
            Formulario de contacto
          </h2>

          <label className="block">
            <span className="block text-sm text-stone-700 mb-1">Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe aquí tu nombre"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-stone-700 mb-1">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-stone-700 mb-1">Teléfono (opcional)</span>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-stone-700 mb-1">Mensaje</span>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Introduce tu mensaje"
              rows={4}
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
            />
          </label>

          <div className="flex justify-center">
            <CTA texto="Enviar" icono={<FiSend className="w-4 h-4" />} />
          </div>
        </form>
    )
}