
require('../util/shims');

var BaseWorld = require('./baseworld');
var Tree = require('../objects/tree');

// -----------------------------------------------------------------
// -----------------------------------------------------------------
function ForestWorld() {
    // invoke our super constructor thingy
    BaseWorld.apply(this, arguments);
}
// -----------------------------------------------------------------
// inheritance
ForestWorld.prototype = Object.create(BaseWorld.prototype);
ForestWorld.prototype.constructor = ForestWorld;
// -----------------------------------------------------------------
// real object methods..
ForestWorld.prototype.tree = function(x, y, width, height) {
    var bW = this.w2bDelta(width);
    var bH = this.w2bZDelta(height);
    this.feature(
        x, y,
        new Tree(bW, bH, this.getColor('wood'), this.getColor('foliage'))
    );
}
// -----------------------------------------------------------------
module.exports = ForestWorld;
