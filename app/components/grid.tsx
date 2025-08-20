'use client'
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
type Vertex = {
	x: number;
	y: number;
	r: number;
	fx?: number | null;
	fy?: number | null;
} | undefined;
export default function Grid() {
	const canvasRef = useRef<HTMLCanvasElement| null>(null);
	useEffect(() => {
		if(!canvasRef.current) return;
		const width = 384,
		      height = width;
		const radius = 20;
		const Nodes = Array.from({ length: 60 }, () => ({
			x: (Math.random() * 2) - 1,
			y: (Math.random() * 2) - 1,
			r: radius
		}));
		const Links = Nodes.map((_, i) => ({
			source: Nodes[i], 
			target: Nodes[Math.min(i + 1, Nodes.length - 1)]
		}));

		const nodes = Nodes.slice();
		const links = Links.slice();

		canvasRef.current.width = width;
		canvasRef.current.height = height;
		const context = canvasRef.current.getContext('2d');
		if(!context) throw Error('no context');

		const simulation = d3.forceSimulation(nodes)
			.force('charge', d3.forceManyBody().strength(-30))
			.force('link', d3.forceLink(links).strength(1).distance(radius).iterations(10))
			.on('tick', () => {
				context.clearRect(0, 0, width, height);
				context.save();
				context.translate(width / 2, height / 2);
				context.beginPath();
				for(const d of links) {
					context.moveTo(d.source.x, d.source.y);
					context.lineTo(d.target.x, d.target.y);
				}
				context.strokeStyle = '#aaa';
				context.stroke();
				context.beginPath();
				for(const d of nodes) {
					context.moveTo(d.x + 3, d.y);
					context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
				}
				context.fill();
				context.strokeStyle = '#fff';
				context.stroke();
				context.restore();
			})
			
		const drag = d3.drag<HTMLCanvasElement, unknown, Vertex>()
			.subject(({x, y}) => simulation.find(x - width / 2, y - height / 2, 40))
			.on('start', event => {
				if(!event.active) simulation.alphaTarget(0.3).restart();
				event.subject.fx = event.subject.x;
				event.subject.fy = event.subject.y;
			})
			.on('drag', event => {
				event.subject.fx = event.x;
				event.subject.fy = event.y;
			})
			.on('end', event => {
				if(!event.active) simulation.alphaTarget(0);
				event.subject.fx = null;
				event.subject.fy = null;
			});

			d3.select(context.canvas).call(drag).node();
	}, []);

  return (
	<canvas
		className='bg-red-500' 
		//onMouseDown={() => setVertexCount(prev => prev + 1)}
		ref={canvasRef}
	/>
  );
}
