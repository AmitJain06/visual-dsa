# Shared model creation rules

Read and follow this guide whenever creating or changing shared data models under `src/app/shared/models/`.

## Model design

- Represent domain data with explicit, exported TypeScript types, interfaces, or classes. Choose the simplest form that fits the model; use a class when it needs construction defaults or behavior.
- Give fields meaningful names and concrete types. Avoid `any` and keep optional data explicitly optional.
- Keep domain models independent of Angular components and presentation details. Add visual state only when it is part of the shared domain or canvas shape contract, and follow `agentFiles/shape.md` for shape models.
- Document non-obvious invariants, index conventions, and variant formats beside the relevant type or model.
- Prefer readonly tuple types for fixed-position records whose length and field order carry meaning.

## Graph adjacency list model

`GraphAdjacencyList` is the shared input model for generating graphs from adjacency-list-style edge data. Keep it in `src/app/shared/models/graph-adjacency-list.ts` and preserve these semantics:

- `nodes` is the number of graph nodes. Node indexes are zero-based and edge endpoints must be in the range `[0, nodes)`.
- `isDirected` indicates whether the graph is directed. Keep this spelling consistent throughout the application.
- `edges` contains endpoint pairs for unweighted edges and endpoint/weight triples for weighted edges.
- Edge tuple fields are ordered as `[from, to]` or `[from, to, weight]`. Tuple length distinguishes the two variants; weight is numeric.
- A graph instance should use one weighting mode consistently. Do not mix pairs and triples within the same graph's edge list.

Keep the tuple variants explicit and reusable through exported types such as `UnweightedGraphEdge`, `WeightedGraphEdge`, and `GraphAdjacencyListEdge`. Update consumers and this guide together if the model contract changes.
