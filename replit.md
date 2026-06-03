# iPad DevTools Installer

Eine Installer-Seite für das iPad DevTools Bookmarklet – ein vollwertiges Developer-Tools-Panel, das per Lesezeichen in jede Webseite injiziert werden kann.

## Run & Operate

- `pnpm --filter @workspace/ipad-devtools run dev` — Installer-Seite starten (Port via $PORT)
- `pnpm --filter @workspace/api-server run dev` — API-Server starten (Port 8080)
- `pnpm run typecheck` — Vollständiger TypeScript-Check
- `pnpm run build` — Alle Pakete bauen

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS
- API: Express 5
- Build: esbuild (API), Vite (Frontend)

## Where things live

- `artifacts/ipad-devtools/src/bookmarklet.ts` — Der gesamte Bookmarklet-Quellcode (minified JS string)
- `artifacts/ipad-devtools/src/pages/home.tsx` — Installer-Seite
- `artifacts/api-server/src/routes/` — API-Routen

## Architecture decisions

- Das Bookmarklet nutzt Shadow DOM (`attachShadow`) zur Isolation vom Host-Dokument
- Element Picker verwendet `touchstart`/`touchend` + `document.elementFromPoint` für iPad-Touch-Support
- Activity Monitor ist ein geheimes Feature, aktivierbar mit dem Befehl `__spy__` in der Console
- Bookmarklet-Code wird als TypeScript-String gespeichert und im Browser URL-kodiert
- Alle Settings werden in `localStorage` mit Prefix `__idt3_s__` gespeichert

## Product

- **Installer-Seite** unter `/` mit Anweisungen und kopierbarem Bookmarklet-Code
- **Bookmarklet v3** mit: Console, Element Picker (Touch-fix für iPad), DOM-Editor, Style-Editor, Storage, Network, 25+ Commands, Settings
- **Geheimer Activity Monitor** – aktivierbar mit `__spy__` in der Console

## Gotchas

- Der Bookmarklet-Code darf keine Template-Literals mit Backticks auf der äußersten Ebene verwenden (URL-Encoding-Problem)
- Das Shadow DOM isoliert das Panel vom Host-Dokument – Styles können nicht versehentlich die Seite beeinflussen
- iOS Chrome hat ein Limit für Bookmarklet-URL-Länge (~60KB) – den Code kompakt halten
