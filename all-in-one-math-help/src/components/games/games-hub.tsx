"use client";

import type { ComponentType } from "react";
import { EquationBalancer } from "@/components/games/equation-balancer";
import { RapidFire } from "@/components/games/rapid-fire";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export type StudentGame = {
  id: string;
  label: string;
  description: string;
  Component: ComponentType;
};

export const STUDENT_GAMES: StudentGame[] = [
  {
    id: "rapid-fire",
    label: "Rapid Fire",
    description: "Sixty seconds of mental math.",
    Component: RapidFire,
  },
  {
    id: "equation-balancer",
    label: "Equation Balancer",
    description: "Preserve equality until x is isolated.",
    Component: EquationBalancer,
  },
];

type GamesHubProps = {
  games?: StudentGame[];
};

export function GamesHub({ games = STUDENT_GAMES }: GamesHubProps) {
  const initial = games[0]?.id ?? "rapid-fire";

  return (
    <Tabs defaultValue={initial} className="gap-4">
      <TabsList variant="line" className="w-full max-w-lg">
        {games.map((game) => (
          <TabsTrigger key={game.id} value={game.id}>
            {game.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {games.map((game) => {
        const GameComponent = game.Component;
        return (
          <TabsContent key={game.id} value={game.id} className="space-y-3">
            <p className="text-muted-foreground text-sm">{game.description}</p>
            <GameComponent />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
