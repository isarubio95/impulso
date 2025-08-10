'use client';

import { useMemo, useState } from 'react';
import CTA from '@/components/CTA';

type Step = 1 | 2 | 3;

const SLOT_MIN = 30;
const MORNING = { start: 9, end: 14 };      // 09:00–14:00
const AFTERNOON = { start: 16.5, end: 20 }; // 16:30–20:00

function buildSlots(dateStr: string) {
  if (!dateStr) return [];
  const base = new Date(dateStr + 'T00:00:00');
  const slots: Date[] = [];

  const pushRange = (start: number, end: number) => {
    const d = new Date(base);
    d.setHours(Math.floor(start), (start % 1) * 60, 0, 0);
    while (d.getHours() + d.getMinutes() / 60 < end) {
      slots.push(new Date(d));
      d.setMinutes(d.getMinutes() + SLOT_MIN);
    }
  };

  pushRange(MORNING.start, MORNING.end);
  pushRange(AFTERNOON.start, AFTERNOON.end);
  return slots;
}

export default function CitasPage() {
  const [step, setStep] = useState<Step>(1);

  // Paso 1
  const [date, setDate] = useState('');
  const minDate = new Date().toISOString().slice(0, 10);
  const slots = useMemo(() => buildSlots(date), [date]);

  // Paso 2
    const [selectedISO, setSelectedISO] = useState('');
    const now = new Date();
    const isToday = !!date && new Date().toISOString().slice(0, 10) === date; // boolean

  // Paso 3
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const timeLabel = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const selectedTimeLabel = selectedISO ? timeLabel(new Date(selectedISO)) : '';

  const canNext1 = !!date;
  const canNext2 = !!selectedISO;
  const canConfirm =
    name.trim().length > 1 && phone.trim().length >= 6 && !!selectedISO;

  const reset = () => {
    setStep(1);
    setDate('');
    setSelectedISO('');
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Título */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-2xl font-semibold text-stone-800 inline-block">
          Citas
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Reserva tu próxima cita en tres pasos: elige día, hora y añade tus datos.
        </p>
        <p className="text-sm text-stone-600">
          Todas nuestras reservas están sujetas a <strong>confirmación</strong>.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Stepper */}
        <ol className="grid md:grid-cols-3 gap-4">
          {[
            { n: 1, t: 'Selecciona la fecha' },
            { n: 2, t: 'Elige la hora' },
            { n: 3, t: 'Introduce tus datos' },
          ].map(({ n, t }) => (
            <li
              key={n}
              className={`p-4 rounded-md border bg-white transition
                ${step === n ? 'border-rose-500 shadow-sm' : 'border-stone-200'}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                    ${step >= (n as Step) ? 'bg-rose-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                  aria-current={step === n ? 'step' : undefined}
                >
                  {n}
                </span>
                <p className="font-medium text-stone-700">{t}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Paso 1: Fecha */}
        {step === 1 && (
          <div className="space-y-6 bg-white mx-auto w-full flex flex-col justify-center items-center p-6 rounded-md shadow-sm border border-stone-200">
            <div className='flex flex-col gap-5'>
                <label className="block">
                <span className="block text-sm font-medium text-stone-700 mb-2">
                    Fecha
                </span>
                <input
                    type="date"
                    className="w-full md:w-60 rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
                    value={date}
                    min={minDate}
                    onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedISO('');
                    }}
                />
                </label>
                
                <div className='flex'>
                    <CTA
                        texto="Siguiente"
                        onClick={() => setStep(2)}
                        disabled={!canNext1}
                    />
                </div>
            </div>            
          </div>
        )}

        {/* Paso 2: Hora */}
        {step === 2 && (
          <div className="space-y-6 bg-white p-6 rounded-md shadow-sm border border-stone-200">
            <p className="text-sm text-stone-600">
              Fecha elegida: <strong>{date || '—'}</strong>
            </p>

            <div
              role="listbox"
              aria-label="Elige una hora"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {slots.map((d) => {
                const iso = d.toISOString();
                const isPast = isToday && d.getTime() <= now.getTime();               
                const active = selectedISO === iso;

                return (
                  <button
                    key={iso}
                    role="option"
                    aria-selected={active}
                    disabled={isPast}
                    onClick={() => setSelectedISO(iso)}
                    className={`rounded-md border px-3 py-2 text-sm text-stone-600 transition cursor-pointer
                      ${active ? 'border-rose-600 ring-2 ring-rose-200' : 'border-stone-300 hover:border-stone-500'}
                      ${isPast ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {timeLabel(d)}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-5">
              <a className='text-blue-700 text-sm cursor-pointer hover:underline' onClick={() => setStep(1)}>Atrás</a>
              <CTA
                texto="Siguiente"
                onClick={() => setStep(3)}
                disabled={!canNext2}
              />
            </div>
          </div>
        )}

        {/* Paso 3: Datos */}
        {step === 3 && (
          <form
            className="space-y-6 bg-white p-6 rounded-md shadow-sm border border-stone-200"
            onSubmit={(e) => {
              e.preventDefault();
              alert(
                `UI: Cita (sin guardar) el ${date} a las ${selectedTimeLabel}\nNombre: ${name}\nTel: ${phone}`
              );
              reset();
            }}
          >
            <p className="text-sm text-stone-600">
              Cita: <strong>{date}</strong> a las{' '}
              <strong>{selectedTimeLabel}</strong>
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-stone-700 mb-1">
                  Nombre y apellidos
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
                  placeholder="Tu nombre"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-stone-700 mb-1">
                  Teléfono
                </span>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
                  placeholder="600 000 000"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-stone-700 mb-1">
                  Email (opcional)
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
                  placeholder="tu@correo.com"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-stone-700 mb-1">
                  Notas (opcional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white"
                  rows={3}
                  placeholder="Información relevante (alergias, embarazo, etc.)"
                />
              </label>
            </div>

            <div className="flex items-center gap-5">
              <a className='text-blue-700 text-sm cursor-pointer hover:underline' onClick={() => setStep(1)}>Atrás</a>
              <button
                type="submit"
                disabled={!canConfirm}
                className={`inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-600 text-white px-4 py-2 rounded-full shadow-sm text-sm font-bold cursor-pointer
                  ${!canConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Confirmar cita"
              >
                CONFIRMAR CITA ✓
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
