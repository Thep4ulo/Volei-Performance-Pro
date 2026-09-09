import { createInsertSchema } from "drizzle-zod";
import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const clubsTable = pgTable("clubs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull().default("São Paulo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamsTable = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").references(() => clubsTable.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Adulto"),
  season: text("season").notNull().default("2026"),
});

export const athletesTable = pgTable("athletes", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teamsTable.id).notNull(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  photoUrl: text("photo_url"),
  birthDate: date("birth_date", { mode: "string" }).notNull(),
  height: numeric("height", { precision: 5, scale: 2 }).notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  position: text("position").notNull(),
  dominantHand: text("dominant_hand").notNull(),
  jerseyNumber: integer("jersey_number").notNull(),
  status: text("status").notNull().default("Ativo"),
  performance: numeric("performance", { precision: 5, scale: 2 }).notNull().default("0"),
  trend: numeric("trend", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matchesTable = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teamsTable.id).notNull(),
  opponent: text("opponent").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  championship: text("championship").notNull(),
  location: text("location").notNull(),
  result: text("result").notNull(),
  setsWon: integer("sets_won").notNull().default(0),
  setsLost: integer("sets_lost").notNull().default(0),
  attackEfficiency: numeric("attack_efficiency", { precision: 5, scale: 2 }).notNull().default("0"),
  sideOut: numeric("side_out", { precision: 5, scale: 2 }).notNull().default("0"),
  breakPoint: numeric("break_point", { precision: 5, scale: 2 }).notNull().default("0"),
  serveEfficiency: numeric("serve_efficiency", { precision: 5, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("Concluída"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const performanceRecordsTable = pgTable("performance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  athleteId: uuid("athlete_id").references(() => athletesTable.id).notNull(),
  matchId: uuid("match_id").references(() => matchesTable.id),
  recordedAt: date("recorded_at", { mode: "string" }).notNull(),
  attack: numeric("attack", { precision: 5, scale: 2 }).notNull(),
  serve: numeric("serve", { precision: 5, scale: 2 }).notNull(),
  block: numeric("block", { precision: 5, scale: 2 }).notNull(),
  reception: numeric("reception", { precision: 5, scale: 2 }).notNull(),
  defense: numeric("defense", { precision: 5, scale: 2 }).notNull(),
  setting: numeric("setting", { precision: 5, scale: 2 }).notNull(),
});

export const trainingSessionsTable = pgTable("training_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teamsTable.id).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  duration: integer("duration").notNull(),
  perceivedIntensity: numeric("perceived_intensity", { precision: 4, scale: 2 }).notNull(),
  trainingType: text("training_type").notNull(),
  load: numeric("load", { precision: 8, scale: 2 }).notNull(),
  fatigueRisk: text("fatigue_risk").notNull(),
});

export const reportsTable = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teamsTable.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("Pronto"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalId: text("external_id").notNull().unique(),
  name: text("name").notNull().default("Usuário"),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("ANALYST"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profilesTable = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
}, (table) => ({
  userUnique: uniqueIndex("profiles_user_id_unique").on(table.userId),
}));

export const teamMembershipsTable = pgTable("team_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  clubId: uuid("club_id").references(() => clubsTable.id).notNull(),
  teamId: uuid("team_id").references(() => teamsTable.id).notNull(),
  role: text("role").notNull().default("ANALYST"),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userTeamUnique: uniqueIndex("team_memberships_user_team_unique").on(table.userId, table.teamId),
}));

export const scoutEventsTable = pgTable("scout_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  athleteId: uuid("athlete_id").references(() => athletesTable.id).notNull(),
  matchId: uuid("match_id").references(() => matchesTable.id).notNull(),
  skill: text("skill").notNull(),
  zone: text("zone").notNull(),
  result: text("result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAthleteSchema = createInsertSchema(athletesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type Athlete = typeof athletesTable.$inferSelect;

export const insertMatchSchema = createInsertSchema(matchesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;

export const insertTrainingSessionSchema = createInsertSchema(trainingSessionsTable).omit({
  id: true,
});
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type TrainingSession = typeof trainingSessionsTable.$inferSelect;

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;