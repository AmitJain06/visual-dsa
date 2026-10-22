# Component creation rules

Read and follow this guide whenever creating an Angular component.

## Required files

Create three adjacent files for every component, all using the same base name:

- `<name>.ts` for the component class and metadata.
- `<name>.html` for the component template.
- `<name>.scss` for the component styles.

For example, a `search-panel` component consists of `search-panel.ts`, `search-panel.html`, and `search-panel.scss` in the same folder.

Reference the external files from the component metadata with `templateUrl` and `styleUrl`. Do not put component templates or styles inline in the TypeScript file. Keep even a currently empty stylesheet as the component's `.scss` file so every component has the same structure.

Use standalone components. Place route-level pages under `src/app/pages/<page-name>/`, page-only components in that page's `components/` folder, and reusable components under `src/app/shared/components/`.
