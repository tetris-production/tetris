
let game_speed = 700;

// フィールドのサイズ
const field_col = 10 //横
const field_row = 20 //縦
// ブロックの大きさ
const block_size = 40
// スクリーンサイズ
const screen_width = block_size * field_col
const screen_height = block_size * field_row
// テトロミノのサイズ
const tetro_size = 4


let can = document.getElementById("can") //キャンバスの用意
let con = can.getContext("2d")//コンテキストとは
// キャンバスに備わっているもの
can.width = screen_width
can.height = screen_height
//can.style.border = "2px solid";
can.style.backgroundColor = "	#323232";


// テトリミノの初期位置
const start_x = field_col / 2 - tetro_size / 2 //水平方向中央
const start_y = 0 //垂直方向トップ
// テトロミノの座標
let tetro_x = start_x
let tetro_y = start_y
// テトロミノの形
let tetro_t = 0
// フィールド本体テトリスの現在の配置場所を格納する変数
let field = []
// ゲームオーバーフラグ
let over = false

// ゲームの初期化
function init(){
    for(let y=0; y<field_row; y++){ //縦列
        field[y] = []
        for(let x=0; x<field_col; x++){ //横列
            field[y][x] = 0
        }
    }
}

//テトロミノの色
const tetro_colors = [
    "#000", //
    "#ff0582", //i
    "#8205ff", //l
    "#0505ff", //j
    "#0affff", //t
    "#0aff0a", //o
    "#ffff0a", //z
    "#ff840a", //s
]

