import { and, asc, eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db, clubsTable, profilesTable, teamMembershipsTable, teamsTable, usersTable } from "@workspace/db";

export type AppRole = "ADMIN" | "COACH" | "ANALYST" | "ATHLETE";

declare global {
  namespace Express {
    interface Request {
      userContext?: {
        externalId: string;
        userId: string;
        clubId: string;
        teamId: string;
        role: AppRole;
      };
    }
  }
}

async function getOrCreateTeam() {
  const existing = await db
    .select({ teamId: teamsTable.id, clubId: teamsTable.clubId })
    .from(teamsTable)
    .orderBy(asc(teamsTable.name))
    .limit(1);
  if (existing[0]) return existing[0];

  const [club] = await db.insert(clubsTable).values({ name: "Minas Vôlei Clube", city: "Belo Horizonte" }).returning({ id: clubsTable.id });
  const [team] = await db.insert(teamsTable).values({
    clubId: club.id,
    name: "Minas Vôlei",
    category: "Adulto",
    season: "2026",
  }).returning({ id: teamsTable.id, clubId: teamsTable.clubId });
  return { teamId: team.id, clubId: team.clubId };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const externalId = getAuth(req).userId;
  if (!externalId) {
    res.status(401).json({ error: "Autenticação necessária." });
    return;
  }

  try {
    const team = await getOrCreateTeam();
    let [user] = await db.select().from(usersTable).where(eq(usersTable.externalId, externalId)).limit(1);
    if (!user) {
      [user] = await db.insert(usersTable).values({
        externalId,
        name: "Usuário Vôlei Pro",
        email: `${externalId}@clerk.local`,
        role: "ADMIN",
      }).returning();
      await db.insert(profilesTable).values({ userId: user.id, displayName: user.name });
    }

    let [membership] = await db
      .select()
      .from(teamMembershipsTable)
      .where(and(eq(teamMembershipsTable.userId, user.id), eq(teamMembershipsTable.teamId, team.teamId)))
      .limit(1);
    if (!membership) {
      [membership] = await db.insert(teamMembershipsTable).values({
        userId: user.id,
        clubId: team.clubId,
        teamId: team.teamId,
        role: user.role as AppRole,
      }).returning();
    }

    req.userContext = {
      externalId,
      userId: user.id,
      clubId: membership.clubId,
      teamId: membership.teamId,
      role: membership.role as AppRole,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userContext || !roles.includes(req.userContext.role)) {
      res.status(403).json({ error: "Seu perfil não possui permissão para esta ação." });
      return;
    }
    next();
  };
}