import sprFiles from "./data/sprites.json" assert { type: "json" };
import { Tile } from "./modules/tile.mjs";
import { Queue } from "./modules/queue.mjs";
const $ = (l) => document.getElementById(l);

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const sprites = [];
const BOARD_WIDTH = 30;
const BOARD_HEIGHT = 16;
const NUM_MINES = 99;

let flagsLeft;
let secondsPassed;
let x, y;
const board = [];
let phase;
let clearedTiles;
let winState;
let clickedMine;
let millis;
let startTime;

function readDigit(num, digit) {
    return Math.floor(num / 10 ** (digit - 1) % 10);
}

// when the search is breadth first
function clearOpenField(x, y) {
    const q = new Queue();
    q.add(board[y][x]);
    board[y][x].known = true;

    while (!q.isEmpty()) {
        const t = q.remove();

        if (t.type === 0 && t.nearbyMines === 0) {
            if (isWithinBoard(t.row-1, t.col) && !board[t.row-1][t.col].known) {
                board[t.row-1][t.col].known = true;
                q.add(board[t.row-1][t.col]);
                clearedTiles++;
            }
            if (isWithinBoard(t.row, t.col-1) && !board[t.row][t.col-1].known) {
                board[t.row][t.col-1].known = true;
                q.add(board[t.row][t.col-1]);
                clearedTiles++;
            }
            if (isWithinBoard(t.row+1, t.col) && !board[t.row+1][t.col].known) {
                board[t.row+1][t.col].known = true;
                q.add(board[t.row+1][t.col]);
                clearedTiles++;
            }
            if (isWithinBoard(t.row, t.col+1) && !board[t.row][t.col+1].known) {
                board[t.row][t.col+1].known = true;
                q.add(board[t.row][t.col+1]);
                clearedTiles++;
            }
            if (isWithinBoard(t.row-1, t.col-1) && !board[t.row-1][t.col-1].known) {
                board[t.row-1][t.col-1].known = true;
                q.add(board[t.row-1][t.col-1]);
                clearedTiles++;
            }
            if (isWithinBoard(t.row+1, t.col-1) && !board[t.row+1][t.col-1].known) {
                board[t.row+1][t.col-1].known = true;
                q.add(board[t.row+1][t.col-1]);
                clearedTiles++;
            }
            if (isWithinBoard(t.row-1, t.col+1) && !board[t.row-1][t.col+1].known) {
                board[t.row-1][t.col+1].known = true;
                q.add(board[t.row-1][t.col+1]);
                clearedTiles++;
            }
            if (isWithinBoard(t.row+1, t.col+1) && !board[t.row+1][t.col+1].known) {
                board[t.row+1][t.col+1].known = true;
                q.add(board[t.row+1][t.col+1]);
                clearedTiles++;
            }
        }
    }
}

function clearTile(x, y) {
    if (isWithinBoard(y, x) && !board[y][x].flagged) {
        board[y][x].known = true;
        clearedTiles++;
        if (board[y][x].nearbyMines === 0) clearOpenField(x, y);
        if (board[y][x].type === 1) clickedMine = true;
    }
}

