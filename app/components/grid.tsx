'use client'
import * as d3 from 'd3';
import { ComponentProps, ReactElement, ReactNode, useEffect, useRef, useState } from "react";

function Vertex () {
	return <g/>
}
//type Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>;
type VertexComponent = ReactElement<ComponentProps<typeof Vertex>>;
export default function Grid() {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [vertices, setVertices] = useState<VertexComponent[]>([]);
	useEffect(() => {
		if(!svgRef.current) return;
		svgRef.current.onclick = 
			() => void setVertices(prev => [...prev, <Vertex key={prev.length}/>]);
		//const svg = d3.select(svgRef.current);
	}, [])
  return (
	<svg 
		className='bg-red-500 size-96 relative flex flex-wrap m-auto' 
		ref={svgRef}
	>
		{vertices}
	</svg>
  );
}
