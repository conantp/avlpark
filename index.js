var fs = require('fs');
var express = require('express')
var app = express()

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.get('/', function(request, response) {
    var obj;
    var obj2;
    fs.readFile('public/data/historical_data.json', 'utf8', function (err, data) {
      if (err) throw err;
      obj = JSON.parse(data);

      fs.readFile('public/data/keen_data.json', 'utf8', function (err, data) {
        if (err) throw err;
        obj2 = JSON.parse(data);

        response.render('index', { active_data: obj, keen_data: obj2});

      });




    });


	// response.sendFile(__dirname + '/public/html/index.html');
})

app.get('/data', function(request, response) {
  response.sendFile(__dirname + '/public/data/keen_data.json');
})
 
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


//https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml