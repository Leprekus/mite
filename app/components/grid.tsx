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
type VertexComponent = ReactElement<ComponentProps<typeof Vertex>>;
function Vertex () {
	return (
		<circle
		/>
	);
}


//type Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>;
export default function Grid() {
	const [vertexCount, setVertexCount] = useState<number>(0);
	const svgRef = useRef<SVGSVGElement | null>(null);
	useEffect(() => {
		if(!svgRef.current) return;
		const width = 384,
		      height = width;
		const nodes = Array.from({ length: 60 }, () => ({
			x: (Math.random() * 2) - 1,
			y: (Math.random() * 2) - 1,
			r: 20
		}));
		const links = nodes.map((_, i) => ({
			source: nodes[i], 
			target: nodes[Math.min(i + 1, nodes.length - 1)]
		}));
		const svg = d3.select(svgRef.current);
		const simulation = d3.forceSimulation(nodes.slice())
			.force('charge', d3.forceManyBody())
			.force('link', d3.forceLink(links).strength(1).distance(20))
			
		const drag = d3.drag()
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
		svg.selectAll('circle')
			.data(nodes)
			.enter()
			.append('circle')
			.attr('cx', 200)	
			.attr('cy', 200)
			.attr('r', 20)
			.attr('style', 'fill: blue; stroke: black; stroke-width: 2;');
	

	}, []);

  return (
	<svg
		className='bg-red-500 size-96 relative  m-auto' 
		//onMouseDown={() => setVertexCount(prev => prev + 1)}
		ref={svgRef}
	/>
  );
}
