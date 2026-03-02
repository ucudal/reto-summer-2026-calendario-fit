CREATE TABLE IF NOT EXISTS `grupo_carrera` (
	`id_grupo` integer NOT NULL,
	`id_carrera` integer NOT NULL,
	PRIMARY KEY(`id_grupo`, `id_carrera`),
	FOREIGN KEY (`id_grupo`) REFERENCES `grupos`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id_carrera`) REFERENCES `carreras`(`id`) ON UPDATE cascade ON DELETE cascade
);
