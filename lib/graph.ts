import { Play } from "next/font/google";
import { LinkDatum, Recorder, Vertex, VisualTrace } from "./graph-controller";
import UnionFind from "./union-find";

type MethodKeys<T> = {
  [K in keyof T]-?: T[K] extends (...args: any[]) => any ? K : never
}[keyof T];

export type AlgorithmName = MethodKeys<Graph>;
interface Edge extends LinkDatum {
    source: Vertex;
    target: Vertex;
    id: string;
};
export default class Graph {
    private vertices: Vertex[]; 
    private edges: Edge[];
    constructor(
        vertices: Vertex[], 
        edges: LinkDatum[],
        ) {
        this.vertices = vertices.map(v => ({...v}));
        this.edges = edges.map(e => {
            if(typeof e.source === 'number'
            || typeof e.target === 'number')
                throw Error('Expected Vertex found number')
            return {
            ...e, 
            source: e.source as Vertex,
            target: e.target as Vertex,
            id: (e.source as Vertex).id 
        }});
    }
    
    kruskal(recorder: Recorder): Recorder {
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
            recorder.trace.outline(recorder, [from , to]);
            if(uf.find(from).parent !== uf.find(to).parent) {
                uf.union(from, to);
                tree.push(e);
                console.log('marking')
                recorder.trace.mark(recorder, [from, to], e);
            }
        });
        console.log('kruskal trace', recorder);
        return recorder;
    }
    prim(): Recorder {}
    bellmanFord(recorder: Recorder): Recorder {
        const start = this.vertices[0];
        const distance: {
            [key: string]: number 
        } = {};
        this.vertices.forEach(v => distance[v.id] = Infinity);
        distance[start.id] = 0;
        recorder.trace.outline(recorder, [start]);
        this.vertices.forEach(_ => {
            this.edges.forEach(e => {
                const { source, target, weight }= e;
                recorder.trace.outline(recorder, [source, target]);
                if(distance[source.id] + weight < distance[target.id]) {
                    recorder.trace.mark(recorder, [source, target], e);
                    distance[target.id] = distance[source.id] + weight;
                    console.log(distance[target.id]);
                }
            });
        });
        return recorder;
    }
    dijkstra(recorder: Recorder): Recorder {
        const distance: {[id: string]: [number]} = {};
        this.vertices.forEach(v => distance[v.id] = [Infinity]);

        const start = this.vertices[0];
        distance[start.id][0] = 0;

        const queue: Array<[Vertex, [number]]> = this.vertices
            .map(v => [v, distance[v.id]]);
        queue.sort(([_, a], [__, b]) => b[0] - a[0]);
        
        while(queue.length > 0) {
            const [u] = queue.pop()!;
            recorder.trace.outline(recorder, [u]);

            this.edges.forEach(e => {
                const { source, target, weight } = e;
                recorder.trace.outline(recorder, [source, target]);
                if( source.id === u.id &&
                    distance[source.id][0] + weight < distance[target.id][0]) {
                    distance[target.id][0] = distance[source.id][0] + weight;
                    queue.sort(([_, a], [__, b]) => b[0] - a[0]);
                    recorder.trace.mark(recorder, [source, target], e);
                }
            })

        }
        return recorder;
    }
}
