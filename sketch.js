let characterSheet; // 載入單一的角色圖片資源
let attackSheet;    // 載入攻擊的圖片資源
let projectileSheet; // 載入投射物的圖片資源
let newCharacterSheet; // 載入新角色的圖片資源
let newCharacterSheet2; // 載入第二個新角色的圖片資源
let touchSheet11; // 載入角色3的觸碰動畫資源
let smileSheet10; // 載入角色2的微笑動畫資源
let fallDownSheet10; // 載入角色2的倒下動畫資源

// --- 動畫資料庫 ---
// 集中管理所有動畫的設定
const animations = {
  idle: {
    img: null, // 預載入後設定
    frames: [0, 1, 2, 3, 4, 3, 2, 1], // 使用春麗的呼吸/站立畫格序列
    frameWidth: 192.4, // 2309 / 12
    frameHeight: 193,
    speed: 10, // 調整呼吸動畫速度
  },
  walk: {
    img: null, // 預載入後設定
    frames: [5, 6, 7, 8, 9, 10, 11], // 使用春麗的走路畫格序列
    frameWidth: 192.4, // 2309 / 12
    frameHeight: 193,
    speed: 5,
  },
  jump: {
    img: null, // 預載入後設定
    frames: [0], // 暫時使用站立畫格作為跳躍
    frameWidth: 192.4,
    frameHeight: 193,
    speed: 1,
    loops: false, // 跳躍動畫只播放一次
  },
  attack: {
    img: null, // 預載入後設定
    frames: [0, 1, 2, 3], // 播放所有攻擊畫格
    frameWidth: 154,         // 616 / 4
    frameHeight: 193,
    speed: 5,
    loops: false, // 攻擊動畫只播放一次
    projectileFrame: 2, // 在第3個畫格 (索引2) 發射投射物
  },
};

// --- 角色物件 ---
// 集中管理角色的所有狀態與屬性
const character = {
  x: 0,
  y: 0,
  vy: 0, // Vertical velocity (垂直速度)
  gravity: 0.8,
  jumpStrength: -20, // 跳躍力道 (負數向上)
  speed: 5,
  direction: 1, // 1: 右, -1: 左
  state: 'idle', // 'idle', 'walk', 'jump', 'attack'
  animationIndex: 0,
  previousState: 'idle', // 用於偵測狀態變化
  isOnGround: true,
  groundY: 0, // 地面高度
};

// --- 投射物管理 ---
const projectiles = [];
const projectileInfo = {
  img: null, // 預載入後設定
  speed: 10, // 投射物飛行速度
  frames: [0, 1, 2], // 使用月牙波的畫格
  frameWidth: 197, // 591 / 3
  frameHeight: 229,
  animationIndex: 0,
  animationSpeed: 6, // 投射物自身的動畫速度
};

// --- 新角色物件 ---
const newCharacter = {
  x: 0,
  y: 0,
  state: 'stop', // 'stop', 'smile'
  previousState: 'stop',
  animationIndex: 0,
  touchDistance: 150,
  displayText: "", // 要顯示的文字
  isVisible: true, // 控制角色是否可見
  animations: {
    stop: {
      img: null,
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      frameWidth: 467 / 8,
      frameHeight: 95,
      speed: 10,
    },
    smile: {
      img: null,
      // 假設 smile_10.png 也是 8 幀, 467x95
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      frameWidth: 467 / 8,
      frameHeight: 95,
      speed: 8,
    },
    fall: {
      img: null,
      frames: [0, 1, 2, 3],
      frameWidth: 375 / 4,
      frameHeight: 83,
      speed: 10,
      loops: false, // 只播放一次
    },
  },
};

// --- 第二個新角色物件 ---
const newCharacter2 = {
  x: 0,
  y: 0,
  direction: 1,
  state: 'stop', // 'stop', 'touch'
  previousState: 'stop',
  animationIndex: 0,
  touchDistance: 250, // 觸發狀態改變的距離 (增加距離)
  animations: {
    stop: {
      img: null,
      frames: [0, 1, 2, 3, 4, 5],
      frameWidth: 343 / 6,
      frameHeight: 40,
      speed: 10,
    },
    touch: {
      img: null,
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      frameWidth: 732 / 11,
      frameHeight: 69,
      speed: 8, // 可以為新動畫設定不同速度
    }
  },
};

// --- 互動相關變數 ---
let inputBox; // 用於文字輸入
let isChatting = false; // 是否正在與角色2互動

