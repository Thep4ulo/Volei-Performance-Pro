import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter, type Request } from "express";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import {
  athletesTable,
  clubsTable,
  matchesTable,
  performanceRecordsTable,
  reportsTable,
  scoutEventsTable,
  teamsTable,
  trainingSessionsTable,
} from "@workspace/db";
import {
  CreateAthleteBody,
  CreateAthleteResponse,
  CreateMatchBody,
  CreateMatchResponse,
  CreateReportBody,
  CreateReportResponse,
  CreateTrainingSessionBody,
  CreateTrainingSessionResponse,
  DeleteAthleteParams,
  GetAthleteComparisonQueryParams,
  GetAthleteComparisonResponse,
  GetAthleteResponse,
  GetAthletesQueryParams,
  GetAthletesResponse,
  GetDashboardActivityResponse,
  GetDashboardSummaryResponse,
  GetMatchResponse,
  GetMatchesQueryParams,
  GetMatchesResponse,
  GetReportsResponse,
  GetTacticalSummaryResponse,
  GetTrainingSessionsResponse,
  UpdateAthleteBody,
  UpdateAthleteParams,
  UpdateAthleteResponse,
  UpdateMatchBody,
  UpdateMatchParams,
  UpdateMatchResponse,
} from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";
import { attackEfficiency, metricFromEvents, SCOUT_RESULTS, SCOUT_SKILLS, serveEfficiency, sideOut } from "../lib/performance";

const router: IRouter = Router();
let seedPromise: Promise<string> | undefined;

const asNumber = (value: unknown) => Number(value ?? 0);
const initialsFor = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const emptyMetrics = { attack: 0, serve: 0, block: 0, reception: 0, defense: 0, setting: 0 };

async function resolveTeamId(req: Request) {
  return req.userContext?.teamId ?? ensureSeeded();
}

async function metricsForAthlete(athleteId: string) {
  const events = await db.select({ skill: scoutEventsTable.skill, result: scoutEventsTable.result })
    .from(scoutEventsTable)
    .where(eq(scoutEventsTable.athleteId, athleteId));
  return events.length ? metricFromEvents(events) : emptyMetrics;
}

