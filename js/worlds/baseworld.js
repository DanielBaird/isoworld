
require('../util/shims.js');

var defaults = require('./worlddefaults.js');
var defaultOptions = defaults.options;
var colorSchemes = defaults.colorSchemes;
var Isomer = require('../../bower_components/isomer/index.js');
var Point = Isomer.Point;

var UnitColumn = require('../objects/unitcolumn.js');
var Feature = require('../objects/feature.js');
var VerticalFeature = require('../objects/verticalfeature.js');
var PathFeature = require('../objects/pathfeature.js');

// -----------------------------------------------------------------
// -----------------------------------------------------------------
function BaseWorld(domElement, options) {
    this._opts = Object.create(defaultOptions);
    this.mergeOptions(options);

    this._squares = this.initSquares();

    this._groundStacks = [];
    this._groundHeight = [];

    this._dom = this.resolveDom(domElement);
    this._layers = this.makeLayers();

    this._colors = colorSchemes[this._opts.colorScheme];
    if (this._colors === undefined) {
        this._colors = { 'blank': new Isomer.Color(255,75,75,0.66) };
    }

    // auto-size?
    if (this._opts.autoSize) {
        this.autoSize();
    }
}
// -----------------------------------------------------------------
// work out a block size that will fit our world
BaseWorld.prototype.autoSize = function() {

    var opts = this._opts;

    // get the canvas size
    var cW = this._layers.fg.canvas.width;
    var cH = this._layers.fg.canvas.height;

    // get the block counts
    var bX = this._squares.length;
    var bY = this._squares[0].length;

    var extraHeight = opts.maxH - opts.minH;
    var xyBlocks = bX + bY;

    // the display is x+y block-diagonals across, and x+y diagonals tall
    var bW = xyBlocks * Math.cos(opts.isoAngle);
    var bH = (xyBlocks + (2 * this.wl2bl(extraHeight, true))) * Math.sin(opts.isoAngle);

    // work stuff out.
    var hConstraint = cH / bH;
    var wConstraint = cW / bW;
    opts.isoScale = Math.min(hConstraint, wConstraint) * 0.99; // a 1% allowance

    // position the origin
    var sidePad = Math.max(0, (cW - (opts.isoScale * bW)) / 2);
    var  topPad = Math.max(0, (cH - (opts.isoScale * bH)) / 2);

    opts.isoOriginX = sidePad * 1.01 + ((cW - sidePad - sidePad) * bY / (bX + bY));

    opts.isoOriginY = cH - (topPad * 1.01);

    // rebuild the layers
    this._layers = this.makeLayers();
    this.renderMaybe();
}
// -----------------------------------------------------------------
// init our squares
BaseWorld.prototype.initSquares = function() {
    var sqs = [];
    var opts = this._opts;
    var blocksX = Math.ceil((opts.maxX - opts.minX) / opts.blockSize);
    var blocksY = Math.ceil((opts.maxY - opts.minY) / opts.blockSize);

    for (var x = 0; x < blocksX; x++) {
        sqs.push([]);
        for (var y = 0; y < blocksY; y++) {
            sqs[x].push({
                // here's the default square.
                x: x,
                y: y,
                z: 0,
                ground: [],
                paths: [],
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
// pick out the dom element
BaseWorld.prototype.resolveDom = function(domElement) {
    if (domElement instanceof Element) {
        return domElement;
    } else {
        //maybe it's a string, which we'll assume is an id
        return document.getElementById(domElement);
    }
}
// -----------------------------------------------------------------
// init the three layers
BaseWorld.prototype.makeLayers = function() {
    var opts = this._opts;
    var w = this._dom.clientWidth;
    var h = this._dom.clientHeight;
    var isoOpts = {
        scale: opts.isoScale,
        angle: opts.isoAngle
    }
    if (opts.isoOriginX) isoOpts['originX'] = opts.isoOriginX;
    if (opts.isoOriginY) isoOpts['originY'] = opts.isoOriginY;

    this._dom.innerHTML = '' +
        '<style>.isoworld { position: absolute; top: 0, bottom: 0, left: 0, right: 0 }</style>' +
        '<canvas id="isoworld-bg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-fg" class="isoworld" width="' + w + '" height="' + h + '"></canvas>' +
        '<canvas id="isoworld-ui" class="isoworld" width="' + w + '" height="' + h + '"></canvas>';

    var bg = new Isomer(document.getElementById('isoworld-bg'), isoOpts);
    var fg = new Isomer(document.getElementById('isoworld-fg'), isoOpts);

    isoOpts['lightPosition'] = new Isomer.Vector(-1,-1,10);
    isoOpts['lightPosition'] = new Isomer.Vector(-1,-1,10);
    var ui = new Isomer(document.getElementById('isoworld-ui'), isoOpts);

    return { bg: bg, fg: fg, ui: ui };
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
BaseWorld.prototype.wh2bh = function(altitude) {
    return (this.wl2bl(altitude - this._opts.minH, true));
}
// -----------------------------------------------------------------
// convert world length/delta to a block delta
// set isVertical to true if it's a vertical measurement
BaseWorld.prototype.wl2bl = function(length, isVertical) {
    if (isVertical) {
        return length / this._opts.blockSize * this._opts.scaleH;
    } else {
        return length / this._opts.blockSize * (1 - this._opts.isoGap);
    }
}
// -----------------------------------------------------------------
// convert world coordinates to block coordinates
// set 'delta' to true if your point is a difference or length, in
// which case the result will just get scaled and won't also be
// adjusted to match origins.
BaseWorld.prototype.w2b = function(wPoint, delta) {
    var o = this._opts;
    var scale = 1 / o.blockSize;
    if (delta) {
        return ( wPoint
            .scale(Point.ORIGIN, scale, scale, scale * o.scaleH)
        );
    } else {
        return ( wPoint
            .translate(0 - o.minX, 0 - o.minY, 0 - o.minH)
            .scale(Point.ORIGIN, scale, scale, scale * o.scaleH)
        );
    }
}
// -----------------------------------------------------------------
// get the actual parent block for the given world coords
BaseWorld.prototype.w2block = function(wPoint) {
    return this._block( this.w2b(wPoint) );
}
// -----------------------------------------------------------------
// get the actual parent block for the given block coords
BaseWorld.prototype._block = function(bPoint) {
    if (this._inBlockRange(bPoint)) {
        var bX = Math.floor(bPoint.x);
        var bY = Math.floor(bPoint.y);
        return this._squares[bX][bY];
    } else {
        return false;
    }
}
// -----------------------------------------------------------------
// is this block coord in range?nsooe.log
BaseWorld.prototype._inBlockRange = function(bPoint) {
    return (
           bPoint.x >= 0
        && bPoint.x < this._squares.length
        && bPoint.y >= 0
        && bPoint.y < this._squares.length
    );
}
// -----------------------------------------------------------------
// add a feature at world coords.  The z / height element is ignored
BaseWorld.prototype.feature = function(wPoint, feature) {
    var bP = this.w2b(wPoint);

    // dodgy undifferentiated feature..
    if (!feature) {
        feature = new VerticalFeature(bP);
    }

    this._addFeature(bP, feature);
    this.renderMaybe();
}
// -----------------------------------------------------------------
// add a path that follows the points given.
BaseWorld.prototype.addPath = function(points, width, type) {
    var p1, p2;
    var c = this.getColor(type);
    for (var p=1; p < points.length; p++) {
        p1 = this.w2b(points[p-1]);
        p2 = this.w2b(points[p]);
        this._pathBetween(p1, p2, width, c);
    }
}
// -----------------------------------------------------------------
// add a path that follows the points given.
BaseWorld.prototype._pathBetween = function(from, to, width, color) {

    var currB = this._block(from);
    var currP = new Point(currB.x + 0.5, currB.y + 0.5, currB.z);

    var finalB = this._block(to);
    var nextB, nextP, xDiff, yDiff;

    // TODO: check for valid positions

    while (currB != finalB) {
        // there's four directions to go..
        xDiff = finalB.x - currB.x;
        yDiff = finalB.y - currB.y;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            // let's move along the x axis
            if (xDiff < 0) {
                nextB = this._block(new Point(currB.x - 1, currB.y, 0));
                nextP = new Point(nextB.x + 0.5, nextB.y + 0.5, 0);
                currB.paths.push(new PathFeature(currP, currB, width, '-x', color));
                nextB.paths.push(new PathFeature(nextP, nextB, width, '+x', color));
            } else {
                nextB = this._block(new Point(currB.x + 1, currB.y, 0));
                nextP = new Point(nextB.x + 0.5, nextB.y + 0.5, 0);
                currB.paths.push(new PathFeature(currP, currB, width, '+x', color));
                nextB.paths.push(new PathFeature(nextP, nextB, width, '-x', color));
            }
        } else {
            // move along the y axis
            if (yDiff < 0) {
                nextB = this._block(new Point(currB.x, currB.y - 1, 0));
                nextP = new Point(nextB.x + 0.5, nextB.y + 0.5, 0);
                currB.paths.push(new PathFeature(currP, currB, width, '-y', color));
                nextB.paths.push(new PathFeature(nextP, nextB, width, '+y', color));
            } else {
                nextB = this._block(new Point(currB.x, currB.y + 1, 0));
                nextP = new Point(nextB.x + 0.5, nextB.y + 0.5, 0);
                currB.paths.push(new PathFeature(currP, currB, width, '+y', color));
                nextB.paths.push(new PathFeature(nextP, nextB, width, '-y', color));
            }
        }

        currB = nextB;
        currP = new Point(currB.x + 0.5, currB.y + 0.5, currB.z);
    }

    this.renderMaybe();
}
// -----------------------------------------------------------------
// adds a feature to the appropriate square.  sets the feature's parent.
BaseWorld.prototype._addFeature = function(bPoint, feature) {
    if (this._inBlockRange(bPoint)) {
        var sq = this._block(bPoint);
        sq.features.push(feature);
        feature.parent(sq);

        // sort the features by nearness to viewer
        sq.features.sort( function(a, b) {
            return (b.origin().depth() - a.origin().depth());
        });
    }
}
// -----------------------------------------------------------------
// set the ground level and/or soil stack.
// .ground(<Point>) will set the ground level.
// .ground(<Point>, <Array>) will set both the ground level and the
//     soil stack.
// .ground(<Num1>, <Num2>, <Array>) will set the soil stack at
//     (Num1, Num2) without affecting the ground level.
BaseWorld.prototype.ground = function() {

    if (arguments.length == 1) {
        // single arg, should be a Point to set ground level from
        this._setGroundLevel( this.w2b(arguments[0]) );
    }
    if (arguments.length == 2) {
        // two args, should be a point and a soil stack
        this._setGroundLevel( this.w2b(arguments[0]) );
        this._setGroundStack( this.w2b(arguments[0]), arguments[1] );
    }
    if (arguments.length == 3) {
        // three args, should be x, y, soilStack
        var wP = new Point(arguments[0], arguments[1], 0);
        this._setGroundStack( this.w2b(wP), arguments[2] );
    }
    this.renderMaybe();
}
// -----------------------------------------------------------------
// turn an array of type/depth e.g. ['water', 2, sand', 1, 'soil']
// into an array of ground blocks
BaseWorld.prototype._listToStack = function(list, bP) {

    var listPos, color, thickness;
    var stack = [];
    var height = 0;

    for (listIndex = 0; listIndex < list.length; listIndex = listIndex + 2) {
        // list[listIndex] is the type of this layer
        color = this.getColor(list[listIndex]);

        // list[listIndex + 1] is the thickness of the layer
        if (listIndex < list.length - 1) {
            thickness = this.wl2bl( list[listIndex + 1], true );
        } else {
            thickness = height - this.wh2bh( this._opts.bedrockH );
        }
        if (thickness > 0) {
            height -= thickness;
            column = new UnitColumn(bP.x, bP.y, height, thickness, color);
            stack.unshift(column);
        }
    }
    return stack;
}
// -----------------------------------------------------------------
// set ground level at block point.  It's okay to set levels outside
// the world area, they'll still affect the height of blocks inside
// the area.
BaseWorld.prototype._setGroundLevel = function(bP) {
    this._groundHeight.push( bP );
}
// -----------------------------------------------------------------
// set ground stack for a block.
// setting will set from bedrock up to altitude in specified color
BaseWorld.prototype._setGroundStack = function(bP, list) {
    if (this._inBlockRange(bP)) {
        this._groundStacks.push({ x: bP.x, y: bP.y, ground: this._listToStack(list, bP) });
        this._extrapolateGround();
        return true;
    } else {
        return false;
    }
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquare = function(x, y) {
    this.renderSquareGround(x, y);
    this.renderSquarePaths(x, y);
    this.renderSquareFeatures(x, y);
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquareFeatures = function(x, y) {

    var sq = this._squares[x][y];

    if (sq !== undefined) {
        if (sq.features && sq.features.length > 0) {
            // there's features to render.
            // we draw features along the line from left corner
            // to right corner.  So we need to find points for
            // all the features along that line.
            // The +2 is +1 for the fencepost error, and +1 more to
            // add half a feature's worth of padding at each end
            var f, feature;
            var gap = this._opts.isoGap;
            var increment = (1 - gap) / (sq.features.length + 2);
            var step = increment/2;
            for (f=0; f < sq.features.length; f++) {
                feature = sq.features[f];
                step += increment;
                feature.render(this._layers.fg, this._opts);
                // feature.renderAt(this._layers.fg, [x + step, y + 1 - gap - step, sq.z], this._opts);
            }
        }
    }
}
// -----------------------------------------------------------------
// render a square
BaseWorld.prototype.renderSquarePaths = function(x, y) {

    var sq = this._squares[x][y];

    if (sq !== undefined) {
        if (sq.paths && sq.paths.length > 0) {
            var p, path;
            for (p=0; p < sq.paths.length; p++) {
                path = sq.paths[p];
                path.render(this._layers.fg, this._opts);
            }
        }
    }
}
// -----------------------------------------------------------------
// render a square's ground column
BaseWorld.prototype.renderSquareGround = function(x, y) {
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
            bedrockZ = this.wh2bh(this._opts.bedrockH);
            groundLayer = new UnitColumn(
                x, y, bedrockZ,
                (sq.z ? sq.z : 0) - bedrockZ,
                this.getColor('blank')
            );
            groundLayer.render(this._layers.fg, this._opts);
        }
    }
}
// -----------------------------------------------------------------
// render the UI layer
BaseWorld.prototype.renderUI = function() {

    var iso = this._layers.ui;
    iso.canvas.clear();

    var maxX = this._squares.length;
    var maxY = this._squares[0].length;
    var gX, gY;
    var gH = this.wh2bh(this._opts.maxHeight) + 0.33;

    // draw the grid
    for (gX = 0; gX <= maxX; gX++) {
        iso.add(new Isomer.Path(
            new Point(gX-0.01, 0, gH),
            new Point(gX+0.01, 0, gH),
            new Point(gX,   maxY, gH)
        ), this.getColor('ui'));
    }
    for (gY = 0; gY <= maxY; gY++) {
        iso.add(new Isomer.Path(
            new Point(0, gY+0.01, gH),
            new Point(0, gY-0.01, gH),
            new Point(maxX,   gY, gH)
        ), this.getColor('ui'));
    }
}
// -----------------------------------------------------------------
// render the foreground layer
BaseWorld.prototype.renderFG = function() {

    this._layers.fg.canvas.clear();

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
    if (this._opts.showAxes) {
        var axL = 100;   // axis length, in blocks
        var axW = 0.01;  // axis width, in blocks
        var Pt = Isomer.Point;
        var axC = new Isomer.Color(255,0,0);
        this._layers.fg.add(new Isomer.Path([new Pt(0,axW,0), new Pt(0,0-axW,0), new Pt(axL,0,0)]), axC);
        this._layers.fg.add(new Isomer.Path([new Pt(0-axW,0,0), new Pt(axW,0,0), new Pt(0,axL,0)]), axC);
        this._layers.fg.add(new Isomer.Path([new Pt(0-axW,axW,0), new Pt(axW,0-axW,0), new Pt(0,0,axL)]), axC);
    }
}
// -----------------------------------------------------------------
// render
BaseWorld.prototype.render = function() {
    this.renderFG();
    // this.renderUI();
}
// -----------------------------------------------------------------
// render, only if we're supoosed to re-render automatically
BaseWorld.prototype.renderMaybe = function() {
    if (this._autoRender) { this.render(); }
}
// -----------------------------------------------------------------
// copy a ground column between squares
BaseWorld.prototype._copyGround = function(from, to) {
    var newLayer;
    var fromZ = from.z;
    var aboveBedrock = to.z - this.wh2bh(this._opts.bedrockH);

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
// extrapolate all the ground columns and altitudes
BaseWorld.prototype._extrapolateGround = function() {
    var sqs = this._squares;
    var maxX = sqs.length;
    var maxY = sqs[0].length;
    var bx, by;

    for (bx = 0; bx < maxX; bx++) { for (by = 0; by < maxY; by++) {
        this._extrapolateGroundForSquare(sqs[bx][by]);
    }}
    this.renderMaybe();

}
// -----------------------------------------------------------------
// extrapolate all the ground columns and altitudes
BaseWorld.prototype._extrapolateGroundForSquare = function(sq) {

    // vars we use in both things
    var dx, dy, dist;

    // work out an average altitude
    var h, hAlt, voteSize;
    var sqAlt = 0;
    var votes = 0;
    for (var gh=0; gh < this._groundHeight.length; gh++) {
        h = this._groundHeight[gh];
        dx = sq.x + 0.5 - h.x;
        dy = sq.y + 0.5 - h.y;
        dist = 1 + dx*dx + dy*dy;
        voteSize = 1 / dist;
        sqAlt += h.z * voteSize;
        votes += voteSize;
    }
    sqAlt = sqAlt / votes;
    sq.z = sqAlt;
    // actually try rounding to the nearest something
    // var rnd = 1 / 0.333;
    var rnd = 1;
    sq.z = Math.round(sqAlt * rnd) / rnd;

    // copy nearest ground stack
    var maxX = this._squares.length;
    var maxY = this._squares[0].length;
    var bestDist, candidate, bestCandidate;
    var bestDist = maxX * maxX + maxY * maxY;
    for (var gs = 0; gs < this._groundStacks.length; gs++) {
        candidate = this._groundStacks[gs];
        dx = sq.x + 0.5 - candidate.x;
        dy = sq.y + 0.5 - candidate.y;
        dist = dx*dx + dy*dy;
        if (dist < bestDist) {
            bestDist = dist;
            bestCandidate = candidate;
        }
    }
    if (bestCandidate) {
        this._copyGround(bestCandidate, sq);
    }

}
// -----------------------------------------------------------------
// -----------------------------------------------------------------
module.exports = BaseWorld;
