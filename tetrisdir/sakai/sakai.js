//フィールドサイズ
const FIELD_COL = 10; //横
const FIELD_ROW = 20; //縦

const SECOND_FIELD_COL = 6;
const SECOND_FIELD_ROW = 5;

//ブロック一つのサイズ
const BLOCKC_SIZE = 30;

//デフォルトスピード
const GAME_SPEED = 500;
const DROP_SPEED = 1000;

//キャンバスサイズ（ゲーム空間）
const SCREEN_W = BLOCKC_SIZE * FIELD_COL;
const SCREEN_H = BLOCKC_SIZE * FIELD_ROW;

//キャンバスサイズ（ゲーム空間） secnd
const SECOND_SCREEN_W = BLOCKC_SIZE * SECOND_FIELD_COL;
const SECOND_SCREEN_H = BLOCKC_SIZE * SECOND_FIELD_ROW;

//テトロミノのサイズ
const TETRO_SIZE = 4;

//呼び出し
let can = document.getElementById("can");
let con = can.getContext("2d");

can.width = SCREEN_W;
can.height = SCREEN_H;
can.style.border = "4px solid #555";



//次のテトリス
const canvas = document.getElementById("next");
const context = canvas.getContext("2d");

canvas.width = SECOND_SCREEN_W;
canvas.height = SECOND_SCREEN_H;
canvas.style.border = "4px solid #555";


//スタート位置
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;

//表示位置
const secnd_START_X = 1;
const secnd_START_Y = 1;

//テトロミノの座標( 位置 )
let tetro_x = START_X;
let tetro_y = START_Y;

//テトリスの座標
let secnd_tetro_x = secnd_START_X;
let secnd_tetro_y = secnd_START_Y;


//ブロックを格納する変数
let tetro_t;
let secondtetro_t;

const TETRO_COLRS = [
    "#000",    //0空  
    "#6CF",    //1水色
    "#F92",    //2オレンジ
    "#66F",    //3青
    "#C5C",    //4紫
    "#FD2",    //5黄色
    "#F44",    //6赤
    "#5B5",    //7緑 
];


