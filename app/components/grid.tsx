'use client'
import Button from '@/components/ui/button';
import GraphController, { LinkDatum, MSTImplementation, Vertex } from '@/lib/graph-controller';
import { forwardRef, useEffect, useRef } from "react";

const menuItems = ['Start', 'Step Forward', 'Step Back', 'Clear', 'Reset'];
//type Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>;

enum Keys {
	x = 'x',
	c = 'c'
};
export default function Grid() {
	const canvasRef = useRef<HTMLCanvasElement| null>(null);
	const gcRef = useRef<GraphController | null>(null);
	useEffect(() => {
		if(!canvasRef.current) return;
		let nodes: Vertex[] = Array.from({ length: 10 }, () => ({
			id: crypto.randomUUID(),
			x: (Math.random() * 2) - 1,
			y: (Math.random() * 2) - 1,
			vx: 0,
			vy: 0,
			fx: null,
			fy: null,
		}));
		const links: LinkDatum[] = nodes.map((_, i) => ({
			source: i, 
			target: Math.min(i + 1, nodes.length - 1),
			weight: 0
		}));
		const canvas = canvasRef.current;
		const gc = new GraphController(
			canvas,
			nodes,
			links
		);
		gcRef.current = gc;
		gc.render();
		canvas.onclick = event => {
		const [x, y] = gc.getMouseCanvasCoordinates(event);
		gc.addNode({
				id: crypto.randomUUID(),
				x,
				y,
				vx: 0,
				vy: 0,
				fx: null,
				fy: null
			});
			
		}
		
		window.onkeydown = event => {
			
			if(event.key === Keys.x){
				gc.handleNodeDeletion();
			}
			if(event.key === Keys.c){
				gc.handleEdgeCreation();

			}
		}
		gc.minimumSpanningTree(MSTImplementation.Kruskal);
		return () => {
			gc.destroy();
			canvas.onclick = null;
			canvas.onmousemove = null;
			window.onkeydown = null;
		};
			
	}, []);

  return (
	<div className=''>
		<div className='flex gap-2'>
		<Button >Start</Button>
		<Button>Step Forward</Button>
		<Button>Step Back</Button>
		<Button>Clear</Button>
		<Button>Reset</Button>
		</div>
		<div className='m-auto w-fit'>
			<canvas
				className='border-rounded-md shadow' 
				//onMouseDown={() => setVertexCount(prev => prev + 1)}
				ref={canvasRef}
			/>
		</div>
	</div>
  );
}
