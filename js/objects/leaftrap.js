
var VerticalFeature = require('./verticalfeature');
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
var Cylinder = Isomer.Shape.Cylinder;
var Cone = require('../shapes/cone');
var Ring = require('../shapes/ring');

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
