var url = require('url');
var fs = require('fs');
var path = require('path');

function Server() {    
};

Server.prototype.start = function (port, ip, done) {
    if (this.bceidServer === undefined 
        ||this.bceidServer.isLogin === undefined 
    ) {
        throw '{ isLogin:function, isLogout:function } bceidServer is mandatory';        
    }
    var self = this;
    this.http = require('http').createServer(function(request, response) {
        if ('/' == request.url) { request.url = '/index.html'; }

        var parsed = url.parse(request.url, true);
        var filePath = path.join(__dirname, '../client/' + parsed.pathname);
        var encoding = 'binary';
        var content = '';
        try { 
            content = fs.readFileSync(filePath);
            encoding = 'binary';
            if (! /\.png$/.test(parsed.pathname)) {
                content = content.toString();
                encoding = 'utf8';
            }
        }
        catch (error) { 
            response.statusCode = 404; 
            content = request.url;
            encoding = 'utf8';
        }

        if (/forms/.test(parsed.pathname)) {    
            self.bceidServer.validateToken(request, function(status) {
                if (status.code == 200) {
                    response.setHeader('Content-Type', 'text/html');
                    response.write(content, encoding);
                    response.end();
                }
                else {
                    var target = request.headers['host'] + parsed.pathname;
                    var location = self.bceidServer.buildLoginUrl(request.headers['host'], target);
                    response.writeHead(302, { 'Location':location });
                    response.write('', encoding);
                    response.end();
                }
            });           
        }
        else {
            if (self.bceidServer.isLogin(parsed.pathname)) {
                self.bceidServer.handleLogin(request, response);                
            } 
            else {                
                if (self.bceidServer.isLogout(parsed.pathname)) {   
                    self.bceidServer.logout(response);                        
                    response.writeHead(302, { 'Location':'/' });
                    content = '';
                }   
                self.setContentType(parsed.pathname, response);                             
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

Server.prototype.setContentType = function(path, response) {
    if (/\.js$/.test(path)) {
        response.setHeader('Content-Type', 'application/javascript');
    }
    if (/\.css$/.test(path)) {
        response.setHeader('Content-Type', 'text/css');
    }
    if (/\.html$/.test(path)) {
        response.setHeader('Content-Type', 'text/html');
    }
    if (/\.data$/.test(path)) {
        response.setHeader('Content-Type', 'text/plain');
    }
    if (/\.png$/.test(path)) {
        response.setHeader('Content-Type', 'image/png');                    
    }
}

Server.prototype.stop = function (done) {
    if (this.http) {
        this.http.close();
    }
    done();
};

Server.prototype.useBceidServer = function(bceidServer) {
    this.bceidServer = bceidServer;
};

module.exports = Server;
