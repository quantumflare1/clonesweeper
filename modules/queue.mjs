export class Queue {
    constructor() {
        this.q = [];
        this.length = 0;
    }
    add(el) {
        this.q.push(el);
        this.length++;
    }
    remove() {
        this.length--;
        return this.q.splice(0, 1)[0];
    }
    isEmpty() {
        return this.length === 0;
    }
}