import * as d3 from "d3";
import Graph from "./graph";

export enum MSTImplementation {
    Prim,
    Kruskal,
};
export enum MCPImplementation {
    Dijkstra,
    BellmanFord,
};
export interface ClientXY {
	clientX: number;
	clientY: number;
};
export interface Vertex extends d3.SimulationNodeDatum {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    fx: number | null;
    fy: number | null;
}
export interface LinkDatum {
    index?: number;
    source: Vertex | number;
    target: Vertex | number; 
    weight: number;
};

export enum Trace {
    outline = 'outline;',
    mark = 'mark',
    clear = 'clear'
};

export type TraceOp = 
    | { type: Trace.outline, nodes: Vertex[] }
    | { type: Trace.mark, nodes: Vertex[], link: LinkDatum }
    | { type: Trace.clear };

export interface VisualTrace {
    outline: (nodes: Vertex[]) => void;
    mark: (nodes: Vertex[], link: LinkDatum) => void;
    clear: () => void;
};

type Recorder = {
    steps: TraceOp[];
    trace: VisualTrace;
};

export default class GraphController {
    private canvas: HTMLCanvasElement;
    private context:  CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private radius: number;
    private mouseX: number;
    private mouseY: number;
    private initialNodes: Vertex[];
    private initialLinks: LinkDatum[];
    private nodes: Vertex[];
    private links: LinkDatum[];
    private simulation: d3.Simulation<Vertex, undefined> | null;
    private nodeToRemove: string | null;
    private from: string | null;
    private to: string | null;
    private algorithmMarkedNodes: Vertex[];
    private algorithmOutlinedNodes: Vertex[];

    private getContext() {
        const context = this.canvas.getContext('2d');
        if(!context) throw new Error('Canvas context is null');
        this.canvas.onmousemove =  
            event => this.updateMouseCanvasPosition(event);
        return context;
    }

    private applyContainerCollision(n: Vertex) {
        const minX = -this.width / 2, maxX = this.width / 2;
        const minY = -this.height / 2, maxY = this.height / 2;
        const r = this.radius, e = 0.9; // restitution (0..1)
        if (n.x < minX + r) { n.x = minX + r; n.vx = Math.abs(n.vx) * e; }
        if (n.x > maxX - r) { n.x = maxX - r; n.vx = -Math.abs(n.vx) * e; }
        if (n.y < minY + r) { n.y = minY + r; n.vy = Math.abs(n.vy) * e; }
        if (n.y > maxY - r) { n.y = maxY - r; n.vy = -Math.abs(n.vy) * e; }
    }

    private findNodeAt(x: number, y: number) {
        if(this.simulation === null) return undefined;
        return this.simulation
            .find(x, y, 2 * this.radius + 2);
    }
    private reheatSimulation(){
        this.simulation?.alpha(0.7).alphaDecay(0.012).alphaTarget(0.0).restart();
    }
    private markUserSelectedNodes(){
        const removalFill = 'oklch(63.7% 0.237 25.331)';
        const linkCreationFill = 'oklch(67.3% 0.182 276.935)';
        this.nodeToRemove && 
        this.markNode(this.nodeToRemove, removalFill);
        this.from &&
        this.markNode(this.from, linkCreationFill);
    }
    
    private outlineAlgorithmNodes() {
        const algorithmOutlineFill = 'oklch(72.3% 0.219 149.579)';
        this.algorithmOutlinedNodes .forEach(n => 
            this.outlineNode(n.id, algorithmOutlineFill));

    }

