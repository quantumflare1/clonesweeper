import sprFiles from "./data/sprites.json" with { type: "json" };
import * as Minesweeper from "./modules/game.mjs";
import * as Helper from "./modules/helper.mjs";

const $ = (l) => document.getElementById(l);
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: false });

const sprites = [];

let millis;
let pressedFace = false;

function readDigit(num, digit) {
    return Math.floor(num / 10 ** (digit - 1) % 10);
}

function checkFacePress(e = new PointerEvent()) {
    if (e.offsetX >= 242 && e.offsetX <= 270 && e.offsetY >= 26 && e.offsetY <= 54) {
        pressedFace = true;
    }
}

function checkClickResetGame(e = new PointerEvent()) {
    pressedFace = false;
    if (e.offsetX >= 242 && e.offsetX <= 270 && e.offsetY >= 26 && e.offsetY <= 54) {
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
                ctx.putImageData(sprites[24 + curTile.number], j, i);
            }
            else if (curTile.held) {
                ctx.putImageData(sprites[24], j, i);
            }
            else if (curTile.locked) {
                ctx.putImageData(sprites[39], j, i);
            }
            else if (curTile.flagged) {
                ctx.putImageData(sprites[35], j, i);
            }
            else {
                ctx.putImageData(sprites[34], j, i);
            }
        }
    }
    if (pressedFace) ctx.putImageData(sprites[20], 240, 26);
    else ctx.putImageData(sprites[19], 240, 26);
    ctx.putImageData(sprites[21], 245, 31);
    
    ctx.putImageData(sprites[8], 23, 23);
    ctx.putImageData(sprites[readDigit(Minesweeper.flags, 3) + 9], 26, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.flags, 2) + 9], 43, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.flags, 1) + 9], 60, 26);

    ctx.putImageData(sprites[8], 434, 23);
    ctx.putImageData(sprites[readDigit(Minesweeper.time, 3) + 9], 437, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.time, 2) + 9], 454, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.time, 1) + 9], 471, 26);
}

function game(frameTime) {
    if (Minesweeper.gameState === 0) {
        millis = Minesweeper.startTime ? frameTime - Minesweeper.startTime : 0;
        if (Minesweeper.time < 999 && Minesweeper.phase !== 0) {
            Minesweeper.incrementTime(Math.floor(millis / 1000));
        }

        draw();
    }
    else endDraw();

    requestAnimationFrame(game);
}

function endDraw() {
    for (let i = 80; i <= canvas.clientHeight - 32; i += 16) {
        for (let j = 16; j < canvas.clientWidth - 16; j += 16) {
            const coords = Helper.pixelToBoardCoords(j, i);
            const curTile = Minesweeper.board[coords.y][coords.x];

            if (curTile.known) {
                if (curTile.type === 1) ctx.putImageData(sprites[37], j, i);
                else ctx.putImageData(sprites[24 + curTile.nearbyMines], j, i);
            }
            else if (curTile.flagged) {
                if (curTile.type === 0) ctx.putImageData(sprites[38], j, i);
                
                else ctx.putImageData(sprites[35], j, i);
            }
            else if (curTile.type === 1) {
                if (Minesweeper.gameState === 1) ctx.putImageData(sprites[35], j, i);
                else ctx.putImageData(sprites[36], j, i);
            }
            else {
                ctx.putImageData(sprites[34], j, i);
            }
        }
    }
    if (pressedFace) ctx.putImageData(sprites[20], 240, 26);
    else ctx.putImageData(sprites[19], 240, 26);
    if (Minesweeper.gameState === 0) ctx.putImageData(sprites[21], 245, 31);
    else if (Minesweeper.gameState === 1) ctx.putImageData(sprites[22], 245, 31);
    else ctx.putImageData(sprites[23], 245, 31);
    
    ctx.putImageData(sprites[8], 23, 23);
    ctx.putImageData(sprites[readDigit(Minesweeper.flags, 3) + 9], 26, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.flags, 2) + 9], 43, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.flags, 1) + 9], 60, 26);

    ctx.putImageData(sprites[8], 434, 23);
    ctx.putImageData(sprites[readDigit(Minesweeper.time, 3) + 9], 437, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.time, 2) + 9], 454, 26);
    ctx.putImageData(sprites[readDigit(Minesweeper.time, 1) + 9], 471, 26);
}

function initDraw() {
    for (let i = 0; i <= canvas.clientHeight - 16; i += 16) {
        for (let j = 0; j < canvas.clientWidth; j += 16) {
            if (i >= 16 && i <= 48 && j >= 16 && j < canvas.clientWidth - 16) {
                ctx.fillStyle = "#b8a7b9";
                ctx.fillRect(j, i, canvas.clientWidth - 32, 16);
                j = canvas.clientWidth - 32;
                continue;
            } else if (i === 64 && j === 0) {
                ctx.putImageData(sprites[1], j, i);
                continue;
            } else if (i === 64 && j + 16 >= canvas.clientWidth) {
                ctx.putImageData(sprites[0], j, i);
                continue;
            }
            if (i === 0 && j === 0) {
                ctx.putImageData(sprites[2], j, i);
            }
            else if (i === 0 && j + 16 >= canvas.clientWidth) {
                ctx.putImageData(sprites[3], j, i);
            }
            else if (i + 16 >= canvas.clientHeight && j === 0) {
                ctx.putImageData(sprites[4], j, i);
            }
            else if (i + 16 >= canvas.clientHeight && j + 16 >= canvas.clientWidth) {
                ctx.putImageData(sprites[5], j, i);
            }
            else if (j === 0 || j + 16 >= canvas.clientWidth) {
                ctx.putImageData(sprites[6], j, i);
            }
            else if (i === 0 || i + 16 >= canvas.clientHeight || i === 64) {
                ctx.putImageData(sprites[7], j, i);
            }
        }
    }
    ctx.putImageData(sprites[8], 23, 23);
    ctx.putImageData(sprites[8], 434, 23);
}

function load() {
    console.log("sup");
    Minesweeper.init();

    const img = new Image();
    img.src = "./assets/spritesheet.png";
    img.addEventListener("load", () => {
        const spritesheet = new OffscreenCanvas(img.width, img.height);
        const sprCtx = spritesheet.getContext("2d", { willReadFrequently: true, alpha: false });
        
        sprCtx.drawImage(img, 0, 0);
        Object.keys(sprFiles).forEach((v, k) => {
            sprites[k] = sprCtx.getImageData(sprFiles[v][1], sprFiles[v][0], sprFiles[v][3], sprFiles[v][2]);
        });
        initDraw();
        requestAnimationFrame(game);
    });
    
    canvas.addEventListener("mousedown", checkFacePress);
    canvas.addEventListener("mousedown", Minesweeper.getHold);
    canvas.addEventListener("mouseup", Minesweeper.getClick);
    canvas.addEventListener("mouseup", checkClickResetGame);
    addEventListener("contextmenu", (e) => { e.preventDefault(); });
    addEventListener("game_start", () => {
        requestAnimationFrame(game);
    });
    addEventListener("game_ninedeath", () => {
        
    });
}

addEventListener("load", load);