const sketches = [
  'sketch_particles3d.js',
  'sketch_modern_pop.js',
  'sketch_hybrid.js',
  'sketch_attractor.js',
  'sketch_pixi_flow.js',
  'sketch_riso.js',
  'sketch_liquid.js',
  'sketch_utilitarian.js',
  'sketch_slime.js',
  'sketch_supershape.js',
  'sketch_diff_growth.js',
  'sketch_memphis.js',
  'sketch_eva.js',
  'sketch_bento.js',
  'sketch_nightcity.js',
  'sketch_korin.js',
  'sketch_flow.js',
  'sketch_rd.js',
  'sketch_lsystem.js',
  'sketch_chaos.js',
  'sketch_ca.js',
  'sketch_fractal.js',
  'sketch_voronoi.js',
  'sketch_delaunay.js',
  'sketch_physics.js',
  'sketch_agent.js',
  'sketch_glitch.js',
  'sketch_shader.js',
  'sketch_kinetic.js',
  'sketch_dataviz.js',
  'sketch_isometric.js',
  'sketch_halftone.js',
  'sketch_moire.js',
  'sketch_perlin.js',
  'sketch_ai.js',
  'sketch_fui.js',
  'sketch18.js',
  'sketch_tdr.js',
  'sketch_crouwel.js',
  'sketch_dia.js',
  'sketch_warwicker.js',
  'sketch_lines.js'
];

const selector = document.getElementById('sketch-selector');

sketches.forEach((s, i) => {
  const option = document.createElement('option');
  option.value = s;
  option.text = `${i + 1}. ${s.replace('.js', '').replace('sketch_', '')}`;
  selector.appendChild(option);
});

// URLパラメータから初期スケッチを取得
const urlParams = new URLSearchParams(window.location.search);
const sketchParam = urlParams.get('sketch');
if (sketchParam && sketches.includes(sketchParam)) {
  selector.value = sketchParam;
}

let currentScript = null;
let p5Instance = null;
let gui = null;

function loadSketch(src) {
  if (currentScript) {
    currentScript.remove();
    
    // p5.jsのインスタンスを削除
    if (p5Instance) {
      p5Instance.remove();
      p5Instance = null;
    } else if (window.remove) {
      window.remove();
    }
    
    // グローバル関数をリセットして、前のスケッチの影響を消す
    window.setup = null;
    window.draw = null;
    window.mousePressed = null;
    window.keyPressed = null;
    window.windowResized = null;

    // 前のスケッチのGUI設定をクリア
    if (window.guiConfig) {
      delete window.guiConfig;
    }
    // GUIを破棄
    if (gui) {
      gui.destroy();
      gui = null;
    }

    // キャンバスを削除
    const canvas = document.querySelector('canvas');
    if (canvas) canvas.remove();
  }

  // グローバル汚染を防ぐため、リロードに近い挙動にするのが理想だが、
  // 簡易的にスクリプトタグを差し替える
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => {
    // p5.jsを再初期化（これにより新しいsetup/drawが認識される）
    p5Instance = new p5();

    // GUIの生成
    if (window.guiConfig) {
      gui = new lil.GUI();
      window.guiConfig.forEach(config => {
        // windowオブジェクトのプロパティを操作する
        const controller = gui.add(window, config.variable, config.min, config.max, config.step).name(config.name || config.variable);
        if (config.onChange) {
          controller.onChange(config.onChange);
        }
        if (config.onFinishChange) {
          controller.onFinishChange(config.onFinishChange);
        }
      });
    }
  };
  document.body.appendChild(script);
  currentScript = script;
}

selector.addEventListener('change', (e) => {
  loadSketch(e.target.value);
});

// p5.jsを動的に読み込んでから初期ロードを行う
const p5Script = document.createElement('script');
p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
p5Script.onload = () => {
  // p5.js読み込み完了後に最初のスケッチを開始
  loadSketch(selector.value);
};
document.head.appendChild(p5Script);