async function ensureSeeded(): Promise<string> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const existing = await db.select({ id: teamsTable.id }).from(teamsTable).limit(1);
    let teamId = existing[0]?.id;
    if (teamId) {
      const existingAthlete = await db
        .select({ id: athletesTable.id })
        .from(athletesTable)
        .where(eq(athletesTable.teamId, teamId))
        .limit(1);
      if (existingAthlete[0]) return teamId;
    } else {
      const [club] = await db
        .insert(clubsTable)
        .values({ name: "Minas Vôlei Clube", city: "Belo Horizonte" })
        .returning();
      const [team] = await db
        .insert(teamsTable)
        .values({ clubId: club.id, name: "Minas Vôlei", category: "Adulto", season: "2026" })
        .returning();
      teamId = team.id;
    }

    const athleteSeed = [
      ["3a2f4e1f-3e7e-4d1c-8f88-5e8f8d6b1001", "Ana Carolina", "Levantador", 7, 176, 68, "Direita", 91, 3.8],
      ["3a2f4e1f-3e7e-4d1c-8f88-5e8f8d6b1002", "Luiza Martins", "Ponteiro", 12, 184, 72, "Esquerda", 88, 2.4],
      ["3a2f4e1f-3e7e-4d1c-8f88-5e8f8d6b1003", "Giovana Reis", "Central", 4, 193, 79, "Direita", 84, 1.2],
      ["3a2f4e1f-3e7e-4d1c-8f88-5e8f8d6b1004", "Marina Alves", "Líbero", 2, 169, 61, "Direita", 82, -0.7],
      ["3a2f4e1f-3e7e-4d1c-8f88-5e8f8d6b1005", "Beatriz Souza", "Oposto", 15, 188, 76, "Direita", 79, 4.9],
      ["3a2f4e1f-3e7e-4d1c-8f88-5e8f8d6b1006", "Clara Nunes", "Ponteiro", 9, 181, 69, "Esquerda", 76, -1.5],
    ] as const;

    await db.insert(athletesTable).values(
      athleteSeed.map(([id, name, position, jerseyNumber, height, weight, dominantHand, performance, trend]) => ({
        id,
        teamId,
        name,
        initials: initialsFor(name),
        birthDate: "2001-03-14",
        height: String(height),
        weight: String(weight),
        position,
        dominantHand,
        jerseyNumber,
        performance: String(performance),
        trend: String(trend),
        status: "Ativo",
      })),
    );

    await db.insert(matchesTable).values([
      {
        teamId,
        opponent: "Praia Clube",
        date: "2026-08-29",
        championship: "Superliga B",
        location: "Arena UniBH",
        result: "Vitória",
        setsWon: 3,
        setsLost: 1,
        attackEfficiency: "56",
        sideOut: "68",
        breakPoint: "42",
        serveEfficiency: "71",
        status: "Concluída",
      },
      {
        teamId,
        opponent: "Sesi Bauru",
        date: "2026-08-22",
        championship: "Superliga B",
        location: "Panela de Pressão",
        result: "Derrota",
        setsWon: 2,
        setsLost: 3,
        attackEfficiency: "49",
        sideOut: "61",
        breakPoint: "35",
        serveEfficiency: "64",
        status: "Concluída",
      },
      {
        teamId,
        opponent: "Osasco São Cristóvão",
        date: "2026-09-11",
        championship: "Superliga B",
        location: "Arena UniBH",
        result: "Vitória",
        setsWon: 0,
        setsLost: 0,
        attackEfficiency: "0",
        sideOut: "0",
        breakPoint: "0",
        serveEfficiency: "0",
        status: "Agendada",
      },
    ]);

    await db.insert(scoutEventsTable).values([
      { athleteId: athleteSeed[0][0], matchId: (await db.select({ id: matchesTable.id }).from(matchesTable).where(and(eq(matchesTable.teamId, teamId), eq(matchesTable.opponent, "Praia Clube"))).limit(1))[0].id, skill: "ataque", zone: "Zona 3", result: "ponto" },
      { athleteId: athleteSeed[0][0], matchId: (await db.select({ id: matchesTable.id }).from(matchesTable).where(and(eq(matchesTable.teamId, teamId), eq(matchesTable.opponent, "Praia Clube"))).limit(1))[0].id, skill: "ataque", zone: "Zona 3", result: "erro" },
      { athleteId: athleteSeed[1][0], matchId: (await db.select({ id: matchesTable.id }).from(matchesTable).where(and(eq(matchesTable.teamId, teamId), eq(matchesTable.opponent, "Praia Clube"))).limit(1))[0].id, skill: "recepção", zone: "Zona 5", result: "defesa positiva" },
      { athleteId: athleteSeed[1][0], matchId: (await db.select({ id: matchesTable.id }).from(matchesTable).where(and(eq(matchesTable.teamId, teamId), eq(matchesTable.opponent, "Praia Clube"))).limit(1))[0].id, skill: "saque", zone: "Zona 1", result: "ponto" },
    ]);

    const sessions = [
      ["2026-09-03", 110, 7, "Técnico + tático"],
      ["2026-09-02", 90, 6, "Força"],
      ["2026-08-31", 120, 8, "Jogo coletivo"],
      ["2026-08-29", 75, 5, "Recuperação ativa"],
      ["2026-08-28", 105, 7, "Técnico"],
    ] as const;
    await db.insert(trainingSessionsTable).values(
      sessions.map(([date, duration, perceivedIntensity, trainingType]) => ({
        teamId,
        date,
        duration,
        perceivedIntensity: String(perceivedIntensity),
        trainingType,
        load: String(duration * perceivedIntensity),
        fatigueRisk: duration * perceivedIntensity > 750 ? "Alto" : duration * perceivedIntensity > 450 ? "Moderado" : "Baixo",
      })),
    );

    await db.insert(reportsTable).values([
      { teamId, title: "Análise pós-jogo · Praia Clube", type: "Equipe", subject: "Minas Vôlei", status: "Pronto" },
      { teamId, title: "Evolução técnica · Ana Carolina", type: "Individual", subject: "Ana Carolina", status: "Pronto" },
      { teamId, title: "Pré-jogo · Osasco", type: "Equipe", subject: "Minas Vôlei", status: "Processando" },
    ]);

    return teamId;
  })();
  return seedPromise;
}

