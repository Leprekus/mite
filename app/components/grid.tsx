'use client'

import { ReactNode, useState } from "react";

const Vertex = () => <span className='size-12 bg-blue-500 rounded-full'/>;
export default function Grid() {
	const [vertices, setVertices] = useState<Array<ReactNode>>([]);
	console.log(vertices);
  return (
	<div 
		className='bg-red-500 size-96 relative flex flex-wrap m-auto' 
		onClick={() => setVertices(prev => [...prev, <Vertex key={prev.length}/>])}>
		{vertices}
	</div>
  );
}
