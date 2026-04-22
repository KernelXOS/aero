import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'Transporte Fletes - Calculadora de Rutas',
  description: 'Calcula el costo de tu flete en tiempo real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-blue-50 to-gray-100">
        {children}
      </body>
    </html>
  )
}