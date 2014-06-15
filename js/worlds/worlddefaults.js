
var Color = require('../../bower_components/isomer/index.js').Color;

var defaultOptions = {

    autoRender: true,

    worldSizeX: 10,     // size of world
    worldSizeY: 10,     // size of world

    worldOriginX: 0,    // starting X coord, in world units
    worldOriginY: 0,    // starting Y coord, in world units
    worldOriginZ: 0,    // starting Z coord, in world units

    worldScaleZ: 1,     // how many altitude units to a ground co-ord unit?

    colorScheme: 'bright',
    bedrockLevel: -3,
    blockSize: 1,       // how many 'world' units long is one side of a block?
    isoGap: 0.05,       // gap to leave between blocks

    // Isomer rendering options.
    isoScale: 60,       // pixel length of a 1x1x1 block.  Isomer default is 70
    isoAngle: Math.PI/8,  // Math.PI/4 ~ Math.PI/15.  Isomer default is Math.PI/6

    dummy: "has no trailing comma"
}

var colorSchemes = {
    'bright': {
        'blank': new Color(180,180,180),
        'soil': new Color(110, 50, 35),
        'sand': new Color(230, 200, 20),
        'leaflitter': new Color(90, 110, 50),
        'water': new Color(50, 200, 255, 0.75),
        'wood': new Color(90, 50, 20, 0.66),
        'highlight': new Color(255, 255, 100, 0.1)
    },
    'real': {
        'blank': new Color(125,125,125),
        'soil': new Color(50, 40, 30),
        'sand': new Color(210, 190, 120),
        'leaflitter': new Color(50, 60, 40),
        'water': new Color(50, 150, 255, 0.75),
        'wood': new Color(50, 40, 30, 0.66),
        'highlight': new Color(255, 255, 100, 0.1)
    }
}

module.exports = {
    options: defaultOptions,
    colorSchemes: colorSchemes
}