async function mapAthlete(row: typeof athletesTable.$inferSelect) {
  const metrics = await metricsForAthlete(row.id);
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    photoUrl: row.photoUrl,
    birthDate: row.birthDate,
    height: asNumber(row.height),
    weight: asNumber(row.weight),
    position: row.position,
    dominantHand: row.dominantHand,
    jerseyNumber: row.jerseyNumber,
    team: "Minas Vôlei",
    status: row.status,
    performance: asNumber(row.performance),
    trend: asNumber(row.trend),
    metrics,
    lastUpdated: row.updatedAt.toISOString(),
  };
}

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const [athletes, matches, sessions] = await Promise.all([
    db.select().from(athletesTable).where(eq(athletesTable.teamId, teamId)),
    db.select().from(matchesTable).where(eq(matchesTable.teamId, teamId)).orderBy(desc(matchesTable.date)),
    db.select().from(trainingSessionsTable).where(eq(trainingSessionsTable.teamId, teamId)).orderBy(desc(trainingSessionsTable.date)),
  ]);
  const average = athletes.length ? athletes.reduce((sum, item) => sum + asNumber(item.performance), 0) / athletes.length : 0;
  const completed = matches.filter((match) => match.status === "Concluída");
  const summary = {
    totalAthletes: athletes.length,
    averagePerformance: Math.round(average * 10) / 10,
    attackEfficiency: completed.length ? Math.round(completed.reduce((sum, match) => sum + asNumber(match.attackEfficiency), 0) / completed.length) : 0,
    receptionEfficiency: 87,
    sideOut: completed.length ? Math.round(completed.reduce((sum, match) => sum + asNumber(match.sideOut), 0) / completed.length) : 0,
    weeklyLoad: sessions.slice(0, 5).reduce((sum, session) => sum + asNumber(session.load), 0),
    fatigueIndex: 32,
    performanceTrend: [
      { label: "Mai", value: 74 },
      { label: "Jun", value: 77 },
      { label: "Jul", value: 79 },
      { label: "Ago", value: 82 },
      { label: "Set", value: Math.round(average) },
    ],
    positionDistribution: [
      { label: "Ponteiro", value: athletes.filter((a) => a.position === "Ponteiro").length },
      { label: "Central", value: athletes.filter((a) => a.position === "Central").length },
      { label: "Levantador", value: athletes.filter((a) => a.position === "Levantador").length },
      { label: "Oposto", value: athletes.filter((a) => a.position === "Oposto").length },
      { label: "Líbero", value: athletes.filter((a) => a.position === "Líbero").length },
    ],
  };
  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const [match, session, report] = await Promise.all([
    db.select().from(matchesTable).where(eq(matchesTable.teamId, teamId)).orderBy(desc(matchesTable.createdAt)).limit(1),
    db.select().from(trainingSessionsTable).where(eq(trainingSessionsTable.teamId, teamId)).orderBy(desc(trainingSessionsTable.date)).limit(1),
    db.select().from(reportsTable).where(eq(reportsTable.teamId, teamId)).orderBy(desc(reportsTable.createdAt)).limit(1),
  ]);
  const activity = [
    match[0] && { id: match[0].id, type: "match", title: `Jogo contra ${match[0].opponent}`, description: `${match[0].result} · ${match[0].setsWon}–${match[0].setsLost}`, timestamp: match[0].date, accent: "lime" },
    session[0] && { id: session[0].id, type: "training", title: "Treino registrado", description: `${session[0].trainingType} · carga ${session[0].load}`, timestamp: session[0].date, accent: "cyan" },
    report[0] && { id: report[0].id, type: "report", title: "Relatório atualizado", description: report[0].title, timestamp: report[0].createdAt.toISOString(), accent: "violet" },
  ].filter(Boolean);
  res.json(GetDashboardActivityResponse.parse(activity));
});

