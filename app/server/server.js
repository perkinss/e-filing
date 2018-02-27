var url = require('url');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

function Server() {    
};

Server.prototype.start = function (port, ip, done) {
    if (this.guardian === undefined 
        ||this.guardian.validate === undefined 
        || this.guardian.login === undefined) {
        throw '{ validate:foo, login:bar } guardian is mandatory';        
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
            self.guardian.validator.validate(request, function(status) {
                if (status.code == 200) {
                    response.setHeader('Content-Type', 'text/html');
                    response.write(content, encoding);
                    response.end();
                }
                else {
                    var location = self.guardian.login + '?then=http://' + request.headers['host'] + parsed.pathname;
                    response.writeHead(302, { 'Location':location });
                    response.write('', encoding);
                    response.end();
                }
            });           
        }
        else {
            if (/^\/login$/.test(parsed.pathname)) {
                response.statusCode = 200;
                if ('POST' == request.method) {    
                    response.setHeader('Set-Cookie', ['token=' + self.guardian.validator.token]);
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
                    filePath = path.join(__dirname, '../client/bceid.html');
                    content = fs.readFileSync(filePath).toString();
                    content = content.replace('then-value', parsed.query.then);
                    response.setHeader('Content-Type', 'text/html');
                    response.statusCode = 200; 
                    response.write(content, encoding);
                    response.end();
                }
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
