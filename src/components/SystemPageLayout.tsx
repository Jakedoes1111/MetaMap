import Link from "next/link";
import type { ReactNode } from "react";

interface SystemPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const SystemPageLayout = ({ title, description, children }: SystemPageLayoutProps) => (
  <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <Link href="/systems" className="text-sm font-semibold text-accent hover:underline">
        Systems overview
      </Link>
    </header>
    {children}
  </main>
);
