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

function AppLayout({ children }: { children: React.ReactNode }) {
  const { setSidebarOpen } = useContent();

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white antialiased">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-black scroll-smooth">
        <div className="mx-auto max-w-7xl min-h-full flex flex-col p-4 md:p-8 gap-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-indigo-500" />
              <span className="font-bold">ContentOS</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering title if needed */}
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
