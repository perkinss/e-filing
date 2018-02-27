var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;

var LocalBCeIDServer = require('./app/server/fake.bceid.form');
localBCeIDServer = new LocalBCeIDServer({token:'monday', home:home});

var Server = require('./app/server/server');
var server = new Server();
server.useGuardian(localBCeIDServer);

server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});

module.exports = server;
module.exports.port = port;
