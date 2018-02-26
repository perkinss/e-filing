var expect = require('chai').expect;
var FakeBceIDServer = require('../fake.bceid.server');
var request = require('request');
var JSDOM = require('jsdom').JSDOM;

describe('Fake BCeID Server', function() {

    var server;
    var port = 5042;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {
        server = new FakeBceIDServer({token:'monday'});
        server.start(port, ip, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('serves bceid.html', function(done) {
        request(home + '/bceid.html', function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.contain('FAKE BCeID LOGIN');
            done();
        });
    });

    it('keeps track of the target', function(done) {
        request(home + '/bceid.html?then=anywhere', function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            const dom = new JSDOM(body);
            var document = dom.window.document;

            expect(document.querySelector(
                'form input[name="then"][type="hidden"]').value).to.equal('anywhere');
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

    describe('always accepts the received credentials', function() {
    
        it('sets the cookie', function(done) {
            request.post(home + '/bceid.html', {form:{user:'you', password:'any', then:'anywhere'}}, function(err, response, body) {
                expect(response.headers['set-cookie']).to.deep.equal(['token=monday']);
                done();
            });
        });       

        it('sets the redirection', function(done) {
            request.post(home + '/bceid.html', {form:{user:'you', password:'any', then:'anywhere'}}, function(err, response, body) {
                expect(response.statusCode).to.equal(302);
                expect(response.headers['location']).to.equal('anywhere');
                expect(body).to.equal('');
                done();
            });
        });       
    }); 

    it('rejects unknown token', function(done) {
        var cookieJar = request.jar();
        var cookie = request.cookie('token=unknown');
        var url = home + '/validate';
        cookieJar.setCookie(cookie, url);

        request({url: url, jar: cookieJar}, function(err, response, body) {
            expect(response.statusCode).to.equal(403);
            expect(body).to.equal('KO');
            done();
        });
    });

    it('accepts only one token', function(done) {
        var cookieJar = request.jar();
        var cookie = request.cookie('token=monday');
        var url = home + '/validate';
        cookieJar.setCookie(cookie, url);

        request({url: url, jar: cookieJar}, function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('OK');
            done();
        });
    });

    it('rejects empty token', function(done) {
        var cookieJar = request.jar();
        var cookie = request.cookie('token=');
        var url = home + '/validate';
        cookieJar.setCookie(cookie, url);

        request({url: url, jar: cookieJar}, function(err, response, body) {
            expect(response.statusCode).to.equal(403);
            expect(body).to.equal('KO');
            done();
        });
    });
});