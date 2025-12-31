/*
	z        => 2 bytes [int]
	subz     => 2 bytes [int]
	nooff    => 1 byte [boolean] (Obsolete flag 1: Layered)
	id       => 2 bytes [int] (used for identifying the image, used in anim)
	o        => 4 bytes [Coord=>(int,int)]
	.png byte array [byte[]]
*/

exports.parse = function(layer_data){

	var z = layer_data.readInt16LE(0);
	var subz = layer_data.readInt16LE(2);
	var nooff = (layer_data[4] === 2 ? true : false);
	var id = layer_data.readInt16LE(5);
	var o = {
		x: layer_data.readInt16LE(7),
		y: layer_data.readInt16LE(9)
	}
	var image_data = layer_data.slice(11);

	return {
		z: z,
		subz: subz,
		nooff: nooff,
		id: id,
		o: o,
		image: image_data
	};
}
