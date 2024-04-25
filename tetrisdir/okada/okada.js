// 落下スピード
const DROP_SPEED = 400;

// 1ブロックの大きさ
const BLOCK_SIZE = 30;

// フィールドのサイズ
const PLAY_SCREEN_WIDTH = 10;
const PLAY_SCREEN_HEIGHT = 20;

// キャンバスIDの取得
const CANVAS = document.getElementById('canvas');

// 2dコンテキストの取得
const CANVAS_2D = CANVAS.getContext('2d');

// キャンバスサイズ（＝プレイ画面のサイズ）
const CANVAS_WIDTH = BLOCK_SIZE * PLAY_SCREEN_WIDTH;
const CANVAS_HEIGHT = BLOCK_SIZE * PLAY_SCREEN_HEIGHT;
CANVAS.width = CANVAS_WIDTH;
CANVAS.height = CANVAS_HEIGHT;

// テトリミノの1辺の最長
const TET_SIZE = 4;

// 7種類のテトリミノ達
let TETRO_TYPES = [
  [],
  [
    // Z
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    // S
    [0, 0, 0, 0],
    [0, 0, 1, 1],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    // I
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    // J
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    // L
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    // T
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    // O
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
];

const tetColors = ['', '#6CF', '#F92', '#66F', '#C5C', '#FD2', '#F44', '#5B5'];

// TETRO_TYPESのインデックス番号をランダム取得
let tetroTypesIndex = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

// テトロミノを取得する
let tetroMino = TETRO_TYPES[tetroTypesIndex];

// テトリミノの移動距離
let tetroMinoDistanceX = 0;
let tetroMinoDistanceY = 0;

// 画面本体
const SCREEN = [];

// タイマーID
let timerId = NaN;

// ゲームオーバーフラグ
let isGameOver = false;

let interval;

// テトリスプレイ画面描画処理ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const drawPlayScreen = () => {
  // 背景色を黒に指定
  CANVAS_2D.fillStyle = '#000';

  // キャンバスを塗りつぶす
  CANVAS_2D.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 動かせなくなった固定済みのテトリミノを描画する
  // SCREEN配列には現在のゲーム状態が格納されていて、その内容に応じてブロックを描画する
  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      if (SCREEN[y][x]) {
        drawBlock(x, y, SCREEN[y][x]);
      }
    }
  }

  // 現在操作中のテトリミノを描画する
  // tetroMino配列にはテトリミノの形状が格納されていて、それを基に描画する
  for (let y = 0; y < TET_SIZE; y++) {
    for (let x = 0; x < TET_SIZE; x++) {
      if (tetroMino[y][x]) {
        drawBlock(
          tetroMinoDistanceX + x,
          tetroMinoDistanceY + y,
          tetroTypesIndex
        );
      }
    }
  }

  if (isGameOver) {
    const GAME_OVER_MESSAGE = 'GAME OVER';
    CANVAS_2D.font = "40px 'Meiryo UI'";
    const width = CANVAS_2D.measureText(GAME_OVER_MESSAGE).width;
    const x = CANVAS_WIDTH / 2 - width / 2;
    const y = CANVAS_HEIGHT / 2 - 20;
    CANVAS_2D.fillStyle = 'white';
    CANVAS_2D.fillText(GAME_OVER_MESSAGE, x, y);
  }
};

// 画面を真ん中にするーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const CONTAINER = document.getElementById('container');
CONTAINER.style.width = CANVAS_WIDTH + 'px';

const createTetPosition = () => {
  tetroMinoDistanceX = PLAY_SCREEN_WIDTH / 2 - TET_SIZE / 2;
  tetroMinoDistanceY = 0;
};

// // リプレイ機能ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
  isGameOver = false;
  clearInterval(interval);
  init();
});

// const replayGame = () => {
//     isGameOver = false;
//     init();
//   };

// document.addEventListener('keydown', (e) => {
//     if (isGameOver && e.code === 'KeyP') {
//       replayGame();
//     }
// });

// 与えられた座標とテトロミノの種類から、ブロックを描画するーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const drawBlock = (x, y, tetroTypesIndex) => {
  // 与えられたx座標とy座標から、実際の描画位置を計算
  let drawX = x * BLOCK_SIZE;
  let drawY = y * BLOCK_SIZE;

  // 塗りつぶしの色をランダムに指定
  CANVAS_2D.fillStyle = tetColors[tetroTypesIndex];

  // 指定された位置とサイズでブロックを描画
  CANVAS_2D.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);

  // 線の色を黒に設定
  CANVAS_2D.strokeStyle = 'black'; // 色
  CANVAS_2D.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE); // 輪郭
};

