
var Isomer = require('../../bower_components/isomer');
var Path = Isomer.Path;
var Point = Isomer.Point;
var Shape = Isomer.Shape;

var Cone = function (origin, radius, vertices, height) {
	radius = (typeof radius === 'number') ? radius : 1;
	height = (typeof height === 'number') ? height : 1;
	vertices = vertices || 20;

	var cone = new Shape();
	var tip = origin.translate(0,0,height);
	var i, basePath = new Path();

	for (i = 0; i < vertices; i++) {
		basePath.push(
			new Point(
				radius * Math.cos(i * 2 * Math.PI / vertices),
				radius * Math.sin(i * 2 * Math.PI / vertices),
				0
			)
		);
	}

	bastPath = basePath.translate(origin);

	cone.push(basePath);

	// now march along the base path, making the side panels
	for (i = 1; i < vertices; i++) {
		console.log('adding a panel', i, basePath.points[i]);
		cone.push(
			new Path([
				basePath.points[i-1],
				basePath.points[i],
				tip
			])
		);
	}

	return cone;
};


module.exports = Cone;
