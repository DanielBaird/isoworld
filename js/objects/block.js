
var Isomer = require('../../bower_components/isomer/index.js');
var Point = Isomer.Point;
var Prism = Isomer.Shape.Prism;

// -----------------------------------------------------------------
function Block(centerX, centerY, bottomZ, w, h, color) {
    this.cX = centerX;
    this.cY = centerY;
    this.bZ = bottomZ;

    var halfW = w / 2;
    this.x = centerX - halfW;
    this.y = centerY - halfW;
    this.z = bottomZ;
    this.w = w;
    this.h = h;

    this.color = color;
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