router.get("/athletes", async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const query = GetAthletesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { search, position } = query.data;
  const filters = [eq(athletesTable.teamId, teamId)];
  if (position) filters.push(eq(athletesTable.position, position));
  const rows = await db.select().from(athletesTable).where(search ? and(...filters, or(ilike(athletesTable.name, `%${search}%`), ilike(athletesTable.position, `%${search}%`))) : and(...filters)).orderBy(asc(athletesTable.name));
  res.json(GetAthletesResponse.parse(await Promise.all(rows.map(mapAthlete))));
});

router.post("/athletes", requireRole("ADMIN", "COACH", "ANALYST"), async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const parsed = CreateAthleteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(athletesTable).values({
    teamId,
    ...parsed.data,
    initials: initialsFor(parsed.data.name),
    height: String(parsed.data.height),
    weight: String(parsed.data.weight),
    performance: "0",
    trend: "0",
  }).returning();
  res.status(201).json(CreateAthleteResponse.parse(await mapAthlete(created)));
});

router.get("/athletes/:id", async (req, res): Promise<void> => {
  const [athlete] = await db.select().from(athletesTable).where(and(eq(athletesTable.id, req.params.id), eq(athletesTable.teamId, await resolveTeamId(req))));
  if (!athlete) {
    res.status(404).json({ error: "Athlete not found" });
    return;
  }
  res.json(GetAthleteResponse.parse(await mapAthlete(athlete)));
});

router.patch("/athletes/:id", requireRole("ADMIN", "COACH", "ANALYST"), async (req, res): Promise<void> => {
  const params = UpdateAthleteParams.safeParse(req.params);
  const parsed = UpdateAthleteBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : !parsed.success ? parsed.error.message : "Invalid request" });
    return;
  }
  const [updated] = await db.update(athletesTable).set({
    ...parsed.data,
    initials: initialsFor(parsed.data.name),
    height: String(parsed.data.height),
    weight: String(parsed.data.weight),
    updatedAt: new Date(),
  }).where(and(eq(athletesTable.id, params.data.id), eq(athletesTable.teamId, await resolveTeamId(req)))).returning();
  if (!updated) {
    res.status(404).json({ error: "Athlete not found" });
    return;
  }
  res.json(UpdateAthleteResponse.parse(await mapAthlete(updated)));
});

