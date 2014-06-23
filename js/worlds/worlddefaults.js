
var Color = require('../../bower_components/isomer/index.js').Color;
var Point = require('../../bower_components/isomer/index.js').Point;

var defaultOptions = {
    autoRender:  true,    // re-draw the world when anything changes
    autoSize:    true,    // work out block size to fill the canvas

    worldSizeX:    10,    // size of world
    worldSizeY:    10,    // size of world

    worldOriginX:   0,    // starting X coord, in world units
    worldOriginY:   0,    // starting Y coord, in world units
    worldOriginZ:   0,    // starting Z coord, in world units

    worldScaleZ:    1,    // how many altitude units to a ground co-ord unit?

    colorScheme: 'bright',
    maxHeight:      5,    // max height of interesting features (used to auto-size)
    minHeight:     -8,    // minimum height of interesting features (used to auto-size)
    bedrockLevel: -16,    // how far down to stop drawing the ground

    blockSize:      1,    // how many 'world' units long is one side of a block?
    isoGap:         0.05, // gap to leave between blocks

    // Isomer rendering options.
    //
    //                 '-_
    //         isoScale   '-_
    //        '-_            _-_
    //           '-_      _-'   '-_
    //  ____________   _-'         '-_
    //    ^           |-_           _-|
    //    :           |  '-_     _-'  |      _
    //    : isoScale  |     '-_-'     |   _-'
    //    v           |       |       | -'
    //  ------------  '-_     |     _-'
    //                   '-_  |  _-'   isoAngle
    //                      '-_-' __________________
    //

    // pixel length of a 1x1x1 block.  The Isomer default is 70.
    // It's this value that gets adjusted when autoSize = true, so
    // normally you won't need to set it yourself.
    isoScale: 60,

    // PI/15 looks quite side-on; PI/4 is more top-down. The Isomer
    // default is PI/6.  If your drawing area's aspect ratio is
    // unusual you can tweak this to fill the area better.
    isoAngle: Math.PI/6,

    // these isoOrigin values are optional.  If you use autoSize and
    // set maxHeight / minHeight properly you won't need to set the
    // isoOrigin.
    // isoOriginX: 450,  // pixel pos of point 0,0,0 on the canvas
    // isoOriginY: 450,  // pixel pos of point 0,0,0 on the canvas

    dummy: "has no trailing comma"
}

var colorSchemes = {
    'bright': {
        'blank': new Color(180,180,180),
        'soil': new Color(110, 50, 35),
        'sand': new Color(230, 200, 20),
        'leaflitter': new Color(90, 110, 50),
        'water': new Color(50, 200, 255, 0.75),
        'wood': new Color(90, 50, 20),
        'foliage': new Color(90, 200, 50, 0.75),
        'ui': new Color(255, 255, 0, 0.33),
        'highlight': new Color(255, 255, 100, 0.66)
    },
    'real': {
        'blank': new Color(125,125,125),
        'soil': new Color(50, 40, 30),
        'sand': new Color(210, 190, 120),
        'leaflitter': new Color(50, 60, 40),
        'water': new Color(50, 150, 255, 0.75),
        'wood': new Color(50, 40, 30, 0.66),
        'foliage': new Color(90, 200, 50, 0.66),
        'ui': new Color(255, 255, 100, 0.33),
        'highlight': new Color(255, 255, 100, 0.66)
    }
}

module.exports = {
    options: defaultOptions,
    colorSchemes: colorSchemes
}