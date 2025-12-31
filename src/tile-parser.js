/*
	t    => 1 byte [char]
	id   => 1 byte [int]
	w    => 2 bytes [int]
	.png byte array [byte[]]
*/

exports.parse = function(layer_data){

	var t = layer_data.slice(0, 1).toString('utf8');
	var id = layer_data[1];
	var w = layer_data.readInt16LE(2);
	var image_data = layer_data.slice(4);

	return {
		t: t,
		id: id,
		w: w,
		image: image_data
	};
}
