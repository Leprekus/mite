import { LinkDatum, Recorder, Vertex, VisualTrace } from "./graph-controller";
import UnionFind from "./union-find";

interface Edge extends LinkDatum {
    id: string;
};
export default class Graph {
    private vertices: Vertex[]; 
    private edges: Edge[];
    private recorder: Recorder;
    constructor(
        vertices: Vertex[], 
        edges: LinkDatum[],
        recorder: Recorder) {
        this.recorder = recorder;
        this.vertices = vertices.map(v => ({...v}));
        this.edges = edges.map(e => ({
            ...e, 
            id: (e.source as Vertex).id 
        }));
    }
    get getRecorder(): Recorder {
        return this.recorder;
    }
    kruskal() {
        console.log('running kruskal')
        console.log(this.edges, this.vertices)
        const uf = new UnionFind<Vertex>();
        const tree: Edge[] = [];
        this.vertices.map(v => uf.add(v));
        const edges = [...this.edges]
            .sort((a, b) => a.weight - b.weight);
        edges.map(e => {
            const from = e.source as Vertex;
            const to = e.target as Vertex;
            this.recorder.trace.outline(this.recorder, [from , to]);
            if(uf.find(from).parent !== uf.find(to).parent) {
                uf.union(from, to);
                tree.push(e);
                this.recorder.trace.mark(this.recorder, [from, to], e);
            }
        });
        console.log('kruskal trace', this.recorder);
        return tree;
    }
    prim() {}
    dijkstra() {}
    bellmanFord() {}
}
