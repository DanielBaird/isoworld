
var worldDefaults = require('./worlddefaults.js');
var ForestWorld = require('./forestworld.js');
var Isomer = require('../../bower_components/isomer/index.js');

var World = {
    defaultOptions: worldDefaults,
    Color: Isomer.Color,

    Forest: ForestWorld
}

window.World = World;
module.exports = World;
