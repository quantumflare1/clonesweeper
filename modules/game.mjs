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

        if (t.type === 0 && t.nearbyMines === 0) {
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

function clearTile(x, y) {
    if (Helper.isWithinBoard(y, x, BOARD_HEIGHT, BOARD_WIDTH)) {
        const pos = board[y][x];
        if (!pos.flagged && !pos.known) {            
                pos.known = true;
                clearedTiles++;
                clearOpenField(x, y);
                if (pos.type === 1) clickedMine = true;
                console.log("fella");
        }
    }
}

function flagTile(clicked) {
    if (!clicked.known && flags >= 0) {
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
}

function generateBoard(avoidX, avoidY) {
    let mines = NUM_MINES;
    const unminedTiles = [];
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 30; j++) {
            if (i >= avoidY - 1 && i <= avoidY + 1 && j >= avoidX - 1 && j <= avoidX + 1) {
                continue;
            }
            unminedTiles.push(new Tile(i, j));
        }
    }
    for (let i = 0; i < mines; i++) {
        const rand = Math.floor(Math.random() * unminedTiles.length);
        const tile = unminedTiles.splice(rand, 1);

        board[tile[0].row][tile[0].col].type = 1;

        Helper.forAdjacent((r, c) => {
            if (Helper.isWithinBoard(r, c, BOARD_HEIGHT, BOARD_WIDTH)) board[r][c].nearbyMines++;
        }, tile[0].row, tile[0].col);
    }
}

function getClick(e = new PointerEvent()) {
    if (gameState !== 0) {
        return;
    }
    const click = Helper.pixelToBoardCoords(e.offsetX, e.offsetY);
    
    if (click.x < 0 || click.x >= BOARD_WIDTH) return;
    if (click.y < 0 || click.y >= BOARD_HEIGHT) return;

    const clicked = board[click.y][click.x];

    if (e.button === 0 && !clicked.flagged) {
        if (phase === 0) {
            generateBoard(click.x, click.y);
            startGame();
        }
        clearTile(click.x, click.y);
    } else if (e.button === 2) {
        if (!clicked.known) flagTile(clicked);
        if (clicked.nearbyFlags === clicked.nearbyMines && clicked.known) {
            Helper.forAdjacent(clearTile, click.x, click.y);
        }
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
    startTime = document.timeline.currentTime;
    console.log(BOARD_HEIGHT * BOARD_WIDTH - NUM_MINES);

    for (let i = 0; i < BOARD_HEIGHT; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            board[i][j] = new Tile(i, j);
        }
    }
}


export { board, clearedTiles, clickedMine, gameState, flags, time, phase, startTime, clearOpenField, incrementTime, generateBoard, getClick, startGame, endGame, init };