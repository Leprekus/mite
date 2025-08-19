'use client'
import * as d3 from 'd3';
import { cloneElement, ComponentProps, ReactElement, ReactNode, useEffect, useRef, useState } from "react";

interface VertexProps { transform : string };
function Vertex ({ transform }: VertexProps) {
	return (
		<circle
			r={10}
			stroke='black'
			fill='white'
			className='transition-colors duration-200 hover:fill-gray-200'
			transform={transform}
		/>
	);
}
//type Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>;
type VertexComponent = ReactElement<ComponentProps<typeof Vertex>>;
export default function Grid() {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [vertexCount, setVertexCount] = useState<number>(0);
	const [transform, setTransform] = useState<string>('');
	useEffect(() => {
		if(!svgRef.current) return;
		svgRef.current.onclick = 
			() => void setVertexCount(prev => prev + 1);
		const svg = d3.select(svgRef.current);
		svg.call(
			d3.zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.15, 4.0])
				.on('zoom', event => {
					setTransform(String(event.transform))
				})
		);


		const datums = Array.from({ length: 69 }, () => ({}));
		
		const sim = d3.forceSimulation(datums)
			.force('x', d3.forceX(200).strength(0.05))
			.force('y', d3.forceY(200).strength(0.05))
			.force('collide', d3.forceCollide(24))

		const vertices = svg	
			.selectAll('circle')
			.data(datums)
			.enter()
			.append('circle')
			.attr('r', 10)
			.attr('fill', 'blue')
			.attr('stroke', 'yellow')
			.attr('style', 'transition-property: fill; transition-duration: 200ms;');
		sim.alphaDecay(0);
		sim.on('tick', () => {
			vertices
				.attr('cx', d => d.x)
				.attr('cy', d => d.y)
		})

	}, []);

  return (
	<svg 
		className='bg-red-500 size-96 relative  m-auto' 
		ref={svgRef}
	>
		{Array(vertexCount)
			.fill(0)
			.map((_, i) => <Vertex transform={transform} key={`vertex-${i}`}/>)
		}
	</svg>
  );
}
