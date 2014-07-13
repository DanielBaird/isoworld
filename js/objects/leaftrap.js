
var VerticalFeature = require('./verticalfeature');
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
var InvPyramid = require('../shapes/invpyramid');
var Cone = require('../shapes/cone');
var Cylinder = Isomer.Shape.Cylinder;

// -----------------------------------------------------------------
function LeafTrap(origin, parent, height, width, color) {
    VerticalFeature.call(this, origin, parent, height);
    this.w = width;
    this.c = color;
}
// -----------------------------------------------------------------
// inheritance
LeafTrap.prototype = Object.create(VerticalFeature.prototype);
LeafTrap.prototype.constructor = LeafTrap;
// -----------------------------------------------------------------
LeafTrap.prototype.renderAt = function(iso, center, opts) {

    center = center.translate(0,0,5);

    console.log('drawing leaf trap at ', center);

    var halfw = this.w/2;
    var poler = this.w/12;
    var poledist = halfw - poler;
    var catcherh = this.h * 4/5;

    // upside down pyramid with supporting poles in each corner
    var polePt1 = center.translate(halfw, -1 * halfw, 0);
    var polePt2 = center.translate(-1 * halfw, halfw, 0);
    var catcherPt = center.translate(-1 * halfw, -1 * halfw, this.h - catcherh);

    iso.add(new Cone(catcherPt, this.w, 10, catcherh), this.c);
    // iso.add(new InvPyramid(catcherPt, this.w, this.w, catcherh), this.c);
    iso.add(new Cylinder(polePt1, poler, 5, this.h), this.c);
    iso.add(new Cylinder(polePt2, poler, 5, this.h), this.c);

    // iso.add(
    //     new Cylinder(center, this.w / 2, 10, this.h * trunkHeightRatio),
    //     this.cTrunk
    // );

}
// -----------------------------------------------------------------
module.exports = LeafTrap;
