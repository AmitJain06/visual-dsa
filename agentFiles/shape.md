# Shape design rules

Read and follow this guide whenever creating, changing, or removing a canvas shape or its model, renderer, defaults, or shape-specific properties.

## Generic shape data

- Keep each shape generic and reusable across pages and algorithm problems. Do not bake a particular exercise's values, colors, layout, or behavior into the shape component.
- Represent shape data with explicit shared model types. Include a stable ID, position, and the visual or domain properties required by that shape.
- Use sensible defaults when a shape is added. Keep default values and supported value types in the shape model or shape configuration rather than scattering them through the canvas UI.
- Support the shape's intended domain values with explicit types and controls, including numeric, string, character, and boolean values where appropriate. Do not assume all shapes have numeric values or identical domain properties.
- An `Edge` references two existing `GraphNode` IDs. Create it only after two distinct graph nodes are selected; never allow an unattached edge to be dropped onto the canvas. Store direction, weighted mode, and optional weight explicitly. Render a weight at the midpoint only when weighted.
- Keep shape rendering and shape-specific visual behavior in that shape's component. Keep generic canvas interactions such as dragging, selecting, and connecting in the canvas.

## Shared properties toolbar

- Every shape must use the same reusable `ShapePropertiesPanel` toolbar/drawer. Do not create a separate toolbar or drawer for an individual shape.
- The canvas opens this shared panel when a user right-clicks a shape. Adding a shape uses its defaults and does not open the panel.
- Keep common visual controls, such as color and blinking, in the shared panel. Add shape-specific controls as conditional sections within that panel, based on the selected shape's type; show size and form for node shapes, and direction, weight, and thickness for edges.
- Bind controls to the selected shape's explicit model properties and emit updated shape data through the panel's existing change output so the canvas and host program stay synchronized.
- When adding a shape, update the shared panel with controls for its supported properties and value types; do not duplicate common controls.

## Component files

Each shape renderer is a standalone Angular component with adjacent `.ts`, `.html`, and `.scss` files, following `agentFiles/component-creation.md`. Shared model definitions belong under `src/app/shared/models/`.
