'use client'
import Button from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { AlgorithmName } from '@/lib/graph';
import GraphController, { LinkDatum, Vertex } from '@/lib/graph-controller';
import { Pause, Play, Redo2, RotateCcw, Trash, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from "react";

enum Keys {
	x = 'x',
	c = 'c'
};

enum MediaAction {
	Play = 'play',
	Pause = 'pause',
	StepForward = 'stepForward',
	StepBack = 'stepBack',
	Clear = 'clear',
	Reset = 'reset'
};

const algorithms: AlgorithmName[] = ['bellmanFord', 'prim', 'kruskal', 'dijkstra'];
export default function Grid() {
	const canvasRef = useRef<HTMLCanvasElement| null>(null);
	const visualizerRef = useRef<ReturnType<GraphController['visualizer']> | null>(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
  	const [algorithm, setAlgorithm] = useState<AlgorithmName>('kruskal');
	useEffect(() => {
		if(!canvasRef.current) return;
		const nodes: Vertex[] = Array.from({ length: 10 },() => ({
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
		visualizerRef.current = gc.visualizer();
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
		return () => {
			gc.destroy();
			canvas.onclick = null;
			canvas.onmousemove = null;
			window.onkeydown = null;
		};
			
	}, []);


	const handleMedia = (action: MediaAction) => {
		//every method except play
		//leaves the visualizer in
		//a paused state
		setIsPlaying(false);
		switch(action) {
			case MediaAction.Play:
				setIsPlaying(true);
				visualizerRef.current?.play();
				break;
			case MediaAction.Pause:
				visualizerRef.current?.pause();
				break;
			case MediaAction.StepForward:
				visualizerRef.current?.stepForward();
				break;
			case MediaAction.StepBack:
				visualizerRef.current?.stepBack();
				break;
			case MediaAction.Clear:
				visualizerRef.current?.clear();
				break;
			case MediaAction.Reset:
				visualizerRef.current?.reset();
				break;
		}

	};
	const handleSetAlgorithm = (option: string) => {
		const opt = option as AlgorithmName;
		setAlgorithm(opt);
		handleMedia(MediaAction.Pause);
		visualizerRef.current?.reset(opt);
	}
	return (
	<div className=''>
		<div className='flex gap-2 justify-center items-center'>

		<Button onClick={() =>handleMedia(MediaAction.StepBack)}><Undo2/></Button>
		<Button onClick={() => {
			isPlaying ? 
				handleMedia(MediaAction.Pause) :
				handleMedia(MediaAction.Play)
		}}>{
			isPlaying ? <Pause/> : <Play/>
		}</Button>
		<Button onClick={() =>handleMedia(MediaAction.StepForward)}><Redo2/></Button>
		<Button onClick={() => visualizerRef.current?.reset()}><RotateCcw/></Button>
		<Button className='bg-red-400 text-white hover:bg-red-500 active:bg-red-600'
			onClick={() =>handleMedia(MediaAction.Clear)}
		>
			<Trash/>	
		</Button>
		<Select defaultValue={algorithm} onValueChange={handleSetAlgorithm}>
			<Select.Trigger placeholder="Choose an algorithm" />
			<Select.Content>
				{algorithms
					.map(a => 
					     <Select.Item 
					     	value={a}
						key={a}
					      >
					     	{a}
					     </Select.Item>)}
			</Select.Content>
		</Select>

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
