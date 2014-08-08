
var VerticalFeature = require('./verticalfeature');
var Isomer = require('../../bower_components/isomer');
var Point = Isomer.Point;
var Pyramid = Isomer.Shape.Pyramid;
var Cylinder = Isomer.Shape.Cylinder;
var Cone = require('../shapes/cone');
var Ring = require('../shapes/ring');

// TODO this is debugging
var defaultType;
var pick = Math.random();
var types = 'pointy cylindrical stump combination umbrella random'.split(' ');
defaultType = types[Math.floor(Math.random() * types.length)];
// override random tree type..
defaultType = 'umbrella';
// defaultType = 'random';

// -----------------------------------------------------------------
function Tree(origin, parent, width, height, trunkColor, leafColor, type) {
    VerticalFeature.call(this, origin, parent, height);
    this.w = width;
    this.cTrunk = trunkColor;
    this.cLeaf = leafColor;

    // TODO remove this debug thing
    this.type = defaultType;
    if (type) this.type = type;
}
// -----------------------------------------------------------------
// inheritance
Tree.prototype = Object.create(VerticalFeature.prototype);
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

        var trunkHeightRatio = 2/3;
        var foliageWidthRatio = 4;
        var foliageHeightRatio = 2/3;
        var foliageStartRatio = 1/3;

        var offset = 0 - (this.w/1.41);
        var treePt = center.translate(offset, offset, 0);
        var foliagePt = center.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );
        // draw the trunk
        iso.add(
            new Pyramid(treePt, this.w, this.w, this.h * trunkHeightRatio),
            this.cTrunk
        );
        // draw the foliage
        iso.add(
            new Pyramid(foliagePt, this.w * foliageWidthRatio, this.w * foliageWidthRatio, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (type == 'cylindrical' || type == 'umbrella') {

        var trunkHeightRatio = 2/3;
        var foliageWidthRatio = 5;
        var foliageStartRatio = 2/3;
        var foliageHeightRatio = 1/3;

        if (type == 'umbrella') {
            foliageWidthRatio = 13;
            trunkHeightRatio = 3/4;
            foliageStartRatio = 3/4;
            foliageHeightRatio = 1/4;
        }

        var radius = this.w * 1;
        var leafOrigin = center.translate(0, 0, this.h * foliageStartRatio);

        // draw the trunk
        iso.add(
            new Cylinder(center, radius, 22, this.h * trunkHeightRatio),
            this.cTrunk
        );
        // draw the foliage
        var fr = radius * foliageWidthRatio;
        var sides = 5 + fr * 22;
        iso.add(
            new Cylinder(leafOrigin, radius * foliageWidthRatio, sides, this.h * foliageHeightRatio),
            this.cLeaf
        );
    }

    if (type == 'canopytop') {

        var trunkHeightRatio = 1/2;
        var foliageWidthRatio = 10;
        var foliageStartRatio = trunkHeightRatio - 1/10;
        var foliageHeightRatio = 1 - foliageStartRatio;

        var radius = this.w * 0.5;

        var fRadius = radius * foliageWidthRatio;
        var fH = this.h * foliageHeightRatio; // foliage height
        var fLowH = fH * 4/6;
        var fLowPt = center.translate(0, 0, this.h * foliageStartRatio);
        var fMidH = fH * 1/6;
        var fMidPt = fLowPt.translate(0, 0, fLowH);
        var fTopH = fH * 1/6;
        var fTopPt = fMidPt.translate(0, 0, fMidH);


        // draw the trunk
        iso.add(
            new Ring(center, radius, 11, this.h * trunkHeightRatio),
            this.cTrunk
        );
        // draw the foliage
        var sides = 5 + fr * 22;
        iso.add(new Cone.Inverted.Open(fLowPt, fRadius, sides, fLowH), this.cLeaf);
        iso.add(new Cylinder(fMidPt, fRadius, sides, fMidH), this.cLeaf);
        iso.add(new Cone.Open(fTopPt, fRadius, sides, fTopH), this.cLeaf);
    }

    if (type == 'stump') {
        var radius = this.w;
        iso.add(new Cylinder(center, radius, 33, this.h), this.cTrunk);
    }

    if (type == 'combination') {

        var trunkHeightRatio = 1/5;
        var foliageWidthRatio = 2;
        var foliageHeightRatio = 4/5;
        var foliageStartRatio = 1/5;

        var offset = 0 - (this.w/2);
        var foliageOrigin = center.translate(
            offset * foliageWidthRatio,
            offset * foliageWidthRatio,
            this.h * foliageStartRatio
        );

        // draw the trunk
        iso.add(
            new Cylinder(center, this.w / 2, 10, this.h * trunkHeightRatio),
            this.cTrunk
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
