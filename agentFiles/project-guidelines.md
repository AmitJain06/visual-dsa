# Project guidelines

## Project structure

- Keep route-level pages under `src/app/pages/<page-name>/`.
- Keep components used only by one page under that page's `components/` folder.
- Put reusable components shared by multiple pages under `src/app/shared/components/`.
- Put shared TypeScript types and interfaces under `src/app/shared/models/`.
- Put reusable application services under `src/app/shared/services/`.
- Register and maintain routes in `src/app/app.routes.ts`.

## Angular and UI

- Use standalone Angular components and the existing Angular Router setup.
- Import PrimeNG components individually in the standalone components that use them.
- Keep PrimeNG's global theme configuration in `src/app/app.config.ts` and global styles in `src/styles.scss`.
- Follow the existing TypeScript and SCSS conventions; avoid adding dependencies unless the task needs them.

## Changes

- Keep edits focused on the requested work and preserve unrelated user changes.
- Do not commit or push unless explicitly requested.
