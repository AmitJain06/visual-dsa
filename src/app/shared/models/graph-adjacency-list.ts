/** An edge without a weight, using zero-based node indexes. */
export type UnweightedGraphEdge = readonly [from: number, to: number];

/** A weighted edge, using zero-based node indexes. */
export type WeightedGraphEdge = readonly [from: number, to: number, weight: number];

/** Tuple length distinguishes an unweighted edge from a weighted edge. */
export type GraphAdjacencyListEdge = UnweightedGraphEdge | WeightedGraphEdge;

/**
 * Graph input model for future graph generation.
 * `nodes` is the number of nodes; edge endpoints are indexes in `[0, nodes)`.
 * Use two-item edge tuples for unweighted graphs and three-item tuples for weighted graphs.
 */
export class GraphAdjacencyList {
  constructor(
    public nodes: number,
    public isDirected: boolean,
    public edges: GraphAdjacencyListEdge[] = []
  ) {}
}
