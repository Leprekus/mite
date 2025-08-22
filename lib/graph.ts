import { LinkDatum, Vertex, VisualTrace } from "./graph-controller";
import UnionFind from "./union-find";

interface Edge extends LinkDatum {
    id: string;
};
export default class Graph {
    private vertices: Vertex[]; 
    private edges: Edge[];
    private trace: VisualTrace;
    constructor(
        vertices: Vertex[], 
        edges: LinkDatum[],
        trace: VisualTrace) {
        this.trace = trace;
        this.vertices = vertices.map(v => ({...v}));
        this.edges = edges.map(e => ({
            ...e, 
            id: (e.source as Vertex).id 
        }));
    }
    kruskal() {
        const uf = new UnionFind<Vertex>();
        const tree: Edge[] = [];
        this.vertices.map(v => uf.add(v));
        const edges = [...this.edges]
            .sort((a, b) => a.weight - b.weight);
        edges.map(e => {
            const from = e.source as Vertex;
            const to = e.target as Vertex;
            this.trace.outline([from , to]);
            if(uf.find(from).parent !== uf.find(to).parent) {
                uf.union(from, to);
                tree.push(e);
                this.trace.mark([from, to], e);
            }
        });
        return tree;
    }
    prim() {}
    dijkstra() {}
    bellmanFord() {}
}
