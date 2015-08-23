
 

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
		  		console.log("Day of week avg", search_str);

		  		for(deck in processed_data[search_str]){
		  			if(	deck == "Date" || 
		  				deck == "Day" || 
		  				deck == "Week" || 
		  				deck == "Month" || 
		  				deck == "Year"){
						continue;
					}
					value = parseFloat(processed_data[search_str][deck].replace("%", "") );
					console.log(value);

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

			 	if(value > 0){

					active_data[deck][dateString] = value.toFixed(2) + "%";
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
  	year = 2008;

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
  	$("#current-date").html("Data for: " + dateFormat(current_date, "DDD MM-YY") );
  	for (deck in active_data){
  		row = active_data[deck];
  		html = "<li>" ;
	  		html += "<h2>" + deck + "</h2>";
	  		html += "<ul class='year-list'>";
	  			for(year in active_data[deck]){
	  				percent = active_data[deck][year];
	  				percent = parseFloat(percent.replace("%", "")).toFixed(0);
	  				if(percent > 0){
		  				html += "<li>";
		  					html += "<p><b>" + year + "</b> : " + percent + "%</p>";
		  				html += "</li>";
		  			}
	  			}
	  		html += "</ul>";
  		html += "</li>";
  		$("#parking-deck-list").append(html);
  	}

  	$("#parking-deck-list").slideDown('fast');
  }