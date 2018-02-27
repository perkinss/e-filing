var expect = require('chai').expect;
var request = require('request');
var url = require('url');
var Server = require('../../../app/server/server');

describe('logout', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {                
        server = new Server();
        server.useGuardian({ isLogin:function() { return false;} });
        server.start(port, ip, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('unsets the cookie', function(done) {
        var cookieJar = request.jar();
        var cookie = request.cookie('token=cgi');
        var url = home + '/logout';
        cookieJar.setCookie(cookie, url);

        request({url: url, jar: cookieJar}, function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(response.request.headers.cookie).to.equal('token=unknown');
            done();
        });
    });
});
