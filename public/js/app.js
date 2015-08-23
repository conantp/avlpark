
 

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

  function buildDayOfWeekAverage(){
  	year = 2008;

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

    console.log(processed_data);
    buildActiveData();
    buildDayOfWeekAverage();
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
		  			for(year in active_data[deck]){
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
			  		html += "<canvas class='chart' width=\"100%\" height=\"100\"></canvas>";
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
	    scaleShowVerticalLines: true,

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

    // // scaleStartValue: 0,
    // // scaleSteps: 10,
    // // scaleStepWidth: Math.ceil(100 / 10),

    // scaleOverride: true,

	};

	chart_data = [];

	// for(year in active_data["Civic Center"]['year_data']){
	// 	chart_data.push(active_data["Civic Center"]['year_data'][year]);
	// }
	for(deck in active_data){

		temp_data = {
		    labels: ["Su.", "Mo.", "Tu.", "We.", "Th.", "Fr.", "Sa."],
		    datasets: [
		        {
		            label: "My First dataset",
		            fillColor: "rgba(0, 230, 0, 0.8)",
		            strokeColor: "rgba(100, 255, 100, 1.0)",
		            highlightFill: "rgba(255,255,255,1)",
		            highlightStroke:  "rgba(255,255,255,1)",
		            data: active_data[deck]['year_data']['2015']
		        }
		    ]
		};

		chart_data.push(temp_data);
	}

	 

  	$("#parking-deck-list").slideDown('fast');


	i = 0;
	var myLineChart = [];
	var ctx = []
	$(".chart").each(function(){

		// Get the context of the canvas element we want to select

	  	myLineChart.push( new Chart($(this)[0].getContext("2d") ).Bar(chart_data[i++], options) );
	
	});

	// $(".parking-deck").find('.chart-container').slideToggle();

	$(".parking-deck").click(function(){
		$(this).find('.chart-container').slideToggle();

	});

	$("#wrapper").removeClass('blur');




  }