var fs = require('fs');

var Keen = require('keen-js');


module.exports = {
	client: false,
	active_keen_data: false,
	io: false,

	monitor_process_keen_data: function(io){
		module.exports.io = io;
		module.exports.client = new Keen({
			projectId: "565c7cf3672e6c59de885e59", // String (required always)
			readKey: "0b4ce90e25a8674f4db8a6232c2b50814065d1b9f41ee768c3d427dfd0dd7b1c90535f056acade7a57551360d89dd5f16051bd804d57e57b0ce8b89640cd17f696d15ad098bd098e4d12196b0c5874128a0ce92015a64476e65ae74da94aaaba3f0a678d4337d95bb267ab79575468d9"      // String (required for querying data)

		// protocol: "https",         // String (optional: https | http | auto)
		// host: "api.keen.io/3.0",   // String (optional)
		// requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
		});

		var interval = setInterval(module.exports.process_keen_data, 10 * 1000);
	},

	process_keen_data: function(){
		console.log("Checking Keen Data");
		Keen.ready(function(){
			var query = new Keen.Query("average", 
										{
											eventCollection: "deck_status",
											groupBy: "deck",
											interval: "every_1_minutes",
											targetProperty: "available",
											timeframe: "this_10_minutes",
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

				    	fs.writeFile('public/data/keen_data.json', JSON.stringify(keen_data, null, 4), function(err) {
						    if(err) {
						      console.log(err);
						    } else {
						      console.log("Updated Keen Data JSON");
								module.exports.io.emit('keen-update', keen_data);
								console.log("Sent keen update to clients via websocket");
						    }
						}); 
				    }
				    else{
				    	console.log("No Keen Data Update");
				    }
				}
			});
		});
	}
};