router.delete("/athletes/:id", requireRole("ADMIN", "COACH"), async (req, res): Promise<void> => {
  const params = DeleteAthleteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(athletesTable).where(and(eq(athletesTable.id, params.data.id), eq(athletesTable.teamId, await resolveTeamId(req)))).returning();
  if (!deleted) {
    res.status(404).json({ error: "Athlete not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/matches", async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const query = GetMatchesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = await db.select().from(matchesTable).where(eq(matchesTable.teamId, teamId)).orderBy(desc(matchesTable.date));
  res.json(GetMatchesResponse.parse(rows.map((row) => ({
    ...row,
    attackEfficiency: asNumber(row.attackEfficiency),
    sideOut: asNumber(row.sideOut),
    breakPoint: asNumber(row.breakPoint),
    serveEfficiency: asNumber(row.serveEfficiency),
  }))));
});

router.post("/matches", requireRole("ADMIN", "COACH", "ANALYST"), async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const parsed = CreateMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(matchesTable).values({
    teamId,
    ...parsed.data,
    attackEfficiency: "0",
    sideOut: "0",
    breakPoint: "0",
    serveEfficiency: "0",
  }).returning();
  res.status(201).json(CreateMatchResponse.parse({
    ...created,
    attackEfficiency: 0,
    sideOut: 0,
    breakPoint: 0,
    serveEfficiency: 0,
  }));
});

router.get("/matches/:id", async (req, res): Promise<void> => {
  const [match] = await db.select().from(matchesTable).where(and(eq(matchesTable.id, req.params.id), eq(matchesTable.teamId, await resolveTeamId(req))));
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  res.json(GetMatchResponse.parse({ ...match, attackEfficiency: asNumber(match.attackEfficiency), sideOut: asNumber(match.sideOut), breakPoint: asNumber(match.breakPoint), serveEfficiency: asNumber(match.serveEfficiency) }));
});

const scoutEventBody = z.object({
  athleteId: z.string().uuid(),
  skill: z.enum(SCOUT_SKILLS),
  zone: z.string().min(1).max(40),
  result: z.enum(SCOUT_RESULTS),
});

async function recalculateMatch(matchId: string) {
  const events = await db.select({ skill: scoutEventsTable.skill, result: scoutEventsTable.result })
    .from(scoutEventsTable)
    .where(eq(scoutEventsTable.matchId, matchId));
  const attacks = events.filter((event) => event.skill === "ataque");
  const serves = events.filter((event) => event.skill === "saque");
  const receptions = events.filter((event) => event.skill === "recepção");
  await db.update(matchesTable).set({
    attackEfficiency: String(attackEfficiency(
      attacks.filter((event) => event.result === "ponto").length,
      attacks.filter((event) => event.result === "erro").length,
      attacks.length,
    )),
    sideOut: String(sideOut(
      receptions.filter((event) => event.result === "ponto" || event.result === "defesa positiva").length,
      receptions.length,
    )),
    serveEfficiency: String(serveEfficiency(
      serves.filter((event) => event.result === "ponto").length,
      serves.filter((event) => event.result === "erro").length,
    )),
  }).where(eq(matchesTable.id, matchId));
}

router.get("/matches/:matchId/scout-events", async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const matchId = Array.isArray(req.params.matchId) ? req.params.matchId[0] : req.params.matchId;
  const [match] = await db.select({ id: matchesTable.id }).from(matchesTable).where(and(eq(matchesTable.id, matchId), eq(matchesTable.teamId, teamId)));
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  const events = await db.select().from(scoutEventsTable).where(eq(scoutEventsTable.matchId, match.id)).orderBy(desc(scoutEventsTable.createdAt));
  res.json(events.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() })));
});

router.post("/matches/:matchId/scout-events", requireRole("ADMIN", "COACH", "ANALYST"), async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const matchId = Array.isArray(req.params.matchId) ? req.params.matchId[0] : req.params.matchId;
  const parsed = scoutEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [match] = await db.select({ id: matchesTable.id }).from(matchesTable).where(and(eq(matchesTable.id, matchId), eq(matchesTable.teamId, teamId)));
  const [athlete] = await db.select({ id: athletesTable.id }).from(athletesTable).where(and(eq(athletesTable.id, parsed.data.athleteId), eq(athletesTable.teamId, teamId)));
  if (!match || !athlete) {
    res.status(404).json({ error: "Partida ou atleta não encontrado." });
    return;
  }
  const [event] = await db.insert(scoutEventsTable).values({ ...parsed.data, matchId: match.id }).returning();
  await recalculateMatch(match.id);
  res.status(201).json({ ...event, createdAt: event.createdAt.toISOString() });
});

