'use client'
import GraphController, { LinkDatum, Vertex } from '@/lib/graph-controller';
import * as d3 from 'd3';
import { cloneElement, ComponentProps, DragEventHandler, MouseEventHandler, ReactElement, ReactNode, useEffect, useRef, useState } from "react";

enum EventTypes {
	MouseDown = 'mousedown',
	MouseUp = 'mouseup', 
	MouseMove = 'mousemove',
	MouseLeave = 'mouseleave',
	TouchStart = 'touchstart',
	TouchEnd = 'touchend'

};

//type Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>;

enum Keys {
	x = 'x',
	c = 'c'
};
export default function Grid() {
	const canvasRef = useRef<HTMLCanvasElement| null>(null);
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
			target: Math.min(i + 1, nodes.length - 1)
		}));
		const canvas = canvasRef.current;
		const gc = new GraphController(
			canvas,
			nodes,
			links
		);
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
		canvas.onmousemove = event => {
			gc.updateMouseCanvasPosition(event);
		}
		window.onkeydown = event => {
			
			if(event.key === Keys.x){
				gc.handleNodeDeletion();
			}
			if(event.key === Keys.c){

			}
		}
			return () => {
				gc.destroy();
				canvas.onclick = null;
				canvas.onmousemove = null;
				window.onkeydown = null;
			};
			
	}, []);

  return (
	<canvas
		className='border-rounded-md shadow' 
		//onMouseDown={() => setVertexCount(prev => prev + 1)}
		ref={canvasRef}
	/>
  );
}
