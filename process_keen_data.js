var fs = require('fs');

var Keen = require('keen-js');


module.exports = {
	client: false,
	active_keen_data: false,
	io: false,

	monitorProcessKeenData: function(io){
		module.exports.io = io;
		module.exports.client = new Keen({
			projectId: "565c7cf3672e6c59de885e59", // String (required always)
			readKey: "0b4ce90e25a8674f4db8a6232c2b50814065d1b9f41ee768c3d427dfd0dd7b1c90535f056acade7a57551360d89dd5f16051bd804d57e57b0ce8b89640cd17f696d15ad098bd098e4d12196b0c5874128a0ce92015a64476e65ae74da94aaaba3f0a678d4337d95bb267ab79575468d9"      // String (required for querying data)

		// protocol: "https",         // String (optional: https | http | auto)
		// host: "api.keen.io/3.0",   // String (optional)
		// requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
		});

		fs.stat('public/data/keen_data.json', function(err, stat) {
		    if(err == null) {
		        console.log('File exists');
		    } else if(err.code == 'ENOENT') {
		    	module.exports.processKeenData();
		        // fs.writeFile('log.txt', 'Some log\n');
		    } else {
		        console.log('Some other error: ', err.code);
		    }
		});

		fs.stat('public/data/keen_data_long.json', function(err, stat) {
		    if(err == null) {
		        console.log('Long File exists');
		    } else if(err.code == 'ENOENT') {
		    	module.exports.process_wider_keen_data();
		        // fs.writeFile('log.txt', 'Some log\n');
		    } else {
		        console.log('Some other error: ', err.code);
		    }
		});

		var interval = setInterval(module.exports.processKeenData, 1 * 60 * 1000);
		var interval2 = setInterval(module.exports.process_wider_keen_data, 60 * 60 * 1000);
	},



	convert_keen_result_to_data_array: function(res){
    	var keen_data = {};

    	for(key in res.result){
    		row = res.result[key];

    		time = row.timeframe.start;
    		for(val_key in row.value){
    			value_row = row.value[val_key];
    			keen_deck_name = value_row.deck;

    			keen_deck_available = value_row.result;

    			if(keen_deck_available === null){
    				continue;
    			}

    			if(typeof keen_data[keen_deck_name] == 'undefined'){
    				keen_data[keen_deck_name] = {};
    			}
    			keen_data[keen_deck_name][time] = keen_deck_available;
    		}
    	}
    	return keen_data;
	},

	write_keen_data_to_file: function(data, filename){
    	fs.writeFile(filename, JSON.stringify(data, null, 4), function(err) {
		    if(err) {
		      console.log(err);
		    } else {
		      console.log("Updated Keen Data JSON");
				module.exports.io.emit('keen-update', data);
				console.log("Sent keen update to clients via websocket");
		    }
		});
	},

	processKeenData: function(){
		console.log("Checking Keen Data");
		Keen.ready(function(){
			var query = new Keen.Query("average", 
										{
											eventCollection: "deck_status",
											groupBy: "deck",
											interval: "every_5_minutes",
											targetProperty: "available",
											timeframe: "this_60_minutes",
											timezone: "US/Eastern"
										});

			module.exports.client.run(query, function(err, res){
			    if (err) {
			    	console.log(err);
			      // there was an error!
			    }
			    else {
					if(JSON.stringify(res) != JSON.stringify(module.exports.active_keen_data) ){
		    	      	module.exports.active_keen_data = res;
		    	      
				    	var keen_data = module.exports.convert_keen_result_to_data_array(res);

				    	module.exports.write_keen_data_to_file(keen_data, 'public/data/keen_data.json');

				    }
				    else{
				    	console.log("No Keen Data Update");
				    }
				}
			});
		});
	},

	process_wider_keen_data: function(){
		console.log("Checking Keen Data (WIDER)");
		Keen.ready(function(){
			var query = new Keen.Query("average", 
										{
											eventCollection: "deck_status",
											groupBy: "deck",
											interval: "every_5_minutes",
											targetProperty: "minimum",
											timeframe: "this_15_days",
											timezone: "US/Eastern"
										});

			module.exports.client.run(query, function(err, res){
			    if (err) {
			    	console.log(err);
			      // there was an error!
			    }
			    else {
					if(JSON.stringify(res) != JSON.stringify(module.exports.active_keen_data) ){
		    	      	module.exports.active_keen_data = res;
		    	      
				    	var keen_data = module.exports.convert_keen_result_to_data_array(res);

				    	module.exports.write_keen_data_to_file(keen_data, 'public/data/keen_data_long.json');

				    }
				    else{
				    	console.log("No Keen Data Update");
				    }
				}
			});
		});
	}
};