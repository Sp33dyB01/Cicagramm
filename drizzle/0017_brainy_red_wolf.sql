CREATE TABLE `kedvencek` (
	`fel_id` text,
	`c_id` text,
	FOREIGN KEY (`fel_id`) REFERENCES `felhasznalo`(`fel_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`c_id`) REFERENCES `cica`(`c_id`) ON UPDATE no action ON DELETE cascade
);
