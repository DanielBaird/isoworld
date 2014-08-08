
var Isomer = require('../../bower_components/isomer');
var Path = Isomer.Path;
var Point = Isomer.Point;
var Shape = Isomer.Shape;

var BaseCone = function (origin, radius, vertices, height, inverted, open) {
	radius = (typeof radius === 'number') ? radius : 1;
	height = (typeof height === 'number') ? height : 1;
	vertices = vertices || 20;

	inverted = !!inverted;
	open = !!open;

	var cone = new Shape();
	var tip = origin.translate(0, 0, height);
	if (inverted) {
		origin = tip;
		tip = origin.translate(0, 0, -1 * height);
	}
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

	basePath = basePath.translate(origin.x, origin.y, origin.z);

	if (!open) {
		cone.push(basePath);
	}

	// now march along the base path, making the side panels
	var side;
	for (i = 1; i < vertices; i++) {
		if (inverted) {
			side = new Path([basePath.points[i], basePath.points[i-1], tip]);
		} else {
			side = new Path([basePath.points[i-1], basePath.points[i], tip]);
		}
		cone.push(side);
	}
	// add the last panel
	if (inverted) {
		side = new Path([basePath.points[0], basePath.points[i-1], tip]);
	} else {
		side = new Path([basePath.points[i-1], basePath.points[0], tip]);
	}
	cone.push(side);

	return cone;
};

var Cone = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, false, false);
};

Cone.Inverted = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, true, false);
}

Cone.Open = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, false, true);
}

Cone.Inverted.Open = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, true, true);
}

Cone.Open.Inverted = function(origin, radius, vertices, height) {
	return new BaseCone(origin, radius, vertices, height, true, true);
}

module.exports = Cone;
