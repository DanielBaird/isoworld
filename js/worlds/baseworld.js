
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

    this._squares = this.initSquares();
    this._groundStacks = [];
    this._groundHeight = [];
    this._layers = this.makeLayers(domElement);

    this._colors = colorSchemes[this._opts.colorScheme];
    if (this._colors === undefined) {
        this._colors = { 'blank': new Isomer.Color(255,75,75,0.66) };
    }
}
// -----------------------------------------------------------------
// init our squares
BaseWorld.prototype.initSquares = function() {
    var sqs = [];
    for (var x = 0; x < this._opts.worldSizeX; x++) {
        sqs.push([]);
        for (var y = 0; y < this._opts.worldSizeY; y++) {
            sqs[x].push({
                // here's the default square.
                x: x,
                y: y,
                z: 0,
                ground: [],
                features: []
            });
        }
    }
    return sqs;
}
// -----------------------------------------------------------------
// return a color
BaseWorld.prototype.getColor = function(type) {
    var color = this._colors[type];
    if (!color) color = this._colors['blank'];
    return color
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
    var isoOpts = {
        scale: this._opts.isoScale,
        angle: this._opts.isoAngle
    }

    this._dom.innerHTML = '' +
        '<style>.isoworld { position: absolute; top: 0, bottom: 0, left: 0, right: 0 }</style>' +
        '<canvas id="isoworld-bg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-fg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-ui" class="isoworld" width="' + w + '" height="' + h + '"></canvas>';

    return ({
        bg: new Isomer(document.getElementById('isoworld-bg'), isoOpts),
        fg: new Isomer(document.getElementById('isoworld-fg'), isoOpts),
        ui: new Isomer(document.getElementById('isoworld-ui'), isoOpts)
    });
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
// convert world height to block z
BaseWorld.prototype.w2bVertical = function(altitude) {
    var ans = (altitude - this._opts.worldOriginZ) / this._opts.blockSize * this._opts.worldScaleZ;
    return ans;
}
// -----------------------------------------------------------------
// convert world coordinates to block coordinates
// pass in either three args (x, y, z) or one ([x, y, z])
BaseWorld.prototype.w2b = function(worldX, worldY, altitude) {
    var wX = worldX;
    var wY = worldY;
    var wZ = altitude;
    if (wX instanceof Array) {
        wZ = wX[2];
        wY = wX[1];
        wX = wX[0];
    }
    var opts = this._opts;
    // okay now we have world coords for x,y,z.
    var bX = Math.round( (wX - opts.worldOriginX) / opts.blockSize );
    var bY = Math.round( (wY - opts.worldOriginY) / opts.blockSize );
    var bZ = (wZ - opts.worldOriginZ) / opts.blockSize * opts.worldScaleZ;
    return ([bX, bY, bZ]);
}
// -----------------------------------------------------------------
// set the ground level for world coords x,y.
BaseWorld.prototype.groundLevel = function(x, y, altitude) {
    var blockCoords = this.w2b(x, y, altitude);
    var bX = blockCoords[0];
    var bY = blockCoords[1];
    var bZ = blockCoords[2];
    this.setGroundLevel(bX, bY, bZ);
}
// -----------------------------------------------------------------
// set the underground column for world coords x,y.  The stack argument
// is an array of alternating Color and thickness values.  The final
// Color doesn't need a thickness, it will continue to bedrock.
// Alternatively just provide a single Color for a simple one-color column.
BaseWorld.prototype.ground = function(x, y, altitude, stack) {

    var blockCoords = this.w2b(x, y, altitude);
    var bX = blockCoords[0];
    var bY = blockCoords[1];
    var bZ = blockCoords[2];

    var height = bZ;
    var stackPos, layerThickness, layerColor, column;

    var groundStack = [];

    if (stack instanceof Array) {
        // if the caller supplied an actual stack of thickness & color,
        // go through the stack..
        for (stackPos = 0; stackPos < stack.length; stackPos = stackPos + 2) {
            layerColor = stack[stackPos];
            if (stackPos < stack.length - 1) {
                layerThickness = this.w2bVertical( stack[stackPos + 1] );
            } else {
                layerThickness = height - this._opts.bedrockLevel;
            }
            height -= layerThickness;
            column = new UnitColumn(
                bX, bY, height,
                layerThickness, layerColor
            );
            if (layerThickness > 0) {
                groundStack.unshift(column);
            }
        }
    } else {
        // otherwise they must've given us a Color
        groundStack.unshift(new UnitColumn(
            bX, bY, this._opts.bedrockLevel,
            bZ - this._opts.bedrockLevel, stack));
    }

    this.setGroundStack(bX, bY, groundStack);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// make sure a square exists at x,y.  Grow the world as necessary
BaseWorld.prototype.validatePosition = function(x, y) {

    if (x < 0 || y < 0) {
        console.error('Invalid block position: (' + x + ', ' + y + ')');
        return false;
    }

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

    return true;
}
// -----------------------------------------------------------------
// set ground level for the square at BLOCK coords x,y.
BaseWorld.prototype.setGroundLevel = function(x, y, z) {
    if (this.validatePosition(x, y)) {
        this._squares[x][y].z = z;
    }
}
// -----------------------------------------------------------------
// set ground stack for the square at BLOCK coords x,y.
// setting will set from bedrock up to altitude in specified color
BaseWorld.prototype.setGroundStack = function(x, y, stack) {
    if (this.validatePosition(x, y)) {
        this._squares[x][y].ground = stack;
    }
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquare = function(x, y) {
    var sq = this._squares[x][y];
    if (sq !== undefined) {
        // is there a ground column?
        if (sq.ground.length > 0) {
            // render ground column
            for (layer in sq.ground) {
                sq.ground[layer].render(this._layers.fg, this._opts);
            }
        } else {
            // no ground recorded, draw a blank column
            this.renderBlankSquare(sq);
        }
    }
}
// -----------------------------------------------------------------
// render a blank square
BaseWorld.prototype.renderBlankSquare = function(sq) {
    if (! this._blankBlock) {
        this._blankBlock = new Isomer.Shape.Prism(
            new Isomer.Point(-0.5, -0.5, this._opts.bedrockLevel),
            1 - this._opts.isoGap,
            1 - this._opts.isoGap,
            0 - this._opts.bedrockLevel
        );
    }
    var zScale = 1;
    if (sq.z && sq.z != 0) {
        zScale = (0 - this._opts.bedrockLevel + sq.z) / (0 - this._opts.bedrockLevel)
    }
    this._layers.fg.add(
        this._blankBlock.scale(
            new Isomer.Point(-0.5, -0.5, this._opts.bedrockLevel),
            1, 1, zScale
        ).translate(sq.x, sq.y, sq.z),
        this.getColor('blank')
    );
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
