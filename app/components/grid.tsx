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
function Vertex () {
	const [transform, setTransform] = useState<[number, number, number, number]>([0, 0, 0, 0]);
	const [_, x, __, y] = transform;
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const handleDrag = (event: React.MouseEvent) => {
		event.stopPropagation();
		event.nativeEvent.stopImmediatePropagation();
		event.nativeEvent.stopPropagation();
		event.preventDefault();
		if (event.type === EventTypes.MouseDown) {
			setIsDragging(true); 
			//store initial position (x, y) as 'prevX', 'prevY'
			setTransform(([_, x, __, y]) => [event.clientX, x, event.clientY, y])
		}
		if (event.type === EventTypes.MouseUp){
			setIsDragging(false);
		}
		if (isDragging && event.type === EventTypes.MouseMove){
			const { clientX: cx, clientY: cy } = event;
			setTransform(([px, x, py, y]) => [cx, x - cx + px, cy, y + cy - py]);
		}
		if(event.type === EventTypes.MouseLeave){
			setIsDragging(false);
		}
	};
	return (
		<div
			className='absolute size-10 bg-blue-500'
			style={{ right: x, top: y}}
			draggable
			onMouseDown={handleDrag}	
			onMouseUp={ handleDrag}
			onMouseMove={handleDrag}
			onMouseLeave={handleDrag}
			
		/>
	);
}
//type Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>;
type VertexComponent = ReactElement<ComponentProps<typeof Vertex>>;
export default function Grid() {
	const [vertexCount, setVertexCount] = useState<number>(0);
	useEffect(() => {
	}, []);

  return (
	<div 
		className='bg-red-500 size-96 relative  m-auto' 
		onMouseDown={() => setVertexCount(prev => prev + 1)}
	>
		{Array.from({ length: vertexCount }, (_, i) => <Vertex key={i}/>)}
	</div>
  );
}
