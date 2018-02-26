var FakeBceIDServer = require('./app/server/fake.bceid.server');
var fakeserver = new FakeBceIDServer({token:'bceid'});
var fakeport = process.env.OPENSHIFT_NODEJS_PORT || 8081;
var fakeip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
fakeserver.start(fakeport, fakeip, function() {
    console.log('fake server ' + fakeip + ' listening on port ' + fakeport);
});

module.exports = fakeserver;
module.exports.port = fakeport;
