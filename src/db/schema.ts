import { pgTable, uuid, text, timestamp, boolean, integer, doublePrecision, jsonb, numeric } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull().default("Driver"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(), ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }), make: text("make").notNull(), model: text("model").notNull(), year: integer("year"), plate: text("plate").notNull(), fuelType: text("fuel_type").notNull().default("petrol"), odometer: integer("odometer").notNull().default(0), insuranceExpiry: text("insurance_expiry"), licenseExpiry: text("license_expiry"), serviceIntervalKm: integer("service_interval_km").default(15000), lastServiceKm: integer("last_service_km").default(0), isPrimary: boolean("is_primary").notNull().default(false), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(), ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }), vehicleId: uuid("vehicle_id"), type: text("type").notNull().default("business"), origin: text("origin"), destination: text("destination"), distanceKm: doublePrecision("distance_km").notNull().default(0), durationSec: integer("duration_sec").notNull().default(0), startedAt: timestamp("started_at", { withTimezone: true }).notNull(), endedAt: timestamp("ended_at", { withTimezone: true }), costEstimate: numeric("cost_estimate"), path: jsonb("path"), status: text("status").notNull().default("completed"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(), ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }), vehicleId: uuid("vehicle_id"), tripId: uuid("trip_id"), category: text("category").notNull().default("fuel"), amount: numeric("amount").notNull(), currency: text("currency").notNull().default("ZAR"), merchant: text("merchant"), date: text("date").notNull(), fuelLitres: doublePrecision("fuel_litres"), notes: text("notes"), receiptUrl: text("receipt_url"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: uuid("id").defaultRandom().primaryKey(), ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }), vehicleId: uuid("vehicle_id"), kind: text("kind").notNull().default("service"), date: text("date").notNull(), odometer: integer("odometer"), cost: numeric("cost"), notes: text("notes"), receiptUrl: text("receipt_url"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
