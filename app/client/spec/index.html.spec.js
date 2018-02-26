var chai = require('chai')
    , expect = chai.expect;

describe('index.html', function() {

    describe('serving', function() {

        var Zombie = require("zombie");
        var Server = require('../../server/server');

        var port = 5000;
        var ip = 'localhost';
        var url = 'http://' + ip + ':' + port;

        beforeEach(function(done) {
            server = new Server();
            server.useGuardian({ validate:'any', login:'any' });
            server.start(port, ip, done);
        });

        afterEach(function(done) {
            server.stop(done);
        });

        it('works', function(done) {
            const browser = new Zombie();

            browser.visit(url + '/index.html')
                .then(function() {
                    browser.assert.success();
                })
                .then(done, done);
        });
    });

    describe('structure', function() {

        var fs = require('fs');
        var JSDOM = require('jsdom').JSDOM;
        var document;

        beforeEach(function() {
            const dom = new JSDOM(fs.readFileSync('./app/client/index.html'));
            document = dom.window.document;
        });

        it('has the expected title', function() {
            expect(document.getElementsByTagName('title')[0].innerHTML).to.equal('E-Filing');
        });
    });
});
