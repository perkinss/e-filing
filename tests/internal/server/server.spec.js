var expect = require('chai').expect;
var request = require('request');
var Server = require('../../../app/server/server');

describe('Server', function() {

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

    it('needs a guardian', function() {
        var failed = false;
        var server;
        try {
            server = new Server();
            server.useGuardian({ any:'value' });
            server.start(port+1, ip, server.stop(function() {}));            
        }
        catch (error) {
            failed = true;
            expect(error).to.equal('{ isLogin:function } guardian is mandatory');
        }
        
        expect(failed).to.equal(true);
    });

    it('serves index.html', function(done) {
        request(home + '/index.html', function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('returns 404 when unknown', function(done) {
        request(home + '/unknown.file', function(err, response, body) {
            expect(response.statusCode).to.equal(404);
            expect(body).to.equal('/unknown.file');
            done();
        });
    });

    it('can serve a png', function(done) {
        request(home + '/images/logo.png', function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(response.headers['content-type']).to.equal('image/png');
            done();
        });
    });
});
