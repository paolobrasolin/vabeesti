const PRESETS = {
  BARNSLEY_FERN: {
    AX: `return "X";`,
    PR: `return {
  X: "F+[[X]-X]-F[-FX]+X",
  F: "FF",
};`,
    IS: `return [{ x: 0, y: 0, a: 0 }];`,
    OP: `advance = (state, dw, dr) => {
  const da = (Math.PI * dw) / 180;
  return {
    x: state.x + dr * Math.cos(state.a + da),
    y: state.y - dr * Math.sin(state.a + da),
    a: state.a + da,
  };
};

return {
  F: (draw, state) => {
    const source = state.pop();
    const target = advance(source, 0, 10);
    state.push(target);
    draw
      .line(source.x, source.y, target.x, target.y)
      .stroke({ width: 1, color: "black" });
  },
  "+": (draw, state) => {
    state.push(advance(state.pop(), +25, 0))
  },
  "-": (draw, state) => {
    state.push(advance(state.pop(), -25, 0))
  },
  "[": (draw, state) => state.push({ ...state.slice(-1)[0] }),
  "]": (draw, state) => state.pop(),
  X: (draw, state) => {},
};`,
  },
  SIERPINSKI_GASKET: {
    AX: `return "F-G-G";`,
    PR: `return {
  F: "F-G+F+G-F",
  G: "GG",
};`,
    IS: `return { x: 0, y: 0, a: 0 };`,
    OP: `return {
  F: (drawing, state) => {
    const target = this.polpol(state.x, state.y, state.a, 0, 10);
    drawing
      .line(state.x, state.y, target[0], target[1])
      .stroke({ width: 1, color: "black" });
    state.x = target[0];
    state.y = target[1];
    state.a = target[2];
  },
  G: (drawing, state) => {
    const target = this.polpol(state.x, state.y, state.a, 0, 10);
    drawing
      .line(state.x, state.y, target[0], target[1])
      .stroke({ width: 1, color: "black" });
    state.x = target[0];
    state.y = target[1];
    state.a = target[2];
  },
  "+": (drawing, state) => {
    state.a = state.a + (Math.PI * 120) / 180;
  },
  "-": (drawing, state) => {
    state.a = state.a - (Math.PI * 120) / 180;
  },
};`,
  },
  KOCH_CURVE: {
    AX: `return "F";`,
    PR: `return {
  F: "F+F-F-F+F",
};`,
    IS: `return { x: 0, y: 0, a: 0 };`,
    OP: `return {
  F: (drawing, state) => {
    const target = this.polpol(state.x, state.y, state.a, 0, 2);
    drawing
      .line(state.x, state.y, target[0], target[1])
      .stroke({ width: 0.1, color: "black" });
      state.x = target[0];
      state.y = target[1];
  },
  "+": (drawing, state) => {
    state.a = state.a + (Math.PI * 90) / 180;
  },
  "-": (drawing, state) => {
    state.a = state.a - (Math.PI * 90) / 180;
  },
};`,
  },
  BINARY_TREE: {
    AX: `return "0";`,
    PR: `return {
  0: "1[0]0",
  1: "11",
};
    `,
    IS: `return [{ x: 0, y: 0, a: 0 }];`,
    OP: `return {
  1: (drawing, state) => {
    const s = { ...state.pop() };
    const target = this.polpol(s.x, s.y, s.a, 0, 2);
    drawing
      .line(s.x, s.y, target[0], target[1])
      .stroke({ width: 0.1, color: "black" });
    s.x = target[0];
    s.y = target[1];
    state.push(s);
  },
  0: (drawing, state) => {
    const s = { ...state.pop() };
    const target = this.polpol(s.x, s.y, s.a, 0, 2);
    drawing
      .line(s.x, s.y, target[0], target[1])
      .stroke({ width: 0.1, color: "black" });
    s.x = target[0];
    s.y = target[1];
    state.push(s);
  },
  "[": (drawing, state) => {
    const s = { ...state.slice(-1)[0] };
    s.a = s.a - (Math.PI * 45) / 180;
    state.push(s);
  },
  "]": (drawing, state) => {
    state.pop();
    const s = state.slice(-1)[0];
    s.a = s.a + (Math.PI * 45) / 180;
  },
};`,
  },
};

