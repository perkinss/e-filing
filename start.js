var Server = require('./app/server/server');
var server = new Server();
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});

var FakeBceIDServer = require('./app/server/fake.bceid.server');
var fakeserver = new FakeBceIDServer({token:'bceid'});
var fakeport = process.env.OPENSHIFT_NODEJS_PORT || 8081;
var fakeip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
fakeserver.start(fakeport, fakeip, function() {
    console.log('fake server ' + fakeip + ' listening on port ' + fakeport);
});

server.useGuardian({
    validate: 'http://' + fakeip + ':' + fakeport + '/validate',
    login: 'http://' + fakeip + ':' + fakeport + '/bceid.html',
})

module.exports = server;
module.exports.port = port;
