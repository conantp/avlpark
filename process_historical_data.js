var fs = require('fs');
var tabletop = require('tabletop');

// var dateFormat = require('dateFormat');
var processed_data = {};

  var current_date = new Date();
  var current_month = false;
  var current_day = false;
  var current_year = false;
  var current_week = false;
  var active_data = {};
var processed_data = {};
      var month_data = {};
  var month_data_by_deck = {};


function setDateVars(){
    var d = new Date();


    current_day = d.getDay();
    current_week = d.getWeekNumber();
    current_year = d.getFullYear();
  }



Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};



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

  function showInfo(data2, tabletop) {
    // alert("Successfully processed!")
    console.log('go');
    data = tabletop.sheets("For App").all();	

    for (index in data){
    	row = data[index];
    	processed_data[formatDate(row.Date)] = row;
    }

    console.log(processed_data);
    buildActiveData();
    buildDayOfWeekAverage();
    buildMonthAverage();

    active_data.month_data_by_deck = month_data_by_deck;
	write_data_to_file('public/data/historical_data.json', active_data);
  }

  function write_data_to_file(outputFilename, data){
	fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outputFilename);
	    }
	}); 
  }

  function buildActiveData(){
    year = 2012;

    for(column in processed_data["2015-1-0"]){
      if( column == "Date" || 
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
          if( column == "Date" || 
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

  var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml?gid=809388972&single=true';


var do_data_process = function(){

	console.log("Processing sheet data");
	setDateVars();

      tabletop.init( { key: public_spreadsheet_url,
                     callback: showInfo,
                     simpleSheet: false } );


     

};

do_data_process();

var interval = setInterval(do_data_process, 10 * 1000);


//https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml