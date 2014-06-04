

var Block = require('./block.js');
// -----------------------------------------------------------------
function UnitColumn(centerX, centerY, bottomZ, h, color) {
    Block.call(this, centerX, centerY, bottomZ, 1, h, color);
}
// -----------------------------------------------------------------
module.exports = UnitColumn;