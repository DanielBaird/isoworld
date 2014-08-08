
require('../util/shims');

var BaseWorld = require('./baseworld');
var Tree = require('../objects/tree');
var LeafTrap = require('../objects/leaftrap');
var SoilPit = require('../objects/soilpit');
var Dendrometer = require('../objects/dendrometer');
var Crane = require('../objects/towercrane');

// -----------------------------------------------------------------
// -----------------------------------------------------------------
function ForestWorld(domElement, options) {
    // invoke our super constructor thingy
    BaseWorld.call(this, domElement, options);

    if (options.treeType) {
        this._treeType = options.treeType;
    }
}
// -----------------------------------------------------------------
// inheritance
ForestWorld.prototype = Object.create(BaseWorld.prototype);
ForestWorld.prototype.constructor = ForestWorld;
// -----------------------------------------------------------------
// real object methods..
// -----------------------------------------------------------------
ForestWorld.prototype.tree = function(location, width, height, special) {

    var pos = this.w2b(location);

    var bW = this.wl2bl(width);
    var bH = this.wl2bl(height, true);
    var type = this._treeType;

    if (type && type == 'stump') {
        // make stumps all 2.5m tall
        bH = this.wl2bl(2.5, true);
    }
    if (type && type == 'stump' && special) {
        bH = this.wl2bl(15, true);
    }

    var leftc = this.getColor('ui');
    var rightc = this.getColor('polywhite');
    if (special == 'left') { this._addFeature(
            pos, new Tree(pos, null, bW, bH, leftc, leftc, type)
    ); } else if (special == "right") { this._addFeature(
            pos, new Tree(pos, null, bW, bH, rightc, rightc, type)
    ); } else {
        this._addFeature(
            pos, new Tree(pos, null, bW, bH, this.getColor('wood'), this.getColor('foliage'), type)
        );
    }
}
// -----------------------------------------------------------------
ForestWorld.prototype.leafTrap = function(location) {
    var pos = this.w2b(location);
    var w = this.wl2bl(1.5);
    var h = this.wl2bl(2, true);
    var trap = new LeafTrap(pos, null, h, w, this.getColor('leaftrap'), this.getColor('steel'));

    this._addFeature(pos, trap);
}
// -----------------------------------------------------------------
ForestWorld.prototype.soilPit = function(location) {
    var pos = this.w2b(location);
    var boxsize = this.wl2bl(1);
    var h = this.wl2bl(2, true);
    var pit = new SoilPit(pos, null, h, boxsize, this.getColor('polywhite'));

    this._addFeature(pos, pit);
}
// -----------------------------------------------------------------
ForestWorld.prototype.dendrometer = function(location, diameter) {
    var pos = this.w2b(location);
    var h = this.wl2bl(2, true);       // height off ground
    var diam = this.wl2bl(diameter);   // diameter of tree
    var width = this.wl2bl(0.5, true); // width of band
    var dendro = new Dendrometer(pos, null, h, diam, width, this.getColor('steel'), this.getColor('polywhite'));

    this._addFeature(pos, dendro);
}
// -----------------------------------------------------------------
ForestWorld.prototype.crane = function(location, height, boomLength) {
    var width = this.wl2bl(3);            // width of tower
    var pos = this.w2b(location.translate(-1.5 * width, -1.5 * width, 0));
                                          // use the front corner to find the parent block
    var h = this.wl2bl(height, true);     // tower height
    var booml = this.wl2bl(boomLength);   // boom length
    var base = new Crane.Base(pos, null, h, width, this.getColor('metal'), this.getColor('concrete'), this.getColor('polywhite'));
    // var boom = new Crane.Boom(pos, null, h, booml, width, 0, this.getColor('metal'), this.getColor('polywhite'));

    this._addFeature(pos, base);
    // this._addFeature(pos, boom);
}
// -----------------------------------------------------------------
module.exports = ForestWorld;
