import { LinkDatum, Vertex } from "./graph-controller";

type Edge = LinkDatum;
class Graph {
    vertices: Vertex[]; 
    edges: Edge[];
    private unionFind() {}
    constructor(vertices: Vertex[], edges: Edge[]) {
        this.vertices = vertices;
        this.edges = edges;
    }
    kruskal() {}
    prim() {}
    dijkstra() {}
    bellmanFord() {}
}
