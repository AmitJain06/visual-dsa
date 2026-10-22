# Visual canvas architecture

Read and follow this guide whenever creating or changing the visual canvas, its shape catalog, shape renderers, or code that synchronizes program state with canvas elements.

For any shape-specific implementation, also read and follow `agentFiles/shape.md`.

## Canvas responsibility

The visual canvas is a reusable, independent workspace. It owns the shared editing surface and generic workspace behavior, such as placing, moving, selecting, arranging, and rendering elements. It should be usable by different pages and problem types without embedding one problem's data structure or shape choices into the canvas itself.

Keep the canvas generic. Do not hard-code a fixed set of problem-specific shapes or assume every problem uses the same palette.

## Shape system

Treat shapes as configurable, typed visual elements that the program can create and update. Future shape types include:

- `LinkListNode`
- `DoubleLinkListNode`
- `TreeNode`
- `ArrayElement`

`GraphNode` and `Edge` are implemented as domain shapes with their own standalone Angular components. Each future shape type must also have its own component with adjacent TypeScript, HTML, and SCSS files. A shape component owns its rendering and shape-specific visual behavior; the canvas owns the shared workspace interactions. `GraphNode` has color, diameter (`size`, in canvas units), blinking state, and form (`shape`), which defaults to `circle`. Its value supports integer, string, character, double, or boolean types and defaults to integer `0`. An `Edge` references exactly two graph node IDs and has directed/undirected and weighted/unweighted modes. A weighted edge has an optional numeric weight displayed at its midpoint; it also supports color, thickness, and blinking. Keep this state explicit in the shared model so the host program can create and update shapes.

The reusable `Graph` data-structure component configures the generic canvas with only `GraphNode` and `Edge`, graph-wide direction and weighting settings, and the node value type. It owns graph-specific settings and synchronizes changes to existing shapes; the canvas receives the available shape palette, creation defaults, and property visibility from its host.

Keep shape property editing in the reusable `ShapePropertiesPanel` component. Adding a graph node uses its defaults and does not open the editor. Selecting Edge from the palette starts endpoint selection; it only creates an edge after the user selects two distinct graph nodes. Edges are not independently dragged or dropped. Right-clicking a canvas shape opens the shared properties panel as a sliding drawer from the right; suppress the browser context menu for that shape. The panel emits updated shape data to the canvas. Keep common style controls shared and render only the controls required by the selected shape. For `GraphNode`, include its supported value types. For `Edge`, include direction, weighted mode and weight, and thickness.

Shape data should support domain values and visual properties needed by problems, such as color, blocked/disabled state, and algorithm state. Use stable identifiers so program state and canvas elements can be synchronized reliably.

Keep shape definitions and shared types separate from the canvas surface. Prefer a shape catalog/registry or another extensible configuration boundary over growing conditionals and a hard-coded palette inside the canvas component. Shape-specific rendering and properties belong to the shape system; generic placement and workspace interactions belong to the canvas.

## Problem-specific configuration and synchronization

The problem/page should configure which shape types and tools are available to the user. A problem may provide a tailored palette or restrict available shapes; the canvas must not make those choices globally.

The program must be able to create and update canvas elements from its data. Design the canvas API so the host can provide or bind element data and receive intentional user edits/events. Keep algorithm state authoritative in the host/program where appropriate, and use stable IDs to map that state to visual elements.

## Component conventions

Reusable canvas, data-structure wrappers, and shape components belong under `src/app/shared/components/`; shared interfaces belong under `src/app/shared/models/`. The Graph wrapper belongs under `shared/components/data-structures/graph/` and composes the reusable canvas. Follow `agentFiles/component-creation.md` for the required TypeScript, HTML, and SCSS files for each Angular component.
