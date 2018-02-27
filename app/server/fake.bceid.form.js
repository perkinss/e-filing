var qs = require('querystring');
var url = require('url');
var fs = require('fs');
var path = require('path');

var self;

function Authentificator(options) {    
    this.token = options.token;
    this.home = options.home;
    self = this;
};

Authentificator.prototype.validate = function(request, callback) {  
    var status = {
        code: 403
    };
    if (request.headers.cookie 
        && request.headers.cookie.indexOf('token=' + self.token) != -1) {
        
        status.code = 200;
    }  
    callback(status);         
};

Authentificator.prototype.handle = function(request, response) {
    var parsed = url.parse(request.url, true);
    if ('POST' == request.method) {    
        response.setHeader('Set-Cookie', ['token=' + self.token]);
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var form = qs.parse(body); 
            response.writeHead(302, { 'Location':form.then });
            response.write('');
            response.end();
        });
    }
    else {                    
        var filePath = path.join(__dirname, '../client/bceid.html');
        var content = fs.readFileSync(filePath).toString();
        content = content.replace('then-value', parsed.query.then);
        response.setHeader('Content-Type', 'text/html');
        response.statusCode = 200; 
        response.write(content);
        response.end();
    }
};

Authentificator.prototype.buildLoginUrl = function(base, target) {
    return 'http://' + base + '/login?then=http://' + target
};

Authentificator.prototype.isLogin = function(url) {
    return /^\/login$/.test(url);
};

module.exports = Authentificator;