function getClick(e = new PointerEvent()) {
    if (e.offsetX >= 242 && e.offsetX <= 256 && e.offsetY >= 26 && e.offsetY <= 54) {
        init();
        return;
    }
    const clickCoords = pixelToBoardCoords(e.offsetX, e.offsetY);
    x = clickCoords.x;
    y = clickCoords.y;
    
    if (x < 0 || x >= canvas.clientWidth / 16 - 2) return;
    if (y < 0 || y >= canvas.clientHeight / 16 - 6) return;

    if (e.button === 0 && !board[y][x].flagged) {
        if (board[y][x].type === 1) {
            clickedMine = true;
        }
        if (phase === 0) {
            startGame();
        }
        board[y][x].known = true;
        clearedTiles++;
        if (board[y][x].nearbyMines === 0 && board[y][x].type === 0) {
            clearOpenField(x, y);
        }
    } else if (e.button === 2) {
        if (!board[y][x].known && flagsLeft >= 0) {
            board[y][x].flagged = !board[y][x].flagged;
            if (board[y][x].flagged) {
                flagsLeft--;
            }
            else {
                flagsLeft++;
            }

            if (isWithinBoard(y-1, x-1)) board[y-1][x-1].nearbyFlags++;
            if (isWithinBoard(y-1, x)) board[y-1][x].nearbyFlags++;
            if (isWithinBoard(y-1, x+1)) board[y-1][x+1].nearbyFlags++;
            if (isWithinBoard(y, x-1)) board[y][x-1].nearbyFlags++;
            if (isWithinBoard(y, x+1)) board[y][x+1].nearbyFlags++;
            if (isWithinBoard(y+1, x-1)) board[y+1][x-1].nearbyFlags++;
            if (isWithinBoard(y+1, x)) board[y+1][x].nearbyFlags++;
            if (isWithinBoard(y+1, x+1)) board[y+1][x+1].nearbyFlags++;
        }
        else if (board[y][x].nearbyFlags === board[y][x].nearbyMines) {
            clearTile(x-1, y-1);
            clearTile(x-1, y);
            clearTile(x-1, y+1);
            clearTile(x, y-1);
            clearTile(x, y+1);
            clearTile(x+1, y-1);
            clearTile(x+1, y);
            clearTile(x+1, y+1);
        }
    }
    console.log(clearedTiles);
}

function pixelToBoardCoords(x, y) {
    return { x: Math.floor(x / 16 - 1), y: Math.floor(y / 16 - 5) };
}

function isWithinBoard(r, c) {
    return r >= 0 && r < BOARD_HEIGHT && c >= 0 && c < BOARD_WIDTH;
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

        if (isWithinBoard(tile[0].row-1, tile[0].col-1)) board[tile[0].row-1][tile[0].col-1].nearbyMines++;
        if (isWithinBoard(tile[0].row-1, tile[0].col)) board[tile[0].row-1][tile[0].col].nearbyMines++;
        if (isWithinBoard(tile[0].row-1, tile[0].col+1)) board[tile[0].row-1][tile[0].col+1].nearbyMines++;
        if (isWithinBoard(tile[0].row, tile[0].col-1)) board[tile[0].row][tile[0].col-1].nearbyMines++;
        if (isWithinBoard(tile[0].row, tile[0].col+1)) board[tile[0].row][tile[0].col+1].nearbyMines++;
        if (isWithinBoard(tile[0].row+1, tile[0].col-1)) board[tile[0].row+1][tile[0].col-1].nearbyMines++;
        if (isWithinBoard(tile[0].row+1, tile[0].col)) board[tile[0].row+1][tile[0].col].nearbyMines++;
        if (isWithinBoard(tile[0].row+1, tile[0].col+1)) board[tile[0].row+1][tile[0].col+1].nearbyMines++;
    }
}

function draw() {
    for (let i = 80; i <= canvas.clientHeight - 32; i += 16) {
        for (let j = 16; j < canvas.clientWidth - 16; j += 16) {
            const coords = pixelToBoardCoords(j, i);
            const curTile = board[coords.y][coords.x];

            if (curTile.known) {
                if (curTile.type === 1) {
                    ctx.drawImage(sprites[23], j, i);
                }
                else ctx.drawImage(sprites[25 + curTile.nearbyMines], j, i);
            }
            else if (curTile.flagged) {
                if (winState !== 0) {
                    ctx.drawImage(sprites[24], j, i);
                }
                ctx.drawImage(sprites[21], j, i);
            }
            else if (winState === 1) {
                if (curTile.type === 1) {
                    ctx.drawImage(sprites[21], j, i);
                }
            }
            else if (winState === 2) {
                if (curTile.type === 1) {
                    ctx.drawImage(sprites[22], j, i);
                }
            }
            else {
                ctx.drawImage(sprites[20], j, i);
            }
        }
    }
    ctx.drawImage(sprites[19], 240, 26);
    
    ctx.drawImage(sprites[8], 23, 23);
    ctx.drawImage(sprites[readDigit(flagsLeft, 3) + 9], 26, 26);
    ctx.drawImage(sprites[readDigit(flagsLeft, 2) + 9], 43, 26);
    ctx.drawImage(sprites[readDigit(flagsLeft, 1) + 9], 60, 26);

    ctx.drawImage(sprites[8], 434, 23);
    ctx.drawImage(sprites[readDigit(secondsPassed, 3) + 9], 437, 26);
    ctx.drawImage(sprites[readDigit(secondsPassed, 2) + 9], 454, 26);
    ctx.drawImage(sprites[readDigit(secondsPassed, 1) + 9], 471, 26);
}

