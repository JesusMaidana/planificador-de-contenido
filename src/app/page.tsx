import { Suspense } from "react";
import { ContentTable } from "@/components/ContentTable";

export default function Home() {
  return (
    <Suspense fallback={<div className="text-zinc-400">Cargando contenido...</div>}>
      <ContentTable />
    </Suspense>
  );
}
