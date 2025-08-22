// union-find.spec.ts
import { describe, it, expect } from 'vitest';
import UnionFind, { UnionFindNode } from '../../lib/union-find';
type Item = { id: string; label?: string };

const A: Item = { id: 'a', label: 'A' };
const B: Item = { id: 'b', label: 'B' };
const C: Item = { id: 'c', label: 'C' };

describe('UnionFind', () => {
  it('adds nodes and find returns the node itself before unions', () => {
    const uf = new UnionFind<Item>();
    const na = uf.add(A);
    const nb = uf.add(B);

    expect(Object.keys(uf.nodes)).toHaveLength(2);
    expect(uf.find(A)).toBe(na);
    expect(uf.find(B)).toBe(nb);

    // parent should point to self initially
    expect(na.parent).toBe(na);
    expect(nb.parent).toBe(nb);
    expect(na.size).toBe(1);
    expect(nb.size).toBe(1);
  });

  it('unions by size: smaller attaches to larger; sizes add up', () => {
    const uf = new UnionFind<Item>();
    const na = uf.add(A);
    const nb = uf.add(B);
    const nc = uf.add(C);

    // union A-B: equal sizes, B should attach to A (>= branch)
    uf.union(A, B);
    const rootAB = uf.find(A);
    expect(rootAB).toBe(uf.find(B));
    expect(rootAB).toBe(na); // A stays root on tie
    expect(rootAB.size).toBe(2);
    expect(nb.parent).toBe(rootAB);

    // union C-A: C(1) attaches under rootAB(2)
    uf.union(C, A);
    const rootABC = uf.find(A);
    expect(rootABC).toBe(uf.find(C));
    expect(rootABC).toBe(na);
    expect(rootABC.size).toBe(3);
    expect(nc.parent).toBe(rootABC);
  });

  it('union is idempotent when nodes already connected', () => {
    const uf = new UnionFind<Item>();
    uf.add(A);
    uf.add(B);

    uf.union(A, B);
    const root1 = uf.find(A);
    const size1 = root1.size;

    uf.union(A, B); // no change expected
    const root2 = uf.find(B);
    expect(root2).toBe(root1);
    expect(root2.size).toBe(size1);
  });

  it('supports transitive connectivity', () => {
    const uf = new UnionFind<Item>();
    uf.add(A);
    uf.add(B);
    uf.add(C);

    uf.union(A, B);
    uf.union(B, C);

    const rA = uf.find(A);
    const rB = uf.find(B);
    const rC = uf.find(C);
    expect(rA).toBe(rB);
    expect(rB).toBe(rC);
    expect(rA.size).toBe(3);
  });

  it('find throws for unknown id', () => {
    const uf = new UnionFind<Item>();
    uf.add(A);
    expect(() => uf.find({ id: 'missing' })).toThrowError(
      /No node found with key missing/
    );
  });

  it('UnionFindNode exposes element and parent link', () => {
    const uf = new UnionFind<Item>();
    const na = uf.add(A);
    expect(na).toBeInstanceOf(UnionFindNode);
    expect(na.element).toEqual(A);
    expect(na.parent).toBe(na);
  });
});

