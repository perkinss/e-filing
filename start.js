var Server = require('./app/server/server');

var server = new Server();

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});

module.exports = server;
module.exports.port = port;
