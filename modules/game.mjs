import { Queue } from "./queue.mjs";
import { Tile } from "./tile.mjs";
import * as Helper from "./helper.mjs";

const BOARD_HEIGHT = 16;
const BOARD_WIDTH = 30;
const NUM_MINES = 99;
const board = [];

let clearedTiles = 0;
let clickedMine = null;
let flags = 49;
let time = 0;
let phase = 0;
let gameState = 0;
let startTime;
let clickedTile;
let trolling;
const phaseThresholds = [ 0, 80, 20, 30, 20, 35, 15, 40, 20, 25, 15, 25, 20, 35 ];

const enterPhase = {
    // big fan of how javascript just lets you name functions as numbers
    2() {
        phase = 2;
        const unknown = [];
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            for (let j = 0; j < BOARD_WIDTH; j++) {
                if (!board[i][j].known) {
                    unknown.push([i, j]);
                }
            }
        }
    
        for (let i = 0; i < unknown.length; i++) {
            const curTile = unknown[i];
            board[curTile[0]][curTile[1]].locked = true;
        }
        generate9();
        document.title = "Locksweeper";
        console.log(`phase ${phase} entered`);
    },
    3() {
        phase = 3;
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            for (let j = 0; j < BOARD_WIDTH; j++) {
                board[i][j].locked = false;
            }
        }
        console.log(`phase ${phase} entered`);
    },
    4() {
        phase = 4;
        console.log(`phase ${phase} entered`);
    },
    5() {
        phase = 5;
        console.log(`phase ${phase} entered`);
    },
    6() {
        phase = 6;
        console.log(`phase ${phase} entered`);
    },
    7() {
        phase = 7;
        console.log(`phase ${phase} entered`);
    },
    8() {
        phase = 8;
        console.log(`phase ${phase} entered`);
    },
    9() {
        phase = 9;
        console.log(`phase ${phase} entered`);
    },
    10() {
        phase = 10;
        console.log(`phase ${phase} entered`);
    },
    11() {
        phase = 11;
        console.log(`phase ${phase} entered`);
    },
    12() {
        phase = 12;
        console.log(`phase ${phase} entered`);
    },
    13() {
        phase = 13;
        console.log(`phase ${phase} entered`);
    },
    14() {
        phase = 14;
        console.log(`phase ${phase} entered`);
    }
};

function printBoard() {
    for (const i of board) {
        for (const j of i) {
            console.log(j);
        }
    }
    phase = 3;
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            board[i][j].locked = false;
        }
    }
    console.log("phase 3 entered");
}

function generate9() {
    const unknown = [];
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (!board[i][j].known) {
                unknown.push([i, j]);
            }
        }
    }

    const rand = Math.floor(Math.random() * unknown.length);
    const tile = board[unknown[rand][0]][unknown[rand][1]];
    tile.number = 9;
    tile.locked = false;
    tile.isNine = true;
    return unknown[rand];
}

function enterPhase2() {
    phase = 2;
    const unknown = [];
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (!board[i][j].known) {
                unknown.push([i, j]);
            }
        }
    }

    for (let i = 0; i < unknown.length; i++) {
        const curTile = unknown[i];
        board[curTile[0]][curTile[1]].locked = true;
    }
    generate9();
    document.title = "Locksweeper";
    console.log("phase 2 entered");
}

function unlockBoard() {
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            board[i][j].locked = false;
        }
    }
}

function clearOpenField(x, y) {
    const q = new Queue();
    q.add(board[y][x]);
    board[y][x].known = true;

    function bfsClearTile(col, row) {
        if (Helper.isWithinBoard(row, col, BOARD_HEIGHT, BOARD_WIDTH) && !board[row][col].known) {
            board[row][col].known = true;
            q.add(board[row][col]);
            clearedTiles++;
        }
    }

    while (!q.isEmpty()) {
        const t = q.remove();

        if (t.type === 0 && t.nearbyMines === 0 && t.nearbyFlags === 0) {
            bfsClearTile(t.col-1, t.row-1);
            bfsClearTile(t.col-1, t.row);
            bfsClearTile(t.col-1, t.row+1);
            bfsClearTile(t.col, t.row-1);
            bfsClearTile(t.col, t.row+1);
            bfsClearTile(t.col+1, t.row-1);
            bfsClearTile(t.col+1, t.row);
            bfsClearTile(t.col+1, t.row+1);
        }
    }
}

