/*
	cc => 4 bytes [Coord=>(int,int)]
	bc => 4 bytes [Coord=>(int,int)]
	bs => 4 bytes [Coord=>(int,int)]
	sz => 4 bytes [Coord=>(int,int)]
	en => 1 byte [int]
	for ( i = 0; i -> en)
		epid => 1 byte [int]
		cn   => 2 bytes [int]
		for( j = 0; j -> cn)
			ep[epid][j] => 4 bytes [Coord=>(int,int)]
*/

exports.parse = function(layer_data){

	var cc = {
		x: layer_data.readInt16LE(0),
		y: layer_data.readInt16LE(2)
	};
	var bc = {
		x: layer_data.readInt16LE(4),
		y: layer_data.readInt16LE(6)
	};
	var bs = {
		x: layer_data.readInt16LE(8),
		y: layer_data.readInt16LE(10)
	};
	var sz = {
		x: layer_data.readInt16LE(12),
		y: layer_data.readInt16LE(14)
	};

	// TODO: Need to validate the results of ep, the output looks a little strange and could be wrong
	var ep = [];
	var en = layer_data.readInt8(16);
	var cursor = 17;
	for(var i = 0 ; i < en ; i++){
		var epid = layer_data.readInt8(cursor);
		var cn = layer_data.readInt16LE(cursor + 1);
		cursor += 3;
		ep[epid] = [];
		for(var j = 0 ; j < cn ; j++){
			ep[epid][j] = {
				x: layer_data.readInt16LE(cursor),
				y: layer_data.readInt16LE(cursor + 2)
			};
			cursor += 4;
		}
	}

	return {
		cc,
		bc,
		bs,
		sz,
		ep
	};
}
