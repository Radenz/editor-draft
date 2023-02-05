/**
 * @file editor.js
 * @author Raden Rifqi Rahman
 * @version 1.0
 */

// * Parameterized constants
const FPS = 60;

const POINT_RADIUS = 0.01;
const FLOAT_SIZE = 4;

const POSITION_SIZE = 2;
const COLOR_SIZE = 3;

// * Derived constants
// !! DO NOT CHANGE
const FACTOR_SIZE = 1;
const PARENT_POSITION_INDEX = POSITION_SIZE + COLOR_SIZE;
const PARENT_ROTATION_INDEX = POSITION_SIZE + COLOR_SIZE + POSITION_SIZE;
const PARENT_SCALE_INDEX =
  POSITION_SIZE + COLOR_SIZE + POSITION_SIZE + FACTOR_SIZE;
const VERTEX_SIZE =
  POSITION_SIZE + COLOR_SIZE + POSITION_SIZE + FACTOR_SIZE + FACTOR_SIZE;
const R = POSITION_SIZE + 0;
const G = POSITION_SIZE + 1;
const B = POSITION_SIZE + 2;
const FRAME_DELTA_TIME = 1000 / FPS;

/**
 * @callback OnVector2Changed
 * @param {Vector2} vec
 */

/**
 * @callback OnVertexChanged
 * @param {Vertex} vertex
 */

class Vector3 {
  /**
   * Creates a new Vector3
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  /**
   * @property {Vector3}
   */
  static get zero() {
    return new Vector3(0, 0, 0);
  }

  /**
   * @property {number}
   */
  get x() {
    return this._x;
  }

  /**
   * @property {number}
   */
  set x(value) {
    this._x = value;
  }

  /**
   * @property {number}
   */
  get y() {
    return this._y;
  }

  /**
   * @property {number}
   */
  set y(value) {
    this._y = value;
  }

  /**
   * @property {number}
   */
  get z() {
    return this._z;
  }

  /**
   * @property {number}
   */
  set z(value) {
    this._z = value;
  }

  /**
   * @property {number[]}
   */
  get data() {
    return [this._x, this._y, this._z];
  }

  /**
   * @param {Vector3} a
   * @param {Vector3} b
   * @returns {Vector3}
   */
  static add(a, b) {
    return new Vector3(a._x + b._x, a._y + b._y, a._z + b._z);
  }

  /**
   * @param {Vector3} a
   * @param {Vector3} b
   * @returns {Vector3}
   */
  static sub(a, b) {
    return new Vector3(a._x - b._x, a._y - b._y, a._z - b._z);
  }

  as2() {
    return new Vector2(this._x, this._y);
  }
}

const CLEAR_COLOR = new Vector3(0.5, 0.5, 0.5);

class Color {
  /**
   * @property {Vector3}
   */
  static get black() {
    return new Vector3(0, 0, 0);
  }

  /**
   * @property {Vector3}
   */
  static get red() {
    return new Vector3(1, 0, 0);
  }

  /**
   * @property {Vector3}
   */
  static get green() {
    return new Vector3(0, 1, 0);
  }

  /**
   * @property {Vector3}
   */
  static get blue() {
    return new Vector3(0, 0, 1);
  }

  /**
   * @property {Vector3}
   */
  static get white() {
    return new Vector3(1, 1, 1);
  }

  /**
   * @param {number} r
   * @param {number} g
   * @param {number} b
   */
  static rgb(r, g, b) {
    return new Vector3(r / 255, g / 255, b / 255);
  }
}

class Editor {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    // TODO: Try other contex, add guard
    /** @type {WebGLRenderingContext} */
    this.context = canvas.getContext("webgl");
    /** @type {Shape[]} */
    this.shapes = [];

