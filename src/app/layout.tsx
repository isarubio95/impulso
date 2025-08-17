import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Impulso Estética',
  description: 'Centro de estética',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stone-50 text-stone-800">      
        {children}    
      </body>
    </html>
  );
}