// 三次元配列
const tetro_types = [
    [], //0.空
    [               // 1.I
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    [               // 2.L
        [0,1,0,0],
        [0,1,0,0],
        [0,1,1,0],
        [0,0,0,0],
    ],
    [               // 3.J
        [0,0,1,0],
        [0,0,1,0],
        [0,1,1,0],
        [0,0,0,0],
    ],
    [               // 4.T
        [0,1,0,0],
        [0,1,1,0],
        [0,1,0,0],
        [0,0,0,0],
    ],
    [               // 5.O
        [0,0,0,0],
        [0,1,1,0],
        [0,1,1,0],
        [0,0,0,0],
    ],
    [               //6.Z
        [0,0,0,0],
        [1,1,0,0],
        [0,1,1,0],
        [0,0,0,0],
    ],
    [               //7.S
        [0,0,0,0],
        [0,1,1,0],
        [1,1,0,0],
        [0,0,0,0],
    ]
]

tetro_t = Math.floor(Math.random() * (tetro_types.length - 1)) + 1
tetro = tetro_types[ tetro_t ]

init()
drawAll()

let move = setInterval(dropTetro, game_speed);

// ----------------------------------------------------------
// 以下関数定義のみ
// ----------------------------------------------------------

// ブロック一つ描画する
function drawBlock(x, y, c){
	let print_x = x * block_size;
	let print_y = y * block_size;

	// シャドウの設定
	con.shadowColor = "#fff"; // シャドウ
	con.shadowBlur = 10; // ぼかし
	// ブロックを描画する
	con.fillStyle = tetro_colors[c];
	con.fillRect(print_x, print_y, block_size, block_size);
	con.strokeStyle = "#fff";
	con.strokeRect(print_x, print_y, block_size, block_size);

	// シャドウの設定をリセット
	con.shadowColor = "transparent";
	con.shadowBlur = 0;
}

// ブロックとフィールドの描画
function drawAll(){
    con.clearRect(0,0,screen_width, screen_height)
    for(let y=0; y<field_row; y++){
        for(let x=0; x<field_col; x++){
            if(field[y][x]){
                drawBlock(x, y, field[y][x])
            }
        }
    }
    for(let y=0; y<tetro_size; y++){
        for(let x=0; x<tetro_size; x++){
            if(tetro[y][x]){
                drawBlock(tetro_x + x, tetro_y + y, tetro_t)
            }
        }
    }

		//ゲームオーバー時に表示される
    if(over){
        let s = "GAME OVER"
        con.font = "60px 'ゴシック'"
        let w = con.measureText(s).width
        let x = screen_width / 2 - w /2
        let y = screen_height / 2 - 20
        con.strokeText(s, x, y)
        con.fillStyle = "#ff0000";
        con.fillText(s, x, y)
    }
}

// 動けるかどうか
function checkMove(mx, my, ntetro){
    if(ntetro === undefined){
        ntetro = tetro
    }
    for(let y=0; y<tetro_size; y++){
        for(let x=0; x<tetro_size; x++){
            if(ntetro[y][x]){
                let nx = tetro_x + mx + x
                let ny = tetro_y + my + y
                if( nx < 0 ||
                    ny < 0 ||
                    ny >= field_row ||
                    nx >= field_col　||
                    field[ny][nx]){
                    return false
                }
            }
        }
    }
    return true
}

// テトロミノの回転
function rotate(){
    let ntetro = []
    for(let y=0; y<tetro_size; y++){
        ntetro[y] = []
        for(let x=0; x<tetro_size; x++){
            ntetro[y][x] = tetro[tetro_size-x-1][y]
        }
    }
    return ntetro
}

// 落ちたブロックの確定（位置、色）
function fixTetro(){
    for(let y=0; y<tetro_size; y++){
        for(let x=0; x<tetro_size; x++){
            if(tetro[y][x]){
                field[tetro_y + y][tetro_x + x] = tetro_t
            }
        }
    }
}

//　横列がそろったかチェックする
function checkLine(){
    let line_count = 0
    for(let y=0; y<field_row; y++){
        let flag = true
        for(let x=0; x<field_col; x++){
            if(!field[y][x]){
                flag = false
                break
            }
        }
        if(flag){
            line_count++
            for(let ny = y; ny>0; ny--){
                for(let nx = 0; nx<field_col; nx++){
                    field[ny][nx] = field[ny - 1][nx]
                }
            }
        }
    }
}

// ブロックの落ちる処理
function dropTetro(){
    if(over){
        return
    }
    if(checkMove(0, 1)){
        tetro_y ++
    }else{
        fixTetro()
        checkLine()
        tetro_t = Math.floor(Math.random() * (tetro_types.length - 1)) + 1
        tetro = tetro_types[ tetro_t ]
        tetro_x = start_x
        tetro_y = start_y

        if(!checkMove(0,0)){
            over = true
        }
    }
        drawAll()
}

function pauseTetro(){
	//return clearInterval(dropTetro, game_speed);
	// if(checkMove(0,0)){
	// 	tetro_y;
	// }
	// drawAll();
}

// キーボードが押された時の処理
document.onkeydown = function(e){
    if(over){
        return
    }
    // onkeydown keycode 検索
    switch( e.keyCode ){
        case 37://左
            if(checkMove(- 1, 0)){
                tetro_x --
            }
            break;
        case 39://右
            if(checkMove(1, 0)){
                tetro_x ++
            }
            break;
        case 40://下
            if(checkMove(0, 1)){
                tetro_y ++
            }
            break;
        case 32://スペース
        let ntetro = rotate()
        if(checkMove(0, 0, ntetro)){
            tetro = ntetro
        }
            break;
    }
    drawAll()
}

//リプレイボタン
document.getElementById("replayButton").addEventListener("click", function() {
	init();
	drawAll(); // ゲーム画面を描画
	over = false; // ゲームオーバーフラグをリセット
  
});

//一時停止ボタン
let isPause = false; //動いてる状態初期値
document.getElementById("pauseButton").addEventListener("click", function() {

	if(isPause){
		isPause = false;
		move = setInterval(dropTetro, game_speed);
		console.log(isPause);
		pauseButton.innerHTML = "PAUSE";

	} else {
		isPause = true;
		clearInterval(move);
		pauseButton.innerHTML = "START";
	}
});

//次のテトリミノを表示させるキャンバス
let nextTetroCanvas = document.getElementById("nextTetroCanvas");
let nextTetroCtx = nextTetroCanvas.getContext("2d");
nextTetroCanvas.width = 100;
nextTetroCanvas.height = 100;

// 次のテトリミノを描画する関数
function drawNextTetro(){
	nextTetroCtx.clearRect(0, 0, nextTetroCanvas.width, nextTetroCanvas.height);

	const blockSize = nextTetroCanvas.width / tetro_size;

	for(let y = 0; y < tetro_size; y++){
			for(let x = 0; x < tetro_size; x++){
					if(nextTetro[y][x]){
							const posX = x * blockSize + (nextTetroCanvas.width - tetro_size * blockSize) / 2;
							const posY = y * blockSize + (nextTetroCanvas.height - tetro_size * blockSize) / 2;
							nextTetroCtx.fillStyle = tetro_colors[nextTetroType];
							nextTetroCtx.fillRect(posX, posY, blockSize, blockSize);
							nextTetroCtx.strokeStyle = "#fff";
							nextTetroCtx.strokeRect(posX, posY, blockSize, blockSize);
					}
			}
	}
}

// ゲームの初期化時に次のテトロミノを生成して描画
let nextTetroType = Math.floor(Math.random() * (tetro_types.length - 1)) + 1;
let nextTetro = tetro_types[nextTetroType];
drawNextTetro();