    this.context.viewport(0, 0, canvas.width, canvas.height);
    this.setup().then(this.start.bind(this));
  }

  async setup() {
    this.context.clearColor(CLEAR_COLOR.x, CLEAR_COLOR.y, CLEAR_COLOR.z, 1.0);

    const vertexShader = this.context.createShader(this.context.VERTEX_SHADER);
    let res = await fetch("vbasic.glsl");
    const vertexShaderSource = await res.text();
    this.context.shaderSource(vertexShader, vertexShaderSource);
    this.context.compileShader(vertexShader);
    const fragmentShader = this.context.createShader(
      this.context.FRAGMENT_SHADER
    );
    res = await fetch("fbasic.glsl");
    const fragmentShaderSource = await res.text();
    this.context.shaderSource(fragmentShader, fragmentShaderSource);
    this.context.compileShader(fragmentShader);
    const program = this.context.createProgram();
    this.context.attachShader(program, vertexShader);
    this.context.attachShader(program, fragmentShader);
    this.context.linkProgram(program);
    this.buffer = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffer);
    const vPositionAttribute = this.context.getAttribLocation(
      program,
      "vPosition"
    );
    const vColorAttribute = this.context.getAttribLocation(program, "vColor");
    const vParentPositionAttribute = this.context.getAttribLocation(
      program,
      "vParentPosition"
    );
    const vParentRotationAttribute = this.context.getAttribLocation(
      program,
      "vParentRotation"
    );
    const vParentScaleAttribute = this.context.getAttribLocation(
      program,
      "vParentScale"
    );
    this.context.vertexAttribPointer(
      vPositionAttribute,
      POSITION_SIZE,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      0
    );
    this.context.vertexAttribPointer(
      vColorAttribute,
      COLOR_SIZE,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      POSITION_SIZE * FLOAT_SIZE
    );
    this.context.vertexAttribPointer(
      vParentPositionAttribute,
      POSITION_SIZE,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      (POSITION_SIZE + COLOR_SIZE) * FLOAT_SIZE
    );
    this.context.vertexAttribPointer(
      vParentRotationAttribute,
      1,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      (POSITION_SIZE + COLOR_SIZE + POSITION_SIZE) * FLOAT_SIZE
    );
    this.context.vertexAttribPointer(
      vParentScaleAttribute,
      1,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      (POSITION_SIZE + COLOR_SIZE + POSITION_SIZE + 1) * FLOAT_SIZE
    );
    this.context.enableVertexAttribArray(vPositionAttribute);
    this.context.enableVertexAttribArray(vColorAttribute);
    this.context.enableVertexAttribArray(vParentPositionAttribute);
    this.context.enableVertexAttribArray(vParentRotationAttribute);
    this.context.enableVertexAttribArray(vParentScaleAttribute);

    // console.log(this.context.getShaderInfoLog(vertexShader));
    // console.log(this.context.getShaderInfoLog(fragmentShader));

    this.context.useProgram(program);
    // console.log(this.context.getProgramInfoLog(program));
  }

  start() {
    // TODO: Support vendor specific
    setInterval(() => {
      window.requestAnimationFrame(this.render.bind(this));
    }, FRAME_DELTA_TIME);
  }

  render() {
    this.context.clear(this.context.COLOR_BUFFER_BIT);
    for (const shape of this.shapes) {
      if (shape.isHidden) continue;

      const data = shape.data;

      this.context.bufferData(
        this.context.ARRAY_BUFFER,
        new Float32Array(data),
        this.context.DYNAMIC_DRAW
      );

      this.context.drawArrays(
        shape.drawMode(this.context),
        0,
        data.length / VERTEX_SIZE
      );

      if (shape.isHighlighted) {
        this.drawOutline(data);
        shape.vertices.forEach((vertex) => this.drawPoint(vertex, ORANGE));
      }
    }
  }

  /**
   *
   * @param {number[]} verticesData
   */
  drawOutline(verticesData) {
    const vertexCount = verticesData.length / VERTEX_SIZE;
    for (let i = 0; i < vertexCount; i++) {
      // R channel
      verticesData[VERTEX_SIZE * i + R] = 1;
      // G channel
      verticesData[VERTEX_SIZE * i + G] = 0.568;
      // B channel
      verticesData[VERTEX_SIZE * i + B] = 0;
    }

    this.context.bufferData(
      this.context.ARRAY_BUFFER,
      new Float32Array(verticesData),
      this.context.DYNAMIC_DRAW
    );
    this.context.drawArrays(this.context.LINE_LOOP, 0, vertexCount);
  }

  /**
   *
   * @param {Vertex} vertex
   * @param {Vector3} color
   */
  drawPoint(vertex, color) {
    let data = vertex.data.flat();
    data[R] = color.x;
    data[G] = color.y;
    data[B] = color.z;

    // Actual vertex coords
    const position = new Vector2(data[0], data[1]);
    const parentPosition = new Vector2(
      data[PARENT_POSITION_INDEX],
      data[PARENT_POSITION_INDEX + 1]
    );
    const parentRotation = data[PARENT_ROTATION_INDEX];
    const parentScale = data[PARENT_SCALE_INDEX];
    position.scale(parentScale);
    const vertexCoord = Vector2.add(
      parentPosition,
      MathX.rotate2(position, parentRotation, Vector2.zero)
    );

    let point = new Vector2(POINT_RADIUS, 0);
    for (let i = 0; i < 9; i++) {
      // ? Circle coordinates
      data.push(point.x, point.y);
      // ? Vertex color
      data.push(color.x, color.y, color.z);
      // ? Center (origin) coordinate
      data.push(vertexCoord.x, vertexCoord.y);
      // ? Rotation
      data.push((i * Math.PI) / 4);
      // ? Scale
      data.push(1);
    }

    this.context.bufferData(
      this.context.ARRAY_BUFFER,
      new Float32Array(data),
      this.context.DYNAMIC_DRAW
    );

    this.context.drawArrays(this.context.TRIANGLE_FAN, 0, 10);
  }

  /**
   *
   * @param {Transform} transform
   * @param {Vertex[]} vertices
   * @returns {Triangle}
   */
  createTriangle(transform, vertices) {
    const triangle = new Triangle(transform, vertices);
    this.shapes.push(triangle);
    return triangle;
  }

  /**
   *
   * @param {Transform} transform
   * @param {number} size
   * @returns {Square}
   */
  createSquare(transform, size) {
    const square = new Square(transform, size);
    this.shapes.push(square);
    return square;
  }

  /**
   *
   * @param {Transform} transform
   * @param {number} length
   * @returns {Line}
   */
  createLine(transform, length) {
    const line = new Line(transform, length);
    this.shapes.push(line);
    return line;
  }

  /**
   *
   * @param {Transform} transform
   * @param {number} length
   * @param {number} width
   * @returns {Rectangle}
   */
  createRectangle(transform, length, width) {
    const rect = new Rectangle(transform, length, width);
    this.shapes.push(rect);
    return rect;
  }
}

