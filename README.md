# LB2 To-Do App

Eine einfache Fullstack-To-Do-App für das LB2 Deployment-Projekt.

In diesem Projekt geht es nicht nur darum, eine kleine App zu bauen. Der wichtigste Teil ist der ganze Deployment-Prozess: Container, Pipeline, Datenbank, Environment-Variablen, Health Check und Deployment auf Render.

---

## Live Deployment

| Service              | URL                                               |
| -------------------- | ------------------------------------------------- |
| Frontend             | `https://web-lb2-todo-app-1.onrender.com`          |
| Backend Health Check | `https://web-lb2-todo-app.onrender.com/health`    |
| Backend API          | `https://web-lb2-todo-app.onrender.com/api/todos` |


---

## Projektübersicht

Die Anwendung ist eine einfache To-Do-App.

Man kann:

* neue Aufgaben erstellen
* alle Aufgaben anzeigen
* Aufgaben als erledigt markieren
* Aufgaben löschen
* Aufgaben dauerhaft in einer PostgreSQL-Datenbank speichern

Die App besteht aus drei Teilen:

1. **React Frontend**
2. **Express.js Backend API**
3. **PostgreSQL Datenbank**

---

## Technologie-Stack

| Bereich            | Technologie            |
| ------------------ | ---------------------- |
| Frontend           | React, Vite            |
| Backend            | Node.js, Express.js    |
| Datenbank          | PostgreSQL             |
| Containerisierung  | Docker, Docker Compose |
| CI/CD              | GitHub Actions         |
| Deployment         | Render                 |
| Versionsverwaltung | Git, GitHub            |

---

## Architekturübersicht

Die App ist in drei Services aufgeteilt.

Der Benutzer öffnet das React Frontend im Browser. Das Frontend schickt HTTP-Anfragen an die Express Backend API. Das Backend verarbeitet diese Anfragen und speichert die Daten in der PostgreSQL-Datenbank.

```mermaid
flowchart TD
    A[User Browser] --> B[React Frontend]
    B --> C[Express Backend API]
    C --> D[(PostgreSQL Datenbank)]

    B -. deployed als .-> E[Render Static Site]
    C -. deployed als .-> F[Render Web Service]
    D -. gehostet als .-> G[Render PostgreSQL]
```

---

## Repository-Struktur

```text
todo-app/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docker-compose.yml
├── README.md
└── architecture.md
```

---

## API-Endpunkte

| Methode | Endpunkt         | Beschreibung                                  |
| ------- | ---------------- | --------------------------------------------- |
| GET     | `/health`        | Prüft, ob Backend und Datenbank funktionieren |
| GET     | `/api/todos`     | Gibt alle Todos zurück                        |
| POST    | `/api/todos`     | Erstellt ein neues Todo                       |
| PATCH   | `/api/todos/:id` | Ändert den Status eines Todos                 |
| DELETE  | `/api/todos/:id` | Löscht ein Todo                               |

Beispiel für den Health Check:

```json
{
  "status": "ok",
  "message": "Backend and database are healthy"
}
```

---

## Environment-Variablen

Die App verwendet Environment-Variablen für die Konfiguration. Secrets werden nicht direkt im Code gespeichert.

### Backend Environment-Variablen

```env
PORT=5000
DATABASE_URL=postgresql://todo_user:todo_password@localhost:5432/todo_db
```

In Produktion wird `DATABASE_URL` in Render als Environment Variable gespeichert. Dort zeigt sie auf die Render PostgreSQL-Datenbank.

### Frontend Environment-Variablen

```env
VITE_API_URL=http://localhost:5000/api/todos
```

In Produktion zeigt `VITE_API_URL` auf die deployte Backend API:

```env
VITE_API_URL=https://web-lb2-todo-app.onrender.com/api/todos
```

---

## Lokales Setup mit Docker Compose

Das ist die empfohlene Variante, weil Frontend, Backend und Datenbank zusammen gestartet werden.

### Voraussetzungen

Installiert sein sollten:

* Docker Desktop
* Git
* Node.js LTS, nur falls man die App ohne Docker starten will

### App starten

Im Projektordner:

```bash
docker compose up --build
```

Das startet alle Services:

