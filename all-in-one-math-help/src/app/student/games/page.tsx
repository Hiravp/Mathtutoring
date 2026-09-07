import { GamesHub } from "@/components/games/games-hub";

export default function GamesPage() {
  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Games</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Drill arithmetic under a clock, then practice keeping both sides of an
          equation equal until x is isolated. More games can plug into this hub
          later.
        </p>
      </div>
      <GamesHub />
    </main>
  );
}
