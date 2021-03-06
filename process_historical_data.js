var fs = require("fs");
var tabletop = require("tabletop");
// var dateFormat = require("dateFormat");

var currentDate = new Date();
var currentMonth = false;
var currentDay = false;
var currentYear = false;
var currentWeek = false;
var activeData = {};
var processedData = {};
var monthData = {};
var monthDataByDeck = {};


function setDateVars(){
	var d = new Date();
	currentDay = d.getDay();
	currentWeek = d.getWeekNumber();
	currentYear = d.getFullYear();
}


Date.prototype.getWeekNumber = function(){
	var d = new Date(+this);
	d.setHours(0,0,0);
	d.setDate(d.getDate()+4-(d.getDay()||7));
	return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

function formatDate(date) {
	var d = new Date(date);
	var year = d.getFullYear();
	var week = d.getWeekNumber();
	var day = d.getDay();


	return [year, week, day].join("-");
}

function showInfo(data2, tabletop) {
	// alert("Successfully processed!")
	data = tabletop.sheets("For App").all();	

	for (index in data){
		row = data[index];
		processedData[formatDate(row.Date)] = row;
	}

	console.log(processedData);
	buildActiveData();
	buildDayOfWeekAverage();
	buildMonthAverage();

	activeData.monthDataByDeck = monthDataByDeck;
	write_data_to_file("public/data/historical_data.json", activeData);
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
	var year = 2012;

	for(var column in processedData["2015-1-0"]){
		if( column == "Date" || 
			column == "Day" || 
			column == "Week" || 
			column == "Month" || 
			column == "Year"){
				continue;
		}
		activeData[column] = {};
	}

	while(year <= 2015){
		var search_str = year + "-" + currentWeek + "-" + currentDay;

		for(var column in processedData[search_str]){
			if( column == "Date" || 
				column == "Day" || 
				column == "Week" || 
				column == "Month" || 
				column == "Year"){
					continue;
			}
			activeData[column][year] = processedData[search_str][column];
		}
		year++;
	}
	console.log(activeData);
}

function buildMonthAverage(){
	for(var index in data){
		row = data[index];

		var d = new Date(row.Date);

		row_mo = d.getMonth();
		row_yr = d.getFullYear();
		row_dy = d.getDate();


		key = row_yr + "-" + row_mo;

		for(var deck in row){
				if(	deck == "Date" || 
					deck == "Day" || 
					deck == "Week" || 
					deck == "Month" || 
					deck == "Year"){
				continue;
			}

			// otherwise, it"s actually a deck

			deck_row = row[deck];

			value = parseFloat(deck_row.replace("%", "") );

			if(value < 1){
				continue;
			}

			if(typeof monthData[key] == "undefined"){
				monthData[key] = {"decks" : {}};
			}

			if(typeof monthData[key]["decks"][deck] == "undefined"){
				monthData[key]["decks"][deck] = {"sum" : 0, "count" : 0, "values" : {} };
			}

			monthData[key]["decks"][deck]["sum"] += value;
			monthData[key]["decks"][deck]["count"]++;
			monthData[key]["decks"][deck]["values"][row_dy] = row;
		}
	}



	for(var key in monthData){
		month = monthData[key];
		for(deck_key in month["decks"]){
			deck = month["decks"][deck_key];

			deck["average"] = deck["sum"] / deck["count"];
		}
	}

	// Repeat the loop, build month data
	for(var key in monthData){
		if(key.indexOf("2015-") !== 0 && key.indexOf("2014-") !== 0){
			continue;
		}
		month = monthData[key];
		for(var deck_key in month["decks"]){
			deck = month["decks"][deck_key];

			if(typeof monthDataByDeck[deck_key] == "undefined"){
				monthDataByDeck[deck_key] = {};
			}

			if(isNaN(deck["average"]) ){
				continue;
			}

			monthDataByDeck[deck_key][key] = deck["average"].toFixed(0);
		}
	}
}

function buildDayOfWeekAverage(){
	var year = 2012;

	while(year < 2016){
		var day = 0;
		while(day < 7){
			var week = 0;
			while(week <= 52){
				search_str = year + "-" + week + "-" + day;

				for(var deck in processedData[search_str]){
					if(	deck == "Date" || 
						deck == "Day" || 
						deck == "Week" || 
						deck == "Month" || 
						deck == "Year"){
							continue;
					}
					value = parseFloat(processedData[search_str][deck].replace("%", "") );

					if(typeof activeData[deck][day] == "undefined"){
						activeData[deck][day] = 0;
						activeData[deck][day+"_count"] = 0;
					}

					activeData[deck][day] += value;
					activeData[deck][day+"_count"]++;
				}
				week++;
			}

			for(var deck in activeData){
				value = activeData[deck][day] / activeData[deck][day+"_count"];

				dateString = year+"-"+day;//dateFormat(day, "dddd");

				if(typeof activeData[deck]["year_data"] == "undefined"){
					activeData[deck]["year_data"] = {};
				}
				if(typeof activeData[deck]["year_data"][year] == "undefined"){
					activeData[deck]["year_data"][year] = {};
				}

				if(value > 0){
				activeData[deck][dateString] = value.toFixed(2) + "%";
				activeData[deck]["year_data"][year][day] = (100 - value).toFixed(2);
				}
				delete activeData[deck][day];
				delete activeData[deck][day+"_count"];
			}
			day++;
		}
		year++;
	}
}

var public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml?gid=809388972&single=true";

var do_data_process = function(){

console.log("Processing sheet data");
setDateVars();

tabletop.init( 
				{ 
					key: public_spreadsheet_url,
					callback: showInfo,
					simpleSheet: false 
				});
};

do_data_process();

var interval = setInterval(do_data_process, 10 * 1000);

//https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml