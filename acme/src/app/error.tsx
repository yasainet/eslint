"use client";

import { Button } from "@/components/ui/button";

export default function Error({ retry }: { retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <p>問題が発生しました。時間をおいて再度お試しください。</p>
      <Button onClick={() => retry()}>再試行</Button>
    </main>
  );
}
