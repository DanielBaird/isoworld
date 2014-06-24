
var Feature = require('./feature');
var Isomer = require('../../bower_components/isomer');

// -----------------------------------------------------------------
// construction
// -----------------------------------------------------------------
function VerticalFeature(origin, parent, height) {
    Feature.call(this, origin, parent);
    this.h = height;
}
// -----------------------------------------------------------------
// inheritance
VerticalFeature.prototype = Object.create(Feature.prototype);
VerticalFeature.prototype.constructor = VerticalFeature;
// -----------------------------------------------------------------
// implementation
// -----------------------------------------------------------------
VerticalFeature.prototype.render = function(iso, opts) {
    this.renderAt(iso, this._origin, opts);
}
// -----------------------------------------------------------------
VerticalFeature.prototype.renderAt = function(iso, center, opts) {
    var width = 0.25;
    var color = new Isomer.Color(255,255,0);
    var shape = Isomer.Shape.extrude(
        new Isomer.Path.Star(center, width/6, width/2, 11),
        this.h
    );
    iso.add(shape, color);
}
// -----------------------------------------------------------------
module.exports = VerticalFeature;
