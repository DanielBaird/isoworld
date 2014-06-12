
var Isomer = require('../../bower_components/isomer/index.js');
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