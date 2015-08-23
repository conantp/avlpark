var express = require('express')
var app = express()
var tabletop = require('tabletop');
// var dateFormat = require('dateFormat');

var processed_data = {};

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
  }

  var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml?gid=809388972&single=true';



app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.get('/', function(request, response) {

	response.sendFile(__dirname + '/public/html/index.html');
})

app.listen(app.get('port'), function() {
	    // tabletop.init( { key: public_spreadsheet_url,
     //                 callback: showInfo,
     //                 simpleSheet: false } );



  console.log("Node app is running at localhost:" + app.get('port'))
})


//https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml