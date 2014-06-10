
require('../util/shims.js');

var BaseWorld = require('./baseworld.js');

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
// ...
module.exports = ForestWorld;
