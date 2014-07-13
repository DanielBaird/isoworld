
var Isomer = require('../../bower_components/isomer');
var Path = Isomer.Path;
var Point = Isomer.Point;
var Shape = Isomer.Shape;

InvPyramid = function (origin, dx, dy, dz) {
	dx = (typeof dx === 'number') ? dx : 1;
	dy = (typeof dy === 'number') ? dy : 1;
	dz = (typeof dz === 'number') ? dz : 1;

	var pyramid = new Shape();

	/* Path parallel to the x-axis */
	var face1 = new Path([
		origin.translate(0, 0, dz),
		new Point(origin.x + dx, origin.y, origin.z + dz),
		new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z)
	]);
	/* Push the face, and its opposite face, by rotating around the Z-axis */
	pyramid.push(face1);
	pyramid.push(face1.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

	/* Path parallel to the y-axis */
	var face2 = new Path([
		origin.translate(0, 0, dz),
		new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z),
		new Point(origin.x, origin.y + dy, origin.z + dz)
	]);
	pyramid.push(face2);
	pyramid.push(face2.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

	/* base */
	var base = new Path([
		origin.translate(0, 0, dz),
		new Point(origin.x + dx, origin.y, origin.z + dz),
		new Point(origin.x + dx, origin.y + dy, origin.z + dz),
		new Point(origin.x, origin.y + dy, origin.z + dz)
	]);
	pyramid.push(base);

	return pyramid;
};

module.exports = InvPyramid;
