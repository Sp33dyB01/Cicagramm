PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `felhasznalo`(`fel_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "userId", "accountId", "providerId", "password", "createdAt", "updatedAt") SELECT "id", "userId", "accountId", "providerId", "password", "createdAt", "updatedAt" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_cica` (
	`c_id` text PRIMARY KEY NOT NULL,
	`kor` integer NOT NULL,
	`p_kep` text NOT NULL,
	`r_bemutat` text,
	`fel_id` text,
	`tomeg` real NOT NULL,
	`nev` text(50) NOT NULL,
	`faj_id` integer,
	`ivartalanitott` integer NOT NULL,
	FOREIGN KEY (`fel_id`) REFERENCES `felhasznalo`(`fel_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`faj_id`) REFERENCES `fajta`(`faj_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_cica`("c_id", "kor", "p_kep", "r_bemutat", "fel_id", "tomeg", "nev", "faj_id", "ivartalanitott") SELECT "c_id", "kor", "p_kep", "r_bemutat", "fel_id", "tomeg", "nev", "faj_id", "ivartalanitott" FROM `cica`;--> statement-breakpoint
DROP TABLE `cica`;--> statement-breakpoint
ALTER TABLE `__new_cica` RENAME TO `cica`;--> statement-breakpoint
CREATE TABLE `__new_macskakepek` (
	`mkep_id` text PRIMARY KEY NOT NULL,
	`c_id` text,
	`feltoltDatum` integer NOT NULL,
	FOREIGN KEY (`c_id`) REFERENCES `cica`(`c_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_macskakepek`("mkep_id", "c_id", "feltoltDatum") SELECT "mkep_id", "c_id", "feltoltDatum" FROM `macskakepek`;--> statement-breakpoint
DROP TABLE `macskakepek`;--> statement-breakpoint
ALTER TABLE `__new_macskakepek` RENAME TO `macskakepek`;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `felhasznalo`(`fel_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") SELECT "id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);