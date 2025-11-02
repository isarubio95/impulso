'use client';

import { useMemo, useState, useEffect } from 'react';
import CTA from '../components/CTA';

type Step = 1 | 2 | 3;

// Definimos el tipo para las citas que recibimos de la API
type BookedAppointment = {
  startsAt: string;
};

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

  // --- ESTADOS ---
  // Paso 1
  const [date, setDate] = useState('');
  const minDate = new Date().toISOString().slice(0, 10);
  const slots = useMemo(() => buildSlots(date), [date]);
  
  // 💡 Nuevo estado para guardar las citas ya reservadas
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  // Paso 2
  const [selectedISO, setSelectedISO] = useState('');
  const now = new Date();
  const isToday = !!date && new Date().toISOString().slice(0, 10) === date;

  // Paso 3
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // 💡 Efecto para cargar las citas ocupadas cuando cambia la fecha
  useEffect(() => {
    if (!date) return;

    // Reseteamos las horas ocupadas al cambiar de día
    setBookedSlots(new Set()); 

    async function fetchBookedSlots() {
      try {
        const res = await fetch(`/api/appointments?day=${date}`);
        const { items } = (await res.json()) as { items: BookedAppointment[] };
        
        // Creamos un Set con las horas de inicio (en formato ISO) para una búsqueda rápida
        const bookedISOs = new Set(items.map(item => new Date(item.startsAt).toISOString()));
        setBookedSlots(bookedISOs);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    }

    fetchBookedSlots();
  }, [date]);


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

  async function reservarCita(payload: {
    fullName: string; phone: string; email?: string; notes?: string;
    startsAt: string; endsAt: string;
  }) {
    const r = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      throw new Error(data?.error ?? 'No se pudo crear la cita');
    }
    return r.json();
  }

  async function handleConfirm(
  e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) {
    e?.preventDefault();
    if (!canConfirm || !selectedISO) return;

    try {
      setLoading(true);
      const startsAt = new Date(selectedISO).toISOString();
      const endsAt = new Date(new Date(selectedISO).getTime() + SLOT_MIN * 60 * 1000).toISOString();

      await reservarCita({
        fullName: name,
        phone,
        email: email || undefined,
        notes: notes || undefined,
        startsAt,
        endsAt,
      });

      alert('¡Solicitud enviada! Te confirmaremos por teléfono o email.');
      reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ha ocurrido un error al reservar la cita.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

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
                <div>
                  <CTA
                    texto="Siguiente"
                    onClick={() => setStep(2)}
                    disabled={!canNext1}
                  />
                </div>                
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
                // 💡 Comprobamos si la hora está en nuestro Set de citas reservadas
                const isBooked = bookedSlots.has(iso);
                const active = selectedISO === iso;
                const isDisabled = isPast || isBooked;

                return (
                  <button
                    key={iso}
                    role="option"
                    aria-selected={active}
                    disabled={isDisabled}
                    onClick={() => setSelectedISO(iso)}
                    // 💡 Aplicamos clases condicionales
                    className={`rounded-md border px-3 py-2 text-sm transition
                      ${active ? 'border-rose-600 ring-2 ring-rose-200' : 'border-stone-300'}
                      ${isDisabled
                        ? 'bg-stone-100 text-stone-400 line-through cursor-not-allowed' // Estilo para deshabilitado/tachado
                        : 'text-stone-600 hover:border-stone-500 cursor-pointer'
                      }`}
                  >
                    {timeLabel(d)}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-5">
              <a className='text-blue-700 text-sm cursor-pointer hover:underline' onClick={() => setStep(1)}>Atrás</a>
              <div>
                <CTA
                texto="Siguiente"
                onClick={() => setStep(3)}
                disabled={!canNext2}
              />
              </div>          
            </div>
          </div>
        )}

        {/* Paso 3: Datos */}
        {step === 3 && (
          <form
            className="space-y-6 bg-white p-6 rounded-md shadow-sm border border-stone-200"
            onSubmit={handleConfirm}
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
              <a className='text-blue-700 text-sm cursor-pointer hover:underline' onClick={() => setStep(2)}>Atrás</a>
              <div>
                <CTA
                  texto={loading ? 'Enviando…' : 'Confirmar cita'}
                  onClick={handleConfirm}
                  disabled={!canConfirm || loading}
                />
              </div>              
            </div>
          </form>
        )}
      </div>
    </section>
  );
}