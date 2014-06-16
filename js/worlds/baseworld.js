
require('../util/shims.js');

var defaults = require('./worlddefaults.js');
var defaultOptions = defaults.options;
var colorSchemes = defaults.colorSchemes;
var Isomer = require('../../bower_components/isomer/index.js');

var UnitColumn = require('../objects/unitcolumn.js');
var Feature = require('../objects/feature.js');

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
    var opts = this._opts;
    var blocksX = Math.ceil(opts.worldSizeX / opts.blockSize);
    var blocksY = Math.ceil(opts.worldSizeY / opts.blockSize);

    for (var x = 0; x < blocksX; x++) {
        sqs.push([]);
        for (var y = 0; y < blocksY; y++) {
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
    if (type instanceof Isomer.Color) {
        return type;
    }
    var color = this._colors[type];
    if (!color) color = this._colors['blank'];
    return color
}
// -----------------------------------------------------------------
// init the three layers
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
// convert absolute world height to absolute block z
BaseWorld.prototype.w2bZ = function(altitude) {
    return (this.w2bZDelta(altitude - this._opts.worldOriginZ));
}
// -----------------------------------------------------------------
// convert world height delta to block z delta
BaseWorld.prototype.w2bZDelta = function(height) {
    return (height / this._opts.blockSize * this._opts.worldScaleZ);
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
    var bX = Math.floor( (wX - opts.worldOriginX) / opts.blockSize );
    var bY = Math.floor( (wY - opts.worldOriginY) / opts.blockSize );
    var bZ = (wZ - opts.worldOriginZ) / opts.blockSize * opts.worldScaleZ;
    return ([bX, bY, bZ]);
}
// -----------------------------------------------------------------
// add a feature at world coords x,y
BaseWorld.prototype.feature = function(x, y, feature) {
    var blockCoords = this.w2b(x, y, 0);
    var bX = blockCoords[0];
    var bY = blockCoords[1];

    if (!feature) {
        feature = new Feature(0.5);
    }

    this._squares[bX][bY].features.push(feature);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// set the ground level for world coords x,y.
BaseWorld.prototype.groundLevel = function(x, y, altitude) {
    var blockCoords = this.w2b(x, y, altitude);
    var bX = blockCoords[0];
    var bY = blockCoords[1];
    var bZ = blockCoords[2];
    this.setGroundLevel(bX, bY, bZ);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// set the underground column for world coords x,y.  The stack argument
// is an array of alternating Color and thickness values.  The final
// Color doesn't need a thickness, it will continue to bedrock.
// Alternatively just provide a single Color for a simple one-color column.
BaseWorld.prototype.ground = function(x, y, stack) {

    var blockCoords = this.w2b(x, y, 0);
    var bX = blockCoords[0];
    var bY = blockCoords[1];
    var bZ = this._squares[bX][bY].z;

    var groundStack = this.listToStack(stack, bX, bY);
    this.setGroundStack(bX, bY, groundStack);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// turn an array of type/depth e.g. ['water', 2, sand', 1, 'soil']
// into an array of ground blocks
BaseWorld.prototype.listToStack = function(list, bX, bY) {

    var listPos, color, thickness;
    var stack = [];
    var height = 0;

    for (listIndex = 0; listIndex < list.length; listIndex = listIndex + 2) {
        // list[listIndex] is the type of this layer
        color = this.getColor(list[listIndex]);

        // list[listIndex + 1] is the thickness of the layer
        if (listIndex < list.length - 1) {
            thickness = this.w2bZDelta( list[listIndex + 1] );
        } else {
            thickness = height - this.w2bZ( this._opts.bedrockLevel );
        }
        if (thickness > 0) {
            height -= thickness;
            column = new UnitColumn(bX, bY, height, thickness, color);
            stack.unshift(column);
        }
    }
    return stack;
}
// -----------------------------------------------------------------
// make sure a square exists at x,y.  Grow the world as necessary
BaseWorld.prototype.validatePosition = function(x, y) {
    var sq = this._squares;
    return (!(x < 0 || y < 0 || x >= sq.length || y >= sq[0].length));
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
        this._groundStacks.push({ x: x, y: y, ground: stack });
        this._extrapolateGround();
    }
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquare = function(x, y) {

    var sq = this._squares[x][y];
    var bedrockZ;

    if (sq !== undefined) {

        // is there a ground column?
        var g, groundLayer;
        if (sq.ground && sq.ground.length > 0) {
            // render ground column
            for (var g=0; g < sq.ground.length; g++) {
                groundLayer = sq.ground[g];
                groundLayer.render(this._layers.fg, this._opts);
            }
        } else {
            // no ground recorded, draw a blank column
            bedrockZ = this.w2bZ(this._opts.bedrockLevel);
            groundLayer = new UnitColumn(
                x, y, bedrockZ,
                (sq.z ? sq.z : 0) - bedrockZ,
                this.getColor('blank')
            );
            groundLayer.render(this._layers.fg, this._opts);
        }

        // now do features..
        var f, feature;
        if (sq.features && sq.features.length > 0) {
            for (var f=0; f < sq.features.length; f++) {
                feature = sq.features[f];
                feature.render(this._layers.fg, [x + 0.5, y + 0.5, sq.z], this._opts);
            }
        }
    }
}
// -----------------------------------------------------------------
// render
BaseWorld.prototype.render = function() {

    for (var layerName in this._layers) {
        this._layers[layerName].canvas.clear();
    }

    var g = this._squares;

    var maxX = g.length;
    var maxY = g[0].length;
    var coordSum = maxX + maxY - 2; // -2 coz they're both zero indexed
    var gX, gY;

    while (coordSum >= 0) {
        for (gX = 0; gX < maxX; gX++) {
            for (gY = 0; gY < maxY; gY++) {
                if (gX + gY == coordSum && g[gX][gY]) {
                    this.renderSquare(gX, gY);
                }
            }
        }
        coordSum -= 1;
    }

    // draw on origin lines, coz why not
    // if (true) {
    if (false) {
        this._layers.fg.add(new Isomer.Path([
            new Isomer.Point(0,-0.01,0), new Isomer.Point(0,0.01,0), new Isomer.Point(10,0,0)
        ]), new Isomer.Color(255,0,0));
        this._layers.fg.add(new Isomer.Path([
            new Isomer.Point(-0.01,0,0), new Isomer.Point(0.01,0,0), new Isomer.Point(0,10,0)
        ]), new Isomer.Color(255,0,0));
        this._layers.fg.add(new Isomer.Path([
            new Isomer.Point(-0.01,-0.01,0), new Isomer.Point(0.01,0.01,0), new Isomer.Point(0,0,10)
        ]), new Isomer.Color(255,0,0));
    }
}
// -----------------------------------------------------------------
// render, only if we're supoosed to re-render automatically
BaseWorld.prototype.renderMaybe = function() {
    if (this._autoRender) { this.render(); }
}
// -----------------------------------------------------------------
// extrapolate all the ground columns
BaseWorld.prototype._neighbours = function(x, y) {
    var neighbours = [];
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0) continue;
            if (this.validatePosition(x + dx, y + dy)) {
                neighbours.push({x: x + dx, y: y + dy});
            }
        }
    }
    return neighbours;
}
// -----------------------------------------------------------------
// copy a ground column between squares
BaseWorld.prototype._copyGround = function(from, to) {
    var newLayer;
    var fromZ = from.z;
    var aboveBedrock = to.z - this.w2bZ(this._opts.bedrockLevel);

    if (fromZ === undefined) fromZ = 0;
    to.ground = [];
    for (var layerIndex = from.ground.length - 1; layerIndex >=0; layerIndex--) {
        if (aboveBedrock > 0) {
            // only add another layer if we're still above bedrock
            newLayer = from.ground[layerIndex].dupe();
            newLayer.translate(to.x - from.x, to.y - from.y, to.z - fromZ);
            aboveBedrock -= newLayer.h;
            to.ground.unshift(newLayer);
        }
    }
    // now fix up the bottom layer so it reaches bedrock
    to.ground[0].z -= aboveBedrock;
    to.ground[0].h += aboveBedrock;
}
// -----------------------------------------------------------------
// extrapolate all the ground columns
BaseWorld.prototype._extrapolateGround = function() {
    var sqs = this._squares;
    var maxX = sqs.length;
    var maxY = sqs[0].length;
    var x, y, dx, dy, gs;
    var dist, bestDist, candidate, bestCandidate;

    for (x = 0; x < maxX; x++) { for (y = 0; y < maxY; y++) {
        bestCandidate = undefined;
        bestDist = maxX*maxX + maxY*maxY;
        for (gs = 0; gs < this._groundStacks.length; gs++) {
            candidate = this._groundStacks[gs];
            dx = x - candidate.x;
            dy = y - candidate.y;
            dist = dx*dx + dy*dy;
            if (dist < bestDist) {
                bestDist = dist;
                bestCandidate = candidate;
            }
        }
        if (bestCandidate) {
            this._copyGround(bestCandidate, this._squares[x][y]);
        }
    }}

    this.renderMaybe();

}
// -----------------------------------------------------------------
// -----------------------------------------------------------------
module.exports = BaseWorld;
