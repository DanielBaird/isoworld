
var Feature = require('./feature');
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
// -----------------------------------------------------------------
var trunkHeightRatio = 4/5;
var foliageWidthRatio = 1.5;
var foliageHeightRatio = 4/5;
var foliageStartRatio = 1/5;
// -----------------------------------------------------------------
function Tree(width, height, trunkColor, leafColor) {
    Feature.call(this, width, trunkColor);
    this.h = height;
    this.cLeaf = leafColor;
}
// -----------------------------------------------------------------
// inheritance
Tree.prototype = Object.create(Feature.prototype);
Tree.prototype.constructor = Tree;
// -----------------------------------------------------------------
Tree.prototype.render = function(iso, center, opts) {
    var negRadius = 0 - (this.w/2);
    var centre = new Point( center[0], center[1], center[2] );
    var treePt = centre.translate(negRadius, negRadius, 0);
    var foliagePt = centre.translate(
        negRadius * foliageWidthRatio,
        negRadius * foliageWidthRatio,
        this.h * foliageStartRatio
    );
    iso.add(
        new Pyramid(treePt, this.w, this.w, this.h * trunkHeightRatio),
        this.c
    );
    iso.add(
        new Pyramid(foliagePt, this.w * foliageWidthRatio, this.w * foliageWidthRatio, this.h * foliageHeightRatio),
        this.cLeaf
    );
    // chuck on a couple of leaf sections


}
// -----------------------------------------------------------------
module.exports = Tree;
