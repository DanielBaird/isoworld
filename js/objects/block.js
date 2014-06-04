
// -----------------------------------------------------------------
function Block(centerX, centerY, bottomZ, w, h, color) {
    this.cX = centerX;
    this.cY = centerY;
    this.bZ = bottomZ;

    var halfW = w / 2;
    this.x = centerX - halfW;
    this.y = centerY - halfW;
    this.z = bottomZ;
    this.w = w;
    this.h = h;

    this.color = color;
}
// -----------------------------------------------------------------
Block.prototype.render = function(iso) {
    // .. wtf to do here?
}
// -----------------------------------------------------------------
module.exports = Block;