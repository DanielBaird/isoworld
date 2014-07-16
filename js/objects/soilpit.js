
var VerticalFeature = require('./verticalfeature');
var Isomer = require('../../bower_components/isomer');
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
