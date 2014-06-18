/*!
 * isoworld v0.0.1
 *
 * Copyright 2014 Daniel Baird
 *
 * Date: 2014-06-18
 */
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.isoworld=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * Entry point for the Isomer API
 */
module.exports = _dereq_('./js/isomer');

},{"./js/isomer":4}],2:[function(_dereq_,module,exports){
function Canvas(elem) {
  this.elem = elem;
  this.ctx = this.elem.getContext('2d');

  this.width = elem.width;
  this.height = elem.height;
}

Canvas.prototype.clear = function () {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

Canvas.prototype.path = function (points, color) {
  this.ctx.beginPath();
  this.ctx.moveTo(points[0].x, points[0].y);

  for (var i = 1; i < points.length; i++) {
    this.ctx.lineTo(points[i].x, points[i].y);
  }

  this.ctx.closePath();

  /* Set the strokeStyle and fillStyle */
  this.ctx.save()

  this.ctx.globalAlpha = color.a;
  this.ctx.fillStyle = this.ctx.strokeStyle = color.toHex();
  this.ctx.stroke();
  this.ctx.fill();
  this.ctx.restore();
};

module.exports = Canvas;

},{}],3:[function(_dereq_,module,exports){
/**
 * A color instantiated with RGB between 0-255
 *
 * Also holds HSL values
 */
function Color(r, g, b, a) {
  this.r = parseInt(r || 0);
  this.g = parseInt(g || 0);
  this.b = parseInt(b || 0);
  this.a = parseFloat((Math.round(a * 100) / 100 || 1));

  this.loadHSL();
};

Color.prototype.toHex = function () {
  // Pad with 0s
  var hex = (this.r * 256 * 256 + this.g * 256 + this.b).toString(16);

  if (hex.length < 6) {
    hex = new Array(6 - hex.length + 1).join('0') + hex;
  }

  return '#' + hex;
};


/**
 * Returns a lightened color based on a given percentage and an optional
 * light color
 */
Color.prototype.lighten = function (percentage, lightColor) {
  lightColor = lightColor || new Color(255, 255, 255);

  var newColor = new Color(
    (lightColor.r / 255) * this.r,
    (lightColor.g / 255) * this.g,
    (lightColor.b / 255) * this.b,
    this.a
  );

  newColor.l = Math.min(newColor.l + percentage, 1);

  newColor.loadRGB();
  return newColor;
};


/**
 * Loads HSL values using the current RGB values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadHSL = function () {
  var r = this.r / 255;
  var g = this.g / 255;
  var b = this.b / 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);

  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;  // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  this.h = h;
  this.s = s;
  this.l = l;
};


/**
 * Reloads RGB using HSL values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadRGB = function () {
  var r, g, b;
  var h = this.h;
  var s = this.s;
  var l = this.l;

  if (s === 0) {
    r = g = b = l;  // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = this._hue2rgb(p, q, h + 1/3);
    g = this._hue2rgb(p, q, h);
    b = this._hue2rgb(p, q, h - 1/3);
  }

  this.r = parseInt(r * 255);
  this.g = parseInt(g * 255);
  this.b = parseInt(b * 255);
};


/**
 * Helper function to convert hue to rgb
 * Taken from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype._hue2rgb = function (p, q, t){
  if(t < 0) t += 1;
  if(t > 1) t -= 1;
  if(t < 1/6) return p + (q - p) * 6 * t;
  if(t < 1/2) return q;
  if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
};

module.exports = Color;

},{}],4:[function(_dereq_,module,exports){
var Canvas = _dereq_('./canvas');
var Color = _dereq_('./color');
var Path = _dereq_('./path');
var Point = _dereq_('./point');
var Shape = _dereq_('./shape');
var Vector = _dereq_('./vector');


/**
 * The Isomer class
 *
 * This file contains the Isomer base definition
 */
function Isomer(canvasId, options) {
  options = options || {};

  this.canvas = new Canvas(canvasId);
  this.angle = options.angle || (Math.PI / 6);

  this.scale = options.scale || 70;

  this._calculateTransformation();

  this.originX = options.originX || this.canvas.width / 2;
  this.originY = options.originY || this.canvas.height * 0.9;

  /**
   * Light source as defined as the angle from
   * the object to the source.
   *
   * We'll define somewhat arbitrarily for now.
   */
  this.lightPosition = options.lightPosition || new Vector(2, -1, 3);
  this.lightAngle = this.lightPosition.normalize();

  /**
   * The maximum color difference from shading
   */
  this.colorDifference = 0.20;
  this.lightColor = options.lightColor || new Color(255, 255, 255);
}

/**
 * Sets the light position for drawing.
 */
Isomer.prototype.setLightPosition = function (x, y, z) {
  this.lightPosition = new Vector(x, y, z);
  this.lightAngle = this.lightPosition.normalize();
}

Isomer.prototype._translatePoint = function (point) {
  /**
   * X rides along the angle extended from the origin
   * Y rides perpendicular to this angle (in isometric view: PI - angle)
   * Z affects the y coordinate of the drawn point
   */
  var xMap = new Point(point.x * this.transformation[0][0],
                       point.x * this.transformation[0][1]);

  var yMap = new Point(point.y * this.transformation[1][0],
                       point.y * this.transformation[1][1]);

  var x = this.originX + xMap.x + yMap.x;
  var y = this.originY - xMap.y - yMap.y - (point.z * this.scale);
  return new Point(x, y);
};


/**
 * Adds a shape or path to the scene
 *
 * This method also accepts arrays
 */
Isomer.prototype.add = function (item, baseColor) {
  if (Object.prototype.toString.call(item) == '[object Array]') {
    for (var i = 0; i < item.length; i++) {
      this.add(item[i], baseColor);
    }
  } else if (item instanceof Path) {
    this._addPath(item, baseColor);
  } else if (item instanceof Shape) {
    /* Fetch paths ordered by distance to prevent overlaps */
    var paths = item.orderedPaths();
    for (var i in paths) {
      this._addPath(paths[i], baseColor);
    }
  }
};


/**
 * Adds a path to the scene
 */
Isomer.prototype._addPath = function (path, baseColor) {
  /* Default baseColor */
  baseColor = baseColor || new Color(120, 120, 120);

  /* Compute color */
  var v1 = Vector.fromTwoPoints(path.points[1], path.points[0]);
  var v2 = Vector.fromTwoPoints(path.points[2], path.points[1]);

  var normal = Vector.crossProduct(v1, v2).normalize();

  /**
   * Brightness is between -1 and 1 and is computed based
   * on the dot product between the light source vector and normal.
   */
  var brightness = Vector.dotProduct(normal, this.lightAngle);
  color = baseColor.lighten(brightness * this.colorDifference, this.lightColor);

  this.canvas.path(path.points.map(this._translatePoint.bind(this)), color);
};

/**
 * Precalculates transformation values based on the current angle and scale
 * which in theory reduces costly cos and sin calls
 */
Isomer.prototype._calculateTransformation = function () {
  this.transformation = [
    [
      this.scale * Math.cos(this.angle),
      this.scale * Math.sin(this.angle)
    ],
    [
      this.scale * Math.cos(Math.PI - this.angle),
      this.scale * Math.sin(Math.PI - this.angle)
    ]
  ];
}

/* Namespace our primitives */
Isomer.Canvas = Canvas;
Isomer.Color = Color;
Isomer.Path = Path;
Isomer.Point = Point;
Isomer.Shape = Shape;
Isomer.Vector = Vector;

/* Expose Isomer API */
module.exports = Isomer;

},{"./canvas":2,"./color":3,"./path":5,"./point":6,"./shape":7,"./vector":8}],5:[function(_dereq_,module,exports){
var Point = _dereq_('./point');

/**
 * Path utility class
 *
 * An Isomer.Path consists of a list of Isomer.Point's
 */
function Path(points) {
  if (Object.prototype.toString.call(points) === '[object Array]') {
    this.points = points;
  } else {
    this.points = Array.prototype.slice.call(arguments);
  }
}


/**
 * Pushes a point onto the end of the path
 */
Path.prototype.push = function (point) {
  this.points.push(point);
};


/**
 * Returns a new path with the points in reverse order
 */
Path.prototype.reverse = function () {
  var points = Array.prototype.slice.call(this.points);

  return new Path(points.reverse());
};


/**
 * Translates a given path
 *
 * Simply a forward to Point#translate
 */
Path.prototype.translate = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.translate.apply(point, args);
  }));
};