function holdTile(x, y) {
    if (Helper.isWithinBoard(y, x, BOARD_HEIGHT, BOARD_WIDTH) && !board[y][x].flagged && !board[y][x].locked) board[y][x].held = true;
}

function clearTile(x, y) {
    if (Helper.isWithinBoard(y, x, BOARD_HEIGHT, BOARD_WIDTH)) {
        const pos = board[y][x];
        if (pos.isNine && !pos.known) {
            pos.tickNine(trolling.ninesFlagged);
            pos.known = true;
        }
        else if (!pos.flagged && !pos.known && !pos.locked && !pos.isNine) {            
                pos.known = true;
                pos.held = false;
                clearedTiles++;
                clearOpenField(x, y);
                if (pos.type === 1) clickedMine = true;
        }
    }
}

function flagTile(clicked) {
    if (!clicked.known && !clicked.locked && flags > 0) {
        clicked.flagged = !clicked.flagged;
        if (clicked.flagged) {
            flags--;

            Helper.forAdjacent((r, c) => {
                if (Helper.isWithinBoard(r, c, BOARD_HEIGHT, BOARD_WIDTH)) board[r][c].nearbyFlags++;
            }, clicked.row, clicked.col);
        }
        else {
            flags++;

            Helper.forAdjacent((r, c) => {
                if (Helper.isWithinBoard(r, c, BOARD_HEIGHT, BOARD_WIDTH)) board[r][c].nearbyFlags--;
            }, clicked.row, clicked.col);
        }
    }
    else if (clicked.isNine) {
        clicked.isNine = false;
        clicked.known = false;
        clicked.locked = true;
        clicked.number = clicked.nearbyMines;
        trolling.ninesFlagged++;
        Helper.interval.clear(clicked.interval);
        if (trolling.ninesFlagged < 10) {
            const pos = generate9();
            clearTile(pos[1], pos[0]);
        } else {
            unlockBoard();
        }
    }
}

function generateBoard(avoidX, avoidY) {
    let mines = NUM_MINES;
    const unminedTiles = [];

    // split board into 4x5 sectors
    for (let i = 0; i < BOARD_HEIGHT / 4; i++) {
        for (let j = 0; j < BOARD_WIDTH / 5; j++) {
            unminedTiles.push([]);
            for (let k = 0; k < 4; k++) {
                for (let l = 0; l < 5; l++) {
                    if (i*4+k >= avoidY - 1 && i*4+k <= avoidY + 1 && j*5+l >= avoidX - 1 && j*5+l <= avoidX + 1) {
                        continue;
                    }
                    unminedTiles[i*6+j].push([i*4+k, j*5+l]);
                }
            }
        }
    }
    for (let i = 0; i < unminedTiles.length; i++) {
        for (let j = 0; j < Math.floor(NUM_MINES / unminedTiles.length); j++) {
            const rand = Math.floor(Math.random() * unminedTiles[i].length);
            const tile = unminedTiles[i].splice(rand, 1)[0];

            board[tile[0]][tile[1]].type = 1;

            Helper.forAdjacent((r, c) => {
                if (Helper.isWithinBoard(r, c, BOARD_HEIGHT, BOARD_WIDTH)) board[r][c].addNearbyMine();
            }, tile[0], tile[1]);
            mines--;
        }
    }
    for (let i = 0; i < mines; i++) {
        const randSector = Math.floor(Math.random() * unminedTiles.length);
        const randTile = Math.floor(Math.random() * unminedTiles[randSector].length);
        const tile = unminedTiles[randSector].splice(randTile, 1)[0];

        board[tile[0]][tile[1]].type = 1;
        Helper.forAdjacent((r, c) => {
            if (Helper.isWithinBoard(r, c, BOARD_HEIGHT, BOARD_WIDTH)) board[r][c].addNearbyMine();
        }, tile[0], tile[1]);
    }
}

