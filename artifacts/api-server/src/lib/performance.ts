export const roundMetric = (value: number) => Math.round(value * 100) / 100;

export function attackEfficiency(points: number, errors: number, attempts: number) {
  return attempts > 0 ? roundMetric(((points - errors) / attempts) * 100) : 0;
}

export function sideOut(pointsWon: number, receptions: number) {
  return receptions > 0 ? roundMetric((pointsWon / receptions) * 100) : 0;
}

export function serveEfficiency(aces: number, errors: number) {
  return roundMetric(aces - errors);
}

export function trainingLoad(duration: number, perceivedIntensity: number) {
  return roundMetric(duration * perceivedIntensity);
}

export function fatigueRisk(load: number) {
  return load > 750 ? "Alto" : load > 450 ? "Moderado" : "Baixo";
}

export const SCOUT_SKILLS = ["ataque", "saque", "recepção", "bloqueio", "defesa", "levantamento"] as const;
export const SCOUT_RESULTS = ["ponto", "erro", "bloqueio adversário", "defesa positiva"] as const;

export type ScoutEventShape = {
  skill: string;
  result: string;
};

export function metricFromEvents(events: ScoutEventShape[]) {
  const attack = events.filter((event) => event.skill === "ataque");
  const serve = events.filter((event) => event.skill === "saque");
  const reception = events.filter((event) => event.skill === "recepção");
  const block = events.filter((event) => event.skill === "bloqueio");
  const defense = events.filter((event) => event.skill === "defesa");
  const setting = events.filter((event) => event.skill === "levantamento");
  const efficiency = (items: ScoutEventShape[]) => {
    if (!items.length) return 0;
    const positive = items.filter((item) => item.result === "ponto" || item.result === "defesa positiva").length;
    return roundMetric((positive / items.length) * 100);
  };

  return {
    attack: attackEfficiency(
      attack.filter((item) => item.result === "ponto").length,
      attack.filter((item) => item.result === "erro").length,
      attack.length,
    ),
    serve: serveEfficiency(
      serve.filter((item) => item.result === "ponto").length,
      serve.filter((item) => item.result === "erro").length,
    ),
    block: efficiency(block),
    reception: efficiency(reception),
    defense: efficiency(defense),
    setting: efficiency(setting),
  };
}