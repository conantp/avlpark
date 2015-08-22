

window.onload = function() { init() };

  var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml?gid=809388972&single=true';
  var processed_data = {};

  var current_date = new Date();
  var current_month = false;
  var current_day = false;
  var current_year = current_date.getFullYear();

  var active_data = {};


var tabletop;

  function init() {
  	setDateVars();

    Tabletop.init( { key: public_spreadsheet_url,
                     callback: showInfo,
                     simpleSheet: false } )
  }

  function buildActiveData(){
  	year = 2008;

	for(column in processed_data["2015-01-01"]){
		if(column == "Date"){
			continue;
		}

		active_data[column] = {};
	}

  	while(year <= 2015){
  		search_str = year + "-" + current_month + "-" + current_day;
  		console.log(search_str);

  		for(column in processed_data[search_str]){
  			if(column == "Date"){
				continue;
			}
  			active_data[column][year] = processed_data[search_str][column];
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
    renderData();

  }

  function setDateVars(){
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    current_day = day;
    current_month = month;

  }

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  function renderData(){
  	$("#current-date").html("Data for: " + current_month + "-" + current_day);
  	for (deck in active_data){
  		row = active_data[deck];
  		html = "<li>" ;
	  		html += "<h2>" + deck + "</h2>";
	  		html += "<ul class='year-list'>";
	  			for(year in active_data[deck]){
	  				percent = active_data[deck][year];
	  				html += "<li>";
	  					html += "<p><b>" + year + "</b> : " + percent + "</p>";
	  				html += "</li>";
	  			}
	  		html += "</ul>";
  		html += "</li>";
  		$("#parking-deck-list").append(html);
  	}

  	$("#parking-deck-list").slideDown('fast');
  }