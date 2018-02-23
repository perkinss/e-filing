var url = require('url');
var fs = require('fs');
var path = require('path');

function Server() {
};

Server.prototype.start = function (port, ip, done) {
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
        if (/forms/.test(parsed.pathname)) {            
            if (request.headers.cookie==undefined || request.headers.cookie.indexOf('token=cgi') == -1) {
                response.writeHead(302, { 'Location':'/bceid.html?then='+parsed.pathname });
                content = '';
            }
        }
        if (/^\/bceid\.html$/.test(parsed.pathname)) {
            if ('POST' == request.method) {
                response.setHeader('Set-Cookie', ['token=cgi']);
                response.writeHead(302, { 'Location':parsed.query.then });
                content = '';
            }
        }
        if (/^\/logout$/.test(parsed.pathname)) {       
            response.setHeader('Set-Cookie', ['token=unknown']);     
            response.writeHead(302, { 'Location':'/' });
            content = '';
        }
        response.write(content, encoding);
        response.end();
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

module.exports = Server;
