var express = require('express'),
    app = express(),
    request = require('request'),
    http = require('http').createServer(app),
    httpm = require('http');

app.use(express.static('public'));

app.get('/', function(req, res) {
	console.log(__dirname);
	res.sendFile(__dirname + '/index.html');
});

app.get('/spoj', function(req, res) {
	// res.send(req.query.handle);
	var url = 'http://www.spoj.com/status/' + req.query.handle + '/signedlist/';
	console.log(url);

	request(url, function(error, response, html) {
        if (!error  && response.statusCode == 200) {
        	//res.send(req.query.handle);
        	//console.log(html);
        	res.send(html);
        }
    });
});


var port = process.env.OPENSHIFT_NODEJS_PORT || 8080// set the port
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
http.listen(port, ip_address);