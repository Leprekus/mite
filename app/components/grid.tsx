'use client'
import GraphController, { LinkDatum, Vertex } from '@/lib/graph-controller';
import { randomUUID } from 'crypto';
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

export default function Grid() {
	const canvasRef = useRef<HTMLCanvasElement| null>(null);
	useEffect(() => {
		if(!canvasRef.current) return;
		let nodes: Vertex[] = Array.from({ length: 10 }, () => ({
			id: randomUUID(),
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
		console.log(nodes);
		const canvas = canvasRef.current;
		const gc = new GraphController(
			canvas,
			nodes,
			links
		);
		gc.render();
		canvas.onclick = () => {
			gc.addNode({
				id: randomUUID(),
				y: 0,
				x: 0,
				vx: 0,
				vy: 0,
				fx: null,
				fy: null
			});
		}
			return () => {
				gc.destroy();
				canvas.onclick = null;
			};
			
	}, []);

  return (
	<canvas
		className='bg-red-500' 
		//onMouseDown={() => setVertexCount(prev => prev + 1)}
		ref={canvasRef}
	/>
  );
}