    private markAlgorithmNodes() {
        const algorithmMarkedFill = 'oklch(72.3% 0.219 149.579)';
        this.algorithmMarkedNodes.forEach(n =>
            this.markNode(n.id, algorithmMarkedFill));

    }
    private SimulationInit() {
        return d3.forceSimulation(this.nodes)
            .force('charge', d3.forceManyBody().strength(-30))
            .force('link', d3.forceLink(this.links).strength(1)
                .distance(this.radius * 7).iterations(10))
            .on('tick', () => {
                this.context.clearRect(0, 0, this.width, this.height);
                this.context.save();
                this.context.translate(this.width / 2, this.height / 2);
                this.context.beginPath();
                for(const d of this.links) {
                    if(
                        typeof d.source === 'number' ||
                            typeof d.target === 'number'
                    ) throw Error('Expected a vertex, found number')
                    this.context.moveTo(d.source.x, d.source.y);
                    this.context.lineTo(d.target.x, d.target.y);
                    //TODO: add a boolean to allow weight toggle
                    this.drawLinkWeight(d.source, d.target, d.weight); 
                }
                this.context.strokeStyle = '#aaa';
                this.context.stroke();
                this.context.beginPath();
                for(const d of this.nodes) {
                    this.applyContainerCollision(d);
                    this.context.moveTo(d.x + this.radius, d.y);
                    this.context.arc(d.x, d.y, this.radius, 0, 2 * Math.PI);
                }
                this.context.fillStyle = 'oklch(55.6% 0 0)';
                this.context.fill();
                this.context.strokeStyle = '#fff';
                this.context.stroke();

                
                this.outlineAlgorithmNodes();
                this.markAlgorithmNodes();
                this.markUserSelectedNodes();
                this.context.restore();
            });




    }
    private DragInit(simulation: d3.Simulation<Vertex, undefined>) {
        return  d3.drag<HTMLCanvasElement, unknown, Vertex | undefined>()
            .subject(({x, y}): Vertex | undefined => 
                simulation.find(x - this.width / 2, y - this.height / 2, 40))
            .on('start', event => {
                //ensures each event starts from an initial 'restart' state
                //otherwise it freezes and prevents subsequent 'start' events from running
                if(!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            })
            .on('drag', event => {
                //update the (x, y) positions
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            })
            .on('end', event => {
                //i think this saves the simulation in the 'end' state.
                if(!event.active) this.reheatSimulation();
                event.subject.fx = null;
                event.subject.fy = null;
            });
    }

    private resize () {
        const w = Math.min(window.innerWidth, window.innerHeight);
        const dpr = window.devicePixelRatio || 1;
        this.width = w; this.height = w;
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(w * dpr);
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${w}px`;
        this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    private onResize = () => { 
        this.resize(); 
        if(this.simulation) this.simulation.restart();

    }

    private setData(newNodes: Vertex[], newLinks: LinkDatum[]) {
        this.nodes = newNodes;
        this.links = newLinks;
        if(this.simulation === null) return;

        this.simulation.nodes(this.nodes);
        const linkForce = this.simulation
        .force<d3.ForceLink<Vertex, LinkDatum>>('link');
        linkForce?.links(newLinks);
        this.reheatSimulation();
    }

    private removeNode() {
        if(!this.nodeToRemove) return; 
        const nextNodes = this.nodes.filter(n => n.id !== this.nodeToRemove);
        const nextLinks = this.links.filter(l => {
           if(typeof l.source === 'number' || typeof l.target === 'number') 
                throw Error('Expected vertex, found number');
            return l.source.id !== this.nodeToRemove && 
            l.target.id !== this.nodeToRemove
        });
        this.setData(nextNodes, nextLinks);
    }


    private outlineNode(id: string, color: string) {

    }
    /*
     * purpose: mark a node for:
     * - deletion 
     * - link creation
     * - algorithm
     * */
    private markNode(id: string, color: string){
        const node = this.nodes.find(n => n.id === id);
        if(!node) return;
        this.context.beginPath();
        this.context.moveTo(node.x + this.radius, node.y);
        this.context.arc(node.x, node.y, this.radius, 0, 2 * Math.PI);
        this.context.fillStyle = color;
        this.context.fill();
    }

    private drawLinkWeight(
            source: Vertex, 
            target: Vertex, 
            weight: number) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const weightFormatted = weight.toString().length > 5 ?
            weight.toFixed(2) :
            weight.toString();
              
        this.context.fillStyle = 'black';
        this.context.font = '12px sans-serif';
        this.context.fillText(weightFormatted, midX, midY);
    }

    private addLink(fromId: string, toId: string) {
        if(this.simulation === null) return;
        const source = this.nodes.find(n => n.id === fromId);
        const target = this.nodes.find(n => n.id === toId);
        if(!source || !target) throw Error('expected node, found undefined');
        //calculate the euclidean distance between the points
        const weight = Math.hypot(
            source.x - target.x, 
            source.y - target.y);
        this.setData(this.nodes, [...this.links, {
            source,
            target,
            weight
        }]);
    }

    private updateMouseCanvasPosition(event: ClientXY) {
        const [x, y] = this.getMouseCanvasCoordinates(event); 
        this.mouseX = x;
        this.mouseY = y;
    }

    private applyTraceStep(op: TraceOp) {
        if(!this.simulation) return;
        switch(op.type) {
            case Trace.outline: null;
            case Trace.mark: 
                //remove duplicate nodes
                //that may come from:
                //(u, v) and (v, w)
                this.algorithmMarkedNodes = [
                    ...this.algorithmMarkedNodes,
                    ...op.nodes
                ].filter((n, i, self) => 
                    i === self.findIndex(
                            m => n.id === m.id)); 
            case Trace.clear: null;
        }
        this.simulation.restart();
    }
    constructor(
        canvas: HTMLCanvasElement, 
        initialNodes: Vertex[],
        initialLinks: LinkDatum[],
        ){
        this.canvas = canvas;
        this.context = this.getContext();
        this.width = 0;
        this.height = 0;
        this.radius = 20;
        this.mouseX = 0;
        this.mouseY = 0;
        this.initialNodes = initialNodes;
        this.initialLinks = initialLinks;
        this.nodes = this.initialNodes.map(n => ({...n}));
        this.links = this.initialLinks.map(l => ({...l}));
        this.nodeToRemove = null;
        this.from = null;
        this.to = null;
        this.algorithmOutlinedNodes = [];
        this.algorithmMarkedNodes = [];
        this.simulation = null;
    }
    
    addNode(node: Vertex) {
        if(this.simulation === null) return;
        if(this.findNodeAt(node.x, node.y)) return;
        this.setData([...this.nodes, node], this.links);
    }
    

    /*
     * purpose: require 2 funcion calls to remove a node
     * call 1: selects the node
     * call 2: confirms selection and removes node
     * */
    handleNodeDeletion() {
        //invalidate any selected edges
        this.from = null;
        this.to = null;
        const node = this.findNodeAt(this.mouseX, this.mouseY);
        if(node && node.id === this.nodeToRemove){
            this.removeNode();
            this.nodeToRemove = null;
            return;
        };

        if(node) {
            this.nodeToRemove = node.id;
            this.simulation?.restart(); // mark node and reflect changes
        };
    }

    handleEdgeCreation() {
        this.nodeToRemove = null; //invalidate any selected node
        if(this.from) {
            const to = this.findNodeAt(this.mouseX, this.mouseY);
            if(to){
                this.to = to.id;  
                this.addLink(this.from, this.to);
                this.from = null;
                this.to = null;
            }
        } else {
            const from = this.findNodeAt(this.mouseX, this.mouseY);
            if(from) {
                this.from = from.id;
            }

        }
        this.simulation?.restart(); //mark node and reflect changes
    }
    

    /*
    * purpose: store the mouse (x, y)
    * coordinates on the canvas
    * can be used when creating a node to 
    * specify its initial position
    */
    getMouseCanvasCoordinates(event: ClientXY) {
	    const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - this.canvas.width / 2;
        const y = event.clientY - rect.top - this.canvas.height / 2;
        return [x, y];
	
    }

   makeTraceRecorder(): Recorder {
        const steps: TraceOp[] = [];
        const trace: VisualTrace = {
            outline: (nodes: Vertex[]) => 
                steps.push({ type: Trace.outline, nodes }),

            mark: (nodes: Vertex[], link: LinkDatum) =>
                steps.push({ type: Trace.mark, nodes, link }),

            clear: () => steps.push({ type: Trace.clear })
        };
        return { steps, trace };

    } 

    async traceRecorderPlayer(steps: TraceOp[], intervalMs: number) {
       //TODO: move all Trace logic into VisualTraceController 
        const sleep = (ms: number) => 
            new Promise(resolve => setTimeout(resolve, ms));
        for(const step of steps) {
            this.applyTraceStep(step);
            await sleep(intervalMs);
        }
    }
    algorithmPlayer() {
        const recorder = this.makeTraceRecorder();
        const graph = new Graph(this.nodes, this.links, recorder.trace);
        graph.kruskal();
        console.log(recorder.steps)
        this.traceRecorderPlayer(recorder.steps, 500);
    }

    render() {
        this.resize();
        this.simulation = this.SimulationInit();
        const drag = this.DragInit(this.simulation);
        d3.select(this.canvas).call(drag);
        window.addEventListener('resize', this.onResize);

    }

    destroy() {
        if(this.simulation) this.simulation.stop();
        d3.select(this.canvas).on('.drag', null);
        window.removeEventListener('resize', this.onResize);
        this.canvas.onmousemove = null;
    }
}