// moveX と moveY（与えられた移動量）に基づいて、テトロミノが移動可能かどうかを判定する関数ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
// newTet = オプションの引数（デフォルト値として tetroMinoを持つ）
// デフォルトでは、現在のテトロミノの位置は tetroMinoDistanceX と tetroMinoDistanceY によって与えられ、テトロミノ自体は tetroMino 配列に格納
const canMove = (moveX, moveY, newTet = tetroMino) => {
  // テトロミノの各ブロックを走査する
  for (let y = 0; y < TET_SIZE; y++) {  // テトロミノの縦のインデックス
    for (let x = 0; x < TET_SIZE; x++) {  // テトロミノの横のインデックス
      if (newTet[y][x]) {  // 現在のテトロミノの位置でブロックがあるかどうか、真(false以外？)ならブロックがある
        // 移動後の座標を計算
        // tetroMinoDistanceX と tetroMinoDistanceY は、現在のテトロミノの左上のブロックの座標を示す
        // 移動量 (moveX と moveY) を追加することで、新しい位置を計算している
        let nextX = tetroMinoDistanceX + x + moveX;
        let nextY = tetroMinoDistanceY + y + moveY;

        // 移動先にブロックがあるか判定
        // 移動後の座標がプレイ画面の境界外にあるか or 既存のブロックと重なっているかどうかをチェック
        if (nextY < 0 || nextX < 0 || nextY >= PLAY_SCREEN_HEIGHT || nextX >= PLAY_SCREEN_WIDTH || SCREEN[nextY][nextX]) {
          return false;  // 条件が真なら、移動が不可のためcanMoveはfalseを返す
        }
      }
    }
  }
  return true;
};

// 右回転ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const createRightRotateTet = () => {
  //回転後の新しいテトリミノ用配列
  let newTet = [];
  for (let y = 0; y < TET_SIZE; y++) {
    newTet[y] = [];
    for (let x = 0; x < TET_SIZE; x++) {
      newTet[y][x] = tetroMino[TET_SIZE - 1 - x][y];
    }
  }
  return newTet;
};

// 左回転ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const createLeftRotateTet = () => {
  //回転後の新しいテトリミノ用配列
  let newTet = [];
  for (let y = 0; y < TET_SIZE; y++) {
    newTet[y] = [];
    for (let x = 0; x < TET_SIZE; x++) {
      newTet[y][x] = tetroMino[x][TET_SIZE - 1 - y];
    }
  }
  return newTet;
};


// キーボードのキー入力に応答してテトリスゲームを制御する関数ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
document.onkeydown = (e) => {
  if (isGameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (canMove(-1, 0)) tetroMinoDistanceX--;
      break;
    // case 'ArrowUp':
    //   if (canMove(0, -1)) tetroMinoDistanceY--;
    //   break;
    case 'ArrowRight':
      if (canMove(1, 0)) tetroMinoDistanceX++;
      break;
    case 'ArrowDown':
      if (canMove(0, 1)) tetroMinoDistanceY++;
      break;
    case 'KeyR':
      let newRTet = createRightRotateTet();
      if (canMove(0, 0, newRTet)) {
        tetroMino = newRTet;
      }
      break;
    case 'KeyL':
      let newLTet = createLeftRotateTet();
      if (canMove(0, 0, newLTet)) {
        tetroMino = newLTet;
      }
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      while (canMove(0, 1)) {
        tetroMinoDistanceY++;
      }
      fixTet();   // ブロックを一気に固定する
      clearLine();   // 揃った行を消去

      // テトリミノをランダムに生成
      tetroTypesIndex = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
      tetroMino = TETRO_TYPES[tetroTypesIndex];
      createTetPosition();

      // 次のテトリミノを出せなくなったらゲームオーバー
      if (!canMove(0, 0)) {
        isGameOver = true;
        clearInterval(timerId);
      }
      drawPlayScreen();   // ゲーム画面を更新
      break;
  }

  // テトロミノの位置や回転が変更された後に、ゲーム画面を更新
  drawPlayScreen();
};

