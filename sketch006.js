var w = 10;
var cells;
var generation = 0;
var caRules = [0, 1, 0, 1, 1, 0, 1, 0]; // Rule 90
var isExporting = false;
var exportCount = 0;
var exportMax = 600;
var exportSessionID = "";

let lastRule = -1;

const params = {
renderBG: true,
bgColor: '#000000',
cellColor: '#00FF64',
ruleset: 'Random',
};

const rulesets = {
  Random: 'rand',
  Curated: [1, 3, 15, 18, 22, 30, 45, 60, 73, 90, 105, 107, 109, 110, 121, 126, 129, 150, 182, 190, 250] //Source for chosen Rules https://atlas.wolfram.com/01/01/
};

var guiConfig = [
  { variable: 'w', min: 2, max: 50, step: 1, name: 'Cell Size', onFinishChange: function(){ initCA(); } },
  { object: params, variable: 'ruleset', options: Object.keys(rulesets), name: 'Pattern Ruleset'},
  { object: params, variable: 'cellColor', type: 'color', name: 'Cell color'},
  { object: params, variable: 'renderBG', name: 'Render Background', onChange: updateBackground},
  { object: params, variable: 'bgColor', type: 'color', name: 'Background', onChange: updateBackground },
  { variable: 'exportMax', min: 60, max: 1200, step: 1, name: 'Export Frames' },
  { variable: 'startExport', name: 'Start Export', type: 'function' }
];

function updateBackground() {
  if (params.renderBG) {
    background(params.bgColor); 
  } else {
    clear();
  }
}

function setup() {
  let c = createCanvas(1920, 1080);
  
  c.style('width', '100%');
  c.style('height', 'auto');
  c.style('max-height', '100vh');
  c.style('display', 'block');
  c.style('margin', '0 auto');

  initCA();
}

function initCA() {
  let numCols = floor(width / w);
  cells= Array(numCols).fill(0);
  let middle = floor(numCols / 2);
  
  generation = 0;
  updateBackground();
}

function draw() {
  let totalGridWidth = cells.length * w;
  let screenOffset = (width - totalGridWidth) / 2;

  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 1) {
      fill(params.cellColor)
      noStroke();
      rect(screenOffset + (i * w), generation * w, w + 1, w + 1);
    }
  }

  generate();
  generation++;
  
  // 画面下まで行ったらリセット
  if (generation * w > height) {
    updateBackground();
    generation = 0;

    cells = Array(floor(width / w)).fill(0);
    cells[floor(cells.length / 2)] = 1;
    
    let chosenRuleNumber;
    let selRuleSet = rulesets[params.ruleset]
    
    do {
      if (selRuleSet === 'rand') {
        chosenRuleNumber = floor(random(256));
      } else {
        chosenRuleNumber = random(selRuleSet);
      }
    } while (chosenRuleNumber == lastRule);

    lastRule = chosenRuleNumber;

    // ルールをランダム変更
    for(let i=0; i<8; i++) {
       caRules[7 - i] = (chosenRuleNumber >> i) & 1;
    }
  }

  // 書き出し処理
  if (isExporting) {
    saveCanvas('cellular_automata_' + exportSessionID + '_' + nf(exportCount + 1, 3), 'png');
    exportCount++;
    if (exportCount >= exportMax) {
      isExporting = false;
      console.log("Export finished");
    }
  }
}

function generate() {
  let nextgen = Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    let left = cells[(i - 1 + cells.length) % cells.length];
    let me = cells[i];
    let right = cells[(i + 1) % cells.length];
    nextgen[i] = rules(left, me, right);
  }
  cells = nextgen;
}

function rules(a, b, c) {
  let s = "" + a + b + c;
  let index = parseInt(s, 2);
  return caRules[7 - index]; // 配列のインデックスとルールのビット順序に注意
}

function windowResized() {
  // 固定サイズのためリサイズ処理は行わない
}

function startExport() {
  if (isExporting) return;
  isExporting = true;
  exportCount = 0;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  exportSessionID = "";
  for (let i = 0; i < 4; i++) exportSessionID += chars.charAt(floor(random(chars.length)));
  console.log(`Export started: ${exportSessionID}`);
}

window.startExport = startExport;