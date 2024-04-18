// 落下スピード
const DROP_SPEED = 300;

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

// テトリスプレイ画面描画処理
const drawPlayScreen = () => {
  // 背景色を黒に指定
  CANVAS_2D.fillStyle = '#000';

  // キャンバスを塗りつぶす
  CANVAS_2D.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 画面本体で動かせなくなったテトリミノを描画する
  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      if (SCREEN[y][x]) {
        drawBlock(x, y, SCREEN[y][x]);
      }
    }
  }

  // テトリミノを描画する
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

// // リプレイ機能
// const replayGame = () => {
//     isGameOver = false;
//     init();
//   };
  
// document.addEventListener('keydown', (e) => {
//     if (isGameOver && e.code === 'KeyP') {
//       replayGame();
//     }
// });

const drawBlock = (x, y, tetroTypesIndex) => {
  let drawX = x * BLOCK_SIZE;
  let drawY = y * BLOCK_SIZE;

  // 塗りに赤を設定
  CANVAS_2D.fillStyle = tetColors[tetroTypesIndex];
  CANVAS_2D.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
  // 線の色を黒に設定
  CANVAS_2D.strokeStyle = 'black';
  CANVAS_2D.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
};

const canMove = (moveX, moveY, newTet = tetroMino) => {
  for (let y = 0; y < TET_SIZE; y++) {
    for (let x = 0; x < TET_SIZE; x++) {
      if (newTet[y][x]) {
        // 現在のテトリミノの位置（tetroMinoDistanceX + x）に移動分を加える（＝移動後の座標）
        let nextX = tetroMinoDistanceX + x + moveX;
        let nextY = tetroMinoDistanceY + y + moveY;

        // 移動先にブロックがあるか判定
        if (
          nextY < 0 ||
          nextX < 0 ||
          nextY >= PLAY_SCREEN_HEIGHT ||
          nextX >= PLAY_SCREEN_WIDTH ||
          SCREEN[nextY][nextX]
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

// 右回転
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

// 左回転
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
  }
  drawPlayScreen();
};

const fixTet = () => {
  for (let y = 0; y < TET_SIZE; y++) {
    for (let x = 0; x < TET_SIZE; x++) {
      if (tetroMino[y][x]) {
        SCREEN[tetroMinoDistanceY + y][tetroMinoDistanceX + x] =
          tetroTypesIndex;
      }
    }
  }
  clearLine();  // 行が揃ったかを確認する
  drawPlayScreen(); // 表示の更新
};

const clearLine = () => {
  // 一列になっている場所をスクリーン上から調べていく
  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    // 行を消すフラグを立てる
    let isClearLine = true;
    // 行に0が入っている（＝そろっていない）かを調べていく
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      if (SCREEN[y][x] === 0) {
        isClearLine = false;
        break;
      }
    }
    if (isClearLine) {
      // そろった行から上へ向かってforループしていく
      for (let newY = y; newY > 0; newY--) {
        for (let newX = 0; newX < PLAY_SCREEN_WIDTH; newX++) {
          // 一列上の情報をコピーする
          SCREEN[newY][newX] = SCREEN[newY - 1][newX];
        }
      }
      addScore(1);  // 行が揃ったので得点を加算
    }
  }
};

// 落下処理
const dropTet = () => {
  if (isGameOver) return;
  if (canMove(0, 1)) {
    tetroMinoDistanceY++;
  } else {
    fixTet();
    clearLine();
    tetroTypesIndex = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
    tetroMino = TETRO_TYPES[tetroTypesIndex];
    createTetPosition();
    // 次のテトリミノを出せなくなったらゲームオーバー
    if (!canMove(0, 0)) {
      isGameOver = true;
      clearInterval(timerId);
    }
  }
  drawPlayScreen();
};

// 画面を真ん中にする
const CONTAINER = document.getElementById('container');
CONTAINER.style.width = CANVAS_WIDTH + 'px';

const createTetPosition = () => {
  tetroMinoDistanceX = PLAY_SCREEN_WIDTH / 2 - TET_SIZE / 2;
  tetroMinoDistanceY = 0;
};

// 初期化処理
const init = () => {
  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    SCREEN[y] = [];
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      SCREEN[y][x] = 0;
    }
  }

  // テスト用
  //SCREEN[4][6] = 1;
  createTetPosition();
  // 落下処理実行
  setInterval(dropTet, DROP_SPEED);
  drawPlayScreen();
};
// let timerId = null;

// 落下処理を呼び出す関数
const startDropTimer = () => {
  timerId = setTimeout(() => {
    if(!isPaused) {
      dropTet();
      startDropTimer();
    }
  }, DROP_SPEED);
};


// 一時停止機能

const togglePause = () => {
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(timerId);
  } 
  else {
    // timerId = setInterval(dropTet, DROP_SPEED);
    startDropTimer(); // 一時停止解除時にタイマー開始
  }
};

startDropTimer();

let isPaused = false;
document.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') {
    togglePause();
  }
});

// 一時停止機能
// const togglePause = () => {
//   isPaused = !isPaused;
//   if(isPaused) {
//       clearInterval(timerId);
//   }
//   else {
//       timerId = setInterval(dropTet, DROP_SPEED);
//   }
// };

// // ポーズボタンの要素を取得
// const pauseButton = document.getElementById('pauseButton');

// // ポーズボタンのクリックイベントリスナーを設定
// pauseButton.addEventListener('click', () => {
//     togglePause();
// });

// console.log(togglePause);

// let isPaused = false;

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