var request = require("request");
var Keen = require("keen-js");

var keenData = {};


module.exports = {
	client: false,
	dataFeedUrl: "http://data.avlpark.com",
	activeSpacesData: false,
	io: false,
	monitorCheckSpaceData(io){
		module.exports.io = io;

		module.exports.client  = new Keen({
			projectId: "565c7cf3672e6c59de885e59", // String (required always)
			writeKey: "86e65b316d1ca3a89c290c026a2c4cdee5dd764e836c140e014d7e364b25a1472454f97857cbf3214061a742c0afd4b670fa50b3eb065c9fd0474496805eb92d648fd060729dff23340f353f39b0d825abd3ddfdd2ae82d036e7757f8e80856d3931fa3887723d77968d462f36bae605",   // String (required for sending data)
			readKey: "0b4ce90e25a8674f4db8a6232c2b50814065d1b9f41ee768c3d427dfd0dd7b1c90535f056acade7a57551360d89dd5f16051bd804d57e57b0ce8b89640cd17f696d15ad098bd098e4d12196b0c5874128a0ce92015a64476e65ae74da94aaaba3f0a678d4337d95bb267ab79575468d9"	  // String (required for querying data)
			// protocol: "https",		 // String (optional: https | http | auto)
			// host: "api.keen.io/3.0",   // String (optional)
			// requestType: "jsonp"	   // String (optional: jsonp, xhr, beacon)
		});

		var interval = setInterval(module.exports.checkSpaceData, 60 * 1000);
	},

	checkSpaceData: function(){
		console.log("Checking for space data");
		// console.log(module.exports.dataFeedUrl);
		request({
			url: module.exports.dataFeedUrl,
			json: true
			}, function (error, response, body) {

				if (!error && response.statusCode === 200) {
					var keenTs = new Date().toISOString();

					if(JSON.stringify(body) != JSON.stringify(module.exports.activeSpacesData)){
						module.exports.activeSpacesData = body;
						module.exports.io.emit("spaces-update", module.exports.activeSpacesData);
						console.log("Sent spaces update to clients via socket");
					}
					else{
						console.log("No spaces update");
						return;
					}

					var keenDeckEvents = {"deck_status": [], "deck_status_all" : []};

					var keenEventAllDecks = {
													keen: { timestamp: keenTs}
												};

					for(var key in body.decks){
						var deckData = body.decks[key];

						var deckName = deckData.name;
						var deckAvailable = parseInt(deckData.available);

						var keenDeckEvent = { 
												deck: deckName, 
												available: deckAvailable,
												keen: { 
														timestamp: keenTs,
														location: {
															coordinates: [deckData.coords[1], deckData.coords[0]]
														} 

													}
											};

						keenEventAllDecks[deckName] = deckAvailable;
						keenDeckEvents.deck_status.push(keenDeckEvent);
					}

					keenDeckEvents.deck_status_all.push(keenEventAllDecks);
					// console.log(keenDeckEvents);
					// Send multiple events to several collections
					module.exports.client.addEvents(keenDeckEvents, function(err, res){
					if (err) {
						console.log("error", err);
						// there was an error!
					}
					else {
						console.log("Sent keen events");
						// console.log("response", res.deck_status);
						// see sample response below
					}
				});
			}
		});
	}
};
