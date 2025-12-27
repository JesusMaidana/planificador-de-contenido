import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { ContentProvider } from '@/context/ContentContext';

export const metadata: Metadata = {
  title: 'Content OS',
  description: 'Manage your content creation workflow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden bg-black text-white antialiased">
        <ContentProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto bg-black p-8">
            <div className="mx-auto max-w-7xl h-full flex flex-col gap-6">
              <div className="flex justify-center">
                <Suspense fallback={
                  <div className="relative w-full max-w-md">
                    <div className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-3 h-[38px]" />
                  </div>
                }>
                  <SearchBar />
                </Suspense>
              </div>
              <div className="flex-1 overflow-hidden">
                {children}
              </div>
            </div>
          </main>
        </ContentProvider>
      </body>
    </html>
  );
}
