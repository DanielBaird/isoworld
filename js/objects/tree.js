
var Feature = require('./feature');
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
var Cylinder = Isomer.Shape.Cylinder;


// TODO this is debugging
var defaultType;
var pick = Math.random();
var types = 'pointy cylindrical stump combination random'.split(' ');
defaultType = types[Math.floor(Math.random() * types.length)];
// override random tree type..
// defaultType = 'cylindrical';
defaultType = 'random';

// -----------------------------------------------------------------
function Tree(fX, fY, width, height, trunkColor, leafColor) {
    Feature.call(this, fX, fY, width, trunkColor);
    this.h = height;
    this.cLeaf = leafColor;

    // TODO remove this debug thing
    this.type = defaultType;
}
// -----------------------------------------------------------------
// inheritance
Tree.prototype = Object.create(Feature.prototype);
Tree.prototype.constructor = Tree;
// -----------------------------------------------------------------
Tree.prototype.renderAt = function(iso, center, opts) {

    var type = this.type;
    if (type == 'random') {
        var randList = [].concat(types);
        randList.splice(types.indexOf('stump'), 1);
        randList.splice(types.indexOf('random'), 1);
        type = randList[Math.floor(Math.random() * randList.length)];
    }

    if (type == 'pointy') {

        var trunkHeightRatio = 4/5;
        var foliageWidthRatio = 2;
        var foliageHeightRatio = 4/5;
        var foliageStartRatio = 1/5;

        var offset = 0 - (this.w/1.41);
        var centre = new Point( center[0], center[1], center[2] );
        var treePt = centre.translate(offset, offset, 0);
        var foliagePt = centre.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );
        // draw the trunk
        iso.add(
            new Pyramid(treePt, this.w, this.w, this.h * trunkHeightRatio),
            this.c
        );
        // draw the foliage
        iso.add(
            new Pyramid(foliagePt, this.w * foliageWidthRatio, this.w * foliageWidthRatio, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (type == 'cylindrical') {

        var trunkHeightRatio = 1/3;
        var foliageWidthRatio = 2;
        var foliageHeightRatio = 2/3;
        var foliageStartRatio = 1/3;

        var offset = 0 - (this.w/2);
        var trunkOrigin = new Point( center[0], center[1], center[2] );
        var leafOrigin = trunkOrigin.translate(0, 0, this.h * foliageStartRatio);
        // draw the trunk
        iso.add(
            new Cylinder(trunkOrigin, this.w / 2, 10, this.h * trunkHeightRatio),
            this.c
        );
        // draw the foliage
        iso.add(
            new Cylinder(leafOrigin, this.w * foliageWidthRatio / 2, 10, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (type == 'stump') {

        var radius = this.w;

        var offset = 0 - radius;
        var trunkOrigin = new Point( center[0], center[1], center[2] );
        iso.add(
            new Cylinder(trunkOrigin, radius, 33, 0.2),
            this.c
        );
    }

    if (type == 'combination') {

        var trunkHeightRatio = 1/5;
        var foliageWidthRatio = 2;
        var foliageHeightRatio = 4/5;
        var foliageStartRatio = 1/5;

        var offset = 0 - (this.w/2);
        var trunkOrigin = new Point( center[0], center[1], center[2] );
        var leafOrigin = trunkOrigin.translate(0, 0, this.h * foliageStartRatio);
        var foliageOrigin = trunkOrigin.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );

        // draw the trunk
        iso.add(
            new Cylinder(trunkOrigin, this.w / 2, 10, this.h * trunkHeightRatio),
            this.c
        );
        // draw the foliage
        iso.add(
            new Pyramid(foliageOrigin, this.w * foliageWidthRatio, this.w * foliageWidthRatio, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

}
// -----------------------------------------------------------------
module.exports = Tree;
