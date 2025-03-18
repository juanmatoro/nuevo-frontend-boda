import Link from "next/link";

export default function Sidebar() {
  return (
    <nav className="w-64 h-screen bg-gray-800 text-white p-4">
      <ul className="space-y-2">
        <li>
          <Link
            className="block p-2 rounded hover:bg-gray-700"
            href="/novios/dashboard"
          >
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link
            className="block p-2 rounded hover:bg-gray-700"
            href="/novios/invitados"
          >
            🎉 Invitados
          </Link>
        </li>
        <li>
          <Link
            className="block p-2 rounded hover:bg-gray-700"
            href="/novios/mensajes"
          >
            ✉️ Mensajes
          </Link>
        </li>
        <li>
          <Link
            className="block p-2 rounded hover:bg-gray-700"
            href="/novios/fotos"
          >
            📷 Galería
          </Link>
        </li>
        <li>
          <Link
            className="block p-2 rounded hover:bg-gray-700"
            href="/novios/estadisticas"
          >
            📈 Estadísticas
          </Link>
        </li>
      </ul>
    </nav>
  );
}