| Service              | Lokale URL                     |
| -------------------- | ------------------------------ |
| Frontend             | `http://localhost:5173`        |
| Backend              | `http://localhost:5000`        |
| Backend Health Check | `http://localhost:5000/health` |
| PostgreSQL           | `localhost:5432`               |

### App stoppen

```bash
docker compose down
```

### Datenbank zurücksetzen

Nur verwenden, wenn die gespeicherten Daten gelöscht werden sollen:

```bash
docker compose down -v
```

---

## Lokales Setup ohne Docker

Die App kann auch manuell gestartet werden.

### Backend

```bash
cd backend
npm install
npm run dev
```

Das Backend läuft dann unter:

```text
http://localhost:5000
```

### Frontend

In einem zweiten Terminal:

```bash
cd frontend
npm install
npm run dev
```

Das Frontend läuft dann unter:

```text
http://localhost:5173
```

---

## Docker Setup

Das Projekt hat eigene Dockerfiles für Frontend und Backend.

### Backend Dockerfile

Das Backend Dockerfile:

* verwendet ein Node.js Alpine Image
* installiert nur die nötigen Production Dependencies
* kopiert den Backend-Code
* öffnet Port `5000`
* startet den Server mit `npm start`

### Frontend Dockerfile

Das Frontend Dockerfile:

* verwendet ein Node.js Alpine Image
* installiert die Frontend Dependencies
* kopiert den Frontend-Code
* öffnet Port `5173`
* startet den Vite Server im Container

### Docker Compose Services

Docker Compose definiert drei Services:

| Service    | Zweck                |
| ---------- | -------------------- |
| `frontend` | React/Vite Frontend  |
| `backend`  | Express API          |
| `database` | PostgreSQL Datenbank |

Das Backend wartet auf den Health Check der Datenbank. Dadurch startet es erst, wenn PostgreSQL bereit ist.

---

## Health Check

Das Backend stellt einen Health-Check-Endpunkt bereit:

```text
/health
```

Dieser prüft:

* ob das Backend läuft
* ob die Datenbankverbindung funktioniert

Der Health Check wird lokal in Docker Compose und auch bei Render verwendet.

---

## CI/CD Pipeline

Das Projekt verwendet GitHub Actions.

Die Workflow-Datei liegt hier:

```text
.github/workflows/deploy.yml
```

Die Pipeline läuft automatisch bei:

* Push auf den `main` Branch
* Pull Requests

Die Pipeline macht folgendes:

1. Repository auschecken
2. Node.js einrichten
3. PostgreSQL Service starten
4. Backend Dependencies installieren
5. Backend starten
6. Health Check testen
7. Frontend Dependencies installieren
8. Frontend bauen
9. Docker Images bauen

So wird geprüft, ob die App gebaut und gestartet werden kann, bevor sie deployed wird.

---

## Deployment

Die Anwendung ist auf Render deployed.

### Backend Deployment

Das Backend läuft als Render Web Service mit Docker.

| Einstellung                    | Wert                 |
| ------------------------------ | -------------------- |
| Service Type                   | Web Service          |
| Runtime                        | Docker               |
| Docker Build Context Directory | `backend`            |
| Dockerfile Path                | `backend/Dockerfile` |
| Health Check Path              | `/health`            |
| Environment Variable           | `DATABASE_URL`       |

Das Backend verbindet sich mit Render PostgreSQL über die interne Datenbank-URL.

### Frontend Deployment

Das Frontend läuft als Render Static Site.

| Einstellung          | Wert                           |
| -------------------- | ------------------------------ |
| Service Type         | Static Site                    |
| Root Directory       | `frontend`                     |
| Build Command        | `npm install && npm run build` |
| Publish Directory    | `dist`                         |
| Environment Variable | `VITE_API_URL`                 |

`VITE_API_URL` zeigt auf die deployte Backend API.

---

## Deployment-Strategie

Die Deployment-Strategie ist automatisches Deployment bei einem Commit.

Wenn Änderungen auf den `main` Branch gepusht werden:

1. GitHub Actions führt die Build-Checks aus
2. Render erkennt den neuen Commit
3. Render baut und deployed den Service neu
4. Die neue Version ist online verfügbar