const SELECTORS = {
  SIMULATION: "#simulation",
  PRESETS_SELECTOR: "#preset",
  BUTTON: ".interactor",
  BUTTONS: {
    RESTART: "#restart",
  },
  EDITORS: {
    AX: "#ax_editor",
    PR: "#pr_editor",
    IS: "#is_editor",
    OP: "#op_editor",
  },
};

const EDITORS_DEFAULT_CONFIG = {
  mode: "javascript",
  theme: "monokai",
  autoRefresh: true,
};

class LSP {
  constructor() {
    this.initEditors();
    this.bindButtons();
    this.resetSimulation();
  }

  initEditors() {
    this.axEditor = CodeMirror(document.querySelector(SELECTORS.EDITORS.AX), {
      ...EDITORS_DEFAULT_CONFIG,
      value: PRESETS.BARNSLEY_FERN.AX,
    });

    this.prEditor = CodeMirror(document.querySelector(SELECTORS.EDITORS.PR), {
      ...EDITORS_DEFAULT_CONFIG,
      value: PRESETS.BARNSLEY_FERN.PR,
    });

    this.isEditor = CodeMirror(document.querySelector(SELECTORS.EDITORS.IS), {
      ...EDITORS_DEFAULT_CONFIG,
      value: PRESETS.BARNSLEY_FERN.IS,
    });

    this.opEditor = CodeMirror(document.querySelector(SELECTORS.EDITORS.OP), {
      ...EDITORS_DEFAULT_CONFIG,
      value: PRESETS.BARNSLEY_FERN.OP,
    });
  }

  bindButtons() {
    document.addEventListener(
      "click",
      (event) => {
        if (!event.target.matches(SELECTORS.BUTTON)) return;
        if (event.target.matches(SELECTORS.BUTTONS.RESTART))
          this.resetSimulation();
        event.preventDefault();
      },
      false
    );
    document.addEventListener("change", (event) => {
      if (!event.target.matches(SELECTORS.PRESETS_SELECTOR)) return;
      event.preventDefault();
      const preset = PRESETS[event.target.value];
      this.axEditor.setValue(preset.AX);
      this.prEditor.setValue(preset.PR);
      this.isEditor.setValue(preset.IS);
      this.opEditor.setValue(preset.OP);
    });
  }

  resetSimulation() {
    this.readFunctions();

    document.getElementsByTagName("svg")[0]?.remove();

    var draw = SVG().addTo("body");
    const g = draw.group();
    const instr = this.produceN(this.axFunction(), 3);
    this.state = this.isFunction();
    instr
      .split("")
      .forEach((c) => (this.opFunction()[c] || (() => {}))(g, this.state));
    const bb = g.bbox();
    draw.viewbox(bb.x - 1, bb.y - 1, bb.width + 2, bb.height + 2);
  }

  readFunctions() {
    this.axFunction = new Function(this.axEditor.getValue());
    this.prFunction = new Function(this.prEditor.getValue());
    this.isFunction = new Function(this.isEditor.getValue());
    this.opFunction = new Function(this.opEditor.getValue());
  }

  produce(input) {
    return input
      .split("")
      .map((c) => this.prFunction()[c] || c)
      .join("");
  }

  produceN(input, n) {
    let str = input;
    for (let i = 0; i < n; i++) {
      str = this.produce(str);
    }
    return str;
  }

  polpol(x, y, a, da, dr) {
    return [x + dr * Math.cos(a + da), y - dr * Math.sin(a + da), a + da];
  }
}

document.addEventListener("DOMContentLoaded", function () {
  window.lsp = new LSP();
});