/**
 * Returns a new path rotated along the Z axis by a given origin
 *
 * Simply a forward to Point#rotateZ
 */
Path.prototype.rotateZ = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.rotateZ.apply(point, args);
  }));
};


/**
 * Scales a path about a given origin
 *
 * Simply a forward to Point#scale
 */
Path.prototype.scale = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.scale.apply(point, args);
  }));
};


/**
 * The estimated depth of a path as defined by the average depth
 * of its points
 */
Path.prototype.depth = function () {
  var i, total = 0;
  for (i = 0; i < this.points.length; i++) {
    total += this.points[i].depth();
  }

  return total / (this.points.length || 1);
};


/**
 * Some paths to play with
 */

/**
 * A rectangle with the bottom-left corner in the origin
 */
Path.Rectangle = function (origin, width, height) {
  if (width === undefined) width = 1;
  if (height === undefined) height = 1;

  var path = new Path([
    origin,
    new Point(origin.x + width, origin.y, origin.z),
    new Point(origin.x + width, origin.y + height, origin.z),
    new Point(origin.x, origin.y + height, origin.z)
  ]);

  return path;
};


/**
 * A circle centered at origin with a given radius and number of vertices
 */
Path.Circle = function (origin, radius, vertices) {
  vertices = vertices || 20;
  var i, path = new Path();

  for (i = 0; i < vertices; i++) {
    path.push(new Point(
      radius * Math.cos(i * 2 * Math.PI / vertices),
      radius * Math.sin(i * 2 * Math.PI / vertices),
      0));
  }

  return path.translate(origin.x, origin.y, origin.z);
};


/**
 * A star centered at origin with a given outer radius, inner
 * radius, and number of points
 *
 * Buggy - concave polygons are difficult to draw with our method
 */
Path.Star = function (origin, outerRadius, innerRadius, points) {
  var i, r, path = new Path();

  for (i = 0; i < points * 2; i++) {
    r = (i % 2 === 0) ? outerRadius : innerRadius;

    path.push(new Point(
      r * Math.cos(i * Math.PI / points),
      r * Math.sin(i * Math.PI / points),
      0));
  }

  return path.translate(origin.x, origin.y, origin.z);
};


/* Expose the Path constructor */
module.exports = Path;

},{"./point":6}],6:[function(_dereq_,module,exports){
function Point(x, y, z) {
  if (this instanceof Point) {
    this.x = (typeof x === 'number') ? x : 0;
    this.y = (typeof y === 'number') ? y : 0;
    this.z = (typeof z === 'number') ? z : 0;
  } else {
    return new Point(x, y, z);
  }
}


Point.ORIGIN = new Point(0, 0, 0);


/**
 * Translate a point from a given dx, dy, and dz
 */
Point.prototype.translate = function (dx, dy, dz) {
  return new Point(
    this.x + dx,
    this.y + dy,
    this.z + dz);
};


/**
 * Scale a point about a given origin
 */
Point.prototype.scale = function (origin, dx, dy, dz) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  if (dy === undefined && dz === undefined) {
    /* If both dy and dz are left out, scale all coordinates equally */
    dy = dz = dx;
    /* If just dz is missing, set it equal to 1 */
  } else {
    dz = (typeof dz === 'number') ? dz : 1;
  }

  p.x *= dx;
  p.y *= dy;
  p.z *= dz;

  return p.translate(origin.x, origin.y, origin.z);
};


/**
 * Rotate about origin on the Z axis
 */
Point.prototype.rotateZ = function (origin, angle) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  var x = p.x * Math.cos(angle) - p.y * Math.sin(angle);
  var y = p.x * Math.sin(angle) + p.y * Math.cos(angle);
  p.x = x;
  p.y = y;

  return p.translate(origin.x, origin.y, origin.z);
};


