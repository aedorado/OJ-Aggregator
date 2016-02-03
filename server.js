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

app.get('/hrank', function(req, res) {
    console.log('Hackerrank Request Recieved');
    var url = 'http://www.hackerrank.com/rest/hackers/' + req.query.handle + '/recent_challenges?offset=0&limit=10000';
    request({uri : url}, function(error, response, html) {
        if (!error  && response.statusCode == 200) {
            var arr = []
            var json = JSON.parse(html);
            json = json['models'];
            for (var i = 0; i < json.length; i++) {
                var element = {
                    when : json[i].created_at,
                    problem : json[i].name,
                }
                element.when = hackerRankDateToEpoch(element.when.substring(0, 19).replace('T', ' '));
                arr.push(element);
            }
            console.log('Returning..')
            res.send(JSON.stringify(arr));
        }
    });

    function hackerRankDateToEpoch(dateString) {
        var d;

        var arr = dateString.split(' ');
        d = new Date(arr[0]);
        arr = arr[1].split(':')
 
        d.setHours(arr[0]);
        d.setMinutes(arr[1]);
        d.setSeconds(arr[2]);

        return d.getTime() / 1000;
    }

});

app.get('/hearth', function(req, res) {
    console.log('Hackerearth Request Recieved');
    var url = 'http://www.hackerearth.com/AJAX/feed/newsfeed/submission/user/' + req.query.handle + '/';

    // var postData = {
    //     index:80
    // };
    // require('request').post({
    //                             uri : url,
    //                             headers : {'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
    //                             body : require('querystring').stringify(postData)
    //                         },
    //                         function(err,res,body){
    //                             console.log(body);
    //                             console.log(res.statusCode);
    //                         });

    request({uri : url}, function(error, response, html) {
        // console.log(error)
        mp = []
        if (!error && response.statusCode == 200) {
            var arr = []
            var json = JSON.parse(html);

            for (i = 0; i < json['count']; i++) {
                $ = cheerio.load(json['feed' + i]);

                if (mp[$('td:nth-child(2)').attr('title')] === undefined) {
                    element = {
                        when : $('td:nth-child(8) a').attr('data-livestamp'),
                        problem : $('td:nth-child(2)').attr('title'),
                        verdict : $('td:nth-child(3) div').attr('class'),
                        lang : $('td:nth-child(6)').text()
                    }
                    mp[element.problem] = 1;
                    console.log(element);
                    arr.push(element);
                }
            }

            console.log(arr.length);
            console.log('Returning..');
            res.send(JSON.stringify(arr));
        }
    });

    function hackerRankDateToEpoch(dateString) {
        var d;

        var arr = dateString.split(' ');
        d = new Date(arr[0]);
        arr = arr[1].split(':')
 
        d.setHours(arr[0]);
        d.setMinutes(arr[1]);
        d.setSeconds(arr[2]);

        return d.getTime() / 1000;
    }
    
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

app.get('/cfapi', function(req, res) {
    // console.log('Codeforces Request Recieved');
    var url = 'http://codeforces.com/api/user.status?handle=' + req.query.handle + '&from=1';
    request({uri : url}, function(error, response, html) {
        if (!error  && response.statusCode == 200) {
            var json = JSON.parse(html);
            // console.log(json['result']);
            var json = json['result'];

            var arr = [];
            for (i = 0; i < json.length; i++) {
                var element = {
                    when : json[i]['creationTimeSeconds'],
                    problem: json[i]['problem']['contestId'] + json[i]['problem']['index'] + '-' + json[i]['problem']['name'],
                    lang: json[i]['programmingLanguage'],
                    verdict: json[i]['verdict']
                }
                arr.push(element);
                // console.log(element);
            }

            // console.log(arr.length);
            res.contentType('application/json');
            res.send(JSON.stringify(arr));

        }
    });
});

app.get('/cchef', function(req, res) {
    console.log('Codechef Request Recieved');
    var url = 'https://www.codechef.com/recent/user?page=undefined&user_handle=' + req.query.handle;
    console.log(req.query.handle);
    console.log(url);
    request({uri : url}, function(error, response, html) {
        console.log(error);
        if (!error  && response.statusCode == 200) {
            var json = JSON.parse(html);
            pid = json['max_page'];
            console.log('Recieved pageindex=' + pid);
            extractAllCodechef(parseInt(pid), res);
        }
    });

    function extractAllCodechef(pid, res) {
        console.log('Extracting All');
        var arr = [], count = 0;
        for (var i = 0; i < pid; i++) {
            url = 'https://www.codechef.com/recent/user?page=' + i + '&user_handle=' + req.query.handle;
            console.log(url);
            request({uri : url}, function(error, response, html) {
                if (!error  && response.statusCode == 200) {

                    var content = JSON.parse(html)['content'];
                    $ = cheerio.load(content);

                    $('.kol').each(function() {
                        var element = {
                            when : $('td:nth-child(1)', $(this)).html().trim(),
                            problem: $('td:nth-child(2) a', $(this)).attr('href').trim(),
                            lang: $('td:nth-child(4)', $(this)).html().trim(),
                            verdict: $('td:nth-child(3) span', $(this)).attr('title').trim(),
                        };

                        console.log(element);

                        arr.push(element);
                        if ($(this).is(':last-child')) {
                            count++;
                            console.log(count, arr.length);
                        }

                        if (count == pid) {
                            console.log('Returning..');
                            console.log(arr.length);
                            res.contentType('application/json');
                            res.send(JSON.stringify(arr));
                        }

                    });
                }
            });
        }
    }

    function codeChefDateToEpoch(dateString) {
        var d;
        if (dateString.indexOf('sec') != -1) {
            var back = dateString.split(' ')[0];
            d = new Date(new Date() - back * 1000);
        } else if (dateString.indexOf('min') != -1) {
            var back = dateString.split(' ')[0];
            d = new Date(new Date() - back * 60 * 1000);
        } else if (dateString.indexOf('hours') != -1) {
            var back = dateString.split(' ')[0];
            d = new Date(new Date() - back * 60 * 60 * 1000);
        } else if (dateString.indexOf('yesterday') != -1) {
            d = new Date(new Date() - 24 * 60 * 60 * 1000);
        } else {
            var arr = dateString.split(' ');
            var h = arr[0].split(':')[0];
            if (arr[1] == 'PM') {
              h = parseInt(h) + 12;
            }
            var m = arr[0].split(':')[1];
            var dd = arr[2].split('/')[0];
            var mm = parseInt(arr[2].split('/')[1]) - 1;
            var yy = arr[2].split('/')[2];
            yy = '20' + yy;

            d = new Date(yy, mm, dd, h, m);
        }
        return d.getTime() / 1000;
    }


});


var port = process.env.OPENSHIFT_NODEJS_PORT || 3000// set the port
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
http.listen(port, ip_address);
