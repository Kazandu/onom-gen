// Concentric Arcs
// 画面中央を中心とした同心円状の円弧ジェネレーター

const params = {
  seed: 1,
  minRadius: 17,
  maxRadius: 1500,
  minWidth: 1,
  maxWidth: 103,
  minArcs: 1, // リングごとの最小円弧数
  maxArcs: 50, // リングごとの最大円弧数
  gapFactor: 1, // 全体の空きの大きさ (0.0 - 1.0)
  ringGap: 8, // リング間の隙間
  strokeCapMode: 'SQUARE', // SQUARE, ROUND, PROJECT
  speed: 1,
  expandEnabled: true,
  expansionSpeed: 1.5,
  morphEnabled: true,
  morphInterval: 30,
  morphSpeed: 0.2706,
  morphWidthVar: 1,
  morphLengthVar: 1,
  stepRotEnabled: true,
  stepRotInterval: 30,
  stepRotSpeed: 0.1009,
  stepRotMaxAngle: 1.249,
  bgColor: '#000000',
  palette: 'Neon',
  exportFrames: 600,
  exportStart: () => startExport(),
  regenerate: () => generateArcs(true)
};

let arcs = [];
let rings = [];
let time = 0;
let expansionOffset = 0;

// カラーパレット
const PALETTES = {
  Neon: ['#FF0055', '#00FFCC', '#CCFF00', '#FFFFFF', '#0055FF'],
  Monochrome: ['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333'],
  Cyberpunk: ['#FCEE09', '#00FFFF', '#FF003C', '#271033'],
  White: ['#FFFFFF'],
  blueRed: ['#00d9ffff','#0033ffff', '#ff0088ff', '#ff0066ff']
};

let isExporting = false;
let exportCount = 0;
let exportMax = 0;
let exportSessionID = "";

function setup() {
  let c = createCanvas(1920, 1080);
  pixelDensity(1);
  
  c.style('width', '100%');
  c.style('height', 'auto');
  c.style('max-height', '100vh');
  c.style('display', 'block');
  c.style('margin', '0 auto');

  noFill();

  generateArcs();
}

function generateArcs(forceReset = false) {
  if (forceReset) {
    params.seed = floor(random(10000));
  }
  randomSeed(params.seed);
  arcs = [];
  rings = [];
  expansionOffset = 0;
  
  let currentRadius = params.minRadius;
  
  // 指定した最大半径に達するまでリング状に生成を繰り返す
  while (currentRadius < params.maxRadius) {
    let ringObj = generateSingleRing(false);
    currentRadius += ringObj.baseWidth + params.ringGap; // 次のリングへの半径を更新
  }
}

function generateSingleRing(insertAtStart = false) {
  let arcWidth = random(params.minWidth, params.maxWidth);
  let colors = PALETTES[params.palette];
  
    let ringObj = {
      baseWidth: arcWidth,
      width: arcWidth,
      targetWidth: arcWidth,
      morphTimer: random(1000),
      rotTimer: random(1000),
      baseRotation: 0,
      targetRotation: 0,
      currentRotation: 0
    };
    
    if (insertAtStart) {
      rings.unshift(ringObj);
    } else {
      rings.push(ringObj);
    }

    let currentAngle = 0;
    // リング全体での回転速度と方向（層ごとに異なる速度で回るように）
    let ringSpeed = random(0.002, 0.015) * (random() > 0.5 ? 1 : -1);
    let prevColor = null;
    
    // リングを分割する円弧の数を決定
    let numArcs = floor(random(params.minArcs, params.maxArcs + 1));
    let weights = [];
    let totalWeight = 0;
    for (let i = 0; i < numArcs; i++) {
      let w = random(0.2, 1.0); // 極端に小さくなりすぎないように
      weights.push(w);
      totalWeight += w;
    }
    
    let newArcs = [];
    // 1つのリングを分割
    for (let i = 0; i < numArcs; i++) {
      let angleLen = (weights[i] / totalWeight) * TWO_PI;

      // 隣り合う色が同じにならないようにする工夫
      let availableColors = colors.filter(c => c !== prevColor);
      if (availableColors.length === 0) availableColors = colors;
      let c = random(availableColors);
      prevColor = c;
      
      // 空きの幅をランダムに決定
      let gapRatio = random(0, params.gapFactor);
      let drawLen = Math.max(0, angleLen * (1 - gapRatio));
      let gapStart = angleLen * gapRatio * random(); // 隙間を前後にランダムに分配

      newArcs.push({
        ring: ringObj,
        baseStartAngle: currentAngle + gapStart,
        baseDrawLen: drawLen,
        drawLen: drawLen,
        targetDrawLen: drawLen,
        color: c,
        speed: ringSpeed,
        morphTimer: random(1000) // アニメーションのタイミングを個別にずらす
      });
      
      currentAngle += angleLen;
    }
    
    if (insertAtStart) {
      arcs = newArcs.concat(arcs); // 先頭に追加
    } else {
      arcs = arcs.concat(newArcs); // 末尾に追加
    }
    
    return ringObj;
}

