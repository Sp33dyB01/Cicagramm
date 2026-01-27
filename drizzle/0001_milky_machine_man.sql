CREATE TABLE IF NOT EXISTS `cica` (
	`c_id` text PRIMARY KEY NOT NULL,
	`kor` integer NOT NULL,
	`p_kep` text NOT NULL,
	`r_bemutat` text,
	`fel_id` text,
	`tomeg` real NOT NULL,
	`nev` text(50) NOT NULL,
	`faj_id` integer,
	`ivartalanitott` integer NOT NULL,
	FOREIGN KEY (`fel_id`) REFERENCES `felhasznalo`(`fel_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`faj_id`) REFERENCES `fajta`(`faj_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `felhasznalo` (
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
CREATE TABLE IF NOT EXISTS `macskakepek` (
	`mkep_id` text PRIMARY KEY NOT NULL,
	`c_id` text,
	`leiras` text,
	FOREIGN KEY (`c_id`) REFERENCES `cica`(`c_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `telepulesek` (
	`id` integer PRIMARY KEY NOT NULL,
	`nev` text,
	`irsz` integer
);
