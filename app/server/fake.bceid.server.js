var url = require('url');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

function Server(options) {
    this.token = options.token;
};

Server.prototype.start = function (port, ip, done) {
    var self = this;
    this.http = require('http').createServer(function(request, response) {
        if ('/' == request.url) { request.url = '/index.html'; }

        var parsed = url.parse(request.url, true);
        var filePath = path.join(__dirname, '../client/' + parsed.pathname);
        var encoding = 'utf8';
        var content = '';
        try { content = fs.readFileSync(filePath).toString(); }
        catch (error) { 
            response.statusCode = 404; 
            content = request.url;
        }
        if (/^\/bceid\.html$/.test(parsed.pathname)) {
            if ('POST' == request.method) {
                response.setHeader('Set-Cookie', ['token=' + self.token]);                

                var body = '';
                request.on('data', function (data) {
                    body += data;
                });
                request.on('end', function () {
                    var form = qs.parse(body); 
                    response.writeHead(302, { 'Location':form.then });
                    response.write('', encoding);
                    response.end();
                });
            }
            else {
                content = content.replace('then-value', parsed.query.then);
                response.write(content, encoding);
                response.end();
            }
        } 
        else if (/^\/validate$/.test(parsed.pathname)) {
            response.statusCode = 403;
            content = 'KO';
            if (request.headers.cookie 
                && request.headers.cookie.indexOf('token=' + self.token) != -1) {
                response.statusCode = 200;
                content = 'OK';
            }            
            response.write(content, encoding);
            response.end();
        }
        else {
            response.write(content, encoding);
            response.end();
        }
    });
    this.http.listen(port, ip, done);
};

Server.prototype.stop = function (done) {
    this.http.close();
    done();
};

module.exports = Server;
