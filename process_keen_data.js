var fs = require("fs");
var Keen = require("keen-js");

module.exports = {
	client: false,
	activeKeenData: false,
	io: false,

	monitorProcessKeenData(io){
		module.exports.io = io;
		module.exports.client = new Keen({
			projectId: "565c7cf3672e6c59de885e59", // String (required always)
			readKey: "0b4ce90e25a8674f4db8a6232c2b50814065d1b9f41ee768c3d427dfd0dd7b1c90535f056acade7a57551360d89dd5f16051bd804d57e57b0ce8b89640cd17f696d15ad098bd098e4d12196b0c5874128a0ce92015a64476e65ae74da94aaaba3f0a678d4337d95bb267ab79575468d9"	  // String (required for querying data)

		// protocol: "https",		 // String (optional: https | http | auto)
		// host: "api.keen.io/3.0",   // String (optional)
		// requestType: "jsonp"	   // String (optional: jsonp, xhr, beacon)
		});

		fs.stat("public/data/keen_data.json", function(err, stat) {
			if(err == null) {
				console.log("File exists");
			} else if(err.code === "ENOENT") {
				module.exports.processKeenData();
				// fs.writeFile("log.txt", "Some log\n");
			} else {
				console.log("Some other error: ", err.code);
			}
		});

		fs.stat("public/data/keen_data_long.json", function(err, stat) {
			if(err == null) {
				console.log("Long File exists");
			} else if(err.code == "ENOENT") {
				module.exports.processWiderKeenData();
				// fs.writeFile("log.txt", "Some log\n");
			} else {
				console.log("Some other error: ", err.code);
			}
		});

		var interval = setInterval(module.exports.processKeenData, 5 * 60 * 1000);
		// var interval2 = setInterval(module.exports.processWiderKeenData, 60 * 60 * 1000);
	},



	convertKeenResultToDataArray(res){
		var keenData = {};

		for(var key in res.result){
			var row = res.result[key];
			var time = row.timeframe.start;

			for(var valKey in row.value){
				var valueRow = row.value[valKey];
				var keenDeckName = valueRow.deck;

				var keenDeckAvailable = valueRow.result;

				if(keenDeckAvailable === null){
					continue;
				}

				if(typeof keenData[keenDeckName] == "undefined"){
					keenData[keenDeckName] = {};
				}
				keenData[keenDeckName][time] = keenDeckAvailable;
			}
		}
		return keenData;
	},

	writeKeenDataToFile(data, filename){
		fs.writeFile(filename, JSON.stringify(data, null, 4), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("Updated Keen Data JSON");
				module.exports.io.emit("keen-update", data);
				console.log("Sent keen update to clients via websocket");
			}
		});
	},

	processKeenData(){
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
					if(JSON.stringify(res) != JSON.stringify(module.exports.activeKeenData) ){
						module.exports.activeKeenData = res;
						var keenData = module.exports.convertKeenResultToDataArray(res);

						module.exports.writeKeenDataToFile(keenData, "public/data/keen_data.json");
					}
					else{
						console.log("No Keen Data Update");
					}
				}
			});
		});
	},

	processWiderKeenData(){
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
					if(JSON.stringify(res) != JSON.stringify(module.exports.activeKeenData) ){
						module.exports.activeKeenData = res;

						var keen_data = module.exports.convertKeenResultToDataArray(res);

						module.exports.writeKeenDataToFile(keen_data, "public/data/keen_data_long.json");
					}
					else{
						console.log("No Keen Data Update");
					}
				}
			});
		});
	}
};