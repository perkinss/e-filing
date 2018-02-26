var fakeport = process.env.OPENSHIFT_NODEJS_PORT || 8081;
var fakeip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var Server = require('./app/server/server');
var server = new Server();
server.useGuardian({
    validate: 'http://' + fakeip + ':' + fakeport + '/validate',
    login: 'http://' + fakeip + ':' + fakeport + '/bceid.html',
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});



module.exports = server;
module.exports.port = port;
