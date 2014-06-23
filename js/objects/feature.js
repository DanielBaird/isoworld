
var Isomer = require('../../bower_components/isomer/index.js');
var Point = Isomer.Point;

// -----------------------------------------------------------------
function Feature(bPoint, width, color, parent) {

    this.origin = new Point(bPoint.x, bPoint.y, bPoint.z);
    this.w = width;
    this.parent(parent); // backreference to parent block

    if (color instanceof Isomer.Color) {
        this.c = color;
    } else {
        this.c = new Isomer.Color(255, 255, 0);
    }
}
// -----------------------------------------------------------------
// set or get parent block
Feature.prototype.parent = function(parent) {
    if (parent !== undefined) {
        this.p = parent;
        this.origin.z = parent.z;
    }
    return this.p;
}
// -----------------------------------------------------------------
// set of get width
Feature.prototype.width = function(width) {
    if (width !== undefined) {
        this.w = width;
    }
    return this.w;
}
// -----------------------------------------------------------------
Feature.prototype.render = function(iso, opts) {
    this.renderAt(iso, this.origin, opts);
}
// -----------------------------------------------------------------
Feature.prototype.renderAt = function(iso, center, opts) {
    iso.add(
        new Isomer.Path.Star(center, this.w/6, this.w/2, 11),
        this.c
    );
}
// -----------------------------------------------------------------
module.exports = Feature;
