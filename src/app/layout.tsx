import './globals.css'
import { Lato } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'], 
  display: 'swap',
})

export const metadata = {
  title: 'Impulso Estética',
  description: 'Centro de bienestar en Logroño',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={lato.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

