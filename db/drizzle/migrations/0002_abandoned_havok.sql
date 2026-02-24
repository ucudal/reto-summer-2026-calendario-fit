PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_grupos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text,
	`id_materia` integer NOT NULL,
	`horas_anuales` text,
	`es_contrasemestre` integer DEFAULT false NOT NULL,
	`cupo` integer,
	`semestre` integer NOT NULL,
	`anio` integer NOT NULL,
	FOREIGN KEY (`id_materia`) REFERENCES `materias`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_grupos`("id", "codigo", "id_materia", "horas_anuales", "es_contrasemestre", "cupo", "semestre", "anio") SELECT "id", "codigo", "id_materia", "horas_anuales", "es_contrasemestre", "cupo", "semestre", "anio" FROM `grupos`;--> statement-breakpoint
DROP TABLE `grupos`;--> statement-breakpoint
ALTER TABLE `__new_grupos` RENAME TO `grupos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `grupos_codigo_unico_idx` ON `grupos` (`codigo`);