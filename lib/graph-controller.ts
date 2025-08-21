import * as d3 from "d3";

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
};
export default class GraphController {
    private canvas: HTMLCanvasElement;
    private context:  CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private radius: number;
    private initialNodes: Vertex[];
    private initialLinks: LinkDatum[];
    private nodes: Vertex[];
    private links: LinkDatum[];
    private simulation: d3.Simulation<Vertex, undefined> | null;

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
        this.initialNodes = initialNodes;
        this.initialLinks = initialLinks;
        this.nodes = this.initialNodes.map(n => ({...n}));
        this.links = this.initialLinks.map(l => ({...l}));

        this.simulation = null;
    }
    private getContext() {
        const context = this.canvas.getContext('2d');
        if(!context) throw new Error('Canvas context is null');
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

    private isOverlapping(node: Vertex) {
        if(this.simulation === null) return false;
        return this.simulation
                .find(node.x, node.y, 2 * this.radius + 2) === undefined ?
                false : true;

    }
    private SimulationInit() {
        return d3.forceSimulation(this.nodes)
			.force('charge', d3.forceManyBody().strength(-30))
			.force('link', d3.forceLink(this.links).strength(1)
                              .distance(this.radius * 4).iterations(10))
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
				}
				this.context.strokeStyle = '#aaa';
				this.context.stroke();
				this.context.beginPath();
				for(const d of this.nodes) {
                    this.applyContainerCollision(d);
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
                //i think this saves the simulation in the 'end' state.
				if(!event.active) simulation.alphaTarget(0); 
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
		this.simulation.alphaTarget(0.3).restart();
    }
    addNode(node: Vertex) {
        if(this.simulation === null) return;
        if(this.isOverlapping(node)) return;
        this.setData([...this.nodes, node], this.links);
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
    }
}
