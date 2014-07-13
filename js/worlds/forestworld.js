
require('../util/shims');

var BaseWorld = require('./baseworld');
var Tree = require('../objects/tree');
var LeafTrap = require('../objects/leaftrap');

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
ForestWorld.prototype.tree = function(location, width, height) {

    var pos = this.w2b(location);

    var bW = this.wl2bl(width);
    var bH = this.wl2bl(height, true);

    if (this._treeType && this._treeType == 'stump') {
        // make stumps all 2m tall
        bH = this.wl2bl(2, true);
    }

    this._addFeature(
        pos, new Tree(pos, null, bW, bH, this.getColor('wood'), this.getColor('foliage'), this._treeType)
    );
}
// -----------------------------------------------------------------
ForestWorld.prototype.leafTrap = function(location) {
    var pos = this.w2b(location);
    var w = this.wl2bl(20);
    var h = this.wl2bl(20, true);
    var trap = new LeafTrap(pos, null, w, h, this.getColor('wood'));

    this._addFeature(pos, trap);
}
// -----------------------------------------------------------------
module.exports = ForestWorld;
