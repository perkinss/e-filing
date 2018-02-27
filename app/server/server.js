var url = require('url');
var fs = require('fs');
var path = require('path');

function Server() {    
};

Server.prototype.start = function (port, ip, done) {
    if (this.guardian === undefined 
        ||this.guardian.isLogin === undefined 
    ) {
        throw '{ isLogin:function } guardian is mandatory';        
    }
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
            self.guardian.validate(request, function(status) {
                if (status.code == 200) {
                    response.setHeader('Content-Type', 'text/html');
                    response.write(content, encoding);
                    response.end();
                }
                else {
                    var target = request.headers['host'] + parsed.pathname;
                    var location = self.guardian.buildLoginUrl(request.headers['host'], target);
                    response.writeHead(302, { 'Location':location });
                    response.write('', encoding);
                    response.end();
                }
            });           
        }
        else {
            if (self.guardian.isLogin(parsed.pathname)) {
                response.statusCode = 200;
                self.guardian.handle(request, response);                
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
    if (this.http) {
        this.http.close();
    }
    done();
};

Server.prototype.useGuardian = function(guardian) {
    this.guardian = guardian;
};

module.exports = Server;