Dadurch müssen die Deployments nicht manuell ausgeführt werden.

---

## Sicherheit

Im Projekt wurden einfache Sicherheits- und Konfigurationsmassnahmen umgesetzt:

* Secrets werden nicht ins Repository gepusht
* Environment-Variablen werden für Konfiguration verwendet
* Datenbank-Zugangsdaten liegen in Render
* Frontend und Backend sind getrennte Services
* Docker sorgt für reproduzierbare Umgebungen
* Ein Health Check ist vorhanden

---

## Monitoring und Logs

Render stellt Logs für die Services bereit.

Backend Logs:

```text
Render Dashboard → Backend Web Service → Logs
```

Frontend Build Logs:

```text
Render Dashboard → Frontend Static Site → Logs
```

Das Backend kann auch direkt über diesen Endpunkt geprüft werden:

```text
https://web-lb2-todo-app.onrender.com/health
```

---

## Produktionsreife

| Anforderung           | Umsetzung                                                        |
| --------------------- | ---------------------------------------------------------------- |
| Containerisiert       | Frontend, Backend und Datenbank laufen mit Docker Compose        |
| Automatisiert         | GitHub Actions Pipeline läuft automatisch                        |
| Konfigurierbar        | Environment-Variablen werden verwendet                           |
| Keine Secrets im Code | Secrets liegen in Render Environment Variables                   |
| Erreichbar            | App ist über Render online erreichbar                            |
| Überwachbar           | Backend hat `/health` Endpunkt und Render Logs                   |
| Dokumentiert          | README erklärt Setup, Architektur, Deployment und Entscheidungen |

---

## Entscheidungen

### Warum React und Vite?

React mit Vite wurde gewählt, weil es schnell, leichtgewichtig und gut für eine kleine Frontend-App geeignet ist. Vite macht auch die Nutzung von Environment-Variablen einfach.

### Warum Express.js?

Express.js wurde gewählt, weil es einfach und stabil ist. Für eine kleine REST API reicht es völlig aus und bleibt gut verständlich.

### Warum PostgreSQL?

PostgreSQL wurde gewählt, weil es eine zuverlässige relationale Datenbank ist. Sie funktioniert lokal mit Docker Compose und auch in Produktion mit Render PostgreSQL.

### Warum Docker Compose?

Docker Compose wurde gewählt, weil damit die komplette App mit einem einzigen Befehl gestartet werden kann. Dadurch ist das Setup einfacher und reproduzierbar.

### Warum GitHub Actions?

GitHub Actions wurde gewählt, weil es direkt mit GitHub verbunden ist und automatisch prüfen kann, ob das Projekt gebaut und gestartet werden kann.

### Warum Render?

Render wurde gewählt, weil es Static Sites, Docker Web Services, PostgreSQL, Environment-Variablen, Logs, Health Checks und automatische Deployments von GitHub unterstützt.

---

## Learnings

In diesem Projekt habe ich gelernt, wie man eine Fullstack-App lokal entwickelt, containerisiert und deployed.

Wichtige Learnings:

* wie ein React Frontend mit einem Express Backend kommuniziert
* wie Backend-Routen aufgebaut sind
* wie PostgreSQL Daten speichert
* wie Environment-Variablen lokal und in Produktion verwendet werden
* wie Docker Compose mehrere Services verbindet
* wie Health Checks beim Monitoring helfen
* wie GitHub Actions automatische Checks ausführt
* wie Render Services aus einem GitHub Repository deployed

Wenn ich das Projekt weiter verbessern würde, würde ich Login, Backend-Tests, besseres Error Handling und erweitertes Monitoring hinzufügen.

---

## Screencast Plan

Im Screencast sollten folgende Punkte gezeigt werden:

1. Repository-Struktur
2. Frontend, Backend, Dockerfiles und Docker Compose
3. GitHub Actions Pipeline
4. Render Backend Deployment
5. Render Frontend Deployment
6. Render PostgreSQL Datenbank
7. Health Check Endpoint
8. Laufende Live-App
9. Todo erstellen, erledigen und löschen
10. Kurze Erklärung der Architektur
11. Environment-Variablen und warum Secrets nicht im Code stehen

---

## Autor

Oguzhan Saydam
