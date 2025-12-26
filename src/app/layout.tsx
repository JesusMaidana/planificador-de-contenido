import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';

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
        <Sidebar />
        <main className="flex-1 overflow-auto bg-black p-8">
          <div className="mx-auto max-w-7xl h-full flex flex-col gap-6">
            <div className="flex justify-center">
              <SearchBar />
            </div>
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