/**
 * The depth of a point in the isometric plane
 */
Point.prototype.depth = function () {
  /* z is weighted slightly to accomodate |_ arrangements */
    return this.x + this.y - 2*this.z;
};


/**
 * Distance between two points
 */
Point.distance = function (p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  var dz = p2.z - p1.z;

  return Math.sqrt(dx*dx + dy*dy + dz*dz);
};


module.exports = Point;

},{}],7:[function(_dereq_,module,exports){
var Path = _dereq_('./path');
var Point = _dereq_('./point');

/**
 * Shape utility class
 *
 * An Isomer.Shape consists of a list of Isomer.Path's
 */
function Shape(paths) {
  if (Object.prototype.toString.call(paths) === '[object Array]') {
    this.paths = paths;
  } else {
    this.paths = Array.prototype.slice.call(arguments);
  }
}


/**
 * Pushes a path onto the end of the Shape
 */
Shape.prototype.push = function (path) {
  this.paths.push(path);
};


/**
 * Translates a given shape
 *
 * Simply a forward to Path#translate
 */
Shape.prototype.translate = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.translate.apply(path, args);
  }));
};


/**
 * Rotates a given shape along the Z axis around a given origin
 *
 * Simply a forward to Path#rotateZ
 */
Shape.prototype.rotateZ = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.rotateZ.apply(path, args);
  }));
};


/**
 * Scales a path about a given origin
 *
 * Simply a forward to Point#scale
 */
Shape.prototype.scale = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.scale.apply(path, args);
  }));
};


/**
 * Produces a list of the shape's paths ordered by distance to
 * prevent overlaps when drawing
 */
Shape.prototype.orderedPaths = function () {
  var paths = this.paths.slice();

  /**
   * Sort the list of faces by distance then map the entries, returning
   * only the path and not the added "further point" from earlier.
   */
  return paths.sort(function (pathA, pathB) {
    return pathB.depth() - pathA.depth();
  });
};


/**
 * Utility function to create a 3D object by raising a 2D path
 * along the z-axis
 */
Shape.extrude = function (path, height) {
  height = (typeof height === 'number') ? height : 1;

  var i, topPath = path.translate(0, 0, height);
  var shape = new Shape();

  /* Push the top and bottom faces, top face must be oriented correctly */
  shape.push(path.reverse());
  shape.push(topPath);

  /* Push each side face */
  for (i = 0; i < path.points.length; i++) {
    shape.push(new Path([
      topPath.points[i],
      path.points[i],
      path.points[(i + 1) % path.points.length],
      topPath.points[(i + 1) % topPath.points.length]
    ]));
  }

  return shape;
};


/**
 * Some shapes to play with
 */

/**
 * A prism located at origin with dimensions dx, dy, dz
 */
