import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from "drizzle-orm";
export const fajta = sqliteTable('fajta', {
  id: integer('faj_id').primaryKey(),
  fajta: text('faj_nev').notNull(),
});
export const telepulesek = sqliteTable("telepulesek", {
  id: integer('id').primaryKey(),
  nev: text('nev'),
  irsz: integer('irsz'),
});
export const felhasznalo = sqliteTable('felhasznalo', {
  id: text('fel_id').primaryKey().notNull(),
  pKep: text('p_kep').notNull(),
  email: text('Email', { length: 50 }).notNull(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  admin: integer('admin').default(0), // 0 or 1
  nev: text('nev').notNull(),
  rBemutat: text('r_bemutat'),
  irsz: integer('irsz'),
  utca: text('utca', { length: 50 }),
  hazszam: integer('hazszam'),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
export const cica = sqliteTable('cica', {
  cId: text('c_id').primaryKey().notNull(),
  kor: integer('kor').notNull(),
  pKep: text('p_kep').notNull(),
  rBemutat: text('r_bemutat'),
  felId: text('fel_id').references(() => felhasznalo.id),
  tomeg: real('tomeg').notNull(),
  nev: text('nev', { length: 50 }).notNull(),
  fajId: integer('faj_id').references(() => fajta.id),
  ivartalanitott: integer('ivartalanitott').notNull(),
});
export const macskakepek = sqliteTable('macskakepek',{
  mkepId: text('mkep_id').primaryKey().notNull(),
  cId: text('c_id').references(() => cica.cId),
  leiras: text('leiras')
});
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => felhasznalo.id),  
});
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => felhasznalo.id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(), // This will be "credential"
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
export const felhasznaloRelations = relations(felhasznalo, ({ many }) => ({
  cats: many(cica),
}));
export const macskakepekRelations = relations (macskakepek, ({ one }) => ({
  cat: one(cica, {
    fields: [macskakepek.cId],
    references: [cica.cId]
  })  
}))
export const cicaRelations = relations(cica, ({ many,one }) => ({
  images: many(macskakepek),
  owner: one(felhasznalo, {
    fields: [cica.felId],
    references: [felhasznalo.id],
  }),
  species: one(fajta, {
    fields: [cica.fajId],
    references: [fajta.id],
  }),
}));
export type SelectFajta = typeof fajta.$inferSelect;