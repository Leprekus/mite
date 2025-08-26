'use client'
import Button from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import GraphController, { LinkDatum, MSTImplementation, StackFrameAction, Vertex } from '@/lib/graph-controller';
import { Pause, Play, Redo2, RedoDot, RotateCcw, Trash, Undo2, UndoDot } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from "react";

const menuItems = ['Start', 'Step Forward', 'Step Back', 'Clear', 'Reset'];
//type Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>;

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
export default function Grid() {
	const canvasRef = useRef<HTMLCanvasElement| null>(null);
	const visualizerRef = useRef<ReturnType<GraphController['visualizer']> | null>(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
  	const [algorithm, setAlgorithm] = useState<string | null>(null);
	useEffect(() => {
		if(!canvasRef.current) return;
		let nodes: Vertex[] = Array.from({ length: 10 },() => ({
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
		setAlgorithm(option);
	}
	return (
	<div className=''>
		<div className='flex gap-2'>

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
		<Select defaultValue={null} onValueChange={handleSetAlgorithm}>
			<Select.Trigger placeholder="Choose an algorithm" />
			<Select.Content>
				<Select.Item value="Dijkstra">Dijkstra</Select.Item>
				<Select.Item value="Kruskal">Kruskal</Select.Item>
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
