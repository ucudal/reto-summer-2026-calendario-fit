CREATE TABLE `carreras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `carreras_nombre_unico_idx` ON `carreras` (`nombre`);--> statement-breakpoint
CREATE TABLE `materias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text NOT NULL,
	`creditos` integer NOT NULL,
	`nombre` text NOT NULL,
	`tiene_correlativa` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materias_nombre_unico_idx` ON `materias` (`nombre`);--> statement-breakpoint
CREATE TABLE `profesores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`apellido` text NOT NULL,
	`correo` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profesores_correo_unico_idx` ON `profesores` (`correo`);--> statement-breakpoint
CREATE TABLE `salones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`edificio` text NOT NULL,
	`aforo` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `horarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`modulo` integer NOT NULL,
	`dia` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requerimientos_salon` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`caracteristicas` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grupos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`id_materia` integer NOT NULL,
	`horas_anuales` text,
	`es_contrasemestre` integer DEFAULT false NOT NULL,
	`cupo` integer,
	FOREIGN KEY (`id_materia`) REFERENCES `materias`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grupos_codigo_unico_idx` ON `grupos` (`codigo`);--> statement-breakpoint
CREATE TABLE `materia_carrera` (
	`id_materia` integer NOT NULL,
	`id_carrera` integer NOT NULL,
	`plan` text NOT NULL,
	`semestre` integer NOT NULL,
	`anio` integer NOT NULL,
	PRIMARY KEY(`id_materia`, `id_carrera`),
	FOREIGN KEY (`id_materia`) REFERENCES `materias`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id_carrera`) REFERENCES `carreras`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `grupo_horario` (
	`id_grupo` integer NOT NULL,
	`id_horario` integer NOT NULL,
	PRIMARY KEY(`id_grupo`, `id_horario`),
	FOREIGN KEY (`id_grupo`) REFERENCES `grupos`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id_horario`) REFERENCES `horarios`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profesor_grupo` (
	`id_profesor` integer NOT NULL,
	`id_grupo` integer NOT NULL,
	`carga` text,
	`confirmado` integer DEFAULT false NOT NULL,
	`es_principal` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`id_profesor`, `id_grupo`),
	FOREIGN KEY (`id_profesor`) REFERENCES `profesores`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id_grupo`) REFERENCES `grupos`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `salon_grupo` (
	`id_salon` integer NOT NULL,
	`id_grupo` integer NOT NULL,
	PRIMARY KEY(`id_salon`, `id_grupo`),
	FOREIGN KEY (`id_salon`) REFERENCES `salones`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id_grupo`) REFERENCES `grupos`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `salon_requerimiento_salon` (
	`id_salon` integer NOT NULL,
	`id_requerimiento_salon` integer NOT NULL,
	PRIMARY KEY(`id_salon`, `id_requerimiento_salon`),
	FOREIGN KEY (`id_salon`) REFERENCES `salones`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id_requerimiento_salon`) REFERENCES `requerimientos_salon`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `grupo_requerimiento_salon` (
	`id_grupo` integer NOT NULL,
	`id_requerimiento_salon` integer NOT NULL,
	PRIMARY KEY(`id_grupo`, `id_requerimiento_salon`),
	FOREIGN KEY (`id_grupo`) REFERENCES `grupos`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id_requerimiento_salon`) REFERENCES `requerimientos_salon`(`id`) ON UPDATE cascade ON DELETE cascade
);
