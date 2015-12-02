var fs = require('fs');
var request = require("request")

var express = require('express')

var get_keen_data = require('./getdata.js');

var process_keen_data = require('./process_keen_data.js');

console.log(process_keen_data);

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

var http = require('http').Server(app);


var io = require('socket.io')(http);

var active_spaces_data = "";

function checkForSpacesUpdate(){
  var url = "https://s3.amazonaws.com/asheville-parking-decks/spaces.json"

  request({
      url: url,
      json: true
  }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
          // console.log(body) // Print the json response

          if(JSON.stringify(body) != JSON.stringify(active_spaces_data)){
              active_spaces_data = body;
              io.emit('spaces-update', active_spaces_data);
              console.log("Sent spaces update");
          }
          else{
            console.log("No spaces update");
          }
      }
  })
}

     

var active_keen_data = "";

 fs.readFile('public/data/keen_data.json', 'utf8', function (err, data) {
    active_keen_data = data;
});
function checkForKeenUpdate(){
   fs.readFile('public/data/keen_data.json', 'utf8', function (err, data) {
      if (err) throw err;

      if(data != active_keen_data){
          active_keen_data = data;

          obj2 = JSON.parse(data);
          io.emit('keen-update', obj2);
          console.log("Sent keen update");
      }
      else{
        console.log("No keen update");
      }
  });
}

var keenInterval;
function monitorForKeen(){
  checkForKeenUpdate();

  if(keenInterval){
    clearInterval(keenInterval);
  }
  
  keenInterval = setInterval(monitorForKeen, 10 * 1000);
}

var interval;
function monitorForSpaces(){
  checkForSpacesUpdate();

  if(interval){
    clearInterval(interval);
  }
  interval = setInterval(monitorForSpaces, 10 * 1000);

}

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
      console.log('user disconnected');
    });

  socket.on('spaces-update', function(msg){
        console.log('message' + msg);

      io.emit('chat message', msg);
    });
});


get_keen_data.monitor_check_space_data();

process_keen_data.monitor_process_keen_data();

http.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
  monitorForSpaces();
  monitorForKeen();
})


//https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml