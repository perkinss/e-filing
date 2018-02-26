var url = require('url');
var fs = require('fs');
var path = require('path');
var remote = require('request');

function Server() {    
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
        if (/forms/.test(parsed.pathname)) {    
            var keyValue = request.headers.cookie.substring(request.headers.cookie.indexOf('token'));
            var cookieJar = remote.jar();
            cookieJar.setCookie(remote.cookie(keyValue), self.guardian.validate);
            remote({url: self.guardian.validate, jar: cookieJar}, function(err, resp, body) {
                if (resp.statusCode == 403) {
                    var location = self.guardian.login + '?then=http://' + request.headers['host'] + parsed.pathname;
                    response.writeHead(302, { 'Location':location });
                    response.write('', encoding);
                    response.end();
                } 
                else {
                    response.setHeader('Content-Type', 'text/html');       
                    response.write(content, encoding);
                    response.end();             
                }
            });            
        }
        else {
            if (/\.js$/.test(parsed.pathname)) {
                response.setHeader('Content-Type', 'application/javascript');
            }
            if (/\.css$/.test(parsed.pathname)) {
                response.setHeader('Content-Type', 'text/css');
            }
            if (/\.html$/.test(parsed.pathname)) {
                response.setHeader('Content-Type', 'text/html');
            }
            if (/\.data$/.test(parsed.pathname)) {
                response.setHeader('Content-Type', 'text/plain');
            }
            if (/\.png$/.test(parsed.pathname)) {
                response.setHeader('Content-Type', 'image/png');
                content = fs.readFileSync(filePath);
                encoding = 'binary';
            }
            if (/^\/logout$/.test(parsed.pathname)) {       
                response.setHeader('Set-Cookie', ['token=unknown']);     
                response.writeHead(302, { 'Location':'/' });
                content = '';
            }
            response.write(content, encoding);
            response.end();
        }
    });
    this.io = require('socket.io')(this.http);
    this.io.on('connection', function(socket) {
    });
    var self = this;
    fs.watch(path.join(__dirname, '../client/'), { recursive:true }, function(e, file) {
        self.sendReload();
    });
    this.http.listen(port, ip, done);
};

Server.prototype.sendReload = function() {
    this.io.emit('reload', {});
};

Server.prototype.stop = function (done) {
    this.http.close();
    done();
};

Server.prototype.useGuardian = function(guardian) {
    this.guardian = guardian;
};

module.exports = Server;