// 一番下に行ったらテトリミノを固定する関数ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const fixTet = () => {
  for (let y = 0; y < TET_SIZE; y++) {
    for (let x = 0; x < TET_SIZE; x++) {
      if (tetroMino[y][x]) { // 現在のテトロミノの位置でブロックが存在するかどうか
        // ブロックが存在する位置に対応する画面上のセルを、テトロミノの種類を示すインデックスで更新
        SCREEN[tetroMinoDistanceY + y][tetroMinoDistanceX + x] = tetroTypesIndex;
      }
    }
  }
  clearLine();  // 行が揃ったかを確認する
  drawPlayScreen(); // ゲーム画面を更新
};

let clearLines = 0;

// 揃った行を検出して消去→得点を加算する関数ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const clearLine = () => {
  // 一列になっている場所をスクリーン上から調べていく
  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    // 行を消すフラグを立てる
    let isClearLine = true;
    // 行に0が入っている（＝そろっていない）かを調べていく
    // 一つでも空のセルが見つかれば、その行は揃っていない
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      if (SCREEN[y][x] === 0) {
        isClearLine = false;
        break;
      }
    }

    // isClearLineがtrueのまま=行にセルが埋まっている、揃っているとき
    // 揃っている行より上の行をすべて一つ下に移動＆その行を消去
    if (isClearLine) {
      clearLines++;
      // そろった行から上へ向かってforループしていく
      for (let newY = y; newY > 0; newY--) {
        for (let newX = 0; newX < PLAY_SCREEN_WIDTH; newX++) {
          // 一列上の情報をコピーする
          SCREEN[newY][newX] = SCREEN[newY - 1][newX];
        }
      }
    }
  }
  if(clearLines >= 1) {
      addScore(clearLines);  // 行が揃ったので得点を加算
      // console.log(clearLines);
    }
    clearLines = 0;
};

// 落下処理ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const dropTet = () => {
  if (isGameOver || isPaused) return;

  // テトリミノが下に移動できるかどうかをチェック
  if (canMove(0, 1)) {
    tetroMinoDistanceY++;
  } else {
    fixTet();   // テトリミノを固定
    clearLine();   // 揃った行を消去

    // テトリミノをランダムに生成
    tetroTypesIndex = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
    tetroMino = TETRO_TYPES[tetroTypesIndex];
    createTetPosition();

    // 次のテトリミノを出せなくなったらゲームオーバー
    if (!canMove(0, 0)) {
      isGameOver = true;
      clearInterval(timerId);
    }
  }
  drawPlayScreen();   // ゲーム画面を更新
};

// 初期化処理ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const init = () => {
  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    SCREEN[y] = [];
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      SCREEN[y][x] = 0;
    }
  }

  // テスト用
  //SCREEN[4][6] = 1;

  // 新しいテトリミノの初期位置を設定
  createTetPosition();

  // 落下処理実行
  interval = setInterval(dropTet, DROP_SPEED);   // 一定の間隔（DROP_SPEED ミリ秒）ごとに dropTet() 関数を呼び出し、テトリミノを自動的に落下
  drawPlayScreen();   // ゲーム画面を更新
};

// 一時停止フラグ
let isPaused = false;


// 落下処理を呼び出す関数ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const startDropTimer = () => {
  if (isPaused === true) { // isPausedがtrueの場合は何もせずに終了
    return;
  }

  timerId = setTimeout(() => {
    if(isPaused === false) {
      dropTet();   // テトリミノを自動的に落下
      startDropTimer();   // 次の落下タイマーを開始
    }
  }, DROP_SPEED);
};

// 初期得点
let score = 0;
// 得点表示用のHTML要素を取得
const scoreDisplay = document.getElementById('score');

// 得点を加算する関数
const addScore = (linesCleared) => {
  // linesClearedが1なら1行、2なら2行、3なら3行、4なら4行が揃ったことを表す
  switch (linesCleared) {
    case 1:
      score += 100; // 1行揃えた時の得点
      break;
    case 2:
      score += 300; // 2行揃えた時の得点
      break;
    case 3:
      score += 500; // 3行揃えた時の得点
      break;
    case 4:
      score += 800; // 4行揃えた時の得点
      break;
    default:
      break;
  }
  // 得点表示を更新
  scoreDisplay.textContent = `得点: ${score}`;
};

const pauseButton = document.getElementById('pauseButton');
pauseButton.addEventListener('click', () => {
  if (isPaused) {
      isPaused = false;
      pauseButton.textContent = "ポーズ";
  } else {
      isPaused = true;
      pauseButton.textContent = "再開する";
  }
  console.log(isPaused);
});