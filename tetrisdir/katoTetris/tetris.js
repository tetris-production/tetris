// ゲームスピード
let gameSpeed = 500;
// フィールドサイズ
const FIELD_COL = 10;
const FIELD_ROW = 20;
// ネクストテトロ表示フィールド
const NEXT_SIZE = 4;

// ブロック1つのサイズ(ピクセル)
const BLOCK_SIZE = 30;

// キャンバスサイズ
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;
const N_SCREEN_SIZE = BLOCK_SIZE * NEXT_SIZE;

// テトロミノの形
const TETRO_TYPES = [
    [], // 0.空
    [                   // 1.I
        [ 0, 0, 0, 0 ],
        [ 1, 1, 1, 1 ],
        [ 0, 0, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ],
    [                   // 2.L
        [ 0, 1, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],
    [                   // 3.J
        [ 0, 0, 1, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],
    [                   // 4.T
        [ 0, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ],
    [                   // 5.O
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],
    [                   // 6.Z
        [ 0, 0, 0, 0 ],
        [ 1, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],
    [                   // 7.S
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 1, 1, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ],
]

// テトロミノの色
const TETRO_COLORS = [
    "#000", // 0空
    "#6CF", // 1水色
    "#F92", // 2オレンジ
    "#66F", // 3青
    "#C5C", // 4紫
    "#FD2", // 5黄色
    "#F44", // 6赤
    "#5B5", // 7緑
]

// テトロミノのサイズ
const TETRO_SIZE = 4;

let can = document.getElementById("can");
let con = can.getContext("2d");
let next = document.getElementById("next");
let ncon = next.getContext("2d");
let s = document.getElementById("score");

can.width = SCREEN_W;
can.height = SCREEN_H;
next.width = N_SCREEN_SIZE;
next.height = N_SCREEN_SIZE;
can.style.border = "4px solid #555";
can.style.backgroundColor = "#222";
next.style.border = "4px solid #555";
next.style.backgroundColor = "#222";

const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;

// テトロミノ
let tetro;
// テトロの形
let tetro_t;
// ネクストテトロミノ
let tetro_n;

// テトロミノの座標
let tetro_x = START_X;
let tetro_y = START_Y;

// ゲームオーバーフラグ
let over = false;

// フィールドの中身
let field = [];

// スコア
let score = 0;

init();

//フィールドの初期化
function init() {
    for(let y = 0; y < FIELD_ROW; y++) {
        field[y] = [];
        
        for(let x = 0; x < FIELD_COL; x++) {
            field[y][x] = 0;
        }
    }

    tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

    // 一定間隔でのブロック落下
    setTetro();
    drawAll();
    setInterval(dropTetro, gameSpeed);
}

// テトロをネクストで初期化
function setTetro() {
    tetro_t = tetro_n;
    tetro = TETRO_TYPES[ tetro_t ];
    tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

    tetro_x = START_X;
    tetro_y = START_Y;
}

// ブロック1つを描画
function drawBlock(x, y, c) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;

    con.fillStyle = TETRO_COLORS[c];
    con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    con.strokeStyle = "black";
    con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}
// ネクストテトロブロック1つを描画
function nextDrawBlock(x, y, c) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;

    ncon.fillStyle = TETRO_COLORS[c];
    ncon.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    ncon.strokeStyle = "black";
    ncon.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

// フィールドとテトロミノの描画
function drawAll() {
    con.clearRect(0, 0, SCREEN_W, SCREEN_H);
    ncon.clearRect(0, 0, N_SCREEN_SIZE, N_SCREEN_SIZE);

    for(let y = 0; y < FIELD_ROW; y++) {
        for(let x = 0; x < FIELD_COL; x++) {
            if( field[y][x] ) {
                drawBlock(x, y, field[y][x]);
            } else {
                let px = x * BLOCK_SIZE;
                let py = y * BLOCK_SIZE;
                con.strokeStyle = "#777";
                con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    let plus = 0;
    while( checkMove(0, plus + 1))plus++;

    for(let y = 0; y < TETRO_SIZE; y++) {
        for(let x = 0; x < TETRO_SIZE; x++) {
            if( tetro[y][x] ) {
                // 着地点
                drawBlock(tetro_x + x, tetro_y + y + plus, 0);
                // テトロ本体
                drawBlock(tetro_x + x, tetro_y + y, tetro_t);
            }
            // ネクストテトロ
            if( TETRO_TYPES[tetro_n][y][x] ) {
                nextDrawBlock(x, y, tetro_n);
            }
                
        }
    }

    if(over) {
        let s = "GAME OVER";
        con.font = "40px 'MS ゴシック'";
        let w = con.measureText(s).width;
        let x = SCREEN_W / 2 - w / 2;
        let y = SCREEN_H / 2 - 20;
        con.lineWidth = 4;
        con.strokeText(s,x,y);
        con.fillStyle = "white";
        con.fillText(s,x,y);
    }
}

// ブロックの当たり判定
function checkMove( mx, my, ntetro ) {
    if( ntetro == undefined) ntetro = tetro;

    for(let y = 0; y < TETRO_SIZE; y++) {
        for(let x = 0; x < TETRO_SIZE; x++) {

            if( ntetro[y][x] ) {
                let nx = tetro_x + x + mx;
                let ny = tetro_y + y + my;

                if( ny < 0
                ||  nx < 0
                ||  ny >= FIELD_ROW
                ||  nx >= FIELD_COL
                ||  field[ny][nx]) return false;
            }
        }
    }

    return true;
}

// テトロミノの回転
function rotate() {
    let ntetro = [];

    for(let y = 0; y < TETRO_SIZE; y++) {
        ntetro[y] = [];
        for(let x = 0; x < TETRO_SIZE; x++) {
            ntetro[y][x] = tetro[TETRO_SIZE - x -1][y];
        }
    }

    return ntetro;
}

function fixTetro() {
    for(let y = 0; y < TETRO_SIZE; y++) {
        for(let x = 0; x < TETRO_SIZE; x++) {
            if( tetro[y][x] ) {
                field[tetro_y + y][tetro_x + x] = tetro_t;
            }
        }
    }
}

// ラインがそろった時のライン削除
function checkLine() {
    let lineCount = 0;
    for(let y = 0; y < FIELD_ROW; y++) {
        let flag = true;

        for(let x = 0; x < FIELD_COL; x++) {
            if(!field[y][x]) {
                flag = false;
                break;
            }
        }

        if(flag) {
            lineCount++;

            for(let ny = y; ny > 0; ny--) {
                for(let nx = 0; nx < FIELD_COL; nx++) {
                    field[ny][nx] = field[ny-1][nx];
                }
            }
        }

        if(lineCount) {
            score += 100 * (2 ** (lineCount));
            s.innerHTML = `score：${score}`;
        }
    }
}

// 一定間隔でのブロック落下処理
function dropTetro() {
    if(over) return;

    if( checkMove( 0, 1 )) {
        tetro_y++;
    } else {
        fixTetro();
        checkLine();
        setTetro();

        if( !checkMove(0,0) ) {
            over = true;
        }
    }
    drawAll();
}

// キーボードが押された時の処理
document.onkeydown = function(e) {
    if(over) return;
    switch( e.code ) {
        case "ArrowLeft": // 左
            if( checkMove( -1, 0 )) tetro_x--;
            break;
        case "ArrowUp": // 上
            if( checkMove( 0, -1 )) tetro_y--;
            break;
        case "ArrowRight": // 右
            if( checkMove( 1, 0 )) tetro_x++;
            break;
        case "ArrowDown": // 下
            if( checkMove( 0, 1 )) tetro_y++;
            break;
        case "Space": // スペース
            let ntetro = rotate();
            if( checkMove( 0, 0, ntetro))tetro = ntetro;
            break;
    }

    drawAll();
}