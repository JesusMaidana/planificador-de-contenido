import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { ContentProvider, useContent } from '@/context/ContentContext';
import { Menu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Content OS',
  description: 'Manage your content creation workflow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const { setSidebarOpen } = useContent();

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white antialiased">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-black scroll-smooth">
        <div className="mx-auto max-w-7xl min-h-full flex flex-col p-4 md:p-8 gap-6">
          {/* Enhanced Mobile Header */}
          <div className="flex items-center justify-between md:hidden shrink-0 bg-zinc-900/40 backdrop-blur-xl p-3 rounded-2xl border border-white/5 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-all active:scale-90"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20" />
              <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">ContentOS Mobile v2</span>
            </div>
            <div className="w-11" /> {/* Spacer */}
          </div>

          <div className="flex justify-center shrink-0">
            <Suspense fallback={
              <div className="relative w-full max-w-md">
                <div className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-3 h-[38px]" />
              </div>
            }>
              <SearchBar />
            </Suspense>
          </div>

          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ContentProvider>
          <AppLayout>{children}</AppLayout>
        </ContentProvider>
      </body>
    </html>
  );
}