router.patch("/matches/:id", requireRole("ADMIN", "COACH", "ANALYST"), async (req, res): Promise<void> => {
  const params = UpdateMatchParams.safeParse(req.params);
  const parsed = UpdateMatchBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : !parsed.success ? parsed.error.message : "Invalid request" });
    return;
  }
  const [updated] = await db.update(matchesTable).set(parsed.data).where(and(eq(matchesTable.id, params.data.id), eq(matchesTable.teamId, await resolveTeamId(req)))).returning();
  if (!updated) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  res.json(UpdateMatchResponse.parse({ ...updated, attackEfficiency: asNumber(updated.attackEfficiency), sideOut: asNumber(updated.sideOut), breakPoint: asNumber(updated.breakPoint), serveEfficiency: asNumber(updated.serveEfficiency) }));
});

router.get("/training-sessions", async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const rows = await db.select().from(trainingSessionsTable).where(eq(trainingSessionsTable.teamId, teamId)).orderBy(desc(trainingSessionsTable.date));
  res.json(GetTrainingSessionsResponse.parse(rows.map((row) => ({ ...row, duration: row.duration, perceivedIntensity: asNumber(row.perceivedIntensity), load: asNumber(row.load) }))));
});

router.post("/training-sessions", requireRole("ADMIN", "COACH", "ANALYST"), async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const parsed = CreateTrainingSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const load = parsed.data.duration * parsed.data.perceivedIntensity;
  const [created] = await db.insert(trainingSessionsTable).values({
    teamId,
    ...parsed.data,
    perceivedIntensity: String(parsed.data.perceivedIntensity),
    load: String(load),
    fatigueRisk: load > 750 ? "Alto" : load > 450 ? "Moderado" : "Baixo",
  }).returning();
  res.status(201).json(CreateTrainingSessionResponse.parse({ ...created, perceivedIntensity: asNumber(created.perceivedIntensity), load: asNumber(created.load) }));
});

router.get("/analysis/tactical-summary", async (req, res): Promise<void> => {
  await resolveTeamId(req);
  const summary = {
    attackZones: [
      { zone: "Zona 4", points: 38, errors: 8, efficiency: 79 },
      { zone: "Zona 3", points: 31, errors: 5, efficiency: 84 },
      { zone: "Zona 2", points: 25, errors: 9, efficiency: 64 },
      { zone: "Fundo", points: 14, errors: 6, efficiency: 58 },
    ],
    serveZones: [
      { zone: "Zona 1", points: 16, errors: 3, efficiency: 84 },
      { zone: "Zona 5", points: 12, errors: 5, efficiency: 71 },
      { zone: "Zona 6", points: 9, errors: 2, efficiency: 78 },
    ],
    insight: "A equipe encontra mais eficiência pelo meio e converte 84% das bolas aceleradas na Zona 3.",
  };
  res.json(GetTacticalSummaryResponse.parse(summary));
});

router.get("/analysis/comparison", async (req, res): Promise<void> => {
  const query = GetAthleteComparisonQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const [first, second] = await Promise.all([
    db.select().from(athletesTable).where(and(eq(athletesTable.id, query.data.firstAthleteId), eq(athletesTable.teamId, await resolveTeamId(req)))),
    db.select().from(athletesTable).where(and(eq(athletesTable.id, query.data.secondAthleteId), eq(athletesTable.teamId, await resolveTeamId(req)))),
  ]);
  if (!first[0] || !second[0]) {
    res.status(404).json({ error: "Athletes not found" });
    return;
  }
  res.json(GetAthleteComparisonResponse.parse({ first: await mapAthlete(first[0]), second: await mapAthlete(second[0]) }));
});

router.get("/reports", async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const rows = await db.select().from(reportsTable).where(eq(reportsTable.teamId, teamId)).orderBy(desc(reportsTable.createdAt));
  res.json(GetReportsResponse.parse(rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))));
});

router.post("/reports", requireRole("ADMIN", "COACH", "ANALYST"), async (req, res): Promise<void> => {
  const teamId = await resolveTeamId(req);
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(reportsTable).values({ teamId, ...parsed.data }).returning();
  res.status(201).json(CreateReportResponse.parse({ ...created, createdAt: created.createdAt.toISOString() }));
});

export default router;