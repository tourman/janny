import invariant from 'invariant';

export class FrozenMap<K, V> extends Map<K, V> {
  constructor(...args: ConstructorParameters<typeof Map<K, V>>) {
    super(...args);
    this.frozen = true;
  }
  protected frozen = false;
  protected whatIf() {
    invariant(!this.frozen, 'The map is frozen');
  }
  set(key: K, value: V): this {
    this.whatIf();
    return super.set(key, value);
  }
  delete(key: K): boolean {
    this.whatIf();
    return super.delete(key);
  }
  clear(): void {
    this.whatIf();
    return super.clear();
  }
}
