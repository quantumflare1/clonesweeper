import * as Helper from "./helper.mjs";

export class Tile {
    constructor(r, c) {
        this.type = 0;
        this.row = r;
        this.col = c;
        this.known = false;
        this.flagged = false;
        this.nearbyMines = 0;
        this.number = 0;
        this.nearbyFlags = 0;
        this.held = false;
        this.locked = false;
        this.isNine = false;
        this.interval = -1;
    }
    addNearbyMine() {
        this.nearbyMines++;
        this.number++;
    }
    tickNine(cooldownFactor) {
        const debugFactor = 200;
        let cd;
        switch (cooldownFactor) {
            case 0:
                cd = 2000 + debugFactor;
                break;
            case 1:
                cd = 1000 + debugFactor;
                break;
            case 2:
                cd = 640 + debugFactor;
                break;
            case 3:
                cd = 490 + debugFactor;
                break;
            case 4:
                cd = 350 + debugFactor;
                break;
            case 5:
                cd = 250 + debugFactor;
                break;
            case 6:
                cd = 180 + debugFactor;
                break;
            case 7:
                cd = 140 + debugFactor;
                break;
            case 8:
                cd = 130 + debugFactor;
                break;
            case 9:
                cd = 110 + debugFactor;
                break;
            default:
                cd = 100 + debugFactor;
        }
        this.interval = Helper.interval.make(() => {
            this.number--;
            if (this.number === 0) {
                this.type = 1;
                Helper.interval.clearAll();
                dispatchEvent(new Event("game_ninedeath"));
            }
        }, cd);
    }
}