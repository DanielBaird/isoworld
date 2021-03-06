
var Color = require('../../bower_components/isomer/index.js').Color;
var Point = require('../../bower_components/isomer/index.js').Point;

var defaultOptions = {
    autoRender: true,    // re-draw the world when anything changes
    autoSize:   true,    // work out block size to fill the canvas

    minX:          0,    // bounds
    maxX:         10,    // bounds

    minY:          0,    // bounds
    maxY:         10,    // bounds

    maxH:          5,    // max height of interesting features (used to auto-size)
    minH:         -8,    // minimum height of interesting features (used to auto-size)
    scaleH:        1,    // how many altitude units to a ground co-ord unit?
    stepH:         0.1,  // round ground heights to the nearest 0.25 of a world unit
    bedrockH:    -16,    // how far down to stop drawing the ground

    featurePosition: 'accurate',

    colorScheme: 'bright',

    blockSize:     1,    // how many 'world' units long is one side of a block?
    isoGap:        0.05, // gap to leave between blocks

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
        'blank': new Color(180,180,180, 0.05),
        'soil': new Color(110, 50, 35),
        'sand': new Color(230, 200, 20),
        'leaflitter': new Color(90, 110, 50),
        'water': new Color(50, 200, 255, 0.75),
        'wood': new Color(90, 50, 20),
        'foliage': new Color(90, 200, 50, 0.66),
        'gravel': new Color(120, 135, 180),
        'leaftrap': new Color(50, 50, 50, 0.9),
        'polywhite': new Color(190, 190, 190),
        'concrete': new Color(130, 130, 130),
        'steel': new Color(170, 180, 220),
        'metal': new Color(60, 60, 80),
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
        'gravel': new Color(120, 135, 180),
        'leaftrap': new Color(50, 50, 50),
        'polywhite': new Color(200, 200, 200),
        'ui': new Color(255, 255, 100, 0.33),
        'highlight': new Color(255, 255, 100, 0.66)
    }
}

module.exports = {
    options: defaultOptions,
    colorSchemes: colorSchemes
}