function startGame() {
    generateBoard(x, y);
    startTime = document.timeline.currentTime;
    phase = 1;
    console.log(BOARD_HEIGHT * BOARD_WIDTH - NUM_MINES);
}

function endGame(win) {
    winState = win ? 1 : 2;
    draw();
    removeEventListener("mousedown", getClick);
}

function checkGameState() {
    if (clearedTiles === BOARD_HEIGHT * BOARD_WIDTH - NUM_MINES) endGame(true);
    if (clickedMine) endGame(false);
}

function game(frameTime) {
    millis = startTime ? frameTime - startTime : 0;
    if (secondsPassed !== 999 || winState === 0) {
        secondsPassed = Math.floor(millis / 1000);
    }

    draw();
    checkGameState();

    if (winState === 0) requestAnimationFrame(game);
}

function initBoard() {
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            board[i][j] = new Tile(i, j);
        }
    }
}

function initDraw() {
    for (let i = 0; i <= canvas.clientHeight - 16; i += 16) {
        for (let j = 0; j < canvas.clientWidth; j += 16) {
            if (i >= 16 && i <= 48 && j >= 16 && j < canvas.clientWidth - 16) {
                ctx.fillStyle = "#a6859f";
                ctx.fillRect(j, i, canvas.clientWidth - 32, 16);
                j = canvas.clientWidth - 32;
                continue;
            } else if (i === 64 && j === 0) {
                ctx.drawImage(sprites[1], j, i);
                continue;
            } else if (i === 64 && j + 16 >= canvas.clientWidth) {
                ctx.drawImage(sprites[0], j, i);
                continue;
            }
            if (i === 0 && j === 0) {
                ctx.drawImage(sprites[2], j, i);
            }
            else if (i === 0 && j + 16 >= canvas.clientWidth) {
                ctx.drawImage(sprites[3], j, i);
            }
            else if (i + 16 >= canvas.clientHeight && j === 0) {
                ctx.drawImage(sprites[4], j, i);
            }
            else if (i + 16 >= canvas.clientHeight && j + 16 >= canvas.clientWidth) {
                ctx.drawImage(sprites[5], j, i);
            }
            else if (j === 0 || j + 16 >= canvas.clientWidth) {
                ctx.drawImage(sprites[6], j, i);
            }
            else if (i === 0 || i + 16 >= canvas.clientHeight || i === 64) {
                ctx.drawImage(sprites[7], j, i);
            }
        }
    }
    ctx.drawImage(sprites[8], 23, 23);
    ctx.drawImage(sprites[8], 434, 23);
}

function init() {
    flagsLeft = 99;
    secondsPassed = 0;
    initBoard();
    phase = 0;
    clearedTiles = 0;
    winState = 0;
    clickedMine = false;
    millis = 0;
    startTime = null;
}

function load() {
    console.log("sup");
    init();
    for (let i = 0; i < sprFiles.length; i++) {
        sprites.push(new Image());
        sprites[i].src = sprFiles[i];
    }
    canvas.addEventListener("mousedown", () => {});
    canvas.addEventListener("mouseup", getClick);
    addEventListener("contextmenu", (e) => { e.preventDefault(); });

    sprites[sprites.length-1].addEventListener("load", () => {
        initDraw();
        requestAnimationFrame(game);
    });
}

addEventListener("load", load);