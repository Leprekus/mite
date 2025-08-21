import * as d3 from "d3";

interface Vertex extends d3.SimulationNodeDatum {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
}
interface LinkDatum {
    index: number;
    source: Vertex;
    target: Vertex; 
};
export default class GraphController {
    private canvas: HTMLCanvasElement;
    private context:  CanvasRenderingContext2D;
    private window: Window & typeof globalThis;
    private width: number;
    private height: number;
    private radius: number;
    private initialNodes: Vertex[];
    private initialLinks: LinkDatum[];
    private nodes: Vertex[];
    private links: LinkDatum[];

    constructor(
        canvas: HTMLCanvasElement, 
        window: Window & typeof globalThis,
        initialNodes: Vertex[],
        initialLinks: LinkDatum[],
        ){
        this.canvas = canvas;
        this.context = this.getContext();
        this.window =  window;
        this.width = Math.min(
            this.window.innerHeight,
            this.window.innerWidth
        );
        this.radius = 20;
        this.height = this.width;
        this.initialNodes = initialNodes;
        this.initialLinks = initialLinks;
        this.nodes = this.initialNodes
            .map(n => Object.create(n));
        this.links = this.initialLinks
            .map(n => Object.create(n));

    }
    private getContext() {
        const context = this.canvas.getContext('2d');
        if(!context) throw new Error('Canvas context is null');
        return context;
    }

    private SimulationInit() {
        return d3.forceSimulation(this.nodes)
			.force('charge', d3.forceManyBody().strength(-30))
			.force('link', d3.forceLink(this.links).strength(1)
                              .distance(radius * 4).iterations(10))
			.on('tick', () => {
				this.context.clearRect(0, 0, this.width, this.height);
				this.context.save();
				this.context.translate(this.width / 2, this.height / 2);
				this.context.beginPath();
				for(const d of this.links) {
                    this.context.moveTo(d.source.x, d.source.y);
                    this.context.lineTo(d.target.x, d.target.y);
				}
				this.context.strokeStyle = '#aaa';
				this.context.stroke();
				this.context.beginPath();
				for(const d of this.nodes) {
                    this.context.moveTo(d.x + this.radius, d.y);
					this.context.arc(d.x, d.y, this.radius, 0, 2 * Math.PI);
				}
				this.context.fill();
				this.context.strokeStyle = '#fff';
				this.context.stroke();
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
				if(!event.active) simulation.alphaTarget(0); //i think this saves the simulation in the 'end' state.
				event.subject.fx = null;
				event.subject.fy = null;
			});
    }
    init() {
        const simulation = this.SimulationInit();
        this.DragInit(simulation);
    }
}
