var Keen = require('keen-js');
var request = require("request");


var client = new Keen({
projectId: "565c7cf3672e6c59de885e59", // String (required always)
writeKey: "86e65b316d1ca3a89c290c026a2c4cdee5dd764e836c140e014d7e364b25a1472454f97857cbf3214061a742c0afd4b670fa50b3eb065c9fd0474496805eb92d648fd060729dff23340f353f39b0d825abd3ddfdd2ae82d036e7757f8e80856d3931fa3887723d77968d462f36bae605",   // String (required for sending data)
readKey: "0b4ce90e25a8674f4db8a6232c2b50814065d1b9f41ee768c3d427dfd0dd7b1c90535f056acade7a57551360d89dd5f16051bd804d57e57b0ce8b89640cd17f696d15ad098bd098e4d12196b0c5874128a0ce92015a64476e65ae74da94aaaba3f0a678d4337d95bb267ab79575468d9"      // String (required for querying data)

// protocol: "https",         // String (optional: https | http | auto)
// host: "api.keen.io/3.0",   // String (optional)
// requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
});

var url = "https://s3.amazonaws.com/asheville-parking-decks/spaces.json";

var check_space_data = function(){

	request({
	    url: url,
	    json: true
	}, function (error, response, body) {


	    if (!error && response.statusCode === 200) {
	    	var keen_deck_events = {'deck_status': []};

	        // console.log(body) // Print the json response

	        keen_ts = new Date().toISOString();
	        for(key in body.decks){
	        	deck_data = body.decks[key];

	        	deck_name = deck_data.name;
	        	deck_available = deck_data.available;

	        	var keen_deck_event = { 
	        							deck: deck_name, 
	        							available: deck_available,
	        							keen: { timestamp: keen_ts}
	        						};
	        	console.log(keen_deck_event);

	        	keen_deck_events.deck_status.push(keen_deck_event);

	        	// Send multiple events to several collections
				client.addEvents(keen_deck_events, function(err, res){
				  if (err) {
				  	console.log("error", err);
				    // there was an error!
				  }
				  else {
				  	// console.log("response", res);
				    // see sample response below
				  }
				});
	        }
	    }
	});
};



check_space_data();

