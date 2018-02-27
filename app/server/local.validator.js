var url = require('url');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var self;

function Validator(options) {    
    this.token = options.token;
    self = this;
};

Validator.prototype.validate = function(request, callback) {  
    var status = {
        code: 403
    };
    if (request.headers.cookie 
        && request.headers.cookie.indexOf('token=' + self.token) != -1) {
        
        status.code = 200;
    }  
    callback(status);         
};

module.exports = Validator;