Shape.Prism = function (origin, dx, dy, dz) {
  dx = (typeof dx === 'number') ? dx : 1;
  dy = (typeof dy === 'number') ? dy : 1;
  dz = (typeof dz === 'number') ? dz : 1;

  /* The shape we will return */
  var prism = new Shape();

  /* Squares parallel to the x-axis */
  var face1 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx, origin.y, origin.z + dz),
    new Point(origin.x, origin.y, origin.z + dz)
  ]);

  /* Push this face and its opposite */
  prism.push(face1);
  prism.push(face1.reverse().translate(0, dy, 0));

  /* Square parallel to the y-axis */
  var face2 = new Path([
    origin,
    new Point(origin.x, origin.y, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  prism.push(face2);
  prism.push(face2.reverse().translate(dx, 0, 0));

  /* Square parallel to the xy-plane */
  var face3 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx, origin.y + dy, origin.z),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  /* This surface is oriented backwards, so we need to reverse the points */
  prism.push(face3.reverse());
  prism.push(face3.translate(0, 0, dz));

  return prism;
};


Shape.Pyramid = function (origin, dx, dy, dz) {
  dx = (typeof dx === 'number') ? dx : 1;
  dy = (typeof dy === 'number') ? dy : 1;
  dz = (typeof dz === 'number') ? dz : 1;

  var pyramid = new Shape();

  /* Path parallel to the x-axis */
  var face1 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z + dz)
  ]);
  /* Push the face, and its opposite face, by rotating around the Z-axis */
  pyramid.push(face1);
  pyramid.push(face1.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

  /* Path parallel to the y-axis */
  var face2 = new Path([
    origin,
    new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  pyramid.push(face2);
  pyramid.push(face2.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

  return pyramid;
};


Shape.Cylinder = function (origin, radius, vertices, height) {
  radius = (typeof radius === 'number') ? radius : 1;

  var circle = Path.Circle(origin, radius, vertices);
  var cylinder = Shape.extrude(circle, height);

  return cylinder;
};


module.exports = Shape;

},{"./path":5,"./point":6}],8:[function(_dereq_,module,exports){
function Vector(i, j, k) {
  this.i = (typeof i === 'number') ? i : 0;
  this.j = (typeof j === 'number') ? j : 0;
  this.k = (typeof k === 'number') ? k : 0;
}

/**
 * Alternate constructor
 */
Vector.fromTwoPoints = function (p1, p2) {
  return new Vector(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
};

Vector.crossProduct = function (v1, v2) {
  var i = v1.j * v2.k - v2.j * v1.k;
  var j = -1 * (v1.i * v2.k - v2.i * v1.k);
  var k = v1.i * v2.j - v2.i * v1.j;

  return new Vector(i, j, k);
};

Vector.dotProduct = function (v1, v2) {
  return v1.i * v2.i + v1.j * v2.j + v1.k * v2.k;
};

Vector.prototype.magnitude = function () {
  return Math.sqrt(this.i*this.i + this.j*this.j + this.k*this.k);
};

Vector.prototype.normalize = function () {
  var magnitude = this.magnitude();
  return new Vector(this.i / magnitude, this.j / magnitude, this.k / magnitude);
};

module.exports = Vector;

},{}],9:[function(_dereq_,module,exports){

module.exports = _dereq_('./worlds/allworlds.js');

},{"./worlds/allworlds.js":15}],10:[function(_dereq_,module,exports){

var Isomer = _dereq_('../../bower_components/isomer/index.js');
var Point = Isomer.Point;
var Prism = Isomer.Shape.Prism;

// -----------------------------------------------------------------
function Block(blockX, blockY, bottomZ, w, h, color) {
    this.x = blockX;
    this.y = blockY;
    this.z = bottomZ;
    this.w = w;
    this.h = h;
    this.color = color;
}
// -----------------------------------------------------------------
Block.prototype.dupe = function() {
    return new Block(this.x, this.y, this.z, this.w, this.h, this.color);
}
// -----------------------------------------------------------------
Block.prototype.translate = function(dx, dy, dz) {
    this.x += dx;
    this.y += dy;
    this.z += dz;
}
// -----------------------------------------------------------------
Block.prototype.render = function(iso, opts) {
    var origin = new Point(
        this.x,
        this.y,
        this.z
    );
    var w = this.w * (1 - opts.isoGap);
    iso.add(
        new Prism(origin, w, w, this.h),
        this.color
    );
}
// -----------------------------------------------------------------
module.exports = Block;
},{"../../bower_components/isomer/index.js":1}],11:[function(_dereq_,module,exports){

var Isomer = _dereq_('../../bower_components/isomer/index.js');
var Point = Isomer.Point;

// -----------------------------------------------------------------
function Feature(width, color) {
    this.w = width;
    if (color instanceof Isomer.Color) {
        this.c = color;
    } else {
        this.c = new Isomer.Color(255, 255, 0);
    }
}
// -----------------------------------------------------------------
Feature.prototype.width = function(width) {
    if (width !== undefined) {
        this.w = width;
    }
    return this.w;
}
// -----------------------------------------------------------------
Feature.prototype.render = function(iso, center, opts) {
    var at = new Point( center[0], center[1], center[2] );
    iso.add(
        new Isomer.Path.Star(at, this.w/6, this.w/2, 11),
        this.c
    );
}
// -----------------------------------------------------------------
module.exports = Feature;

},{"../../bower_components/isomer/index.js":1}],12:[function(_dereq_,module,exports){

var Feature = _dereq_('./feature');
var Isomer = _dereq_('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
var Cylinder = Isomer.Shape.Cylinder;


// TODO this is debugging
var defaultType;
var pick = Math.random();
     if (pick < 0.25) { defaultType = 'pointy'; }
else if (pick < 0.50) { defaultType = 'tubular'; }
else if (pick < 1.00) { defaultType = 'combination'; }

// -----------------------------------------------------------------
function Tree(width, height, trunkColor, leafColor) {
    Feature.call(this, width, trunkColor);
    this.h = height;
    this.cLeaf = leafColor;

    // TODO remove this debug thing
    this.type = defaultType;
}
// -----------------------------------------------------------------
// inheritance
Tree.prototype = Object.create(Feature.prototype);
Tree.prototype.constructor = Tree;
// -----------------------------------------------------------------
Tree.prototype.render = function(iso, center, opts) {

    if (this.type == 'pointy') {

        var trunkHeightRatio = 4/5;
        var foliageWidthRatio = 1.5;
        var foliageHeightRatio = 4/5;
        var foliageStartRatio = 1/5;

        var offset = 0 - (this.w/1.41);
        var centre = new Point( center[0], center[1], center[2] );
        var treePt = centre.translate(offset, offset, 0);
        var foliagePt = centre.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );
        // draw the trunk
        iso.add(
            new Pyramid(treePt, this.w, this.w, this.h * trunkHeightRatio),
            this.c
        );
        // draw the foliage
        iso.add(
            new Pyramid(foliagePt, this.w * foliageWidthRatio, this.w * foliageWidthRatio, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (this.type == 'tubular') {

        var trunkHeightRatio = 1/3;
        var foliageWidthRatio = 1.5;
        var foliageHeightRatio = 2/3;
        var foliageStartRatio = 1/3;

        var offset = 0 - (this.w/2);
        var trunkOrigin = new Point( center[0], center[1], center[2] );
        var leafOrigin = trunkOrigin.translate(0, 0, this.h * foliageStartRatio);
        // draw the trunk
        iso.add(
            new Cylinder(trunkOrigin, this.w / 2, 10, this.h * trunkHeightRatio),
            this.c
        );
        // draw the foliage
        iso.add(
            new Cylinder(leafOrigin, this.w * foliageWidthRatio / 2, 10, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (this.type == 'combination') {

        var trunkHeightRatio = 1/5;
        var foliageWidthRatio = 1.1;
        var foliageHeightRatio = 4/5;
        var foliageStartRatio = 1/5;

        var offset = 0 - (this.w/2);
        var trunkOrigin = new Point( center[0], center[1], center[2] );
        var leafOrigin = trunkOrigin.translate(0, 0, this.h * foliageStartRatio);
        var foliageOrigin = trunkOrigin.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );

        // draw the trunk
        iso.add(
            new Cylinder(trunkOrigin, this.w / 2, 10, this.h * trunkHeightRatio),
            this.c
        );
        // draw the foliage
        iso.add(
            new Pyramid(foliageOrigin, this.w * foliageWidthRatio, this.w * foliageWidthRatio, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

}
// -----------------------------------------------------------------
module.exports = Tree;

},{"../../bower_components/isomer":1,"./feature":11}],13:[function(_dereq_,module,exports){


var Block = _dereq_('./block');
// -----------------------------------------------------------------
function UnitColumn(centerX, centerY, bottomZ, h, color) {
    Block.call(this, centerX, centerY, bottomZ, 1, h, color);
}
// -----------------------------------------------------------------
// inheritance
UnitColumn.prototype = Object.create(Block.prototype);
UnitColumn.prototype.constructor = UnitColumn;
// -----------------------------------------------------------------
module.exports = UnitColumn;

},{"./block":10}],14:[function(_dereq_,module,exports){

// shim for Object.create, from MDN
if (typeof Object.create != 'function') {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            if (arguments.length > 1) {
              throw Error('Second argument not supported');
            }
            if (o === null) {
              throw Error('Cannot set a null [[Prototype]]');
            }
            if (typeof o != 'object') {
              throw TypeError('Argument must be an object');
            }
            F.prototype = o;
            return new F();
        };
    })();
}
},{}],15:[function(_dereq_,module,exports){
"use strict";

var worldDefaults = _dereq_('./worlddefaults.js');
var ForestWorld = _dereq_('./forestworld.js');
var Isomer = _dereq_('../../bower_components/isomer/index.js');

var World = {
    defaultOptions: worldDefaults,
    Color: Isomer.Color,

    Forest: ForestWorld
}

window.World = World;
module.exports = World;

},{"../../bower_components/isomer/index.js":1,"./forestworld.js":17,"./worlddefaults.js":18}],16:[function(_dereq_,module,exports){

_dereq_('../util/shims.js');

var defaults = _dereq_('./worlddefaults.js');
var defaultOptions = defaults.options;
var colorSchemes = defaults.colorSchemes;
var Isomer = _dereq_('../../bower_components/isomer/index.js');
var Point = Isomer.Point;

var UnitColumn = _dereq_('../objects/unitcolumn.js');
var Feature = _dereq_('../objects/feature.js');

// -----------------------------------------------------------------
// -----------------------------------------------------------------
function BaseWorld(domElement, options) {
    this._opts = Object.create(defaultOptions);
    this.mergeOptions(options);

    this._squares = this.initSquares();

    this._groundStacks = [];
    this._groundHeight = [];

    this._dom = this.resolveDom(domElement);
    this._layers = this.makeLayers();

    this._colors = colorSchemes[this._opts.colorScheme];
    if (this._colors === undefined) {
        this._colors = { 'blank': new Isomer.Color(255,75,75,0.66) };
    }

    // auto-size?
    if (this._opts.autoSize) {
        this.autoSize();
    }
}
// -----------------------------------------------------------------
// work out a block size that will fit our world
BaseWorld.prototype.autoSize = function() {

    var opts = this._opts;

    // get the canvas size
    var cW = this._layers.fg.canvas.width;
    var cH = this._layers.fg.canvas.height;

    // get the block counts
    var bX = this._squares.length;
    var bY = this._squares[0].length;

    var extraHeight = opts.maxHeight - opts.minHeight;
    var xyBlocks = bX + bY + (2 * this.w2bZDelta(extraHeight) + 0.33); // the 0.33 is the UI grid height above maxHeight

    // the display is x+y block-diagonals across, and x+y diagonals tall
    var bW = xyBlocks * Math.cos(opts.isoAngle);
    var bH = xyBlocks * Math.sin(opts.isoAngle);

    // work stuff out.
    var hConstraint = cH / bH;
    var wConstraint = cW / bW;
    opts.isoScale = Math.min(hConstraint, wConstraint) * 0.95; // a 5% allowance

    // position the origin
    var sidePad = Math.max(0, (cW - (opts.isoScale * xyBlocks)) / 2);
    opts.isoOriginX = sidePad * 1.05 + ((cW - sidePad - sidePad) * bY / (bX + bY));
    opts.isoOriginY = cH - (this.w2bZDelta(0 - opts.minHeight) * opts.isoScale * 1.05); // 5% allowance again

    // rebuild the layers
    this._layers = this.makeLayers();
    this.render();
}
// -----------------------------------------------------------------
// init our squares
BaseWorld.prototype.initSquares = function() {
    var sqs = [];
    var opts = this._opts;
    var blocksX = Math.ceil(opts.worldSizeX / opts.blockSize);
    var blocksY = Math.ceil(opts.worldSizeY / opts.blockSize);

    for (var x = 0; x < blocksX; x++) {
        sqs.push([]);
        for (var y = 0; y < blocksY; y++) {
            sqs[x].push({
                // here's the default square.
                x: x,
                y: y,
                z: 0,
                ground: [],
                features: []
            });
        }
    }
    return sqs;
}
// -----------------------------------------------------------------
// return a color
BaseWorld.prototype.getColor = function(type) {
    if (type instanceof Isomer.Color) {
        return type;
    }
    var color = this._colors[type];
    if (!color) color = this._colors['blank'];
    return color
}
// -----------------------------------------------------------------
// init the three layers
BaseWorld.prototype.resolveDom = function(domElement) {
    if (domElement instanceof Element) {
        return domElement;
    } else {
        //maybe it's a string, which we'll assume is an id
        return document.getElementById(domElement);
    }
}
// -----------------------------------------------------------------
// init the three layers
BaseWorld.prototype.makeLayers = function() {
    var opts = this._opts;
    var w = this._dom.clientWidth;
    var h = this._dom.clientHeight;
    var isoOpts = {
        scale: opts.isoScale,
        angle: opts.isoAngle
    }
    if (opts.isoOriginX) isoOpts['originX'] = opts.isoOriginX;
    if (opts.isoOriginY) isoOpts['originY'] = opts.isoOriginY;

    this._dom.innerHTML = '' +
        '<style>.isoworld { position: absolute; top: 0, bottom: 0, left: 0, right: 0 }</style>' +
        '<canvas id="isoworld-bg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-fg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-ui" class="isoworld" width="' + w + '" height="' + h + '"></canvas>';

    var bg = new Isomer(document.getElementById('isoworld-bg'), isoOpts);
    var fg = new Isomer(document.getElementById('isoworld-fg'), isoOpts);

    isoOpts['lightPosition'] = new Isomer.Vector(-1,-1,10);
    var ui = new Isomer(document.getElementById('isoworld-ui'), isoOpts);

    return { bg: bg, fg: fg, ui: ui };
}
// -----------------------------------------------------------------
// merge new options into our options
BaseWorld.prototype.mergeOptions = function(extraOpts) {
    for (opt in extraOpts) {
        this._opts[opt] = extraOpts[opt];
    }
}
// -----------------------------------------------------------------
// switch automatic re-rendering on or off, or query current setting
BaseWorld.prototype.autoRender = function(yesno) {
    if (yesno === false) {
        this._opts.autoRender = false;
    } else if (yesno == true) {
        this._opts.autoRender = true;
    }
    return this._opts.autoRender;
}
// -----------------------------------------------------------------
// convert absolute world height to absolute block z
BaseWorld.prototype.w2bZ = function(altitude) {
    return (this.w2bZDelta(altitude - this._opts.worldOriginZ));
}
// -----------------------------------------------------------------
// convert world height delta to block z delta
BaseWorld.prototype.w2bZDelta = function(height) {
    return (height / this._opts.blockSize * this._opts.worldScaleZ);
}
// -----------------------------------------------------------------
// convert world horizontal delta (x or y) to block x or y delta
BaseWorld.prototype.w2bDelta = function(length) {
    return length / this._opts.blockSize;
}
// -----------------------------------------------------------------
// convert world coordinates to block coordinates
// pass in either three args (x, y, z) or one ([x, y, z])
BaseWorld.prototype.w2b = function(worldX, worldY, altitude) {
    var wX = worldX;
    var wY = worldY;
    var wZ = altitude;
    if (wX instanceof Array) {
        wZ = wX[2];
        wY = wX[1];
        wX = wX[0];
    }
    var opts = this._opts;
    // okay now we have world coords for x,y,z.
    var bX = Math.floor( (wX - opts.worldOriginX) / opts.blockSize );
    var bY = Math.floor( (wY - opts.worldOriginY) / opts.blockSize );
    var bZ = (wZ - opts.worldOriginZ) / opts.blockSize * opts.worldScaleZ;
    return ([bX, bY, bZ]);
}
// -----------------------------------------------------------------
// add a feature at world coords x,y
BaseWorld.prototype.feature = function(x, y, feature) {
    var blockCoords = this.w2b(x, y, 0);
    var bX = blockCoords[0];
    var bY = blockCoords[1];
    if (!feature) {
        feature = new Feature(0.1);
    }
    this._squares[bX][bY].features.push(feature);
    // sort the features, widest first
    this._squares[bX][bY].features.sort( function(a, b) {
        return (b.width() - a.width());
    });
    this.renderMaybe();
}
// -----------------------------------------------------------------
// set the ground level for world coords x,y.
BaseWorld.prototype.groundLevel = function(x, y, altitude) {
    var blockCoords = this.w2b(x, y, altitude);
    var bX = blockCoords[0];
    var bY = blockCoords[1];
    var bZ = blockCoords[2];
    this.setGroundLevel(bX, bY, bZ);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// set the underground column for world coords x,y.  The stack argument
// is an array of alternating Color and thickness values.  The final
// Color doesn't need a thickness, it will continue to bedrock.
// Alternatively just provide a single Color for a simple one-color column.
BaseWorld.prototype.ground = function(x, y, stack) {

    var blockCoords = this.w2b(x, y, 0);
    var bX = blockCoords[0];
    var bY = blockCoords[1];

    if (this.validatePosition(bX, bY)) {

        var bZ = this._squares[bX][bY].z;

        var groundStack = this.listToStack(stack, bX, bY);
        this.setGroundStack(bX, bY, groundStack);
        this.renderMaybe();
    } else {
        console.log('IsoWorld: cannot set out-of-range ground stack at (' + x + ', ' + y + '), ignoring.');
    }
}
// -----------------------------------------------------------------
// turn an array of type/depth e.g. ['water', 2, sand', 1, 'soil']
// into an array of ground blocks
BaseWorld.prototype.listToStack = function(list, bX, bY) {

    var listPos, color, thickness;
    var stack = [];
    var height = 0;

    for (listIndex = 0; listIndex < list.length; listIndex = listIndex + 2) {
        // list[listIndex] is the type of this layer
        color = this.getColor(list[listIndex]);

        // list[listIndex + 1] is the thickness of the layer
        if (listIndex < list.length - 1) {
            thickness = this.w2bZDelta( list[listIndex + 1] );
        } else {
            thickness = height - this.w2bZ( this._opts.bedrockLevel );
        }
        if (thickness > 0) {
            height -= thickness;
            column = new UnitColumn(bX, bY, height, thickness, color);
            stack.unshift(column);
        }
    }
    return stack;
}
// -----------------------------------------------------------------
// make sure a square exists at x,y
BaseWorld.prototype.validatePosition = function(x, y) {
    var sq = this._squares;
    return (!(x < 0 || y < 0 || x >= sq.length || y >= sq[0].length));
}
// -----------------------------------------------------------------
// set ground level for the square at BLOCK coords x,y.
BaseWorld.prototype.setGroundLevel = function(x, y, z) {
    if (this.validatePosition(x, y)) {
        this._squares[x][y].z = z;
    }
}
// -----------------------------------------------------------------
// set ground stack for the square at BLOCK coords x,y.
// setting will set from bedrock up to altitude in specified color
BaseWorld.prototype.setGroundStack = function(x, y, stack) {
    if (this.validatePosition(x, y)) {
        this._groundStacks.push({ x: x, y: y, ground: stack });
        this._extrapolateGround();
    }
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquare = function(x, y) {
    this.renderSquareGround(x, y);
    this.renderSquareFeatures(x, y);
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquareFeatures = function(x, y) {

    var sq = this._squares[x][y];

    if (sq !== undefined) {
        if (sq.features && sq.features.length > 0) {
            // there's features to render.
            // we draw features along the line from left corner
            // to right corner.  So we need to find points for
            // all the features along that line.
            // The +2 is +1 for the fencepost error, and +1 more to
            // add half a feature's worth of padding at each end
            var f, feature;
            var gap = this._opts.isoGap;
            var increment = (1 - gap) / (sq.features.length + 2);
            var step = increment/2;
            for (f=0; f < sq.features.length; f++) {
                feature = sq.features[f];
                step += increment;
                feature.render(this._layers.fg, [x + step, y + 1 - gap - step, sq.z], this._opts);
            }
        }
    }
}
// -----------------------------------------------------------------
// render a square's ground column
BaseWorld.prototype.renderSquareGround = function(x, y) {

    var sq = this._squares[x][y];
    var bedrockZ;

    if (sq !== undefined) {
        // is there a ground column?
        var g, groundLayer;
        if (sq.ground && sq.ground.length > 0) {
            // render ground column
            for (var g=0; g < sq.ground.length; g++) {
                groundLayer = sq.ground[g];
                groundLayer.render(this._layers.fg, this._opts);
            }
        } else {
            // no ground recorded, draw a blank column
            bedrockZ = this.w2bZ(this._opts.bedrockLevel);
            groundLayer = new UnitColumn(
                x, y, bedrockZ,
                (sq.z ? sq.z : 0) - bedrockZ,
                this.getColor('blank')
            );
            groundLayer.render(this._layers.fg, this._opts);
        }
    }
}
// -----------------------------------------------------------------
// render the UI layer
BaseWorld.prototype.renderUI = function() {

    var iso = this._layers.ui;
    iso.canvas.clear();

    var maxX = this._squares.length;
    var maxY = this._squares[0].length;
    var gX, gY;
    var gH = this.w2bZ(this._opts.maxHeight) + 0.33;

    // draw the grid
    for (gX = 0; gX <= maxX; gX++) {
        iso.add(new Isomer.Path(
            new Point(gX-0.01, 0, gH),
            new Point(gX+0.01, 0, gH),
            new Point(gX,   maxY, gH)
        ), this.getColor('ui'));
    }
    for (gY = 0; gY <= maxY; gY++) {
        iso.add(new Isomer.Path(
            new Point(0, gY-0.01, gH),
            new Point(0, gY+0.01, gH),
            new Point(maxX,   gY, gH)
        ), this.getColor('ui'));
    }
}
// -----------------------------------------------------------------
// render the foreground layer
BaseWorld.prototype.renderFG = function() {

    this._layers.fg.canvas.clear();

    var g = this._squares;

    var maxX = g.length;
    var maxY = g[0].length;
    var coordSum = maxX + maxY - 2; // -2 coz they're both zero indexed
    var gX, gY;

    while (coordSum >= 0) {
        for (gX = 0; gX < maxX; gX++) {
            for (gY = 0; gY < maxY; gY++) {
                if (gX + gY == coordSum && g[gX][gY]) {
                    this.renderSquare(gX, gY);
                }
            }
        }
        coordSum -= 1;
    }

    // draw on origin lines, coz why not
    // if (true) {
    if (false) {
        this._layers.fg.add(new Isomer.Path([
            new Isomer.Point(0,-0.01,0), new Isomer.Point(0,0.01,0), new Isomer.Point(10,0,0)
        ]), new Isomer.Color(255,0,0));
        this._layers.fg.add(new Isomer.Path([
            new Isomer.Point(-0.01,0,0), new Isomer.Point(0.01,0,0), new Isomer.Point(0,10,0)
        ]), new Isomer.Color(255,0,0));
        this._layers.fg.add(new Isomer.Path([
            new Isomer.Point(-0.01,-0.01,0), new Isomer.Point(0.01,0.01,0), new Isomer.Point(0,0,10)
        ]), new Isomer.Color(255,0,0));
    }
}
// -----------------------------------------------------------------
// render
BaseWorld.prototype.render = function() {
    this.renderFG();
    this.renderUI();
}
// -----------------------------------------------------------------
// render, only if we're supoosed to re-render automatically
BaseWorld.prototype.renderMaybe = function() {
    if (this._autoRender) { this.render(); }
}
// -----------------------------------------------------------------
// extrapolate all the ground columns
BaseWorld.prototype._neighbours = function(x, y) {
    var neighbours = [];
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0) continue;
            if (this.validatePosition(x + dx, y + dy)) {
                neighbours.push({x: x + dx, y: y + dy});
            }
        }
    }
    return neighbours;
}
// -----------------------------------------------------------------
// copy a ground column between squares
BaseWorld.prototype._copyGround = function(from, to) {
    var newLayer;
    var fromZ = from.z;
    var aboveBedrock = to.z - this.w2bZ(this._opts.bedrockLevel);

    if (fromZ === undefined) fromZ = 0;
    to.ground = [];
    for (var layerIndex = from.ground.length - 1; layerIndex >=0; layerIndex--) {
        if (aboveBedrock > 0) {
            // only add another layer if we're still above bedrock
            newLayer = from.ground[layerIndex].dupe();
            newLayer.translate(to.x - from.x, to.y - from.y, to.z - fromZ);
            aboveBedrock -= newLayer.h;
            to.ground.unshift(newLayer);
        }
    }
    // now fix up the bottom layer so it reaches bedrock
    to.ground[0].z -= aboveBedrock;
    to.ground[0].h += aboveBedrock;
}
// -----------------------------------------------------------------
// extrapolate all the ground columns
BaseWorld.prototype._extrapolateGround = function() {
    var sqs = this._squares;
    var maxX = sqs.length;
    var maxY = sqs[0].length;
    var x, y, dx, dy, gs;
    var dist, bestDist, candidate, bestCandidate;

    for (x = 0; x < maxX; x++) { for (y = 0; y < maxY; y++) {
        bestCandidate = undefined;
        bestDist = maxX*maxX + maxY*maxY;
        for (gs = 0; gs < this._groundStacks.length; gs++) {
            candidate = this._groundStacks[gs];
            dx = x - candidate.x;
            dy = y - candidate.y;
            dist = dx*dx + dy*dy;
            if (dist < bestDist) {
                bestDist = dist;
                bestCandidate = candidate;
            }
        }
        if (bestCandidate) {
            this._copyGround(bestCandidate, this._squares[x][y]);
        }
    }}

    this.renderMaybe();

}
// -----------------------------------------------------------------
// -----------------------------------------------------------------
module.exports = BaseWorld;

},{"../../bower_components/isomer/index.js":1,"../objects/feature.js":11,"../objects/unitcolumn.js":13,"../util/shims.js":14,"./worlddefaults.js":18}],17:[function(_dereq_,module,exports){

_dereq_('../util/shims');

var BaseWorld = _dereq_('./baseworld');
var Tree = _dereq_('../objects/tree');

// -----------------------------------------------------------------
// -----------------------------------------------------------------
function ForestWorld() {
    // invoke our super constructor thingy
    BaseWorld.apply(this, arguments);
}
// -----------------------------------------------------------------
// inheritance
ForestWorld.prototype = Object.create(BaseWorld.prototype);
ForestWorld.prototype.constructor = ForestWorld;
// -----------------------------------------------------------------
// real object methods..
ForestWorld.prototype.tree = function(x, y, width, height) {
    var bW = this.w2bDelta(width);
    var bH = this.w2bZDelta(height);
    this.feature(
        x, y,
        new Tree(bW, bH, this.getColor('wood'), this.getColor('foliage'))
    );
}
// -----------------------------------------------------------------
module.exports = ForestWorld;

},{"../objects/tree":12,"../util/shims":14,"./baseworld":16}],18:[function(_dereq_,module,exports){

var Color = _dereq_('../../bower_components/isomer/index.js').Color;

var defaultOptions = {
    autoRender:  true,    // re-draw the world when anything changes
    autoSize:    true,    // work out block size to fill the canvas

    worldSizeX:    10,    // size of world
    worldSizeY:    10,    // size of world

    worldOriginX:   0,    // starting X coord, in world units
    worldOriginY:   0,    // starting Y coord, in world units
    worldOriginZ:   0,    // starting Z coord, in world units

    worldScaleZ:    1,    // how many altitude units to a ground co-ord unit?

    colorScheme: 'bright',
    maxHeight:      5,    // max height of interesting features (used to auto-size)
    minHeight:     -8,    // minimum height of interesting features (used to auto-size)
    bedrockLevel: -16,    // how far down to stop drawing the ground

    blockSize:      1,    // how many 'world' units long is one side of a block?
    isoGap:         0.05, // gap to leave between blocks

    // Isomer rendering options.
    //
    //                 '-_
    //         isoScale   '-_
    //        '-_            _-_
    //           '-_      _-'   '-_
    //  ____________   _-'         '-_
    //    ^           |-_           _-|
    //    :           |  '-_     _-'  |      _
    //    : isoScale  |     '-_-'     |   _-'
    //    v           |       |       | -'
    //  ------------  '-_     |     _-'
    //                   '-_  |  _-'   isoAngle
    //                      '-_-' __________________
    //

    // pixel length of a 1x1x1 block.  The Isomer default is 70.
    // It's this value that gets adjusted when autoSize = true, so
    // normally you won't need to set it yourself.
    isoScale: 60,

    // PI/15 looks quite side-on; PI/4 is more top-down. The Isomer
    // default is PI/6.  If your drawing area's aspect ratio is
    // unusual you can tweak this to fill the area better.
    isoAngle: Math.PI/6,

    // these isoOrigin values are optional.  If you use autoSize and
    // set maxHeight / minHeight properly you won't need to set the
    // isoOrigin.
    // isoOriginX: 450,  // pixel pos of point 0,0,0 on the canvas
    // isoOriginY: 450,  // pixel pos of point 0,0,0 on the canvas

    dummy: "has no trailing comma"
}

var colorSchemes = {
    'bright': {
        'blank': new Color(180,180,180),
        'soil': new Color(110, 50, 35),
        'sand': new Color(230, 200, 20),
        'leaflitter': new Color(90, 110, 50),
        'water': new Color(50, 200, 255, 0.75),
        'wood': new Color(90, 50, 20, 0.5),
        'foliage': new Color(90, 200, 50, 0.75),
        'ui': new Color(255, 255, 0, 0.33),
        'highlight': new Color(255, 255, 100, 0.66)
    },
    'real': {
        'blank': new Color(125,125,125),
        'soil': new Color(50, 40, 30),
        'sand': new Color(210, 190, 120),
        'leaflitter': new Color(50, 60, 40),
        'water': new Color(50, 150, 255, 0.75),
        'wood': new Color(50, 40, 30, 0.66),
        'foliage': new Color(90, 200, 50, 0.66),
        'ui': new Color(255, 255, 100, 0.33),
        'highlight': new Color(255, 255, 100, 0.66)
    }
}

module.exports = {
    options: defaultOptions,
    colorSchemes: colorSchemes
}
},{"../../bower_components/isomer/index.js":1}]},{},[9])
(9)
});