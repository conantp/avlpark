
 

window.onload = function() { init() };

  var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml?gid=809388972&single=true';
  var processed_data = {};

  var current_date = new Date();
  var current_month = false;
  var current_day = false;
  var current_year = false;
  var current_week = false;
  var active_data = {};


var tabletop;


Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};


  function init() {
  	setDateVars();

    Tabletop.init( { key: public_spreadsheet_url,
                     callback: showInfo,
                     simpleSheet: false } )
  }

  var month_data = {};
  var month_data_by_deck = {};

  function buildMonthAverage(){
	for(index in data){
		row = data[index];

	    var d = new Date(row.Date);

	    row_mo = d.getMonth();
	    row_yr = d.getFullYear();
	    row_dy = d.getDate();


	    key = row_yr + "-" + row_mo;

	    for(deck in row){
				if(	deck == "Date" || 
					deck == "Day" || 
					deck == "Week" || 
					deck == "Month" || 
					deck == "Year"){
				continue;
			}

			// otherwise, it's actually a deck

			deck_row = row[deck];

			value = parseFloat(deck_row.replace("%", "") );

			if(value < 1){
				continue;
			}

			if(typeof month_data[key] == "undefined"){
				month_data[key] = {'decks' : {}};
			}

			if(typeof month_data[key]['decks'][deck] == "undefined"){
				month_data[key]['decks'][deck] = {'sum' : 0, 'count' : 0, 'values' : {} };
			}

			month_data[key]['decks'][deck]['sum'] += value;
			month_data[key]['decks'][deck]['count']++;
			month_data[key]['decks'][deck]['values'][row_dy] = row;
		}
	}



	for(key in month_data){
		month = month_data[key];
		for(deck_key in month['decks']){
			deck = month['decks'][deck_key];

			deck['average'] = deck['sum'] / deck['count'];
		}
	}

	// Repeat the loop, build month data
	for(key in month_data){
		if(key.indexOf('2015-') !== 0 && key.indexOf('2014-') !== 0){
			continue;
		}
		month = month_data[key];
		for(deck_key in month['decks']){
			deck = month['decks'][deck_key];

			if(typeof month_data_by_deck[deck_key] == 'undefined'){
				month_data_by_deck[deck_key] = {};
			}

			if(isNaN(deck['average']) ){
				continue;
			}

			month_data_by_deck[deck_key][key] = deck['average'].toFixed(0);

		}
	}

  }

  function buildDayOfWeekAverage(){
  	year = 2012;

  	while(year < 2016){
	  	day = 0;
	  	while(day < 7){
		  	week = 0;
		  	while(week <= 52){

		  		search_str = year + "-" + week + "-" + day;

		  		for(deck in processed_data[search_str]){
		  			if(	deck == "Date" || 
		  				deck == "Day" || 
		  				deck == "Week" || 
		  				deck == "Month" || 
		  				deck == "Year"){
						continue;
					}
					value = parseFloat(processed_data[search_str][deck].replace("%", "") );

					if(typeof active_data[deck][day] == "undefined"){
						active_data[deck][day] = 0;
						active_data[deck][day+"_count"] = 0;
					}

		  			active_data[deck][day] += value;
		  			active_data[deck][day+"_count"]++;
		  		}

		  		// active_data[year] = processed_data[search_str];

		  		week++;
		  	}

	  		for(deck in active_data){
				value = active_data[deck][day] / active_data[deck][day+"_count"];

			 	dateString = year+"-"+day;//dateFormat(day, "dddd");

			 	if(typeof active_data[deck]['year_data'] == 'undefined'){
			 		active_data[deck]['year_data'] = {};
			 	}
			 	if(typeof active_data[deck]['year_data'][year] == 'undefined'){
			 		active_data[deck]['year_data'][year] = {};
			 	}

			 	if(value > 0){
					active_data[deck][dateString] = value.toFixed(2) + "%";
					active_data[deck]['year_data'][year][day] = (100 - value).toFixed(2);
			 	}
				delete active_data[deck][day];
				delete active_data[deck][day+"_count"];
			}
		  	day++;
		}
		year++;
	}

  }

  function buildActiveData(){
  	year = 2012;

	for(column in processed_data["2015-1-0"]){
		if(	column == "Date" || 
			column == "Day" || 
			column == "Week" || 
			column == "Month" || 
			column == "Year"){
			continue;
		}

		active_data[column] = {};
	}

  	while(year <= 2015){
  		search_str = year + "-" + current_week + "-" + current_day;
  		console.log(search_str);

  		for(column in processed_data[search_str]){
  			if(	column == "Date" || 
  				column == "Day" || 
  				column == "Week" || 
  				column == "Month" || 
  				column == "Year"){
				continue;
			}
			// if(processed_data[search_str][column] > 0){
	  			active_data[column][year] = processed_data[search_str][column];
			// }
  		}

  		// active_data[year] = processed_data[search_str];

  		year++;
  	}
  	console.log(active_data);
  }

  function showInfo(data2, tabletop2) {
    // alert("Successfully processed!")

    tabletop = tabletop2;
    data = tabletop.sheets("For App").all();	

    for (index in data){
    	row = data[index];
    	processed_data[formatDate(row.Date)] = row;
    }

    // console.log(processed_data);
    buildActiveData();
    buildDayOfWeekAverage();
    buildMonthAverage();
    renderData();

  }

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

  function renderData(){
  	$("#current-date").html(dateFormat(current_date, "dddd, mmmm dS") );
  	for (deck in active_data){
  		row = active_data[deck];

  		score = 10 - parseFloat(row['2015-'+current_day].replace("%", "")) / 10;
  		score = score.toFixed(1);

  		deck_class = 'deck-green';
  		if(score < 1){
  			deck_class = 'deck-red';
  		}
  		else if(score < 2){
  			deck_class = 'deck-orange';
  		}

  		html = "<li class='parking-deck "+deck_class+"'>" ;
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
	var myLineChart = [];
	var ctx = []
	$(".chart").each(function(){

		// Get the context of the canvas element we want to select

	  	myLineChart.push( new Chart($(this)[0].getContext("2d") ).Bar(chart_data[i++], options) );
	
	});

	i = 0;
	$(".chart2").each(function(){

		// Get the context of the canvas element we want to select

	  	myLineChart.push( new Chart($(this)[0].getContext("2d") ).Line(chart_data2[i++], options2) );
	
	});

	// $(".parking-deck").find('.chart-container').slideToggle();

	$(".parking-deck").click(function(){
		$(this).find('.chart-container').slideToggle();

	});

	$("#wrapper").removeClass('blur');




  }