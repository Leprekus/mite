interface UnionFindItem {
    id: string;
}
export class UnionFindNode<T>{
    element: T;
    parent: UnionFindNode<T>;
    size: number;
    constructor(element: T) {
        this.element = element;
        this.parent = this;
        this.size = 1;
    }
}

type UnionFindMap<T> = { [id: string]: UnionFindNode<T> };
export default class UnionFind<T extends UnionFindItem> {
    public nodes: UnionFindMap<T>;
    constructor () {
        this.nodes = {};
    }
    public union(a: T, b: T): void {
        const parent1 = this.find(a);
        const parent2 = this.find(b);
        if(parent1 === parent2) return;
        if(parent1.size >= parent2.size) {
            parent2.parent = parent1;
            parent1.size += parent2.size;
        } else {
            parent1.parent = parent2;
            parent2.size += parent1.size;
        }
    }
    private findHelper(a: UnionFindNode<T>): UnionFindNode<T> {
        if(a.parent !== a) return this.findHelper(a.parent);
        return a;
    }

    public find(k: T): UnionFindNode<T> {
        const key = this.nodes[k.id]; 
        if(key === undefined) 
            throw Error(`No node found with key ${k.id}`);
        return this.findHelper(key);
    }
    public add(k: T): UnionFindNode<T> {
        const v =  new UnionFindNode(k);
        this.nodes[k.id] = v;
        return v;
    }
}
