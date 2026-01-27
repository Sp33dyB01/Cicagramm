PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE if not EXISTS `__new_felhasznalo` (
	`fel_id` text PRIMARY KEY NOT NULL,
	`p_kep` text NOT NULL,
	`Email` text(50) NOT NULL,
	`admin` integer DEFAULT 0,
	`nev` text NOT NULL,
	`jelszo` text NOT NULL,
	`r_bemutat` text,
	`irsz` integer NOT NULL,
	`utca` text(50),
	`hazszam` integer
);
--> statement-breakpoint
INSERT INTO `__new_felhasznalo`("fel_id", "p_kep", "Email", "admin", "nev", "jelszo", "r_bemutat", "irsz", "utca", "hazszam") SELECT "fel_id", "p_kep", "Email", "admin", "nev", "jelszo", "r_bemutat", "irsz", "utca", "hazszam" FROM `felhasznalo`;--> statement-breakpoint
DROP TABLE `felhasznalo`;--> statement-breakpoint
ALTER TABLE `__new_felhasznalo` RENAME TO `felhasznalo`;--> statement-breakpoint
PRAGMA foreign_keys=ON;