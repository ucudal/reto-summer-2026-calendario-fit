# Reto Summer 2026 - CalendarioFIT

CalendarioFIT es una aplicación de escritorio desarrollada para gestionar y planificar los **horarios académicos de la Facultad de Ingeniería y Tecnologías (FIT)** de la Universidad Católica del Uruguay.

La aplicación permite centralizar la información académica (carreras, materias, docentes, grupos y horarios) en una única herramienta, evitando inconsistencias y facilitando la planificación del calendario académico.

---

## Tecnologías utilizadas

El proyecto está desarrollado con el siguiente stack tecnológico:

- **Electron** → aplicación de escritorio multiplataforma
- **React** → interfaz gráfica de usuario
- **SQLite** → base de datos local embebida
- **Drizzle ORM** → manejo del esquema de base de datos

La arquitectura del sistema separa la interfaz de usuario, la lógica de negocio y la persistencia de datos.

---

## Funcionalidades principales

- Gestión de **carreras**
- Gestión de **materias**
- Gestión de **docentes**
- Creación y edición de **grupos académicos**
- Asignación de **horarios por día y módulo**
- Detección de **conflictos de horarios**
- **Importación de datos desde Excel**
- **Exportación del calendario académico a Excel**

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/usuario/calendariofit.git
cd calendariofit
```

Instalar dependencias:

```bash
npm install
npm install --save-dev electron-builder
npm install xlsx
```
---

## Ejecución
Para construir la aplicación:
```bash
npm run build
```
Esto generará una carpeta dist/ con el instalador de la aplicación.

Para ejecutar directamente el programa:
```
dist/win-unpacked/CalendarioFIT.exe
```

Si surgen problemas de seguridad con el control de inteligente de aplicaciones de Windows, seguir los siguientes pasos:
```
Ir a Windows Defender
Seleccionar → Protección contra  virus y amenazas
Luego → Configuración de antivirus y protección contra amenazas (Administrar la configuración)
Una vez ahí → Exclusiones - Agregar o quitar exclusiones
Si, darle a agregar exclusión y poner la carpeta donde se crea el ejecutable, debería ser:
C:\Users\Usuario\AppData\Roaming\calendariofit
```
Esto funciona para crear un ejecutable, si se quiere ejecutar localmente en modo de dev paso a paso a seguir es:
```bash
npm install
npm run build
```
