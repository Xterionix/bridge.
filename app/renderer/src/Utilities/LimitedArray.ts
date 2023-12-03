export default class LimitedArray {
    maxLength: number;
    lastClosed: string[];
    lastIndex: number[];

    constructor(maxLength: number = 10) {
        this.maxLength = maxLength;
        this.lastClosed = [];
        this.lastIndex = [];
    }

    get length() {
        return this.lastClosed.length
    }

    push(item: string): void {
        this.lastClosed.push(item);
        if (this.lastClosed.length > this.maxLength) {
            this.lastClosed.shift();
        }
        this.lastIndex.push(this.lastClosed.indexOf(item));
    }

    pop(): string | undefined {
        if (this.lastClosed.length === 0) return undefined;
        const value = this.lastClosed[this.lastIndex.pop()];
        this.lastClosed = this.lastClosed.filter((x) => x !== value);
        return value;
    }

    toString(): string {
        return this.lastClosed.toString();
    }
}