//三次元配列
const TETRO_TYPES = [
    [],
    [                         //I
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [                         //L
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                         //J
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                         //T
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [                         //O
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                         //Z
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                         //S
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]
    ],
];

tetro_t = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
tetro = TETRO_TYPES[tetro_t];

secondtetro_t = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
secondtetro = TETRO_TYPES[secondtetro_t];


//フィールド本体
let field = []; //一次元配列
let secnd_field = [];
/*
[0,0,0,0.....]としたいが10x15はだるいので初期化処理 init()を作成する
*/

//ゲームオーバーフラグ
let over = false;

let linec = 0;

let result = 0;

var interval;

var repeatFlg = true;




//スタートボタンが押されたときに初期化を行う
document.getElementById("start-button").onclick = function () {

    field = [];
    tetro_x = START_X;
    tetro_y = START_Y;

    linec = 0;
    result = 0;

    document.getElementById('score-count').innerHTML = result;
    document.getElementById('line-count').innerHTML = linec;

    if (over) {
        over = false;
    }

    init();
    onClearInterval();
    onSetInterval();
    drawAll();
    nextdraw();
}

document.getElementById("stop-button").onclick = function () {
    onStopButton();
}

init();

//フィールド初期化 二次元配列の初期化が無いので
function init() {
    for (let y = 0; y < FIELD_ROW; y++) {
        field[y] = []; //yが進むごとにこの行は配列とするという処理 二次元配列にしている
        for (let x = 0; x < FIELD_COL; x++) {
            field[y][x] = 0; //150個分の0を入れられる
        }
    }
    // field[5][8] = 1;
    // field[14][0] = 1;
    // field[14][9] = 1;
}

// setIntervalを動かす関数
function onSetInterval() {
    interval = setInterval(dropTetro, GAME_SPEED);
}

// clearIntervalを動かす関数
function onClearInterval() {
    clearInterval(interval);
}

// 一時停止ボタン押下時の処理を行う関数
function onStopButton() {
    if (repeatFlg) {
        onClearInterval();
        document.getElementById('action').innerHTML = 'RESTART';
        repeatFlg = false;

    } else {
        // ここにクリア入れないとボタン押下2回目以降速くなってしまう
        onClearInterval();
        onSetInterval();
        document.getElementById('action').innerHTML = ' STOP ';
        repeatFlg = true;
    }
}


//ブロック一つを描画する
function drawBlock(x, y, c) {
    let px = x * BLOCKC_SIZE; //xが増えるたびに横方向にBLOCKC_SIZEの数増える
    let py = y * BLOCKC_SIZE; //yが増えるたびに縦方向にBLOCKC_SIZEの数増える

    con.fillStyle = TETRO_COLRS[c]; //色
    con.fillRect(px, py, BLOCKC_SIZE, BLOCKC_SIZE); //ここで座標を表示 矩形描画のためのメソッド(左上隅x座標,左上隅y座標,width,height)
    con.strokeStyle = "black"; //枠の色
    con.strokeRect(px, py, BLOCKC_SIZE, BLOCKC_SIZE); //枠
}

function secnd_drawBlock(x, y, c) {
    let px = x * BLOCKC_SIZE; //xが増えるたびに横方向にBLOCKC_SIZEの数増える
    let py = y * BLOCKC_SIZE; //yが増えるたびに縦方向にBLOCKC_SIZEの数増える

    context.fillStyle = TETRO_COLRS[c]; //色
    context.fillRect(px, py, BLOCKC_SIZE, BLOCKC_SIZE); //ここで座標を表示 矩形描画のためのメソッド(左上隅x座標,左上隅y座標,width,height)
    context.strokeStyle = "black"; //枠の色
    context.strokeRect(px, py, BLOCKC_SIZE, BLOCKC_SIZE); //枠
}


//フィールド,ブロック表示（同じ処理のためまとめている）
function drawAll() {

    con.clearRect(0, 0, SCREEN_W, SCREEN_H); //ブロックのクリア これで表示キーボード処理後の乱立を無くせる

    //着地点の計算
    let plus = 0;
    while (cheeckMove(0, plus + 1)) plus++;

    //TETRO_SIZEは4x4
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (tetro[y][x]) //tetro二次元配列を見に行っている。"1"の時ブロックを表示
            {
                drawBlock(tetro_x + x, tetro_y + y + plus, 0) //着地点
                drawBlock(tetro_x + x, tetro_y + y, tetro_t) //本体 tetro_tは配列0～7のどれかをランダムに
            }
        }
    }

    for (let y = 0; y < FIELD_ROW; y++) { //フィールド縦をループ
        for (let x = 0; x < FIELD_COL; x++) { //フィールド横をループ
            if (field[y][x]) //tetro二次元配列が"1"の時表示
            {
                drawBlock(x, y, field[y][x])  //field[y][x]はブロックが存在するかどうかをチェックする。フィールド内のカラーを描画している
            }
        }
    }

    if (over) {
        let s = "GAME OVER";
        con.font = "40px 'MS ゴシック'";
        let w = con.measureText(s).width;
        let x = SCREEN_W / 2 - w / 2;
        let y = SCREEN_H / 2 - 20;
        con.strokeText(s, x, y);
        con.fillStyle = "black";
        con.fillText(s, x, y);
    }
}


// 次のブロックを表示
function nextdraw() {

    context.clearRect(0, 0, SECOND_SCREEN_W, SECOND_SCREEN_H); //ブロックのクリア これで表示キーボード処理後の乱立を無くせる

    //TETRO_SIZEは4x4
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (secondtetro[y][x]) //tetro二次元配列を見に行っている。"1"の時ブロックを表示
            {
                secnd_drawBlock(secnd_tetro_x + x, secnd_tetro_y + y, secondtetro_t) //本体 tetro_tは配列0～7のどれかをランダムに
            }
        }
    }

    for (let y = 0; y < SECOND_FIELD_ROW; y++) { //フィールド縦をループ
        for (let x = 0; x < SECOND_FIELD_COL; x++) { //フィールド横をループ
            if (secnd_field[y][x]) //tetro二次元配列が"1"の時表示
            {
                secnd_drawBlock(x, y, secnd_field[y][x])  //field[y][x]はブロックが存在するかどうかをチェックする。フィールド内のカラーを描画している
            }
        }
    }
}

