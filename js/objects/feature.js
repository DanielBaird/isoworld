
var Isomer = require('../../bower_components/isomer/index.js');
var Point = Isomer.Point;

// -----------------------------------------------------------------
function Feature(bPoint, parent) {
    this.origin(bPoint);
    this.parent(parent); // backreference to parent block
}
// -----------------------------------------------------------------
// set or get the "origin" point for the feature (block coords)
Feature.prototype.origin = function(origin) {
    if (origin !== undefined) {
        var pt = new Isomer.Point(origin.x, origin.y, origin.z);
        this._origin = origin;
    }
    return this._origin;
}
// -----------------------------------------------------------------
// set or get parent block
Feature.prototype.parent = function(parent) {
    if (parent !== undefined) {
        this.p = parent;
        this._origin.z = parent.z;
    }
    return this.p;
}
// -----------------------------------------------------------------
Feature.prototype.render = function(iso, opts) {
    this.renderAt(iso, this._origin, opts);
}
// -----------------------------------------------------------------
Feature.prototype.renderAt = function(iso, center, opts) {
    var width = 0.25;
    var color = new Isomer.Color(255,255,0);
    iso.add(
        new Isomer.Path.Star(center, width/6, width/2, 11),
        color
    );
}
// -----------------------------------------------------------------
module.exports = Feature;
