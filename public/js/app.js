/*global
activeData, keen_data
*/

// Segment Analytics
!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="4.0.0";
analytics.load("MY4NGMPWvid7w4oA8DnwYOcYHcPXZzDe");
analytics.page();
}}();
// End Segment Analytics

var processedData = {};

var currentDate = new Date();
var currentMonth = false;
var currentDay = false;
var currentYear = false;
var currentWeek = false;
var monthDataByDeck = {};
var myLineChart = [];

var deckRealtimeGraphs = {};

var chartData;
var chartData2;
var chartData3;

var deckCapacity = {
	"Civic Center": 550,
	"Rankin Ave": 262,
	"Biltmore Ave": 404,
	"Wall Street": 221,
	"11 Sears Ally": 1000,
	"College Street": 1000
};


Date.prototype.getWeekNumber = function(){
	var d = new Date(+this);
	d.setHours(0,0,0);
	d.setDate(d.getDate()+4-(d.getDay()||7));
	return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

function setDateVars(){
	var d = new Date();

	currentDay = d.getDay();
	currentWeek = d.getWeekNumber();
	currentYear = d.getFullYear();
}

function formatDate(date) {
	var d = new Date(date);
	var year = d.getFullYear();
	var week = d.getWeekNumber();
	var day = d.getDay();

	return [year, week, day].join("-");
}



function renderKeenData(){

	var options3 = {

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(255,255,255,0.2)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: false,

		//Boolean - Whether the line is curved between points
		bezierCurve : true,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 3,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		,	

		responsive: true,
			maintainAspectRatio: true,

		scaleStartValue: 0,
		scaleSteps: 5,
		scaleStepWidth: 30,

		scaleOverride: true,

	};

	for(var deck in keen_data){
		if ({}.hasOwnProperty.call(keen_data, deck)) {
			var keys = [];
	
			for(var k in keen_data[deck]){
				keys.push(k.substr(11, 5));
			}

			var tempData3 = {
				labels: keys,
				datasets: [
					{
						label: "My First dataset",
						fillColor: "rgba(120, 230, 120, 0.5)",
						strokeColor: "rgba(100, 255, 100, 1.0)",
						highlightFill: "rgba(255,255,255,0.7)",
						highlightStroke:  "rgba(255,255,255,1)",
						data: keen_data[deck]
					}
				]
			};
			chartData3[deck] = tempData3;

			// console.log(deck, deckCapacity[deck]);

			options3.scaleStepWidth = Math.ceil(deckCapacity[deck]/options3.scaleSteps);

			deckRealtimeGraphs[deck] = new Chart($('li.parking-deck[data-deck-key="'+deck+'"]').find('.chart3')[0].getContext("2d")).Line(chartData3[deck], options3);
		}
	}
}

function checkForNewData(data){

	// $.get("/data", function(data){ 
		console.log(data); 

		keen_data = data;

		for(var deck_key in data){
			// Get last label
			var last_label = chartData3[deck_key].labels[chartData3[deck_key].labels.length - 1];


			var keys = [];
			for(var k in keen_data[deck_key]) keys.push(k.substr(11, 5));

			chartData3[deck_key].labels = keys;
			chartData3[deck_key].datasets[0].data = keen_data[deck_key];

			var new_score = keen_data[deck_key][Object.keys(keen_data[deck_key])[Object.keys(keen_data[deck_key]).length - 1]];

			// $('li.parking-deck[data-deck-key="'+deck_key+'"]').find('.score').html(new_score);

			var last_key = keys[keys.length - 1];

			if(last_label == last_key){
				deckRealtimeGraphs[deck_key].datasets[0].points[deckRealtimeGraphs[deck_key].datasets[0].points.length - 1].value = new_score;
				deckRealtimeGraphs[deck_key].update();
			}	
			else{
				deckRealtimeGraphs[deck_key].removeData();
				deckRealtimeGraphs[deck_key].addData([parseInt(new_score)], last_key )
			}

		}

	  // window.setTimeout(checkForNewData, 10000);

	// });
}

function renderData(){
	$(".current-date").html(dateFormat(currentDate, "dddd, mmmm dS") );

	// $("#parking-deck-list").before("<div id='chart3' width=\"100%\" height=\"800\" style='height: 800px'></div>");

	for (deck in activeData){
		row = activeData[deck];

		// score = 10 - parseFloat(row["2015-"+currentDay].replace("%", "")) / 10;
		// score = score.toFixed(1);

		deck_key = deck;
		if(deck_key == "Biltmore Ave (Aloft)"){
			deck_key = "Biltmore Ave";
			deck = deck_key;
		}

		if(deck_key == "Rankin Street"){
			deck_key = "Rankin Ave";
		}

		console.log(deck_key);
		// NEW SCORE
		score = keen_data[deck_key][Object.keys(keen_data[deck_key])[Object.keys(keen_data[deck_key]).length - 1]];


		deck_class = "deck-green";
		if(score < 1){
			deck_class = "deck-red";
		}
		else if(score < 10){
			deck_class = "deck-orange";
		}


		html = "";


		html += "<li class='parking-deck "+deck_class+" col-sm-3' data-deck-key='"+ deck_key + "'>" ;
			html += "<div class='parking-deck-inner'>";
				html += "<h2 class='text-center display-block'>" + deck + "</h2>";
				html += "<div class='score-container text-center'><div class='score odometer'>0</div><b>&nbsp;&nbsp;spaces available</b></div>";
				html += "<div class='graph-container'>";
					html += "<div class='chart-container'>";
						html += "<canvas class='chart' width=\"100%\" height=\"200\"></canvas>";
						html += "<canvas class='chart2' width=\"100%\" height=\"200\"></canvas>";
						html += "<small class='text-center display-block'>Graph of the past hour</small>"
						html += "<canvas class='chart3' width=\"100%\" height=\"200\"></canvas>";
					html += "</div>";
					// html += "<div class='parking-deck-footer'>";
					// 	html += "<small class='text-center display-block'>" + "Max use in previous years</small>";			  		
					// 	html += "<ul class='year-list'>";
					// 		i = 0;
					// 		for(var year in activeData[deck]){
					// 			if(i++ > 3){
					// 				break;
					// 			}
					// 			if(typeof activeData[deck][year] == 'string'){
					// 				percent = activeData[deck][year];
					// 				percent = parseFloat(percent.replace("%", "")).toFixed(0);
					// 				if(percent > 0){
					// 					html += "<li>";
					// 						html += "<p><b>" + year + "</b> : " + percent + "%</p>";
					// 					html += "</li>";
					// 				}
					// 			}
					// 		}

					// 	html += "</ul>";
					// html +="</div>";			  		
				html += "</div>";
			html += "</div>";	  		
		html += "</li>";
		$("#parking-deck-list").append(html);
	}


	var options = {

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(255,255,255,0.2)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: false,

		//Boolean - Whether the line is curved between points
		bezierCurve : true,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 3,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		,	

		responsive: true,
			maintainAspectRatio: true,

	scaleStartValue: 0,
	scaleSteps: 2,
	scaleStepWidth: Math.ceil(40 / 2),

	scaleOverride: true,

	};

	var options2 = {

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(255,255,255,0.2)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: false,

		//Boolean - Whether the line is curved between points
		bezierCurve : true,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 3,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		,	

		responsive: true,
			maintainAspectRatio: true,

		scaleStartValue: 0,
		scaleSteps: 4,
		scaleStepWidth: Math.ceil(100 / 4),

		scaleOverride: true,

	};

	chartData = [];
	chartData2 = [];
	chartData3 = {};


	// for(year in activeData["Civic Center"]['year_data']){
	// 	chartData.push(activeData["Civic Center"]['year_data'][year]);
	// }
	for(var deck in activeData){

		tempData = {
			labels: ["Su.", "Mo.", "Tu.", "We.", "Th.", "Fr.", "Sa."],
			datasets: [
				{
					label: "My First dataset",
					fillColor: "rgba(255, 255, 255, 0.5)",
					strokeColor: "rgba(255, 255, 255, 1.0)",
					highlightFill: "rgba(255,255,255,0.7)",
					highlightStroke:  "rgba(255,255,255,1)",
					data: false //activeData[deck]['year_data']['2015']
				}
			]
		};

		tempData2 = {
			labels: ["14-Jan", "14-Feb", "14-Mar", "14-Apr", "14-May", "14-Jun", "14-Jul", "14-Aug", "14-Sep", "14-Oct", "14-Nov", "14-Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
			datasets: [
				{
					label: "My First dataset",
					fillColor: "rgba(120, 230, 120, 0.5)",
					strokeColor: "rgba(100, 255, 100, 1.0)",
					highlightFill: "rgba(255,255,255,0.7)",
					highlightStroke:  "rgba(255,255,255,1)",
					data: false //monthDataByDeck[deck]
				}
			]
		};

		chartData.push(tempData);
		chartData2.push(tempData2);

	}



	$("#parking-deck-list").slideDown("fast");


	i = 0;
	myLineChart = [];

	$(".chart").each(function(){

		// Get the context of the canvas element we want to select

		// myLineChart.push( new Chart($(this)[0].getContext("2d") ).Bar(chartData[i++], options) );
	
	});

	i = 0;
	$(".chart2").each(function(){

		// Get the context of the canvas element we want to select

		// myLineChart.push( new Chart($(this)[0].getContext("2d") ).Line(chartData2[i++], options2) );
	
	});

	$(".chart, .chart2").hide();

	// $(".parking-deck").find('.chart-container').slideToggle();

	$(".parking-deck").click(function(){
		$(this).find(".chart-container").slideToggle();

	});
}


function getKeenData(){
	// Keen data passed into template
	renderData();
	renderKeenData();
}



// window.onload = function() { init() };

function init() {
	monthDataByDeck = activeData.monthDataByDeck;
	delete activeData.monthDataByDeck;
	setDateVars();
	getKeenData();
}

init();

var socket = io.connect();

function updateScoreData(data){
	var total_available = 0;
	for(var key in data.decks){
		row = data.decks[key];
		total_available += parseInt(row.available);
		$('li.parking-deck[data-deck-key="'+row.name+'"]').find(".score").html(parseInt(row.available) );
		// console.log(row);
	}
	$(".total-available b").html(total_available);
}

socket.on("spaces-update", function(data){
	console.log("Message received: ", data);
	updateScoreData(data);
});

socket.on("keen-update", function(data){
	console.log("Keen received: ", data);
	checkForNewData(data);
});

