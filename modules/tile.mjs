export class Tile {
    constructor(r, c) {
        this.type = 0;
        this.row = r;
        this.col = c;
        this.known = false;
        this.flagged = false;
        this.nearbyMines = 0;
        this.nearbyFlags = 0;
    }
}