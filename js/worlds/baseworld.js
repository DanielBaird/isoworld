
require('../util/shims.js');

var defaults = require('./worlddefaults.js');
var defaultOptions = defaults.options;
var colorSchemes = defaults.colorSchemes;
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
    var isomerOptions = {
        angle: this._opts.isoAngle,
        scale: this._opts.isoSize,
        originY: h - (1.5 * this._opts.isoSize)
    }

    this._dom.innerHTML = '' +
        '<style>.isoworld { position: absolute; top: 0, bottom: 0, left: 0, right: 0 }</style>' +
        '<canvas id="isoworld-bg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-fg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-ui" class="isoworld" width="' + w + '" height="' + h + '"></canvas>';

    this._layers = {
        bg: new Isomer(document.getElementById('isoworld-bg'), isomerOptions),
        fg: new Isomer(document.getElementById('isoworld-fg'), isomerOptions),
        ui: new Isomer(document.getElementById('isoworld-ui'), isomerOptions)
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

    var height = altitude;
    var stackPos, layerThickness, layerColor, column;

    var groundStack = [];

    if (stack instanceof Array) {
        // if the caller supplied an actual stack of thickness & color,
        // go through the stack..
        for (stackPos = 0; stackPos < stack.length; stackPos = stackPos + 2) {
            layerColor = stack[stackPos];
            if (stackPos < stack.length - 1) {
                layerThickness = stack[stackPos + 1];
            } else {
                layerThickness = height - this._opts.bedrockLevel;
            }
            height -= layerThickness;
            column = new UnitColumn(
                x, y, height,
                layerThickness, layerColor
            );
            if (layerThickness > 0) {
                groundStack.unshift(column);
            }
        }
    } else {
        // otherwise they must've given us a Color
        groundStack.unshift(new UnitColumn(
            x, y, this._opts.bedrockLevel,
            altitude - this._opts.bedrockLevel, stack));
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
    var sq = this._squares[x][y];
    // render ground column
    for (layer in sq.ground) {
        sq.ground[layer].render(this._layers.fg, this._opts);
    }
}
// -----------------------------------------------------------------
// render
BaseWorld.prototype.render = function() {
    //.canvas.clear();

    // temporary ground-level indicator
    // var levelc = new Isomer.Color(255,0,0, 0.5);
    // this._layers.fg.add(new Isomer.Shape.Prism(new Isomer.Point(1, -1, -0.01), 1, 1, 0.01), levelc);
    // this._layers.fg.add(new Isomer.Shape.Prism(new Isomer.Point(-1, 1, -0.01), 1, 1, 0.01), levelc);

    var g = this._squares;

    var maxX = g.length - 1;
    var maxY = g[0].length - 1;
    var coordSum = maxX + maxY;
    var gX, gY;

    while (coordSum >= 0) {
        for (gX = 0; gX <= maxX; gX++) {
            for (gY = 0; gY <= maxY; gY++) {
                if (gX + gY == coordSum && g[gX][gY]) {
                    this.renderSquare(gX, gY);
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
