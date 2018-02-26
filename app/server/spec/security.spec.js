var expect = require('chai').expect;
var Server = require('../server');
var request = require('request');
var url = require('url');

describe('Forms access', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    
    var guardianPort = 5001;
    var self = this;    

    describe('when authenticated', function() {

        beforeEach(function(done) {                
            server = new Server();
            server.useGuardian({
                validate: 'http://localhost:5001/validate'
            });        
            server.start(port, ip, function() {
                guardian = require('http').createServer(function(request, response) {
                    response.statusCode = 200;
                    response.write('OK');
                    response.end();
                });
                guardian.listen(guardianPort, done);
            });
        });
    
        afterEach(function(done) {
            server.stop(function() {
                guardian.close(done);
            });
        });

        it ('is allowed', function(done) {
            var cookieJar = request.jar();
            var cookie = request.cookie('token=cgi');
            var url = home + '/forms/form.2.html';
            cookieJar.setCookie(cookie, url);

            request({url: url, jar: cookieJar}, function(err, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.contain('Form 2');
                done();
            });
        });
    });

    describe('when not authenticated', function() {

        beforeEach(function(done) {                
            server = new Server();
            server.useGuardian({
                validate: 'http://localhost:5001/validate',
                login: 'http://localhost:5001/login'
            });        
            server.start(port, ip, function() {
                guardian = require('http').createServer(function(request, response) {
                    var parsed = url.parse(request.url, true);
                    if (parsed.pathname =='/validate') {
                        response.statusCode = 403;
                        response.write('OK');
                        response.end();
                    }
                    if (parsed.pathname =='/login') {
                        response.statusCode = 200;
                        response.write('login requested');
                        response.end();
                    }
                });
                guardian.listen(guardianPort, done);
            });
        });
    
        afterEach(function(done) {
            server.stop(function() {
                guardian.close(done);
            });
        });

        it ('is not allowed', function(done) {
            var cookieJar = request.jar();
            var cookie = request.cookie('token=unknown');
            var url = home + '/forms/form.2.html';
            cookieJar.setCookie(cookie, url);

            request({url: url, jar: cookieJar}, function(err, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.contain('login requested');
                expect(response.request.path).to.equal('/login?then=' + url);
                done();
            });
        });
    });

});

describe('logout', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {                
        server = new Server();
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