function draw() {
  blendMode(BLEND);
  rectMode(CORNER);
  noStroke();
  fill(params.bgColor);
  rect(0, 0, width, height);
  
  push();
  translate(width / 2, height / 2);
  
  time += params.speed;
  
  noFill();

  // GUIの設定に合わせて線の端の形状を変更
  if (params.strokeCapMode === 'ROUND') {
    strokeCap(ROUND);
  } else if (params.strokeCapMode === 'PROJECT') {
    strokeCap(PROJECT);
  } else {
    strokeCap(SQUARE);
  }

  // 全体が外側に広がるアニメーション
  if (params.expandEnabled) {
    expansionOffset += params.expansionSpeed;
    if (expansionOffset > 0) {
      let newRing = generateSingleRing(true);
      expansionOffset -= (newRing.baseWidth + params.ringGap);
    }
  }
  
  // リング（幅）のモーフィング計算
  let currentRingRadius = params.minRadius + expansionOffset;
  for (let r of rings) {
    if (params.morphEnabled) {
      r.morphTimer += 1;
      if (r.morphTimer > params.morphInterval) {
        r.morphTimer = 0;
        r.targetWidth = r.baseWidth * random(1.0 - params.morphWidthVar, 1.0 + params.morphWidthVar);
        r.targetWidth = max(r.targetWidth, 1); // 0未満にならないよう制限
      }
      r.width = lerp(r.width, r.targetWidth, params.morphSpeed);
    } else {
      r.width = lerp(r.width, r.baseWidth, params.morphSpeed);
    }
    
    // ステップ回転の計算
    if (params.stepRotEnabled) {
      r.rotTimer += 1;
      if (r.rotTimer > params.stepRotInterval) {
        r.rotTimer = 0;
        let rotAmount = random(0.1, params.stepRotMaxAngle) * (random() > 0.5 ? 1 : -1);
        r.targetRotation += rotAmount;
      }
      r.currentRotation = lerp(r.currentRotation, r.targetRotation, params.stepRotSpeed);
    }
    
    // 動的に中心半径を再計算
    r.currentRadius = currentRingRadius + r.width / 2;
    currentRingRadius += r.width + params.ringGap;
  }

  for (let a of arcs) {
    // 円弧の長さのモーフィング計算
    if (params.morphEnabled) {
      a.morphTimer += 1;
      if (a.morphTimer > params.morphInterval) {
        a.morphTimer = 0;
        a.targetDrawLen = a.baseDrawLen * random(1.0 - params.morphLengthVar, 1.0 + params.morphLengthVar);
        a.targetDrawLen = max(a.targetDrawLen, 0.01);
      }
      a.drawLen = lerp(a.drawLen, a.targetDrawLen, params.morphSpeed);
    } else {
      // 無効化された場合は元のサイズへスムーズに戻る
      a.drawLen = lerp(a.drawLen, a.baseDrawLen, params.morphSpeed);
    }

    let drawWidth = a.ring.width;
    // 円弧の大きさを上回る線の太さにしない（中心を越えたり急に出現するのを防ぐ）
    if (drawWidth > a.ring.currentRadius * 2) {
      drawWidth = Math.max(0, a.ring.currentRadius * 2);
    }

    if (drawWidth > 0 && a.ring.currentRadius > 0) {
      stroke(a.color);
      strokeWeight(drawWidth);
      
      let rotation = time * a.speed + a.ring.currentRotation;
      
      // 円弧の中心角度を基準にして伸び縮みさせる
      let centerAngle = a.baseStartAngle + a.baseDrawLen / 2;
      let currentStartAngle = centerAngle - a.drawLen / 2;
      let currentEndAngle = centerAngle + a.drawLen / 2;
      
      arc(0, 0, a.ring.currentRadius * 2, a.ring.currentRadius * 2, currentStartAngle + rotation, currentEndAngle + rotation);
    }
  }
  
  // 画面外に押し出されたリングを削除
  for (let i = rings.length - 1; i >= 0; i--) {
    let r = rings[i];
    if (r.currentRadius - r.width / 2 > params.maxRadius) {
      rings.splice(i, 1);
      arcs = arcs.filter(a => a.ring !== r);
    }
  }
  
  pop();

  if (isExporting) {
    saveCanvas('concentric_arcs_' + exportSessionID + '_' + nf(exportCount + 1, 3), 'png');
    exportCount++;
    if (exportCount >= exportMax) {
      isExporting = false;
      console.log("Export finished");
    }
  }
}