function getHold(e = new PointerEvent()) {
    if (gameState !== 0) {
        return;
    }
    const click = Helper.pixelToBoardCoords(e.offsetX, e.offsetY);

    if (click.x < 0 || click.x >= BOARD_WIDTH) return;
    if (click.y < 0 || click.y >= BOARD_HEIGHT) return;

    clickedTile = board[click.y][click.x];

    if (!clickedTile.flagged && !clickedTile.locked) {
        if (e.button === 0) {
            holdTile(click.x, click.y);
        }
        if (e.button === 2) {
            if (clickedTile.known) {
                Helper.forAdjacent(holdTile, click.x, click.y);
            }
        }
    }
}

function getClick(e = new PointerEvent()) {
    if (gameState !== 0) {
        return;
    }
    const click = Helper.pixelToBoardCoords(e.offsetX, e.offsetY);
    
    if (click.x < 0 || click.x >= BOARD_WIDTH) return;
    if (click.y < 0 || click.y >= BOARD_HEIGHT) return;

    clickedTile.held = false;
    Helper.forAdjacent((x, y) => {
        if (Helper.isWithinBoard(y, x, BOARD_HEIGHT, BOARD_WIDTH) && board[y][x].held) board[y][x].held = false;
    }, clickedTile.col, clickedTile.row);

    clickedTile = board[click.y][click.x];

    if (!clickedTile.locked) {
        if (e.button === 0 && !clickedTile.flagged) {
            if (phase === 0) {
                generateBoard(click.x, click.y);
                startGame();
            }
            clearTile(click.x, click.y);
        } else if (e.button === 2) {

            if (!clickedTile.known || clickedTile.isNine) flagTile(clickedTile);
            else if (clickedTile.nearbyFlags === clickedTile.nearbyMines) {
                Helper.forAdjacent(clearTile, click.x, click.y);
            }
        }
    }
    console.log(clearedTiles, phaseThresholds[phase]);
    if (clearedTiles >= phaseThresholds[phase]) {
        //enterPhase[`${phase+1}`]();
    }

    if (clearedTiles === BOARD_HEIGHT * BOARD_WIDTH - NUM_MINES)
        endGame(true);
    if (clickedMine)
        endGame(false);
}

function incrementTime(value) {
    time = value;
}

function startGame() {
    phase = 1;
    startTime = document.timeline.currentTime;
    dispatchEvent(new Event("game_start"));
}

function endGame(win) {
    gameState = win ? 1 : 2;
    dispatchEvent(new Event("game_end"));
}

function init() {
    flags = NUM_MINES;
    time = 0;
    phase = 0;
    clearedTiles = 0;
    gameState = 0;
    clickedMine = null;
    trolling = {
        ninesFlagged: 0
    };
    for (let i = 1; i < phaseThresholds.length; i++) {
        phaseThresholds[i] += phaseThresholds[i-1];
    }
    console.log(BOARD_HEIGHT * BOARD_WIDTH - NUM_MINES);

    for (let i = 0; i < BOARD_HEIGHT; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            board[i][j] = new Tile(i, j);
        }
    }
    addEventListener("game_ninedeath", () => {
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            for (let j = 0; j < BOARD_WIDTH; j++) {
                board[i][j].locked = false;
            }
        }
        gameState = 2;
    });
    Helper.interval.clearAll();
}


export { board, clearedTiles, clickedMine, gameState, flags, time, phase, startTime, trolling, clearOpenField, incrementTime, generateBoard, getHold, getClick, startGame, endGame, init };