//下まで行ったら固定
function fixTetro() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (tetro[y][x]) { // テトロミノのブロックがある場合のみ
                // ブロックの位置に現在のテトロの種類を設定する
                field[tetro_y + y][tetro_x + x] = tetro_t;
            }
        }
    }
    prepareNextTetro();
}

let lineCount = 0; // lineCount をグローバル変数として定義する

//ラインが揃ったかチェックして消す
function checkLine() {
    let linec = 0;
    for (let y = 0; y < FIELD_ROW; y++) {
        let flag = true;

        for (let x = 0; x < FIELD_COL; x++) {
            if (!field[y][x]) {
                flag = false;
                break;
            }
        }

        if (flag) {
            linec++;

            for (let ny = y; ny > 0; ny--) {
                for (let nx = 0; nx < FIELD_COL; nx++) {
                    field[ny][nx] = field[ny - 1][nx];
                }
            }
        }
    }
    calculateScoreAndDrawInfo(linec);
}

// スコアを計算し、表示を更新する関数
function calculateScoreAndDrawInfo(linec) {
    calculateScore(linec);
    drawInfo();
}

// スコアを計算する関数
function calculateScore(linec) {
    result += linec * 100;
    lineCount += linec;
}

// スコアと消したライン数の表示を行う関数
function drawInfo() {
    // ここでメソットごと代入するとループ2回まわるので変数で代入
    document.getElementById('score-count').innerHTML = result;
    document.getElementById('line-count').innerHTML = lineCount;
}

// 次のテトリスの準備を行う関数
function prepareNextTetro() {
    // 次のテトリスの形状と位置をランダムに決定する
    secondtetro_t = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
    secondtetro = TETRO_TYPES[secondtetro_t];
    secnd_tetro_x = secnd_START_X;
    secnd_tetro_y = secnd_START_Y;
}

//落ちていく処理
function dropTetro() {

    if (over) return;

    if (cheeckMove(0, 1)) tetro_y++;
    else {

        fixTetro(); //固定
        checkLine();

        tetro_t = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
        tetro = TETRO_TYPES[tetro_t];
        tetro_x = START_X;
        tetro_y = START_Y;

        if (!cheeckMove(0, 0)) {
            over = true;
        }
    }
    drawAll();
    nextdraw();
}

//あたり判定
function cheeckMove(mx, my, ntetro) {

    if (ntetro == undefined) ntetro = tetro; //もしntetroをいれていなかったら現在のtetroを入れる

    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (ntetro[y][x]) {
                let nx = tetro_x + mx + x;
                let ny = tetro_y + my + y;

                if (ny < 0 ||  //画面外に出たら
                    nx < 0 ||
                    ny >= FIELD_ROW ||
                    nx >= FIELD_COL ||
                    field[ny][nx]) {
                    return false;
                }
            }
        }
    }
    return true;
}

//テトロの回転
function rotate() {
    let ntetro = []; //新しいtetro
    for (let y = 0; y < TETRO_SIZE; y++) {
        ntetro[y] = [];
        for (let x = 0; x < TETRO_SIZE; x++) {
            ntetro[y][x] = tetro[TETRO_SIZE - x - 1][y]; //回転した形にする
        }
    }

    return ntetro;
}

// キーボード処理
document.addEventListener('keydown', function (e) {
    if (over) return; // ゲームオーバーの場合は処理しない

    switch (e.keyCode) {
        case 37: //← 移動
            if (cheeckMove(-1, 0)) tetro_x--; //座標の更新 cheeckMove( x軸の移動後のpx数 , y軸の移動後のpx数)
            break;
        case 38: //↑ 移動
            // if (cheeckMove(0, -1)) tetro_y--;
            break;
        case 39: //→ 移動
            if (cheeckMove(1, 0)) tetro_x++;
            break;
        case 40: //↓ 移動
            if (cheeckMove(0, 1)) tetro_y++;
            break;
        case 32: //スペース 回転
            e.preventDefault(); // デフォルトの動作を阻止
            let ntetro = rotate();
            if (cheeckMove(0, 0, ntetro)) tetro = ntetro; //回転できるか
            break;
        case 16: // shiftキー
            // 移動できないと判断されるとこまで下に落ちる
            while (cheeckMove(0, 1)) tetro_y++;
            break;
    }
    drawAll();
});