class Vector2 {
  static Q1 = new Vector2(1, 1);
  static Q2 = new Vector2(-1, 1);
  static Q3 = new Vector2(-1, -1);
  static Q4 = new Vector2(1, -1);

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this._x = x;
    this._y = y;

    /** @type {OnVector2Changed} */
    this.onChange = null;
  }

  /**
   * @property {Vector2}
   */
  static get zero() {
    return new Vector2(0, 0);
  }

  /**
   * @property {number}
   */
  get x() {
    return this._x;
  }

  /**
   * @property {number}
   */
  set x(value) {
    this._x = value;
    if (this.onChange) this.onChange(this);
  }

  /**
   * @property {number}
   */
  get y() {
    return this._y;
  }

  /**
   * @property {number}
   */
  set y(value) {
    this._y = value;
    if (this.onChange) this.onChange(this);
  }

  /**
   * @property {number[]}
   */
  get data() {
    return [this._x, this._y];
  }

  /**
   *
   * @param {number} angle
   * @param {Vector2} origin
   */
  rotate(angle, origin) {
    const newVector = MathX.rotate2(this, angle, origin);
    this._x = newVector.x;
    this._y = newVector.y;
  }

  /**
   *
   * @param {number} factor
   */
  scale(factor) {
    this._x *= factor;
    this._y *= factor;
  }

  /**
   *
   * @param {number} factor
   */
  scaleX(factor) {
    this._x *= factor;
  }

  /**
   *
   * @param {number} factor
   */
  scaleY(factor) {
    this._y *= factor;
  }

  /**
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @returns {Vector2}
   */
  static add(a, b) {
    return new Vector2(a._x + b._x, a._y + b._y);
  }

  /**
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @returns {Vector2}
   */
  static sub(a, b) {
    return new Vector2(a._x - b._x, a._y - b._y);
  }

  as3() {
    return new Vector3(this.x, this.y, 0);
  }
}

class Transform {
  /**
   *
   * @param {Vector2} position
   * @param {number} rotation
   * @param {number} scale
   */
  constructor(position, rotation, scale) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  /**
   * @property {Transform}
   */
  static get origin() {
    return new Transform(Vector2.zero, 0, 1);
  }
}

class Vertex {
  /**
   *
   * @param {Vector2} position
   * @param {Vector3} color
   * ! Color may be Vector4
   */
  constructor(position, color) {
    this.parent = null;
    this.position = position;
    this.color = color;

    /** @type {OnVertexChanged} */
    this.onChange = null;
    this.position.onChange = () => {
      if (this.onChange) this.onChange(this);
    };
  }

  /**
   * @property {Vertex}
   */
  origin() {
    return new Vertex(Vector2.zero, Vector3.zero);
  }

  /**
   * @property {Transform}
   */
  get parentTransform() {
    return this.parent ? this.parent.transform : Transform.origin;
  }

