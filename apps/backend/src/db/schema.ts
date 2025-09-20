import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const leaderboard = pgTable("leaderboard", {
	id: serial("id").primaryKey(),
	displayName: varchar("name", { length: 256 }).notNull(),
	score: integer("score").notNull()
});