import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rust Player Tracker',
  description: 'Отслеживание игроков Rust по Steam профилю',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="text-white">{children}</body>
    </html>
  )
}
