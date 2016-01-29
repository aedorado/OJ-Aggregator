var express = require('express'),
    app = express(),
    request = require('request'),
    http = require('http').createServer(app),
    cheerio = require('cheerio'),
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

app.get('/cf', function(req, res) {
    console.log('Codeforces Request Recieved');
    var url = 'http://www.codeforces.com/submissions/' + req.query.handle + '/page/1';
    request({uri : url}, function(error, response, html) {
        if (!error  && response.statusCode == 200) {
            $ = cheerio.load(html);
            var pid = $('.page-index').last().attr('pageindex');
            console.log('Recieved pageindex=' + pid);
            extractAllCodeforces(parseInt(pid), res);
        }
    });

    function extractAllCodeforces(pid, res) {
        console.log('extracting all');
        var arr = [], count = 0;
        for (var i = 1; i <= pid; i++) {
            url = 'http://www.codeforces.com/submissions/' + req.query.handle + '/page/' + i;
            console.log(url);
            request({uri : url}, function(error, response, html) {
                // console.log(url);
                if (!error  && response.statusCode == 200) {
                    $ = cheerio.load(html);
                    // $('.status-frame-datatable tr:not(:first)').each(function() {
                    $('.status-frame-datatable tr[class!=first-row]').each(function() {
                        // console.log($(':nth-child(6) > span > span', $(this)).html());
                        var element = {
                            when: $(':nth-child(2)', $(this)).html().trim(),
                            problem: $(':nth-child(4) a', $(this)).html().trim(),
                            lang: $(':nth-child(5)', $(this)).html().trim(),
                            verdict: $(':nth-child(6) > span', $(this)).html().trim(),
                        };
                        // console.log(element);
                        arr.push(element);

                        if ($(this).attr('class') == 'last-row') {
                            console.log('Returning.. ' + ++count);
                        }

                        if (count == pid) {
                            console.log('Returning..');
                            res.contentType('application/json');
                            res.send(JSON.stringify(arr));
                        }

                    });
                }
            });
        }
    }


});


var port = process.env.OPENSHIFT_NODEJS_PORT || 3000// set the port
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
http.listen(port, ip_address);