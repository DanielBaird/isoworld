
"use strict";

var allWorlds = require('./worlds/allworlds.js');
var Isomer = require('../bower_components/isomer/index.js');

window.IsoWorld = {
    Worlds: allWorlds,
    Point: Isomer.Point,
    Color: Isomer.Color
}

module.exports = window.IsoWorld;
