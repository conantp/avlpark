
 
  var processed_data = {};

  var current_date = new Date();
  var current_month = false;
  var current_day = false;
  var current_year = false;
  var current_week = false;
  var month_data_by_deck = {};
var myLineChart = [];

var deck_realtime_graphs = {};

var deck_capacity = {
'Civic Center': 550,
'Rankin Ave': 262,
'Biltmore Ave': 404,
'Wall Street': 221 
};

// window.onload = function() { init() };

function init() {
	month_data_by_deck = active_data.month_data_by_deck;
	delete active_data.month_data_by_deck;
	setDateVars();
	getKeenData();

}

Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

function setDateVars(){
var d = new Date();


current_day = d.getDay();
current_week = d.getWeekNumber();
current_year = d.getFullYear();
}

function formatDate(date) {
var d = new Date(date),
    // month = '' + (d.getMonth() + 1),
    // day = '' + d.getDate(),
    year = d.getFullYear();

// if (month.length < 2) month = '0' + month;
// if (day.length < 2) day = '0' + day;

week = d.getWeekNumber();
day = d.getDay();


return [year, week, day].join('-');
}


function getKeenData(){
	// Keen data passed into template
	renderData();
	renderKeenData();
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

	for(deck in keen_data){
		var keys = [];
		for(var k in keen_data[deck]) keys.push(k.substr(11, 5));

		temp_data_3 = {
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
		chart_data3[deck] = temp_data_3;

		console.log(deck, deck_capacity[deck]);

		options3.scaleStepWidth = Math.ceil(deck_capacity[deck]/options3.scaleSteps);

		deck_realtime_graphs[deck] = new Chart($('li.parking-deck[data-deck-key="'+deck+'"]').find('.chart3')[0].getContext("2d")).Line(chart_data3[deck], options3);
	}
}

function checkForNewData(data){

	// $.get("/data", function(data){ 
		console.log(data); 

		keen_data = data;

		for(deck_key in data){
			// Get last label
			var last_label = chart_data3[deck_key].labels[chart_data3[deck_key].labels.length - 1];


			var keys = [];
			for(var k in keen_data[deck_key]) keys.push(k.substr(11, 5));

			chart_data3[deck_key].labels = keys;
			chart_data3[deck_key].datasets[0].data = keen_data[deck_key];

	  		new_score = keen_data[deck_key][Object.keys(keen_data[deck_key])[Object.keys(keen_data[deck_key]).length - 1]];

			// $('li.parking-deck[data-deck-key="'+deck_key+'"]').find('.score').html(new_score);


			var last_key = keys[keys.length - 1];

			console.log('labels', last_label, last_key);	

			if(last_label == last_key){
				deck_realtime_graphs[deck_key].datasets[0].points[deck_realtime_graphs[deck_key].datasets[0].points.length - 1].value = new_score;
				deck_realtime_graphs[deck_key].update();
			}	
			else{
				deck_realtime_graphs[deck_key].removeData();
				deck_realtime_graphs[deck_key].addData([parseInt(new_score)], last_key )
			}

		}

	  // window.setTimeout(checkForNewData, 10000);

	// });
}

function renderData(){
  	$(".current-date").html(dateFormat(current_date, "dddd, mmmm dS") );

	// $("#parking-deck-list").before("<div id='chart3' width=\"100%\" height=\"800\" style='height: 800px'></div>");

  	for (deck in active_data){
  		row = active_data[deck];

  		score = 10 - parseFloat(row['2015-'+current_day].replace("%", "")) / 10;
  		score = score.toFixed(1);

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


  		deck_class = 'deck-green';
  		if(score < 1){
  			deck_class = 'deck-red';
  		}
  		else if(score < 10){
  			deck_class = 'deck-orange';
  		}


  		html = "";


  		html += "<li class='parking-deck "+deck_class+" col-sm-3' data-deck-key='"+ deck_key + "'>" ;
	  		html += "<div class='parking-deck-inner'>";
		  		html += "<h2>" + deck + "</h2>";
		  		html += "<div class='score'>" + score + "</div>";
		  		html += "<div>";
			  		html += "<ul class='year-list'>";
			  			i = 0;
			  			for(year in active_data[deck]){
			  				if(i++ > 3){
			  					break;
			  				}
			  				if(typeof active_data[deck][year] == 'string'){
				  				percent = active_data[deck][year];
				  				percent = parseFloat(percent.replace("%", "")).toFixed(0);
				  				if(percent > 0){
					  				html += "<li>";
					  					html += "<p><b>" + year + "</b> : " + percent + "%</p>";
					  				html += "</li>";
					  			}
				  			}
			  			}

			  		html += "</ul>";
			  		html += "<div class='chart-container'>";
				  		html += "<canvas class='chart' width=\"100%\" height=\"200\"></canvas>";
				  		html += "<canvas class='chart2' width=\"100%\" height=\"200\"></canvas>";
				  		html += "<h3>Past 4 Hours</h3>"
				  		html += "<canvas class='chart3' width=\"100%\" height=\"200\"></canvas>";
			  		html += "</div>";
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

	chart_data = [];
	chart_data2 = [];
	chart_data3 = {};


	// for(year in active_data["Civic Center"]['year_data']){
	// 	chart_data.push(active_data["Civic Center"]['year_data'][year]);
	// }
	for(deck in active_data){

		temp_data = {
		    labels: ["Su.", "Mo.", "Tu.", "We.", "Th.", "Fr.", "Sa."],
		    datasets: [
		        {
		            label: "My First dataset",
		            fillColor: "rgba(255, 255, 255, 0.5)",
		            strokeColor: "rgba(255, 255, 255, 1.0)",
		            highlightFill: "rgba(255,255,255,0.7)",
		            highlightStroke:  "rgba(255,255,255,1)",
		            data: active_data[deck]['year_data']['2015']
		        }
		    ]
		};

		temp_data_2 = {
		    labels: ["14-Jan", "14-Feb", "14-Mar", "14-Apr", "14-May", "14-Jun", "14-Jul", "14-Aug", "14-Sep", "14-Oct", "14-Nov", "14-Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
		    datasets: [
		        {
		            label: "My First dataset",
		            fillColor: "rgba(120, 230, 120, 0.5)",
		            strokeColor: "rgba(100, 255, 100, 1.0)",
		            highlightFill: "rgba(255,255,255,0.7)",
		            highlightStroke:  "rgba(255,255,255,1)",
		            data: month_data_by_deck[deck]
		        }
		    ]
		};

		chart_data.push(temp_data);
		chart_data2.push(temp_data_2);

	}



  	$("#parking-deck-list").slideDown('fast');


	i = 0;
	myLineChart = [];

	$(".chart").each(function(){

		// Get the context of the canvas element we want to select

	  	// myLineChart.push( new Chart($(this)[0].getContext("2d") ).Bar(chart_data[i++], options) );
	
	});

	i = 0;
	$(".chart2").each(function(){

		// Get the context of the canvas element we want to select

	  	// myLineChart.push( new Chart($(this)[0].getContext("2d") ).Line(chart_data2[i++], options2) );
	
	});

	$(".chart, .chart2").hide();

	// $(".parking-deck").find('.chart-container').slideToggle();

	$(".parking-deck").click(function(){
		$(this).find('.chart-container').slideToggle();

	});
  }

  init();

  var socket = io.connect();

socket.on('spaces-update', function(data){

  console.log("Message received: ", data);
		for(key in data.decks){
			row = data.decks[key];

			$('li.parking-deck[data-deck-key="'+row.name+'"]').find('.score').html(row.available);

			// console.log(row);
		}

});

socket.on('keen-update', function(data){

  console.log("Keen received: ", data);
		
	checkForNewData(data);

});

