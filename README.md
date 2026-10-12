# MediaTracker

An Android app in React Native and strict TypeScript that tracks the movies, series and anime I watch.

TMDB supplies what exists (search, series, seasons, episodes, movies and posters), and a SQLite database on the phone remembers what I have watched. The screens only show data and pass my taps on, while pure, tested functions calculate progress. The finished app shows a poster grid filtered by Watching, Done and Watchlist, with a progress badge on each poster, and a details page where I mark episodes as watched and see when the next episode airs.

## Progress

- [x] **1. A clean Android toolchain** — JDK 17, Android CLI, SDK, adb and the phone over USB
- [ ] **2. Project and editor** — React Native project, first build, strict checks, Neovim
- [ ] **3. Your own types and progress logic** — domain types, percent, label and badge
- [ ] **4. Talking to TMDB** — token, fixtures, fetch client and mapping
- [ ] **5. Designing the database** — SQLite schema, migration and tested queries
- [ ] **6. Screens and navigation** — typed stack with Home, Search and Details
- [ ] **7. The main screen grid** — status filter, poster grid, badges and TMDB credits
- [ ] **8. Search and add** — debounced search and adding titles from details
- [ ] **9. Details and tracking** — seasons, watched episodes, next episode and Done

The step-by-step plan for every milestone is in the [workbook](docs/MediaTracker-Workbook.pdf).

## Structure

```
MediaTracker/
├── android/        generated Android project, built by Gradle
├── assets/         bundled images (the TMDB logo)
├── docs/
│   └── MediaTracker-Workbook.pdf
└── src/
    ├── config/     TMDB token (git-ignored) and its example file
    ├── domain/     types and pure progress logic, no I/O
    ├── tmdb/       TMDB client, response types, mapping and fixtures
    ├── db/         SQLite access, schema and queries
    ├── hooks/      reusable React hooks
    ├── navigation/ stack navigator and route types
    ├── components/ small reusable UI pieces
    └── screens/    Home, Search and Details
```

## Commands

```
npm install                       install dependencies
npm start                         start Metro (keep it running in its own terminal)
npm run android                   build, install and open the app on the phone
npm run check                     type check, lint and tests in one go
npm run typecheck                 type check only
npm run lint                      lint only
npm test                          run all tests
adb devices                       check that the phone is connected
adb logcat ReactNativeJS:V *:S    show the app's log output
android sdk list                  list installed Android SDK packages
```