function preload() {
  // 載入春麗的角色圖片資源
  characterSheet = loadImage('2/全2.png');
  attackSheet = loadImage('4/全4.png'); // 角色攻擊動畫
  projectileSheet = loadImage('3/全3.png'); // 投射物動畫
  newCharacterSheet = loadImage('10/stop/stop_10.png'); // 載入新角色圖片
  smileSheet10 = loadImage('10/smile/smile_10.png'); // 載入角色2微笑動畫
  fallDownSheet10 = loadImage('10/fall_down/fall_down_10.png'); // 載入角色2倒下動畫
  newCharacterSheet2 = loadImage('11/stop/stop_11.png'); // 載入第二個新角色圖片
  touchSheet11 = loadImage('11/touch/touch_11.png'); // 載入角色3的觸碰動畫
}

function setup() {
  // 建立一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);

  // 將載入的圖片連結到所有動畫
  animations.idle.img = characterSheet;
  animations.walk.img = characterSheet;
  animations.jump.img = characterSheet; // 跳躍暫時使用角色圖
  animations.attack.img = attackSheet;

  // 將載入的圖片連結到投射物
  projectileInfo.img = projectileSheet;

  // 初始化角色位置
  character.x = width / 2;
  // 將「地面」設定在畫面的垂直中心
  character.groundY = height / 2;
  character.y = character.groundY;

  // 初始化新角色的圖片與位置
  newCharacter.animations.stop.img = newCharacterSheet;
  newCharacter.animations.smile.img = smileSheet10;
  newCharacter.animations.fall.img = fallDownSheet10;
  // 將新角色放在主角色左邊
  newCharacter.x = character.x - 200;
  newCharacter.y = character.groundY;

  // 初始化第二個新角色的圖片與位置
  newCharacter2.animations.stop.img = newCharacterSheet2;
  newCharacter2.animations.touch.img = touchSheet11;
  newCharacter2.x = character.x + 200;
  newCharacter2.y = character.groundY;

  // 建立文字輸入框並隱藏
  inputBox = createInput();
  inputBox.position(-width, -height); // 先移出畫面外
  inputBox.size(150);
  inputBox.changed(onInputSubmit); // 綁定 Enter 事件
}

