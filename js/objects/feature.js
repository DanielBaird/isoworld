
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;

// -----------------------------------------------------------------
function Feature(origin, parent) {
    this.origin(origin);
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
    if (parent) {
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
    var width = 0.75;
    var color = new Isomer.Color(255,0,255);
    iso.add(
        new Isomer.Path.Star(center, width/6, width/2, 7),
        color
    );
}
// -----------------------------------------------------------------
module.exports = Feature;
