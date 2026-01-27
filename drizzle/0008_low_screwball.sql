PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_felhasznalo` (
	`fel_id` text PRIMARY KEY NOT NULL,
	`p_kep` text NOT NULL,
	`Email` text(50) NOT NULL,
	`emailVerified` integer NOT NULL,
	`admin` integer DEFAULT 0,
	`nev` text NOT NULL,
	`jelszo` text,
	`r_bemutat` text,
	`irsz` integer,
	`utca` text(50),
	`hazszam` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_felhasznalo`("fel_id", "p_kep", "Email", "emailVerified", "admin", "nev", "jelszo", "r_bemutat", "irsz", "utca", "hazszam", "createdAt", "updatedAt") SELECT "fel_id", "p_kep", "Email", "emailVerified", "admin", "nev", "jelszo", "r_bemutat", "irsz", "utca", "hazszam", "createdAt", "updatedAt" FROM `felhasznalo`;--> statement-breakpoint
DROP TABLE `felhasznalo`;--> statement-breakpoint
ALTER TABLE `__new_felhasznalo` RENAME TO `felhasznalo`;--> statement-breakpoint
PRAGMA foreign_keys=ON;