  /**
   * @property {number[]}
   */
  get data() {
    const data = [
      this.position.data,
      this.color.data,
      this.parentTransform.position.data,
      this.parentTransform.rotation,
      this.parentTransform.scale,
    ];
    return data.flat();
  }

  /**
   *
   * @param {Shape} parent
   */
  bind(parent) {
    this.parent = parent;
  }

  /**
   *
   * @param {number} angle
   */
  rotate(angle) {
    const origin = this.parentTransform.position;
    this.position.rotate(angle, origin);
  }

  /**
   *
   * @param {number} factor
   */
  scale(factor) {
    this.position.scale(factor);
  }

  /**
   *
   * @param {number} factor
   */
  scaleX(factor) {
    this.position.scaleX(factor);
  }

  /**
   *
   * @param {number} factor
   */
  scaleY(factor) {
    this.position.scaleY(factor);
  }
}

class Shape {
  /**
   *
   * @param {Transform} transform
   */
  constructor(transform) {
    this.transform = transform;
    /** @type {Vertex[]} */
    this.vertices = [];
    this.highlight = false;
    this.hidden = false;
  }

  /**
   * @abstract
   * @param {WebGLRenderingContext} context
   * @returns {number}
   */
  drawMode(context) {
    return null;
  }

  /**
   * @property {number[]}
   */
  get data() {
    return this.vertices.map((v) => v.data).flat();
  }

  /**
   * @property {boolean}
   */
  get isHighlighted() {
    return this.highlight;
  }

  /**
   * @property {boolean}
   */
  set isHighlighted(value) {
    this.highlight = value;
  }

  /**
   * @property {boolean}
   */
  get isHidden() {
    return this.hidden;
  }

  /**
   * @property {boolean}
   */
  set isHidden(value) {
    this.hidden = value;
  }

  /**
   * @property {number}
   */
  get vertexCount() {
    return this.vertices.length;
  }

  /**
   *
   * @param {number} angle
   */
  rotate(angle) {
    this.transform.rotation += angle;
  }

  /**
   *
   * @param {Vector2} distance
   */
  translate(distance) {
    this.transform.position = Vector2.add(this.transform.position, distance);
  }

  /**
   *
   * @param {number} distance
   */
  transalteX(distance) {
    this.transform.position.x += distance;
  }

  /**
   *
   * @param {number} distance
   */
  transalteY(distance) {
    this.transform.position.y += distance;
  }

  /**
   *
   * @param {number} factor
   */
  scale(factor) {
    this.transform.scale *= factor;
  }
}

class Triangle extends Shape {
  /**
   *
   * @param {Transform} transform
   * @param {Vertex[]} vertices
   */
  constructor(transform, vertices) {
    super(transform);
    /** @type {Vertex[]} */
    this.vertices = vertices;
    vertices.forEach((v) => {
      v.parent = this;
    });

    this.highlight = false;
    this.hidden = false;
  }

  /**
   * @override
   * @param {WebGLRenderingContext} context
   * @returns {number}
   */
  drawMode(context) {
    return context.TRIANGLES;
  }
}

class Square extends Shape {
  /**
   *
   * @param {Transform} transform
   * @param {number} size
   */
  constructor(transform, size) {
    super(transform);

    /** @type {number} */
    this._size = size;

    this.initVertices();
  }

  initVertices() {
    // const halfDiag = (this._size / 2) * Math.SQRT2;
    const s = this._size / 2;
    const topRight = new Vertex(new Vector2(s, s), Color.black);
    const topLeft = new Vertex(new Vector2(-s, s), Color.black);
    const bottomLeft = new Vertex(new Vector2(-s, -s), Color.black);
    const bottomRight = new Vertex(new Vector2(s, -s), Color.black);

    this.vertices = [topRight, topLeft, bottomLeft, bottomRight];
    this.vertices.forEach((v) => {
      v.bind(this);
      v.onChange = (vertex) => this.onVertexChanged(vertex);
    });
  }

  /**
   * @param {Vertex} vertex
   */
  onVertexChanged(vertex) {
    let index = this.vertices.indexOf(vertex);
    let position = vertex.position;
    for (let i = 1; i < 4; i++) {
      const vertexIndex = (index + i) % 4;
      const vertex = this.vertices[vertexIndex];
      position = MathX.rotate2(position, Math.PI / 2, Vector2.zero);
      vertex.position._x = position.x;
      vertex.position._y = position.y;
    }
  }

  /**
   * @override
   * @param {WebGLRenderingContext} context
   * @returns {number}
   */
  drawMode(context) {
    return context.TRIANGLE_FAN;
  }

