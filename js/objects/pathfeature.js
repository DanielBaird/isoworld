
var Feature = require('./feature');
var Isomer = require('../../bower_components/isomer');

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
        pc.translate(hw,   hw,   0),
        pc.translate(hw,   0-hw, 0),
        pc.translate(0-hw, 0-hw, 0),
        pc.translate(0-hw, hw,   0)
    ];
    if (this.dir == '+x') {
        points[0] = pc.translate(0.5 - opts.isoGap, hw,   0);
        points[1] = pc.translate(0.5 - opts.isoGap, 0-hw, 0);
    }
    if (this.dir == '-x') {
        points[2] = pc.translate(-0.5, 0-hw, 0);
        points[3] = pc.translate(-0.5, hw,   0);
    }
    if (this.dir == '+y') {
        points[0] = pc.translate(hw,   0.5 - opts.isoGap, 0);
        points[3] = pc.translate(0-hw, 0.5 - opts.isoGap, 0);
    }
    if (this.dir == '-y') {
        points[1] = pc.translate(hw,   -0.5, 0);
        points[2] = pc.translate(0-hw, -0.5, 0);
    }
    iso.add(new Isomer.Path(points), this.c);
}
// -----------------------------------------------------------------
PathFeature.prototype.renderAt = function(iso, center, opts) {
    // can't render at a point.  so just do a normal render.
    this.render(iso, opts);
}
// -----------------------------------------------------------------
module.exports = PathFeature;
