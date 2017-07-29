const http = require("http");
const express = require('express');
const app = express();
const PORT = 8080;





function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

console.log(generateRandomString(12));








/*//set the view engine to ejs
app.set('view engine', 'ejs');


//index page
app.get('/', function (req, res) {
  res.render('pages/index');
});


//about page
// not needed because only index is needed, rest are defined in /app/views folder
app.get('/about', function (req, res) {
  res.render('pages/about');
});



app.listen(8080);
console.log('8080 is the magic port');*/




// a function which handles requests and sends response
// legacy code (when we weren't coding with ejs)
/*function requestHandler(request, response) {

  if (request.url == "/") {
    response.end("Welcome!");
  } else if (request.url == "/urls") {
    response.end("www.lighthouselabs.ca\nwww.google.com");
  } else {
    response.statusCode = 404;
    response.end("Unknown Path");
  }
  // response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
}

var server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});*/