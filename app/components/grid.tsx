'use client'
import * as d3 from 'd3';
import { cloneElement, ComponentProps, DragEventHandler, MouseEventHandler, ReactElement, ReactNode, useEffect, useRef, useState } from "react";

enum EventTypes {
	MouseDown = 'mousedown',
	MouseUp = 'mouseup', 
	TouchStart = 'touchstart',
	TouchEnd = 'touchend'

};
function Vertex () {
	const [transform, setTransform] = useState<[number, number, number]>([0, 0, 0]);
	const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
		event.stopPropagation();
		event.nativeEvent.stopImmediatePropagation();
		event.nativeEvent.stopPropagation();
		event.preventDefault();
		if (event.type === EventTypes.MouseDown)
			console.log(EventTypes.MouseDown)
		if (event.type === EventTypes.MouseUp)
			console.log(EventTypes.MouseUp)
		if (event.type === EventTypes.TouchStart)
			console.log(EventTypes.TouchStart)
		if (event.type === EventTypes.TouchEnd)
			console.log(EventTypes.TouchEnd)
	};
	return (
		<div
			className='size-10 bg-blue-500'
			onClick={handleDrag} // stop the propagation to parent
			onMouseDown={handleDrag}	
			onMouseUp={ handleDrag}
			onTouchStart={handleDrag}
			onTouchEnd={handleDrag}
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
