
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

    var pos = this.w2b([x, y, 0]);

    var bW = this.w2bDelta(width);
    var bH = this.w2bZDelta(height);

    this.feature(
        pos[3], pos[4],
        new Tree(pos[3], pos[4], bW, bH, this.getColor('wood'), this.getColor('foliage'))
    );
}
// -----------------------------------------------------------------
module.exports = ForestWorld;
