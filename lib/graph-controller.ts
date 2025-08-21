class GraphController<T> {
    private canvas: HTMLCanvasElement;
    private window: Window & typeof globalThis;
    private width: number;
    private height: number;
    private initialNodes: T[];
    private initialLinks: number[];
    constructor(
        canvas: HTMLCanvasElement, 
        window: Window & typeof globalThis,
        initialNodes: T[],
        initialLinks: number[]
    ){
        this.canvas = canvas;
        this.window =  window;
        this.width = Math.min(
            this.window.innerHeight,
            this.window.innerWidth
        );
        this.height = this.width;
        this.initialNodes = initialNodes;
        this.initialLinks = initialLinks;
    }
}
