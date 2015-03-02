/*!
 * isoworld v0.0.1
 *
 * Copyright 2014 Daniel Baird
 *
 * Date: 2015-03-02
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

"use strict";

var allWorlds = _dereq_('./worlds/allworlds.js');
var Isomer = _dereq_('../bower_components/isomer/index.js');

window.IsoWorld = {
    Worlds: allWorlds,
    Point: Isomer.Point,
    Color: Isomer.Color
}

module.exports = window.IsoWorld;

},{"../bower_components/isomer/index.js":1,"./worlds/allworlds.js":23}],10:[function(_dereq_,module,exports){

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

var VerticalFeature = _dereq_('./verticalfeature');
var Isomer = _dereq_('../../bower_components/isomer');
var Point = Isomer.Point;
var Cylinder = Isomer.Shape.Cylinder;
var Cone = _dereq_('../shapes/cone');
var Ring = _dereq_('../shapes/ring');

// -----------------------------------------------------------------
function Dendrometer(origin, parent, height, diameter, width, color1, color2) {
    VerticalFeature.call(this, origin, parent, height);
    this.d = diameter;
    this.w = width;
    this.c1 = color1;
    this.c2 = color2 || color1;
}
// -----------------------------------------------------------------
// inheritance
Dendrometer.prototype = Object.create(VerticalFeature.prototype);
Dendrometer.prototype.constructor = Dendrometer;
// -----------------------------------------------------------------
Dendrometer.prototype.renderAt = function(iso, center, opts) {

    var bandRadius = this.d/2;
    var meterRadius = this.w;
    var meterHeight = meterRadius;
    var meterDist = (bandRadius + meterRadius) / Math.SQRT2;
    var ringPt = center.translate(0, 0, this.h - this.w);
    var meterPt = center.translate(meterDist, 0 - meterDist, this.h);

    iso.add(new Ring(ringPt, bandRadius, 7, this.w), this.c1);
    iso.add(new Cylinder(meterPt.translate(0,0,-2 * meterHeight), meterRadius, 14, meterHeight * 2), this.c2);
    iso.add(new Cone(meterPt, meterRadius, 14, meterHeight), this.c2);
}
// -----------------------------------------------------------------
module.exports = Dendrometer;

},{"../../bower_components/isomer":1,"../shapes/cone":20,"../shapes/ring":21,"./verticalfeature":19}],12:[function(_dereq_,module,exports){

var Isomer = _dereq_('../../bower_components/isomer');
var Point = Isomer.Point;

// -----------------------------------------------------------------
function Feature(origin, parent) {
    this.origin(origin);
    this.parent(parent); // backreference to parent block
}
// -----------------------------------------------------------------
// set or get the "origin" point for the feature (block coords)
Feature.prototype.origin = function(origin) {
    if (origin !== undefined) {
        var pt = new Isomer.Point(origin.x, origin.y, origin.z);
        this._origin = origin;
    }
    return this._origin;
}
// -----------------------------------------------------------------
// set or get parent block
Feature.prototype.parent = function(parent) {
    if (parent) {
        this.p = parent;
        this._origin.z = parent.z;
    }
    return this.p;
}
// -----------------------------------------------------------------
Feature.prototype.render = function(iso, opts) {
    this.renderAt(iso, this._origin, opts);
}
// -----------------------------------------------------------------
Feature.prototype.renderAt = function(iso, center, opts) {
    var width = 0.75;
    var color = new Isomer.Color(255,0,255);
    iso.add(
        new Isomer.Path.Star(center, width/6, width/2, 7),
        color
    );
}
// -----------------------------------------------------------------
module.exports = Feature;

},{"../../bower_components/isomer":1}],13:[function(_dereq_,module,exports){

var VerticalFeature = _dereq_('./verticalfeature');
var Isomer = _dereq_('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
var Cylinder = Isomer.Shape.Cylinder;
var Cone = _dereq_('../shapes/cone');
var Ring = _dereq_('../shapes/ring');

// -----------------------------------------------------------------
function LeafTrap(origin, parent, height, width, color1, color2) {
    VerticalFeature.call(this, origin, parent, height);
    this.w = width;
    this.c1 = color1;
    this.c2 = color2 || color1;
}
// -----------------------------------------------------------------
// inheritance
LeafTrap.prototype = Object.create(VerticalFeature.prototype);
LeafTrap.prototype.constructor = LeafTrap;
// -----------------------------------------------------------------
LeafTrap.prototype.renderAt = function(iso, center, opts) {

    var halfw = this.w/2;
    var poler = this.w/50;
    var poledist = (halfw - 2 * poler) / Math.SQRT2;
    var catcherh = this.h * 4/5;
    var ringh = this.h * 1/10;

    // upside down pyramid with supporting poles in each corner
    var polePt1 = center.translate(poledist, -1 * poledist, 0);
    var polePt2 = center.translate(-1 * poledist, poledist, 0);
    var catcherPt = center.translate(0, 0, this.h - catcherh);
    var ringPt = center.translate(0, 0, this.h - ringh);

    iso.add(new Cylinder(polePt1, poler, 6, this.h), this.c2);
    iso.add(new Cylinder(polePt2, poler, 6, this.h), this.c2);
    iso.add(new Cone.Inverted.Open(catcherPt, halfw, 15, catcherh), this.c1);
    iso.add(new Ring(ringPt, halfw, 7, ringh), this.c2);
    // iso.add(new Ring(ringPt.translate(0,0,-1 * ringh), halfw, 7, ringh), this.c1);

    // iso.add(
    //     new Cylinder(center, this.w / 2, 10, this.h * trunkHeightRatio),
    //     this.cTrunk
    // );

}
// -----------------------------------------------------------------
module.exports = LeafTrap;

},{"../../bower_components/isomer":1,"../shapes/cone":20,"../shapes/ring":21,"./verticalfeature":19}],14:[function(_dereq_,module,exports){

var Feature = _dereq_('./feature');
var Isomer = _dereq_('../../bower_components/isomer');

var validDirections = '+x -x +y -y'.split(' ');

// -----------------------------------------------------------------
// construction
// -----------------------------------------------------------------
function PathFeature(origin, parent, width, direction, color) {
    Feature.call(this, origin, parent);
    this.dir = direction;
    this.w = width;
    this.c = color;
}
// -----------------------------------------------------------------
// inheritance
PathFeature.prototype = Object.create(Feature.prototype);
PathFeature.prototype.constructor = PathFeature;
// -----------------------------------------------------------------
// implementation
// -----------------------------------------------------------------
// is this a valid direction?
Feature.prototype.validDir = function(direction) {
    return (validDirections.indexOf(direction.toLowerCase()) != -1);
}
// -----------------------------------------------------------------
// set or get direction
Feature.prototype.direction = function(direction) {
    if (direction && validDir(direction.toLowerCase())) {
        this.dir = direction.toLowerCase();
    }
    return this.dir;
}
// -----------------------------------------------------------------
// set or get width
Feature.prototype.width = function(width) {
    if (width)  this.w = width;
    return this.w;
}
// -----------------------------------------------------------------
// set or get color
Feature.prototype.color = function(color) {
    if (color)  this.c = color;
    return this.c;
}
// -----------------------------------------------------------------
PathFeature.prototype.render = function(iso, opts) {
    var Pt = Isomer.Point;
    // pc is the parent block's center
    var pc = Pt(this.p.x + 0.5, this.p.y + 0.5, this.p.z);
    var hw = this.w / 2;
    var points = [
        pc.translate(0-hw, hw,   0),
        pc.translate(0-hw, 0-hw, 0),
        pc.translate(hw,   0-hw, 0),
        pc.translate(hw,   hw,   0)
    ];
    if (this.dir == '+x') {
        points[3] = pc.translate(0.5 - opts.isoGap, hw,   0);
        points[2] = pc.translate(0.5 - opts.isoGap, 0-hw, 0);
    }
    if (this.dir == '-x') {
        points[1] = pc.translate(-0.5, 0-hw, 0);
        points[0] = pc.translate(-0.5, hw,   0);
    }
    if (this.dir == '+y') {
        points[3] = pc.translate(hw,   0.5 - opts.isoGap, 0);
        points[0] = pc.translate(0-hw, 0.5 - opts.isoGap, 0);
    }
    if (this.dir == '-y') {
        points[2] = pc.translate(hw,   -0.5, 0);
        points[1] = pc.translate(0-hw, -0.5, 0);
    }
    iso.add(new Isomer.Path(points), this.c);
    points.reverse();  // otherwise the poly gets drawn facing the wrong way
    // if the path goes to one of the two front faces, draw the
    // path down the side of the block as well
    if (this.dir == '-x') {
        points[0] = points[3].translate(0,0,-1000);
        points[1] = points[2].translate(0,0,-1000);
        iso.add(new Isomer.Path(points), this.c);
    }
    if (this.dir == '-y') {
        points[0] = points[1].translate(0,0,-1000);
        points[3] = points[2].translate(0,0,-1000);
        iso.add(new Isomer.Path(points), this.c);
    }
}
// -----------------------------------------------------------------
PathFeature.prototype.renderAt = function(iso, center, opts) {
    // can't render at a point.  so just do a normal render.
    this.render(iso, opts);
}
// -----------------------------------------------------------------
module.exports = PathFeature;

},{"../../bower_components/isomer":1,"./feature":12}],15:[function(_dereq_,module,exports){

var VerticalFeature = _dereq_('./verticalfeature');
var Isomer = _dereq_('../../bower_components/isomer');
var Point = Isomer.Point;
var Prism = Isomer.Shape.Prism;
var Cylinder = Isomer.Shape.Cylinder;

// -----------------------------------------------------------------
function SoilPit(origin, parent, height, boxsize, color) {
    VerticalFeature.call(this, origin, parent, height);
    this.b = boxsize;
    this.c = color;
}
// -----------------------------------------------------------------
// inheritance
SoilPit.prototype = Object.create(VerticalFeature.prototype);
SoilPit.prototype.constructor = SoilPit;
// -----------------------------------------------------------------
SoilPit.prototype.renderAt = function(iso, center, opts) {

    var boxh = this.b;
    var boxw = this.b;
    var boxd = this.b / 2;
    var halfd = boxd / 2;
    var piper = boxd / 3;

    var boxPt = center.translate(-1 * halfd, -1 * halfd, this.h - boxh);

    iso.add(new Cylinder(center, piper, 15, this.h - boxh), this.c);
    iso.add(new Prism(boxPt, boxw, boxd, boxh), this.c);
    iso.add(new Prism(boxPt, boxw, halfd - piper, boxh), this.c);

}
// -----------------------------------------------------------------
module.exports = SoilPit;

},{"../../bower_components/isomer":1,"./verticalfeature":19}],16:[function(_dereq_,module,exports){

var VerticalFeature = _dereq_('./verticalfeature');
var Isomer = _dereq_('../../bower_components/isomer');
var Point = Isomer.Point;
var Prism = Isomer.Shape.Prism;
var Cylinder = Isomer.Shape.Cylinder;
var Ring = _dereq_('../shapes/ring');
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// The BASE of the crane
// -----------------------------------------------------------------
function CraneBase(origin, parent, height, width, color1, color2, color3) {
    VerticalFeature.call(this, origin, parent, height);
    this.w = width;
    this.c1 = color1;
    this.c2 = color2 || color1;
    this.c3 = color3 || color1;
}
// -----------------------------------------------------------------
// inheritance
CraneBase.prototype = Object.create(VerticalFeature.prototype);
CraneBase.prototype.constructor = CraneBase;
// -----------------------------------------------------------------
CraneBase.prototype.renderAt = function(iso, center, opts) {

    var halfw = this.w / 2;
    var basew = this.w * 3;
    var baseh = this.w;
    var halfbw = basew / 2;

    var mastr = this.w / 10;
    var masth = this.h - baseh;

    var ringr = (halfw + mastr) * Math.SQRT2 + mastr;
    var ringh = this.w / 4;

    var basePt = center.translate(0 - halfbw, 0 - halfbw, 0);

    var mastPt1 = center.translate(0 + halfw, 0 + halfw, baseh);
    var mastPt2 = center.translate(0 + halfw, 0 - halfw, baseh);
    var mastPt3 = center.translate(0 - halfw, 0 + halfw, baseh);
    var mastPt4 = center.translate(0 - halfw, 0 - halfw, baseh);

    iso.add(new Ring(center.translate(0,0,this.h - ringh), ringr, 12, ringh, true), this.c3);

    iso.add(new Prism(basePt, basew, basew, baseh), this.c2);

    iso.add(new Cylinder(mastPt1, mastr, 6, masth), this.c1);
    iso.add(new Cylinder(mastPt2, mastr, 6, masth), this.c1);
    iso.add(new Cylinder(mastPt3, mastr, 6, masth), this.c1);
    iso.add(new Cylinder(mastPt4, mastr, 6, masth), this.c1);

    iso.add(new Ring(center.translate(0,0,this.h - ringh), ringr, 12, ringh), this.c3);

}
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// The TOP of the crane
// -----------------------------------------------------------------
function CraneBoom(origin, parent, height, length, width, angle, color1, color2) {
    VerticalFeature.call(this, origin, parent, height);
    this.l = length;
    this.w = width;
    this.a = angle;
    this.c1 = color1;
    this.c2 = color2 || color1;
}
// -----------------------------------------------------------------
// inheritance
CraneBoom.prototype = Object.create(VerticalFeature.prototype);
CraneBoom.prototype.constructor = CraneBoom;
// -----------------------------------------------------------------
CraneBoom.prototype.renderAt = function(iso, center, opts) {

console.log(this);
    var jibLen = this.l;
    var cJibLen = jibLen / 4;
    var halfw = this.w / 2;

    this.a = Math.PI
    console.log(halfw, this.l, this.w, this.a);

    // var jib = new Prism(Point(0, -1 * halfw, 0), this.l, this.w, this.w);
    var jib = new Prism(Point(0, 0, this.h), this.l, this.w, this.w);
    // iso.add(jib.rotateZ(this.a), this.c1);
    iso.add(jib, this.c1);

    return;

    var boxh = this.b;
    var boxw = this.b;
    var boxd = this.b / 2;
    var halfd = boxd / 2;
    var piper = boxd / 3;

    var boxPt = center.translate(-1 * halfd, -1 * halfd, this.h - boxh);

    iso.add(new Cylinder(center, piper, 15, this.h - boxh), this.c);
    iso.add(new Prism(boxPt, boxw, boxd, boxh), this.c);
    iso.add(new Prism(boxPt, boxw, halfd - piper, boxh), this.c);

}
// -----------------------------------------------------------------
module.exports = { Boom: CraneBoom, Base: CraneBase };

},{"../../bower_components/isomer":1,"../shapes/ring":21,"./verticalfeature":19}],17:[function(_dereq_,module,exports){

var VerticalFeature = _dereq_('./verticalfeature');
var Isomer = _dereq_('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
var Cylinder = Isomer.Shape.Cylinder;
var Cone = _dereq_('../shapes/cone');
var Ring = _dereq_('../shapes/ring');

// TODO this is debugging
var defaultType;
var pick = Math.random();
var types = 'pointy cylindrical stump combination umbrella random'.split(' ');
defaultType = types[Math.floor(Math.random() * types.length)];
// override random tree type..
defaultType = 'umbrella';
// defaultType = 'random';

// -----------------------------------------------------------------
function Tree(origin, parent, width, height, trunkColor, leafColor, type) {
    VerticalFeature.call(this, origin, parent, height);
    this.w = width;
    this.cTrunk = trunkColor;
    this.cLeaf = leafColor;

    // TODO remove this debug thing
    this.type = defaultType;
    if (type) this.type = type;
}
// -----------------------------------------------------------------
// inheritance
Tree.prototype = Object.create(VerticalFeature.prototype);
Tree.prototype.constructor = Tree;
// -----------------------------------------------------------------
Tree.prototype.renderAt = function(iso, center, opts) {

    var type = this.type;
    if (type == 'random') {
        var randList = [].concat(types);
        randList.splice(types.indexOf('stump'), 1);
        randList.splice(types.indexOf('random'), 1);
        type = randList[Math.floor(Math.random() * randList.length)];
    }

    if (type == 'pointy') {

        var trunkHeightRatio = 2/3;
        var foliageWidthRatio = 4;
        var foliageHeightRatio = 2/3;
        var foliageStartRatio = 1/3;

        var offset = 0 - (this.w/1.41);
        var treePt = center.translate(offset, offset, 0);
        var foliagePt = center.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );
        // draw the trunk
        iso.add(
            new Pyramid(treePt, this.w, this.w, this.h * trunkHeightRatio),
            this.cTrunk
        );
        // draw the foliage
        iso.add(
            new Pyramid(foliagePt, this.w * foliageWidthRatio, this.w * foliageWidthRatio, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (type == 'cylindrical' || type == 'umbrella') {

        var trunkHeightRatio = 2/3;
        var foliageWidthRatio = 5;
        var foliageStartRatio = 2/3;
        var foliageHeightRatio = 1/3;

        if (type == 'umbrella') {
            foliageWidthRatio = 13;
            trunkHeightRatio = 3/4;
            foliageStartRatio = 3/4;
            foliageHeightRatio = 1/4;
        }

        var radius = this.w * 1;
        var leafOrigin = center.translate(0, 0, this.h * foliageStartRatio);

        // draw the trunk
        iso.add(
            new Cylinder(center, radius, 22, this.h * trunkHeightRatio),
            this.cTrunk
        );
        // draw the foliage
        var fr = radius * foliageWidthRatio;
        var sides = 5 + fr * 22;
        iso.add(
            new Cylinder(leafOrigin, radius * foliageWidthRatio, sides, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (type == 'canopytop') {

        var trunkHeightRatio = 1/2;
        var foliageWidthRatio = 10;
        var foliageStartRatio = trunkHeightRatio - 1/10;
        var foliageHeightRatio = 1 - foliageStartRatio;

        var radius = this.w * 0.5;

        var fRadius = radius * foliageWidthRatio;
        var fH = this.h * foliageHeightRatio; // foliage height
        var fLowH = fH * 4/6;
        var fLowPt = center.translate(0, 0, this.h * foliageStartRatio);
        var fMidH = fH * 1/6;
        var fMidPt = fLowPt.translate(0, 0, fLowH);
        var fTopH = fH * 1/6;
        var fTopPt = fMidPt.translate(0, 0, fMidH);


        // draw the trunk
        iso.add(
            new Ring(center, radius, 11, this.h * trunkHeightRatio),
            this.cTrunk
        );
        // draw the foliage
        var sides = 5 + fr * 22;
        iso.add(new Cone.Inverted.Open(fLowPt, fRadius, sides, fLowH), this.cLeaf);
        iso.add(new Cylinder(fMidPt, fRadius, sides, fMidH), this.cLeaf);
        iso.add(new Cone.Open(fTopPt, fRadius, sides, fTopH), this.cLeaf);
    }

    if (type == 'stump') {
        var radius = this.w;
        iso.add(new Cylinder(center, radius, 33, this.h), this.cTrunk);
    }

    if (type == 'combination') {

        var trunkHeightRatio = 1/5;
        var foliageWidthRatio = 2;
        var foliageHeightRatio = 4/5;
        var foliageStartRatio = 1/5;

        var offset = 0 - (this.w/2);
        var foliageOrigin = center.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );

        // draw the trunk
        iso.add(
            new Cylinder(center, this.w / 2, 10, this.h * trunkHeightRatio),
            this.cTrunk
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

},{"../../bower_components/isomer":1,"../shapes/cone":20,"../shapes/ring":21,"./verticalfeature":19}],18:[function(_dereq_,module,exports){


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

},{"./block":10}],19:[function(_dereq_,module,exports){

var Feature = _dereq_('./feature');
var Isomer = _dereq_('../../bower_components/isomer');

// -----------------------------------------------------------------
// construction
// -----------------------------------------------------------------
function VerticalFeature(origin, parent, height) {
    Feature.call(this, origin, parent);
    this.h = height;
}
// -----------------------------------------------------------------
// inheritance
VerticalFeature.prototype = Object.create(Feature.prototype);
VerticalFeature.prototype.constructor = VerticalFeature;
// -----------------------------------------------------------------
// implementation
// -----------------------------------------------------------------
VerticalFeature.prototype.render = function(iso, opts) {
    this.renderAt(iso, this._origin, opts);
}
// -----------------------------------------------------------------
VerticalFeature.prototype.renderAt = function(iso, center, opts) {
    var width = 0.25;
    var color = new Isomer.Color(255,255,0);
    var shape = Isomer.Shape.extrude(
        new Isomer.Path.Star(center, width/6, width/2, 11),
        this.h
    );
    iso.add(shape, color);
}
// -----------------------------------------------------------------
module.exports = VerticalFeature;


},{"../../bower_components/isomer":1,"./feature":12}],20:[function(_dereq_,module,exports){

var Isomer = _dereq_('../../bower_components/isomer');
var Path = Isomer.Path;
var Point = Isomer.Point;
var Shape = Isomer.Shape;

var BaseCone = function (origin, radius, vertices, height, inverted, open) {
	radius = (typeof radius === 'number') ? radius : 1;
	height = (typeof height === 'number') ? height : 1;
	vertices = vertices || 20;

	inverted = !!inverted;
	open = !!open;

	var cone = new Shape();
	var tip = origin.translate(0, 0, height);
	if (inverted) {
		origin = tip;
		tip = origin.translate(0, 0, -1 * height);
	}
	var i, basePath = new Path();

	for (i = 0; i < vertices; i++) {
		basePath.push(
			new Point(
				radius * Math.cos(i * 2 * Math.PI / vertices),
				radius * Math.sin(i * 2 * Math.PI / vertices),
				0
			)
		);
	}

	basePath = basePath.translate(origin.x, origin.y, origin.z);

	if (!open) {
		cone.push(basePath);
	}

	// now march along the base path, making the side panels
	var side;
	for (i = 1; i < vertices; i++) {
		if (inverted) {
			side = new Path([basePath.points[i], basePath.points[i-1], tip]);
		} else {
			side = new Path([basePath.points[i-1], basePath.points[i], tip]);
		}
		cone.push(side);
	}
	// add the last panel
	if (inverted) {
		side = new Path([basePath.points[0], basePath.points[i-1], tip]);
	} else {
		side = new Path([basePath.points[i-1], basePath.points[0], tip]);
	}
	cone.push(side);

	return cone;
};

var Cone = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, false, false);
};

Cone.Inverted = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, true, false);
}

Cone.Open = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, false, true);
}

Cone.Inverted.Open = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, true, true);
}

Cone.Open.Inverted = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, true, true);
}

module.exports = Cone;

},{"../../bower_components/isomer":1}],21:[function(_dereq_,module,exports){

var Isomer = _dereq_('../../bower_components/isomer');
var Path = Isomer.Path;
var Point = Isomer.Point;
var Shape = Isomer.Shape;

var Ring = function(origin, radius, vertices, height, back) {
	radius = (typeof radius === 'number') ? radius : 1;
	height = (typeof height === 'number') ? height : 1;
	vertices = vertices || 20;
	back = !!back;

	var ring = new Shape();
	var basePoints = new Path();
	var startAngle = Math.PI * 3/4;
	if (back) {
		startAngle = Math.PI * -1/4;
	}
	var i;

	for (i = 0; i < vertices + 1; i++) {
		basePoints.push(
			new Point(
				radius * Math.cos(startAngle + i * Math.PI / vertices),
				radius * Math.sin(startAngle + i * Math.PI / vertices),
				0
			)
		);
	}

	basePoints = basePoints.translate(origin.x, origin.y, origin.z);

	// now march along the base path, making the side panels
	for (i = 1; i < vertices + 1; i++) {
		ring.push(
			new Path([
				basePoints.points[i-1],
				basePoints.points[i],
				basePoints.points[i].translate(0, 0, height),
				basePoints.points[i-1].translate(0, 0, height)
			])
		);
	}

	return ring;
};

module.exports = Ring;

},{"../../bower_components/isomer":1}],22:[function(_dereq_,module,exports){

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
},{}],23:[function(_dereq_,module,exports){
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

},{"../../bower_components/isomer/index.js":1,"./forestworld.js":25,"./worlddefaults.js":26}],24:[function(_dereq_,module,exports){

_dereq_('../util/shims.js');

var defaults = _dereq_('./worlddefaults.js');
var defaultOptions = defaults.options;
var colorSchemes = defaults.colorSchemes;
var Isomer = _dereq_('../../bower_components/isomer/index.js');
var Point = Isomer.Point;

var UnitColumn = _dereq_('../objects/unitcolumn.js');
var Feature = _dereq_('../objects/feature.js');
var VerticalFeature = _dereq_('../objects/verticalfeature.js');
var PathFeature = _dereq_('../objects/pathfeature.js');

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

    var extraHeight = opts.maxH - opts.minH;
    var xyBlocks = bX + bY;

    // the display is x+y block-diagonals across, and x+y diagonals tall
    var bW = xyBlocks * Math.cos(opts.isoAngle);
    var bH = (xyBlocks + (2 * this.wl2bl(extraHeight, true))) * Math.sin(opts.isoAngle);

    // work stuff out.
    var hConstraint = cH / bH;
    var wConstraint = cW / bW;
    opts.isoScale = Math.min(hConstraint, wConstraint) * 0.99; // a 1% allowance

    // position the origin
    var sidePad = Math.max(0, (cW - (opts.isoScale * bW)) / 2);
    var  topPad = Math.max(0, (cH - (opts.isoScale * bH)) / 2);

    opts.isoOriginX = sidePad * 1.01 + ((cW - sidePad - sidePad) * bY / (bX + bY));

    opts.isoOriginY = cH - (topPad * 1.01);

    // rebuild the layers
    this._layers = this.makeLayers();
    this.renderMaybe();
}
// -----------------------------------------------------------------
// init our squares
BaseWorld.prototype.initSquares = function() {
    var sqs = [];
    var opts = this._opts;
    var blocksX = Math.ceil((opts.maxX - opts.minX) / opts.blockSize);
    var blocksY = Math.ceil((opts.maxY - opts.minY) / opts.blockSize);

    for (var x = 0; x < blocksX; x++) {
        sqs.push([]);
        for (var y = 0; y < blocksY; y++) {
            sqs[x].push({
                // here's the default square.
                x: x,
                y: y,
                z: 0,
                ground: [],
                paths: [],
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
// pick out the dom element
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
BaseWorld.prototype.wh2bh = function(altitude) {
    return (this.wl2bl(altitude - this._opts.minH, true));
}
// -----------------------------------------------------------------
// convert world length/delta to a block delta
// set isVertical to true if it's a vertical measurement
BaseWorld.prototype.wl2bl = function(length, isVertical) {
    if (isVertical) {
        return length / this._opts.blockSize * this._opts.scaleH;
    } else {
        return length / this._opts.blockSize * (1 - this._opts.isoGap);
    }
}
// -----------------------------------------------------------------
// convert world coordinates to block coordinates
// set 'delta' to true if your point is a difference or length, in
// which case the result will just get scaled and won't also be
// adjusted to match origins.
BaseWorld.prototype.w2b = function(wPoint, delta) {
    var o = this._opts;
    var scale = 1 / o.blockSize;
    if (delta) {
        return ( wPoint
            .scale(Point.ORIGIN, scale, scale, scale * o.scaleH)
        );
    } else {
        return ( wPoint
            .translate(0 - o.minX, 0 - o.minY, 0 - o.minH)
            .scale(Point.ORIGIN, scale, scale, scale * o.scaleH)
        );
    }
}
// -----------------------------------------------------------------
// get the actual parent block for the given world coords
BaseWorld.prototype.w2block = function(wPoint) {
    return this._block( this.w2b(wPoint) );
}
// -----------------------------------------------------------------
// get the actual parent block for the given block coords
BaseWorld.prototype._block = function(bPoint) {
    if (this._inBlockRange(bPoint)) {
        var bX = Math.floor(bPoint.x);
        var bY = Math.floor(bPoint.y);
        return this._squares[bX][bY];
    } else {
        return false;
    }
}
// -----------------------------------------------------------------
// is this block coord in range?nsooe.log
BaseWorld.prototype._inBlockRange = function(bPoint) {
    return (
           bPoint.x >= 0
        && bPoint.x < this._squares.length
        && bPoint.y >= 0
        && bPoint.y < this._squares.length
    );
}
// -----------------------------------------------------------------
// add a feature at world coords.  The z / height element is ignored
BaseWorld.prototype.feature = function(wPoint, feature) {
    var bP = this.w2b(wPoint);

    // dodgy undifferentiated feature..
    if (!feature) {
        feature = new VerticalFeature(bP);
    }

    this._addFeature(bP, feature);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// add a path that follows the points given.
BaseWorld.prototype.addPath = function(points, width, type) {
    var p1, p2;
    var w = this.wl2bl(width);
    var c = this.getColor(type);
    for (var p=1; p < points.length; p++) {
        p1 = this.w2b(points[p-1]);
        p2 = this.w2b(points[p]);
        this._pathBetween(p1, p2, w, c);
    }
}
// -----------------------------------------------------------------
// add a path that follows the points given.
BaseWorld.prototype._pathBetween = function(from, to, width, color) {

    var currB = this._block(from);
    var currP = new Point(currB.x, currB.y, 0);

    var w = Math.min(1, width);

    var finalB = this._block(to);
    var finalP = new Point(finalB.x, finalB.y, 0);

    // TODO: check for valid positions

    // Bresenham's line drawing algo, from here https://gist.github.com/hexusio/5079147
    var toX = finalB.x;
    var toY = finalB.y;
    var currX = currB.x;
    var currY = currB.y;
    var nextX = currX;
    var nextY = currY;

    var diffX = Math.abs(toX - currX);
    var diffY = Math.abs(toY - currY);
    var stepX = currX < toX ? 1 : -1;
    var stepY = currY < toY ? 1 : -1;
    var err = diffX - diffY;
    var e2, prevDir, nextDir;

    while(currX != toX || currY != toY) {
        // take a step
        e2 = 2 * err;
        if (e2 >- diffY) {
            err = err - diffY;
            nextX = currX + stepX;
            oldDir = stepX < 0 ? '-x' : '+x';
            newDir = stepX < 0 ? '+x' : '-x';
        } else if (e2 < diffX) {
            err = err + diffX;
            nextY = currY + stepY;
            oldDir = stepY < 0 ? '-y' : '+y';
            newDir = stepY < 0 ? '+y' : '-y';
        }

        // path on the old block
        currB.paths.push(new PathFeature(currP, currB, w, oldDir, color));

        // update the block
        currB = this._block(new Point(nextX, nextY));
        currP = new Point(currB.x + 0.5, currB.y + 0.5, 0);

        // path on the new block
        currB.paths.push(new PathFeature(currP, currB, w, newDir, color));

        // update the x and y
        currX = nextX;
        currY = nextY;
    }

    this.renderMaybe();
}
// -----------------------------------------------------------------
// adds a feature to the appropriate square.  sets the feature's parent.
BaseWorld.prototype._addFeature = function(bPoint, feature) {
    if (this._inBlockRange(bPoint)) {
        var sq = this._block(bPoint);
        sq.features.push(feature);
        feature.parent(sq);

        // sort the features for display..
        if (this._opts.featurePosition == 'line') {
            // ..by height
            sq.features.sort( function(a, b) {
                return (b.h - a.h);
            });
        } else {
            // ..by nearness
            sq.features.sort( function(a, b) {
                return (b.origin().depth() - a.origin().depth());
            });
        }
    }
}
// -----------------------------------------------------------------
// set the ground level and/or soil stack.
// .ground(<Point>) will set the ground level.
// .ground(<Point>, <Array>) will set both the ground level and the
//     soil stack.
// .ground(<Num1>, <Num2>, <Array>) will set the soil stack at
//     (Num1, Num2) without affecting the ground level.
BaseWorld.prototype.ground = function() {

    if (arguments.length == 1) {
        // single arg, should be a Point to set ground level from
        this._setGroundLevel( this.w2b(arguments[0]) );
    }
    if (arguments.length == 2) {
        // two args, should be a point and a soil stack
        this._setGroundLevel( this.w2b(arguments[0]) );
        this._setGroundStack( this.w2b(arguments[0]), arguments[1] );
    }
    if (arguments.length == 3) {
        // three args, should be x, y, soilStack
        var wP = new Point(arguments[0], arguments[1], 0);
        this._setGroundStack( this.w2b(wP), arguments[2] );
    }
    this.renderMaybe();
}
// -----------------------------------------------------------------
// turn an array of type/depth e.g. ['water', 2, sand', 1, 'soil']
// into an array of ground blocks
BaseWorld.prototype._listToStack = function(list, bP) {

    var listPos, color, thickness;
    var stack = [];
    var height = 0;

    for (listIndex = 0; listIndex < list.length; listIndex = listIndex + 2) {
        // list[listIndex] is the type of this layer
        color = this.getColor(list[listIndex]);

        // list[listIndex + 1] is the thickness of the layer
        if (listIndex < list.length - 1) {
            thickness = this.wl2bl( list[listIndex + 1], true );
        } else {
            thickness = height - this.wh2bh( this._opts.bedrockH );
        }
        if (thickness > 0) {
            height -= thickness;
            column = new UnitColumn(bP.x, bP.y, height, thickness, color);
            stack.unshift(column);
        }
    }
    return stack;
}
// -----------------------------------------------------------------
// set ground level at block point.  It's okay to set levels outside
// the world area, they'll still affect the height of blocks inside
// the area.
BaseWorld.prototype._setGroundLevel = function(bP) {
    this._groundHeight.push( bP );
}
// -----------------------------------------------------------------
// set ground stack for a block.
// setting will set from bedrock up to altitude in specified color
BaseWorld.prototype._setGroundStack = function(bP, list) {
    if (this._inBlockRange(bP)) {
        this._groundStacks.push({ x: bP.x, y: bP.y, ground: this._listToStack(list, bP) });
        this._extrapolateGround();
        return true;
    } else {
        return false;
    }
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquare = function(x, y) {
    this.renderSquareGround(x, y);
    this.renderSquarePaths(x, y);
    this.renderSquareFeatures(x, y);
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquareFeatures = function(x, y) {

    var sq = this._squares[x][y];

    if (sq !== undefined) {
        if (sq.features && sq.features.length > 0) {
            if (this._opts.featurePosition == 'line') {
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
                    feature.renderAt(this._layers.fg, new Point(x + step, y + 1 - gap - step, sq.z), this._opts);
                }
            } else {
                // featurePosition == 'accurate'
                var f, feature;
                for (f=0; f < sq.features.length; f++) {
                    sq.features[f].render(this._layers.fg, this._opts);
                }
            }
        }
    }
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquarePaths = function(x, y) {

    var sq = this._squares[x][y];

    if (sq !== undefined) {
        if (sq.paths && sq.paths.length > 0) {
            var p, path;
            for (p=0; p < sq.paths.length; p++) {
                path = sq.paths[p];
                path.render(this._layers.fg, this._opts);
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
            bedrockZ = this.wh2bh(this._opts.bedrockH);
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
    var gH = this.wh2bh(this._opts.maxHeight) + 0.33;

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
            new Point(0, gY+0.01, gH),
            new Point(0, gY-0.01, gH),
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
    if (this._opts.showAxes) {
        var axL = 100;   // axis length, in blocks
        var axW = 0.01;  // axis width, in blocks
        var Pt = Isomer.Point;
        var axC = new Isomer.Color(255,0,0);
        this._layers.fg.add(new Isomer.Path([new Pt(0,axW,0), new Pt(0,0-axW,0), new Pt(axL,0,0)]), axC);
        this._layers.fg.add(new Isomer.Path([new Pt(0-axW,0,0), new Pt(axW,0,0), new Pt(0,axL,0)]), axC);
        this._layers.fg.add(new Isomer.Path([new Pt(0-axW,axW,0), new Pt(axW,0-axW,0), new Pt(0,0,axL)]), axC);
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
// copy a ground column between squares
BaseWorld.prototype._copyGround = function(from, to) {
    var newLayer;
    var fromZ = from.z;
    var aboveBedrock = to.z - this.wh2bh(this._opts.bedrockH);

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
// extrapolate all the ground columns and altitudes
BaseWorld.prototype._extrapolateGround = function() {
    var sqs = this._squares;
    var maxX = sqs.length;
    var maxY = sqs[0].length;
    var bx, by;

    for (bx = 0; bx < maxX; bx++) { for (by = 0; by < maxY; by++) {
        this._extrapolateGroundForSquare(sqs[bx][by]);
    }}
    this.renderMaybe();

}
// -----------------------------------------------------------------
// extrapolate all the ground columns and altitudes
BaseWorld.prototype._extrapolateGroundForSquare = function(sq) {

    // vars we use in both things
    var dx, dy, dist;

    // work out an average altitude
    var h, hAlt, voteSize;
    var sqAlt = 0;
    var votes = 0;
    for (var gh=0; gh < this._groundHeight.length; gh++) {
        h = this._groundHeight[gh];
        dx = sq.x + 0.5 - h.x;
        dy = sq.y + 0.5 - h.y;
        dist = 1 + dx*dx + dy*dy;
        voteSize = 1 / dist;
        sqAlt += h.z * voteSize;
        votes += voteSize;
    }
    sqAlt = sqAlt / votes;
    // round to the nearest stepH
    var rnd = this.wl2bl(this._opts.stepH, true);
    sq.z = Math.round(sqAlt / rnd) * rnd;

    // copy nearest ground stack
    var maxX = this._squares.length;
    var maxY = this._squares[0].length;
    var bestDist, candidate, bestCandidate;
    var bestDist = maxX * maxX + maxY * maxY;
    for (var gs = 0; gs < this._groundStacks.length; gs++) {
        candidate = this._groundStacks[gs];
        dx = sq.x + 0.5 - candidate.x;
        dy = sq.y + 0.5 - candidate.y;
        dist = dx*dx + dy*dy;
        if (dist < bestDist) {
            bestDist = dist;
            bestCandidate = candidate;
        }
    }
    if (bestCandidate) {
        this._copyGround(bestCandidate, sq);
    }

    // finally, reparent all this square's features
    for (var f=0; f < sq.features.length; f++) {
        sq.features[f].parent(sq);
    }

}
// -----------------------------------------------------------------
// -----------------------------------------------------------------
module.exports = BaseWorld;

},{"../../bower_components/isomer/index.js":1,"../objects/feature.js":12,"../objects/pathfeature.js":14,"../objects/unitcolumn.js":18,"../objects/verticalfeature.js":19,"../util/shims.js":22,"./worlddefaults.js":26}],25:[function(_dereq_,module,exports){

_dereq_('../util/shims');

var BaseWorld = _dereq_('./baseworld');
var Tree = _dereq_('../objects/tree');
var LeafTrap = _dereq_('../objects/leaftrap');
var SoilPit = _dereq_('../objects/soilpit');
var Dendrometer = _dereq_('../objects/dendrometer');
var Crane = _dereq_('../objects/towercrane');

// -----------------------------------------------------------------
// -----------------------------------------------------------------
function ForestWorld(domElement, options) {
    // invoke our super constructor thingy
    BaseWorld.call(this, domElement, options);

    if (options.treeType) {
        this._treeType = options.treeType;
    }
}
// -----------------------------------------------------------------
// inheritance
ForestWorld.prototype = Object.create(BaseWorld.prototype);
ForestWorld.prototype.constructor = ForestWorld;
// -----------------------------------------------------------------
// real object methods..
// -----------------------------------------------------------------
ForestWorld.prototype.tree = function(location, width, height, special) {

    var pos = this.w2b(location);

    var bW = this.wl2bl(width);
    var bH = this.wl2bl(height, true);
    var type = this._treeType;

    if (type && type == 'stump') {
        // make stumps all 2.5m tall
        bH = this.wl2bl(2.5, true);
    }
    if (type && type == 'stump' && special) {
        bH = this.wl2bl(15, true);
    }

    var leftc = this.getColor('ui');
    var rightc = this.getColor('polywhite');
    if (special == 'left') { this._addFeature(
            pos, new Tree(pos, null, bW, bH, leftc, leftc, type)
    ); } else if (special == "right") { this._addFeature(
            pos, new Tree(pos, null, bW, bH, rightc, rightc, type)
    ); } else {
        this._addFeature(
            pos, new Tree(pos, null, bW, bH, this.getColor('wood'), this.getColor('foliage'), type)
        );
    }
}
// -----------------------------------------------------------------
ForestWorld.prototype.leafTrap = function(location) {
    var pos = this.w2b(location);
    var w = this.wl2bl(1.5);
    var h = this.wl2bl(2, true);
    var trap = new LeafTrap(pos, null, h, w, this.getColor('leaftrap'), this.getColor('steel'));

    this._addFeature(pos, trap);
}
// -----------------------------------------------------------------
ForestWorld.prototype.soilPit = function(location) {
    var pos = this.w2b(location);
    var boxsize = this.wl2bl(1);
    var h = this.wl2bl(2, true);
    var pit = new SoilPit(pos, null, h, boxsize, this.getColor('polywhite'));

    this._addFeature(pos, pit);
}
// -----------------------------------------------------------------
ForestWorld.prototype.dendrometer = function(location, diameter) {
    var pos = this.w2b(location);
    var h = this.wl2bl(2, true);       // height off ground
    var diam = this.wl2bl(diameter);   // diameter of tree
    var width = this.wl2bl(0.5, true); // width of band
    var dendro = new Dendrometer(pos, null, h, diam, width, this.getColor('steel'), this.getColor('polywhite'));

    this._addFeature(pos, dendro);
}
// -----------------------------------------------------------------
ForestWorld.prototype.crane = function(location, height, boomLength) {
    var width = this.wl2bl(3);            // width of tower
    var pos = this.w2b(location.translate(-1.5 * width, -1.5 * width, 0));
                                          // use the front corner to find the parent block
    var h = this.wl2bl(height, true);     // tower height
    var booml = this.wl2bl(boomLength);   // boom length
    var base = new Crane.Base(pos, null, h, width, this.getColor('metal'), this.getColor('concrete'), this.getColor('polywhite'));
    // var boom = new Crane.Boom(pos, null, h, booml, width, 0, this.getColor('metal'), this.getColor('polywhite'));

    this._addFeature(pos, base);
    // this._addFeature(pos, boom);
}
// -----------------------------------------------------------------
module.exports = ForestWorld;

},{"../objects/dendrometer":11,"../objects/leaftrap":13,"../objects/soilpit":15,"../objects/towercrane":16,"../objects/tree":17,"../util/shims":22,"./baseworld":24}],26:[function(_dereq_,module,exports){

var Color = _dereq_('../../bower_components/isomer/index.js').Color;
var Point = _dereq_('../../bower_components/isomer/index.js').Point;

var defaultOptions = {
    autoRender: true,    // re-draw the world when anything changes
    autoSize:   true,    // work out block size to fill the canvas

    minX:          0,    // bounds
    maxX:         10,    // bounds

    minY:          0,    // bounds
    maxY:         10,    // bounds

    maxH:          5,    // max height of interesting features (used to auto-size)
    minH:         -8,    // minimum height of interesting features (used to auto-size)
    scaleH:        1,    // how many altitude units to a ground co-ord unit?
    stepH:         0.1,  // round ground heights to the nearest 0.25 of a world unit
    bedrockH:    -16,    // how far down to stop drawing the ground

    featurePosition: 'accurate',

    colorScheme: 'bright',

    blockSize:     1,    // how many 'world' units long is one side of a block?
    isoGap:        0.05, // gap to leave between blocks

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
        'blank': new Color(180,180,180, 0.05),
        'soil': new Color(110, 50, 35),
        'sand': new Color(230, 200, 20),
        'leaflitter': new Color(90, 110, 50),
        'water': new Color(50, 200, 255, 0.75),
        'wood': new Color(90, 50, 20),
        'foliage': new Color(90, 200, 50, 0.66),
        'gravel': new Color(120, 135, 180),
        'leaftrap': new Color(50, 50, 50, 0.9),
        'polywhite': new Color(190, 190, 190),
        'concrete': new Color(130, 130, 130),
        'steel': new Color(170, 180, 220),
        'metal': new Color(60, 60, 80),
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
        'gravel': new Color(120, 135, 180),
        'leaftrap': new Color(50, 50, 50),
        'polywhite': new Color(200, 200, 200),
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