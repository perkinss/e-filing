var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;

var FakeBceIDServer = require('./app/server/fake.bceid.server');
var fakeBceIDServer = new FakeBceIDServer({token:'monday'});

var Server = require('./app/server/server');
var server = new Server();
server.useBceidServer(fakeBceIDServer);

server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});

var firebase = require('firebase');
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAYx7b7qF47dy8vAnExOaFW5nQCP0EWriw",
    authDomain: "sandbox-5f095.firebaseapp.com",
    databaseURL: "https://sandbox-5f095.firebaseio.com",
    storageBucket: "sandbox-5f095.appspot.com",
    messagingSenderId: "825996076845"
    };
firebase.initializeApp(config);
var news = firebase.database().ref('/news').limitToLast(3);
news.on('child_added', function(data) {
    console.log(data.val());
});

module.exports = server;
module.exports.port = port;
