const Logger = require('./src/logger.js');
const ImageParser = require('./src/image-parser.js');
const TileParser = require('./src/tile-parser.js');
const NegParser = require('./src/neg-parser.js');


exports.decode = function(file_data){

	// the cursor will keep track of which part of the file we're working on
	var cursor = 0;

	// the header will be followed by a `NULL (U+0000)` byte, so we can just keep scanning the bytes one at a time, until we find this null byte
	var header_divider = find_next_instance_of(file_data, cursor, 0);
	cursor = header_divider + 1;

	// for some reason the header is ALSO followed by an `END OF TEXT (U+0003)` byte, but as far as I can tell, Loftar doesn't follow this convention anywhere else in the resource files..
	// at least for this first line (which should be present in every single res file, exactly the same), we just need to ignore the trailing 03 byte. (Ex. header_divider - 1)
	if(file_data.slice(0, header_divider - 1).toString('utf8') !== 'Haven Resource 1'){
		// the file didn't start with `Haven Resource 1`
		// TODO: not sure what to do here yet, for now lets just skip it
		Logger.warn('Resource did not begin with expected `Haven Resource 1`, skipping file.');
		return null;
	}else{

		// alright, we need to iterate over all of the different layers in the res file, and handle them accordingly
		// we don't yet know how many layers there are going to be, so we'll just continue processing until we reach the end of the file
		var finished = false;

		// we can use this to keep track of which layer we're working on
		var current_layer = 0;
		var parsed_layer_data = [];

		while(!finished){

			// we can now start parsing this layer
			// the layer name will be followed by a `NULL (U+0000)` byte, so we can just keep scanning the bytes one at a time, until we find this null byte
			var next_divider = find_next_instance_of(file_data, cursor, 0);
			var layer_name = file_data.slice(cursor, next_divider).toString('utf8');
			cursor = next_divider + 1;

			// the layer length immediately follows the layer name, and is 4 bytes
			var layer_length = file_data.readInt32LE(cursor);
			cursor += 4;

			// and finally, we can start parsing the actual layer data, depending on what type of layer it is
			if(layer_name === 'image'){
				var image_data = ImageParser.parse(file_data.slice(cursor, cursor + layer_length));
				parsed_layer_data.push({
					layer: current_layer,
					layer_type: layer_name,
					data: image_data
				});
			}else if(layer_name === 'tile'){
				var tile_data = TileParser.parse(file_data.slice(cursor, cursor + layer_length));
				parsed_layer_data.push({
					layer: current_layer,
					layer_type: layer_name,
					data: tile_data
				});
			}else if(layer_name === 'neg'){
				var neg_data = NegParser.parse(file_data.slice(cursor, cursor + layer_length));
				parsed_layer_data.push({
					layer: current_layer,
					layer_type: layer_name,
					data: neg_data
				});
			}else{
				// we're not currently parsing any of these layer types, so we'll just store the raw data somewhere and move on
				var unparsed_data_types = ['anim', 'tooltip', 'action', 'plparts', 'plalay', 'pagina', 'code', 'codeentry', 'audio', 'tileset', 'midi'];
				if(unparsed_data_types.indexOf(layer_name) === -1){
					// this isn't one of the supported legacy layer types... but I guess we'll copy it across anyways after printing a warning ¯\_(ツ)_/¯
					Logger.warn('Resource has unrecognized layer type of `' + layer_name + '`');
				}
				// for data that we're not directly parsing, I think we'll just convert it to base64 and return that for now
				parsed_layer_data.push({
					layer: current_layer,
					layer_type: layer_name,
					data: {
						raw: file_data.slice(cursor, cursor + layer_length).toString('base64')
					}
				});
			}

			// we should be done handling this layer now, lets update our cursor and current layer counter
			cursor += layer_length;
			current_layer++;

			if(cursor === file_data.byteLength){
				// we've reached the end of the file!
				// lets break out of the loop
				finished = true;
			}
		}

		return parsed_layer_data;
	}
}

function find_next_instance_of(buffer, start, search_byte){
	var next_divider = -1;
	for(var i = start ; i < buffer.byteLength ; i++){
		if(buffer[i] === search_byte){
			next_divider = i;
			i = Infinity;
		}
	}
	return next_divider;
}
