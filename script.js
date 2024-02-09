import sprFiles from "./data/sprites.json" assert { type: "json" };
import * as Minesweeper from "./modules/game.mjs";
import * as Helper from "./modules/helper.mjs";
const $ = (l) => document.getElementById(l);

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const sprites = [];

let millis;

function readDigit(num, digit) {
    return Math.floor(num / 10 ** (digit - 1) % 10);
}

function checkClickResetGame(e = new PointerEvent()) {
    if (e.offsetX >= 242 && e.offsetX <= 256 && e.offsetY >= 26 && e.offsetY <= 54) {
        Minesweeper.init();
        draw();
    }
}

function draw() {
    for (let i = 80; i <= canvas.clientHeight - 32; i += 16) {
        for (let j = 16; j < canvas.clientWidth - 16; j += 16) {
            const coords = Helper.pixelToBoardCoords(j, i);
            const curTile = Minesweeper.board[coords.y][coords.x];

            if (curTile.known) {
                if (curTile.type === 1) {
                    ctx.drawImage(sprites[23], j, i);
                }
                else ctx.drawImage(sprites[25 + curTile.nearbyMines], j, i);
            }
            else if (curTile.flagged) {
                ctx.drawImage(sprites[21], j, i);
            }
            else {
                ctx.drawImage(sprites[20], j, i);
            }
        }
    }
    ctx.drawImage(sprites[19], 240, 26);
    
    ctx.drawImage(sprites[8], 23, 23);
    ctx.drawImage(sprites[readDigit(Minesweeper.flags, 3) + 9], 26, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.flags, 2) + 9], 43, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.flags, 1) + 9], 60, 26);

    ctx.drawImage(sprites[8], 434, 23);
    ctx.drawImage(sprites[readDigit(Minesweeper.time, 3) + 9], 437, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.time, 2) + 9], 454, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.time, 1) + 9], 471, 26);
}

function game(frameTime) {
    millis = Minesweeper.startTime ? frameTime - Minesweeper.startTime : 0;
    if (Minesweeper.time < 999 && Minesweeper.phase === 1) {
        Minesweeper.incrementTime(Math.floor(millis / 1000));
    }

    draw();

    if (Minesweeper.gameState === 0) requestAnimationFrame(game);
    else endDraw();
}

function endDraw() {
    for (let i = 80; i <= canvas.clientHeight - 32; i += 16) {
        for (let j = 16; j < canvas.clientWidth - 16; j += 16) {
            const coords = Helper.pixelToBoardCoords(j, i);
            const curTile = Minesweeper.board[coords.y][coords.x];

            if (curTile.known) {
                if (curTile.type === 1) ctx.drawImage(sprites[23], j, i);
                else ctx.drawImage(sprites[25 + curTile.nearbyMines], j, i);
            }
            else if (curTile.flagged) {
                if (curTile.type === 0) ctx.drawImage(sprites[24], j, i);
                
                else ctx.drawImage(sprites[21], j, i);
            }
            else if (curTile.type === 1) {
                if (Minesweeper.gameState === 1) ctx.drawImage(sprites[21], j, i);
                else ctx.drawImage(sprites[22], j, i);
            }
        }
    }
    ctx.drawImage(sprites[19], 240, 26);
    
    ctx.drawImage(sprites[8], 23, 23);
    ctx.drawImage(sprites[readDigit(Minesweeper.flags, 3) + 9], 26, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.flags, 2) + 9], 43, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.flags, 1) + 9], 60, 26);

    ctx.drawImage(sprites[8], 434, 23);
    ctx.drawImage(sprites[readDigit(Minesweeper.time, 3) + 9], 437, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.time, 2) + 9], 454, 26);
    ctx.drawImage(sprites[readDigit(Minesweeper.time, 1) + 9], 471, 26);
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

function load() {
    console.log("sup");
    Minesweeper.init();
    for (let i = 0; i < sprFiles.length; i++) {
        sprites.push(new Image());
        sprites[i].src = sprFiles[i];
    }
    
    canvas.addEventListener("mousedown", () => {});
    canvas.addEventListener("mouseup", Minesweeper.getClick);
    canvas.addEventListener("mouseup", checkClickResetGame);
    addEventListener("contextmenu", (e) => { e.preventDefault(); });
    addEventListener("game_start", () => {
        requestAnimationFrame(game);
    });
    addEventListener("game_end", () => {
    });

    sprites[sprites.length-1].addEventListener("load", () => {
        initDraw();
        requestAnimationFrame(game);
    });
}

addEventListener("load", load);