// gui_handler.js などで読み込まれる設定
window.guiConfig = [
  { folder: 'Generator', contents: [
    { object: params, variable: 'seed', min: 0, max: 10000, step: 1, name: 'Seed', listen: true, onChange: () => generateArcs(true) },
    { object: params, variable: 'minRadius', min: 0, max: 200, step: 1, name: 'Min Radius', onChange: () => generateArcs(false) },
    { object: params, variable: 'maxRadius', min: 200, max: 1500, step: 10, name: 'Max Radius', onChange: () => generateArcs(false) },
    { object: params, variable: 'minWidth', min: 1, max: 50, step: 1, name: 'Min Arc Width', onChange: () => generateArcs(false) },
    { object: params, variable: 'maxWidth', min: 10, max: 200, step: 1, name: 'Max Arc Width', onChange: () => generateArcs(false) },
    { object: params, variable: 'minArcs', min: 1, max: 30, step: 1, name: 'Min Arcs', onChange: () => generateArcs(false) },
    { object: params, variable: 'maxArcs', min: 1, max: 50, step: 1, name: 'Max Arcs', onChange: () => generateArcs(false) },
    { object: params, variable: 'gapFactor', min: 0.0, max: 5.0, name: 'Gap Size', onChange: () => generateArcs(false) },
    { object: params, variable: 'ringGap', min: 0, max: 100, step: 1, name: 'Ring Gap', onChange: () => generateArcs(false) },
    { object: params, variable: 'regenerate', name: 'Regenerate', type: 'function' }
  ]},
  { folder: 'Style', contents: [
    { object: params, variable: 'palette', options: Object.keys(PALETTES), name: 'Palette', onChange: () => generateArcs(false) },
    { object: params, variable: 'bgColor', type: 'color', name: 'Background' },
    { object: params, variable: 'strokeCapMode', options: ['SQUARE', 'ROUND', 'PROJECT'], name: 'Line Cap' }
  ]},
  { folder: 'Animation', contents: [
    { object: params, variable: 'speed', min: 0, max: 5.0, name: 'Rot Speed' },
    { object: params, variable: 'expandEnabled', name: 'Expansion' },
    { object: params, variable: 'expansionSpeed', min: 0.1, max: 10.0, name: 'Expand Speed' },
    { object: params, variable: 'morphEnabled', name: 'Morphing' },
    { object: params, variable: 'morphInterval', min: 10, max: 300, step: 10, name: 'Interval' },
    { object: params, variable: 'morphSpeed', min: 0.01, max: 0.3, name: 'Smoothness' },
    { object: params, variable: 'morphWidthVar', min: 0.0, max: 1.0, name: 'Width Var' },
    { object: params, variable: 'morphLengthVar', min: 0.0, max: 1.0, name: 'Length Var' },
    { object: params, variable: 'stepRotEnabled', name: 'Step Rotation' },
    { object: params, variable: 'stepRotInterval', min: 10, max: 300, step: 10, name: 'Step Interval' },
    { object: params, variable: 'stepRotSpeed', min: 0.01, max: 0.3, name: 'Step Smoothness' },
    { object: params, variable: 'stepRotMaxAngle', min: 0.1, max: Math.PI * 2, name: 'Max Step Angle' }
  ]},
  { folder: 'Export', contents: [
    { object: params, variable: 'exportFrames', min: 60, max: 1200, step: 1, name: 'Frames' },
    { object: params, variable: 'exportStart', name: 'Start Export', type: 'function' }
  ]}
];

function startExport() {
  if (isExporting) return;
  isExporting = true;
  exportCount = 0;
  exportMax = params.exportFrames;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  exportSessionID = "";
  for (let i = 0; i < 4; i++) exportSessionID += chars.charAt(floor(random(chars.length)));
  console.log(`Export started: ${exportSessionID}`);
}

function keyPressed() {
  if (key === 's' || key === 'S') startExport();
  if (key === 'r' || key === 'R') generateArcs(true);
}