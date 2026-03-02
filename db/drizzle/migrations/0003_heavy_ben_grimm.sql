CREATE TABLE `semestres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numero_semestre` integer NOT NULL,
	`anio` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `requerimientos_salon`;--> statement-breakpoint
DROP TABLE `salon_requerimiento_salon`;--> statement-breakpoint
DROP TABLE `grupo_requerimiento_salon`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_grupos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text,
	`id_materia` integer NOT NULL,
	`horas_anuales` text,
	`es_contrasemestre` integer DEFAULT false NOT NULL,
	`cupo` integer,
	`id_semestre` integer NOT NULL,
	`color` text NOT NULL,
	FOREIGN KEY (`id_materia`) REFERENCES `materias`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`id_semestre`) REFERENCES `semestres`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_grupos`("id", "codigo", "id_materia", "horas_anuales", "es_contrasemestre", "cupo", "id_semestre", "color") SELECT "id", "codigo", "id_materia", "horas_anuales", "es_contrasemestre", "cupo", '' AS "id_semestre", '' AS "color" FROM `grupos`;--> statement-breakpoint
DROP TABLE `grupos`;--> statement-breakpoint
ALTER TABLE `__new_grupos` RENAME TO `grupos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `grupos_codigo_unico_idx` ON `grupos` (`codigo`);--> statement-breakpoint
ALTER TABLE `materias` ADD `requerimientosSalon` text;--> statement-breakpoint
ALTER TABLE `salones` ADD `caracteristicas` text;