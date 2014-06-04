
require('../util/shims.js');

var defaultOptions = require('./worlddefaults.js');
var Isomer = require('../../bower_components/isomer/index.js');
var UnitColumn = require('../objects/unitcolumn.js');

// -----------------------------------------------------------------
// -----------------------------------------------------------------
function BaseWorld(domElement, options) {
    this._opts = Object.create(defaultOptions);
    this.mergeOptions(options);

    this._squares = [[]];

    this.makeLayers(domElement);
}
// -----------------------------------------------------------------
// merge new options into our options
BaseWorld.prototype.makeLayers = function(domElement) {
    // first, handle the dom thing we have.
    if (domElement instanceof Element) {
        this._dom = domElement;
    } else {
        //maybe it's a string, which we'll assume is an id
        this._dom = document.getElementById(domElement);
    }

    var w = this._dom.clientWidth;
    var h = this._dom.clientHeight;

    this._dom.innerHTML = '' +
        '<canvas id="isoworld-bg" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-fg" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-ui" width="' + w + '" height="' + h + '"></canvas>';

    this._layers = {
        bg: new Isomer(document.getElementById('isoworld-bg')),
        fg: new Isomer(document.getElementById('isoworld-fg')),
        ui: new Isomer(document.getElementById('isoworld-ui'))
    }
}
// -----------------------------------------------------------------
// merge new options into our options
BaseWorld.prototype.mergeOptions = function(extraOpts) {
    for (opt in extraOpts) {
        this._opts[opt] = extraOpts[opt];
    }
}
// -----------------------------------------------------------------
// switch automatic re-rendering on or off, or query current setting
BaseWorld.prototype.autoRender = function(yesno) {
    if (yesno === false) {
        this._opts.autoRender = false;
    } else if (yesno == true) {
        this._opts.autoRender = true;
    }
    return this._opts.autoRender;
}
// -----------------------------------------------------------------
// set the underground column for location x,y.  The stack argument
// is an array of alternating Color and thickness values.  The final
// Color doesn't need a thickness, it will continue to bedrock.
// Alternatively just provide a single Color for a simple one-color column.
BaseWorld.prototype.ground = function(x, y, altitude, stack) {

    var toBedrock = this._opts.bedrockDepth + altitude;
    var stackPos, layerThickness, layerColor;

    var groundStack = [];

    if (stack instanceof Array) {
        // if the uesr supplied an actual stack of thickness & color,
        // go through the stack..
        for (stackPos = 0; stackPos < stack.length; stackPos = stackPos + 2) {
            layerColor = stack[stackPos];
            if (stackPos < stack.length - 1) {
                layerThickness = Math.min(stack[stackPos + 1], toBedrock);
            } else {
                layerThickness = toBedrock;
            }
            toBedrock -= layerThickness; // how far to go to bedrock

            groundStack.unshift(new UnitColumn(x, y, altitude - toBedrock, layerThickness, layerColor));
        }
    } else {
        // otherwise they must've given us a Color
        groundStack.unshift(new UnitColumn(x, y, 0 - toBedrock, toBedrock + altitude, stack));
    }

    this.groundStack(x, y, groundStack);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// make sure a square exists at x,y.  Grow the world as necessary
BaseWorld.prototype.ensureExists = function(x, y) {
    // grow world to this x, y
    if (this._squares.length < x) {
        // grow along x
        this._squares.length = x;
    }
    if (this._squares[x] === undefined) {
        // create the x'th row of y's if necessary
        this._squares[x] = Array(y);
    }
    if (this._squares[x].length < y) {
        // grow along y if necessary
        this._squares[x].length = y;
    }
    if (this._squares[x][y] === undefined) {
        this._squares[x][y] = {};
    }

    // we also need to keep squares[0] length updated, we use
    // that to track max width.
    if (this._squares[0].length < y) {
        // grow along y if necessary
        this._squares[0].length = y;
    }

}
// -----------------------------------------------------------------
// set ground stack for the square at x,y.
// setting will set from bedrock up to altitude in specified color
BaseWorld.prototype.groundStack = function(x, y, stack) {
    this.ensureExists(x, y);
    this._squares[x][y].ground = stack;

}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquare = function(x, y) {
    var iso = this._layers.fg;
    var sq = this._squares[x][y];
    // render ground column
    var layer;
    for (layer in sq.ground) {
        iso.add()
    }
}
// -----------------------------------------------------------------
// render
BaseWorld.prototype.render = function() {
    this._layers.fg.canvas.clear();
    var g = this._squares;

    var maxX = g.length - 1;
    var maxY = g[0].length - 1;
    var coordSum = maxX + maxY;
    var gX, gY;

    while (coordSum >= 0) {
        for (gX = 0; gX <= maxX; gX++) {
            for (gY = 0; gY <= maxY; gY++) {
                if (gX + gY == coordSum && g[gX][gY]) {
                    renderSquare(gX, gY);
                }
            }
        }
        coordSum -= 1;
    }
}
// -----------------------------------------------------------------
// render, only if we're supoosed to re-render automatically
BaseWorld.prototype.renderMaybe = function() {
    if (this._autoRender) {
        this.render();
    }
}
// -----------------------------------------------------------------
// -----------------------------------------------------------------
module.exports = BaseWorld;
