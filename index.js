var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/public/html/index.html');
})
 
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


//https://docs.google.com/spreadsheets/d/19I-P30YkQqO-Um8ab47AaZxzlfJDyuMRr6Iy-ulc_Co/pubhtml