
var Color = require('../../bower_components/isomer/index.js').Color;

var defaultOptions = {
    autoRender: true,

    bedrockLevel: -10,

    groundScale: 1,
    heightScale: 1,

    colorScheme: 'bright',

    // isoSize is the pixel length of a 1x1x1 block.  Isomer default
    // is 70.
    isoSize: 30,
    // isoAngle should be between Math.PI/4 and Math.PI/15 or so.
    // Math.PI/6 is the Isomer default.
    isoAngle: Math.PI/8,
    isoGap: 0.1,

    dummy: "final thing with no trailing comma"
}

var colorSchemes = {
    'bright': {
        'soil': new Color(110, 50, 35),
        'leaflitter': new Color(70, 120, 30),
        'water': new Color(50, 200, 255, 0.75),
        'wood': new Color(90, 50, 20, 0.66),
        'highlight': new Color(255, 255, 100, 0.1)
    },
    'real': {
        'soil': new Color(50, 40, 30),
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