  /**
   * @param {number} value
   */
  set size(value) {
    const factor = value / this._size;
    this.vertices.forEach((v) => v.scale(factor));
    this._size = value;
  }
}

class Rectangle extends Shape {
  /**
   *
   * @param {Transform} transform
   * @param {number} length
   * @param {number} width
   */
  constructor(transform, length, width) {
    super(transform);

    /** @type {number} */
    this._length = length;
    /** @type {number} */
    this._width = width;

    this.initVertices();
  }

  initVertices() {
    const l = this._length / 2;
    const w = this._width / 2;
    const topRight = new Vertex(new Vector2(l, w), Color.black);
    const topLeft = new Vertex(new Vector2(-l, w), Color.black);
    const bottomLeft = new Vertex(new Vector2(-l, -w), Color.black);
    const bottomRight = new Vertex(new Vector2(l, -w), Color.black);

    this.vertices = [topRight, topLeft, bottomLeft, bottomRight];
    this.vertices.forEach((v) => {
      v.bind(this);
      v.onChange = (vertex) => this.onVertexChanged(vertex);
    });
  }

  /**
   * @param {Vertex} vertex
   */
  onVertexChanged(vertex) {
    let index = this.vertices.indexOf(vertex);
    let inverter = Rectangle.getMultiplier(index);
    const topRightVertex = this.vertices[0];

    topRightVertex.position._x = vertex.position.x * inverter.x;
    topRightVertex.position._y = vertex.position.y * inverter.y;

    for (let i = 1; i < 4; i++) {
      const vertex = this.vertices[i];
      let converter = Rectangle.getMultiplier(i);
      vertex.position._x = topRightVertex.position.x * converter.x;
      vertex.position._y = topRightVertex.position.y * converter.y;
    }
  }

  /**
   *
   * @param {number} index
   */
  static getMultiplier(index) {
    switch (index) {
      case 0:
        return Vector2.Q1;
      case 1:
        return Vector2.Q2;
      case 2:
        return Vector2.Q3;
      case 3:
        return Vector2.Q4;
    }
  }

  /**
   * @override
   * @param {WebGLRenderingContext} context
   * @returns {number}
   */
  drawMode(context) {
    return context.TRIANGLE_FAN;
  }

  /**
   * @param {number} value
   */
  set length(value) {
    const factor = value / this._length;
    this.vertices.forEach((v) => v.scaleX(factor));
    this._length = value;
  }

  /**
   * @param {number} value
   */
  set width(value) {
    const factor = value / this._width;
    this.vertices.forEach((v) => v.scaleY(factor));
    this._width = value;
  }
}

class Line extends Shape {
  /**
   *
   * @param {Transform} transform
   * @param {number} length
   */
  constructor(transform, length) {
    super(transform);

    this._length = length;
    this.hidden = false;
    this.initVertices();
  }

  initVertices() {
    const halfDiag = (this._length / 2) * Math.SQRT2;
    const vertexA = new Vertex(new Vector2(-halfDiag, -halfDiag), Color.black);
    const vertexB = new Vertex(new Vector2(halfDiag, halfDiag), Color.black);
    this.vertices = [vertexA, vertexB];

    this.vertices.forEach((v) => {
      v.bind(this);
    });
  }

  /**
   * @property {number}
   */
  get length() {
    return this._length;
  }

  /**
   * @property {number}
   */
  set length(value) {
    const factor = value / this._length;
    this.vertices.forEach((v) => v.scale(factor));
    this._length = value;
  }

  /**
   * @param {WebGLRenderingContext} context
   * @returns {number}
   */
  drawMode(context) {
    return context.LINE_STRIP;
  }
}

// TODO: Implement
class Polygon extends Shape {}

class Matrix2 {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  timesVector2(v) {
    const a = this.a * v.x + this.b * v.y;
    const b = this.c * v.x + this.d * v.y;
    return new Vector2(a, b);
  }
}

const MathX = {
  /**
   *
   * @param {Vector2} point
   * @param {number} angle
   * @param {Vector2} origin
   * @return {Vector2}
   */
  rotate2(point, angle, origin) {
    const diff = Vector2.sub(point, origin);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const rotationMatrix = new Matrix2(c, -s, s, c);
    const newDiff = rotationMatrix.timesVector2(diff);
    return Vector2.add(origin, newDiff);
  },
};

window["MathX"] = MathX;
window["Vector2"] = Vector2;

const ORANGE = new Vector3(1, 0.568, 0);

export { Editor, Vector3, Vertex, Transform, Vector2, Color };
