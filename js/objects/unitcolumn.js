

var Block = require('./block');
// -----------------------------------------------------------------
function UnitColumn(centerX, centerY, bottomZ, h, color) {
    Block.call(this, centerX, centerY, bottomZ, 1, h, color);
}
// -----------------------------------------------------------------
// inheritance
UnitColumn.prototype = Object.create(Block.prototype);
UnitColumn.prototype.constructor = UnitColumn;
// -----------------------------------------------------------------
module.exports = UnitColumn;
