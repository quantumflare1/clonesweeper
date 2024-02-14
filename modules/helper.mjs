const interval = {
    intervals: new Set(),
    make(...args) {
        const newInterval = setInterval(...args);
        this.intervals.add(newInterval);
        return newInterval;
    },
    clear(id) {
        this.intervals.delete(id);
        return clearInterval(id);
    },
    clearAll() {
        this.intervals.forEach((v) => {
            this.clear(v);
        });
    }
};

function isWithinBoard(r, c, bh, bw) {
    return r >= 0 && r < bh && c >= 0 && c < bw;
}

function pixelToBoardCoords(x, y) {
    return { x: Math.floor(x / 16 - 1), y: Math.floor(y / 16 - 5) };
}

function forAdjacent(callback, row, col, ...params) {
    callback(row-1, col-1, ...params);
    callback(row-1, col, ...params);
    callback(row-1, col+1, ...params);
    callback(row, col-1, ...params);
    callback(row, col+1, ...params);
    callback(row+1, col-1, ...params);
    callback(row+1, col, ...params);
    callback(row+1, col+1, ...params);
}

export { interval, isWithinBoard, pixelToBoardCoords, forAdjacent };