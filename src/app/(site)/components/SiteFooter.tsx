export default function Footer() {
  return (
    <footer className="bg-stone-800 text-stone-300">
      <div className="container mx-auto py-12 px-4 grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <p className="font-semibold text-white mb-2">Impulso</p>
          <p>Centro de bienestar en Logroño.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Servicios</p>
          <ul className="space-y-1">
            <li>Tratamientos</li>
            <li>Tienda</li>
            <li>Citas</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Contacto</p>
          <ul className="space-y-1">
            <li>Logroño, La Rioja</li>
            <li>722 162 177</li>
            <li>impulso@example.com</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Redes</p>
          <ul className="space-y-1">
            <li>Instagram</li>
            <li>WhatsApp</li>
            <li>Twitter</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
