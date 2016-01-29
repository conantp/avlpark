var fs = require('fs');
var request = require("request")

var express = require('express')

var get_keen_data = require('./getdata.js');
var process_keen_data = require('./process_keen_data.js');


var app = express()

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.get('/about', function(request, response) {
  response.render('about');
});

app.get('/stats', function(request, response) {
    var obj;
    fs.readFile('public/data/keen_data_long.json', 'utf8', function (err, data) {
      if (err) throw err;
      obj = JSON.parse(data);
        response.render('stats', { keen_data: obj});
    });
});

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

var http = require('http').Server(app);
var io = require('socket.io')(http);


io.on('connection', function(socket){
  console.log('a user connected');

  // console.log( get_keen_data.active_spaces_data);
  io.emit('spaces-update', get_keen_data.active_spaces_data);

  socket.on('disconnect', function(){
      console.log('user disconnected');
    });

  // socket.on('spaces-update', function(msg){
  //       console.log('message' + msg);

  //     io.emit('chat message', msg);
  //   });
});



get_keen_data.monitor_check_space_data(io);
process_keen_data.monitor_process_keen_data(io);
get_keen_data.check_space_data();

http.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


//https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml