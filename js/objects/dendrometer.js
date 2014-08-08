
var VerticalFeature = require('./verticalfeature');
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;
var Cylinder = Isomer.Shape.Cylinder;
var Cone = require('../shapes/cone');
var Ring = require('../shapes/ring');

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
