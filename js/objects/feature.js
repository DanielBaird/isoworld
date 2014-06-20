
var Isomer = require('../../bower_components/isomer/index.js');
var Point = Isomer.Point;

// -----------------------------------------------------------------
function Feature(fX, fY, width, color) {
    this.w = width;

    this.fX = fX;
    this.fY = fY;

    if (color instanceof Isomer.Color) {
        this.c = color;
    } else {
        this.c = new Isomer.Color(255, 255, 0);
    }
}
// -----------------------------------------------------------------
Feature.prototype.width = function(width) {
    if (width !== undefined) {
        this.w = width;
    }
    return this.w;
}
// -----------------------------------------------------------------
Feature.prototype.renderAtZ = function(iso, z, opts) {
    this.renderAt(iso, [this.fX, this.fY, z], opts);
}
// -----------------------------------------------------------------
Feature.prototype.renderAt = function(iso, center, opts) {
    var at = new Point( center[0], center[1], center[2] );
    iso.add(
        new Isomer.Path.Star(at, this.w/6, this.w/2, 11),
        this.c
    );
}
// -----------------------------------------------------------------
module.exports = Feature;
