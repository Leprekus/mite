import { LinkDatum, Vertex } from "./graph-controller";
import UnionFind from "./union-find";

interface Edge extends LinkDatum {
    id: string;
};
class Graph {
    private vertices: Vertex[]; 
    private edges: Edge[];
    constructor(vertices: Vertex[], edges: LinkDatum[]) {
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
        const edges = this.edges
            .sort((a, b) => a.weight - b.weight);
        edges.map(e => {
            const from = e.source as Vertex;
            const to = e.target as Vertex;
            if(uf.find(from).parent !== uf.find(to).parent) {
                uf.union(from, to);
                tree.push(e);
            }
        });
        return tree;
    }
    prim() {}
    dijkstra() {}
    bellmanFord() {}
}
