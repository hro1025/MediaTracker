# MediaTracker

An Android app in React Native and strict TypeScript that tracks the movies, series and anime I watch.

TMDB supplies what exists (search, series, seasons, episodes, movies and posters), and a SQLite database on the phone remembers what I have watched.

## Features

- Search movies, series and anime as you type
- Poster grid with Watching, Watchlist and Done tabs, swipeable
- Progress badge on every poster
- Details page with swipeable seasons and episode tracking
- Marking an episode also marks every episode before it
- Upcoming episodes and the next air date
- Select posters to reset progress or remove them
- TMDB responses cached and preloaded for fast loading

## Structure

```
MediaTracker/
├── android/        generated Android project, built by Gradle
├── assets/         bundled images (the TMDB logo)
└── src/
    ├── config/     TMDB token (git-ignored) and its example file
    ├── domain/     types and pure progress logic, no I/O
    ├── tmdb/       TMDB client, cache, response types, mapping and fixtures
    ├── db/         SQLite access, schema and queries
    ├── hooks/      reusable React hooks
    ├── navigation/ stack navigator and route types
    ├── components/ small reusable UI pieces
    └── screens/    Home, Search, Details and About
```

## Commands

```
npm install                       install dependencies
npm start                         start Metro (keep it running in its own terminal)
npm run android                   build, install and open the app on the phone
npm run android -- --mode release build and install a release version
npm run check                     type check, lint and tests in one go
npm test                          run all tests
adb logcat ReactNativeJS:V *:S    show the app's log output
```

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB.
