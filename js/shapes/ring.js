
var Isomer = require('../../bower_components/isomer');
var Path = Isomer.Path;
var Point = Isomer.Point;
var Shape = Isomer.Shape;

var Ring = function(origin, radius, vertices, height, back) {
	radius = (typeof radius === 'number') ? radius : 1;
	height = (typeof height === 'number') ? height : 1;
	vertices = vertices || 20;
	back = !!back;

	var ring = new Shape();
	var basePoints = new Path();
	var startAngle = Math.PI * 3/4;
	if (back) {
		startAngle = Math.PI * -1/4;
	}
	var i;

	for (i = 0; i < vertices + 1; i++) {
		basePoints.push(
			new Point(
				radius * Math.cos(startAngle + i * Math.PI / vertices),
				radius * Math.sin(startAngle + i * Math.PI / vertices),
				0
			)
		);
	}

	basePoints = basePoints.translate(origin.x, origin.y, origin.z);

	// now march along the base path, making the side panels
	for (i = 1; i < vertices + 1; i++) {
		ring.push(
			new Path([
				basePoints.points[i-1],
				basePoints.points[i],
				basePoints.points[i].translate(0, 0, height),
				basePoints.points[i-1].translate(0, 0, height)
			])
		);
	}

	return ring;
};

module.exports = Ring;
