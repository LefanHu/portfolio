import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import Navbar from '@/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Lefan's Website",
  description: 'Portfolio website showcasing various projects & algorithms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className='flex flex-col h-screen box-border'>
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