function draw() {
  // 設定背景顏色為 #d5bdaf
  background('#d5bdaf');

  // 在處理輸入前，先記錄當前的狀態
  character.previousState = character.state;

  // --- 1. 玩家輸入與狀態更新 ---

  // 只有在地面上且不處於攻擊狀態時，才處理移動/跳躍
  if (character.isOnGround && character.state !== 'attack') {
    if (keyIsDown(RIGHT_ARROW)) {
      character.direction = 1;
      character.state = 'walk';
      character.x += character.speed;
    } else if (keyIsDown(LEFT_ARROW)) {
      character.direction = -1;
      character.state = 'walk';
      character.x -= character.speed;
    } else {
      character.state = 'idle';
    }

    // 處理跳躍輸入
    if (keyIsDown(UP_ARROW)) {
      character.isOnGround = false;
      character.vy = character.jumpStrength;
      character.state = 'jump';
      character.animationIndex = 0; // 每次跳躍都從第一格動畫開始
    }

    // 處理攻擊輸入 (改為向下方向鍵)
    if (keyIsDown(DOWN_ARROW)) {
      character.state = 'attack';
      character.animationIndex = 0;
    }
  }

  // --- 2. 套用物理效果 (重力) ---
  character.y += character.vy;

  // 只有在空中時才施加重力
  if (!character.isOnGround) {
    character.vy += character.gravity;
  }

  // --- 3. 著陸判斷 ---
  if (character.y >= character.groundY && !character.isOnGround) {
    character.y = character.groundY;
    character.vy = 0;
    character.isOnGround = true;
    // 著陸後，根據按鍵決定是走路還是站立
    if (character.state === 'jump') {
      character.state = keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW) ? 'walk' : 'idle';
    }
  }

  // --- 4. 繪製角色 ---
  const anim = animations[character.state]; // 根據當前狀態取得對應的動畫資料

  // 如果狀態發生了變化 (且不是跳躍或攻擊中)，重設動畫索引以從頭播放
  if (character.state !== character.previousState && character.state !== 'jump' && character.state !== 'attack') {
    character.animationIndex = 0;
  }

  // 每 anim.speed 個繪圖幀更新一次動畫
  if (frameCount % anim.speed === 0) {
    // 如果動畫不循環 (如跳躍/攻擊)
    if (anim.loops === false) {
      if (character.animationIndex < anim.frames.length - 1) {
        character.animationIndex++;

        // 在攻擊動畫的特定畫格發射投射物
        if (character.state === 'attack' && character.animationIndex === anim.projectileFrame) {
          createProjectile();
        }
      } else {
        // 動畫播放完畢
        if (character.state === 'attack') {
          character.state = 'idle'; // 攻擊完畢，回到站立狀態
        }
      }
    } else {
      character.animationIndex = (character.animationIndex + 1) % anim.frames.length;
    }
  }

  const frameIndex = anim.frames[character.animationIndex];
  const sx = frameIndex * anim.frameWidth;

  push(); // 儲存當前的繪圖設定
  translate(character.x, character.y); // 將畫布原點移動到角色位置
  scale(character.direction, 1); // 根據角色方向翻轉畫布

  // 繪製當前畫格
  imageMode(CENTER);
  // 攻擊動畫有不同的Y軸偏移，需要微調讓腳對齊地面
  const yOffset = (character.state === 'attack') ? -10 : 0;
  image(anim.img, 0, yOffset, anim.frameWidth, anim.frameHeight, sx, 0, anim.frameWidth, anim.frameHeight);

  pop(); // 恢復原本的繪圖設定

  // 如果角色2不可見，則不執行後續的繪製與邏輯
  if (!newCharacter.isVisible) return;

  // --- 繪製新角色 ---
  newCharacter.previousState = newCharacter.state;

  // 檢查與角色1的距離
  const distToChar2 = abs(character.x - newCharacter.x);

  // 如果角色2倒下了，靠近它可以讓它恢復
  if (newCharacter.state === 'fall' && distToChar2 < newCharacter.touchDistance) {
    newCharacter.state = 'stop';
    newCharacter.animationIndex = 0;
  } else if (newCharacter.state !== 'fall') {
    // 只有在非倒下狀態才處理對話互動
    if (distToChar2 < newCharacter.touchDistance && !isChatting) {
      // 進入互動狀態
      isChatting = true;
      newCharacter.state = 'smile';
      newCharacter.displayText = "需要我解答嗎?";
      inputBox.value(''); // 清空輸入框
      inputBox.position(character.x - inputBox.width / 2, character.y - character.height - 40);
    }
  } else if (distToChar2 >= newCharacter.touchDistance && isChatting) {
    // 離開互動狀態
    isChatting = false;
    newCharacter.state = 'stop';
    newCharacter.displayText = "";
    inputBox.position(-width, -height); // 隱藏輸入框
  }

  const newAnim = newCharacter.animations[newCharacter.state];

  // 更新新角色的動畫
  if (frameCount % newAnim.speed === 0) {
    // 如果動畫不循環 (如倒下)
    if (newAnim.loops === false) {
      if (newCharacter.animationIndex < newAnim.frames.length - 1) {
        newCharacter.animationIndex++;
      }
    } else {
      // 如果狀態改變，重設循環動畫的索引
      if (newCharacter.state !== newCharacter.previousState) {
        newCharacter.animationIndex = 0;
      }
      newCharacter.animationIndex = (newCharacter.animationIndex + 1) % newAnim.frames.length;
    }
  } else if (newCharacter.state !== newCharacter.previousState && newAnim.loops !== false) {
    // 立即重設循環動畫的索引，避免延遲
    newCharacter.animationIndex = 0;
  }

  // 如果在互動中，持續更新輸入框位置
  if (isChatting) {
    inputBox.position(character.x - inputBox.width / 2, character.y - 230);
  }

  const newFrameIndex = newAnim.frames[newCharacter.animationIndex];
  const newSx = newFrameIndex * newAnim.frameWidth;

  // 繪製新角色的當前畫格
  push();
  imageMode(CENTER);
  image(newAnim.img, newCharacter.x, newCharacter.y, newAnim.frameWidth, newAnim.frameHeight, newSx, 0, newAnim.frameWidth, newAnim.frameHeight);
  pop();

  // 繪製角色2頭上的文字
  if (newCharacter.displayText) {
    push();
    // --- 文字與方框設定 ---
    textSize(16);
    const textContent = newCharacter.displayText;
    const padding = 10;
    const boxWidth = textWidth(textContent) + padding * 2;
    const boxHeight = textAscent() + textDescent() + padding;
    const yPos = newCharacter.y - newCharacter.animations.stop.frameHeight / 2 - 10 - boxHeight / 2;

    // --- 繪製背景方框 ---
    rectMode(CENTER);
    noStroke();
    fill('#fee440'); // 設定方框背景色
    rect(newCharacter.x, yPos, boxWidth, boxHeight, 8); // 繪製圓角矩形

    // --- 繪製文字 ---
    fill(0); // 設定文字為黑色
    textAlign(CENTER, CENTER);
    text(textContent, newCharacter.x, yPos);
    pop();
  }

  // --- 繪製第二個新角色 ---
  newCharacter2.previousState = newCharacter2.state;

  // 根據與主要角色的距離，決定狀態
  if (abs(character.x - newCharacter2.x) < newCharacter2.touchDistance) {
    newCharacter2.state = 'touch';
  } else {
    newCharacter2.state = 'stop';
  }

  // 根據主要角色的位置，決定第二個新角色的方向
  if (character.x < newCharacter2.x) {
    newCharacter2.direction = -1; // 主要角色在左邊，角色3反向 (朝左)
  } else {
    newCharacter2.direction = 1; // 主要角色在右邊，角色3正常 (朝右)
  }

  const newAnim2 = newCharacter2.animations[newCharacter2.state];

  // 如果狀態改變，重設動畫索引
  if (newCharacter2.state !== newCharacter2.previousState) {
    newCharacter2.animationIndex = 0;
  }

  // 更新第二個新角色的動畫
  if (frameCount % newAnim2.speed === 0) {
    newCharacter2.animationIndex = (newCharacter2.animationIndex + 1) % newAnim2.frames.length;
  }

  const newFrameIndex2 = newAnim2.frames[newCharacter2.animationIndex];
  const newSx2 = newFrameIndex2 * newAnim2.frameWidth;
  // 繪製第二個新角色的當前畫格
  push();
  imageMode(CENTER);
  translate(newCharacter2.x, newCharacter2.y);
  scale(newCharacter2.direction, 1); // 根據方向翻轉圖片
  image(newAnim2.img, 0, 0, newAnim2.frameWidth * 1.5, newAnim2.frameHeight * 1.5, newSx2, 0, newAnim2.frameWidth, newAnim2.frameHeight);
  pop();

  // --- 5. 更新與繪製投射物 ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.speed * p.direction;

    // 更新投射物自己的動畫
    if (frameCount % projectileInfo.animationSpeed === 0) {
      p.animationIndex = (p.animationIndex + 1) % projectileInfo.frames.length;
    }
    const frameIndex = projectileInfo.frames[p.animationIndex];
    const sx = frameIndex * projectileInfo.frameWidth;
    push();
    translate(p.x, p.y + 30); // 微調Y軸，讓氣功波看起來在地面上
    scale(p.direction, 1);
    imageMode(CENTER);
    image(projectileInfo.img, 0, 0, projectileInfo.frameWidth, projectileInfo.frameHeight, sx, 0, projectileInfo.frameWidth, projectileInfo.frameHeight);
    pop();

    // 如果投射物飛出畫面，就將其移除
    if (p.x < 0 || p.x > width) {
      projectiles.splice(i, 1);
      continue; // 繼續下一個循環
    }

    // 檢查投射物與角色2的碰撞
    const pLeft = p.x - projectileInfo.frameWidth / 2;
    const pRight = p.x + projectileInfo.frameWidth / 2;
    const char2Left = newCharacter.x - newCharacter.animations.stop.frameWidth / 2;
    const char2Right = newCharacter.x + newCharacter.animations.stop.frameWidth / 2;

    if (newCharacter.isVisible && newCharacter.state !== 'fall' && pRight > char2Left && pLeft < char2Right) {
      newCharacter.state = 'fall';
      newCharacter.animationIndex = 0;
      projectiles.splice(i, 1); // 移除投射物
      continue; // 繼續下一個循環
    }
  }

  // --- 6. 邊界處理 (防止角色走出視窗) ---
  if (character.x > width) {
    character.x = width;
  }
  if (character.x < 0) {
    character.x = 0;
  }
}

function createProjectile() {
  const p = {
    x: character.x,
    y: character.y - 100, // 調整Y軸使大氣功波位置更合理
    direction: character.direction,
    speed: projectileInfo.speed,
    animationIndex: 0,
  };
  projectiles.push(p);
}

function onInputSubmit() {
  if (isChatting) {
    const inputText = inputBox.value();
    newCharacter.displayText = inputText + "，歡迎你";
    // 提交後不再隱藏輸入框或結束對話，直到玩家遠離
  }
}
