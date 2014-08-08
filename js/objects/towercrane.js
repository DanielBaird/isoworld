
var VerticalFeature = require('./verticalfeature');
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;
var Prism = Isomer.Shape.Prism;
var Cylinder = Isomer.Shape.Cylinder;
var Ring = require('../shapes/ring');
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
