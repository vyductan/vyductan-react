import { Button } from "@acme/ui/components/button";

export const App = () => {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            vyductan-react / apps/vite-app
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Vite App Template
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base">
            React, TypeScript, Tailwind v4, and shared @acme/ui components are
            wired up so you can start building immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button>Shared UI button</Button>
        </div>
      </section>
    </main>
  );
};
