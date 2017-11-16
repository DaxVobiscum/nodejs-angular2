var bcrypt = require('bcrypt-nodejs');

function User (args, props) {
    
    var id = null;
    var type = null;
    
    if (0 < arguments.length) {
        
        args = arguments[0] || [];
        props = arguments[1] || [];
        
        if ("object" === typeof args[0]) {
            
            Object.assign(this, args[0]);
        }
        else if ("string" === typeof args[0]) {
            
            for (var index = 0; index < props.length; index++) {
            // for (var index in props) {
                
                var propName = props[index] || null;
                var propValue = args[index] || '';
                
                if (!!propName) {
                    
                    this[String(propName)] = String(propValue);
                }
            }
        }
    }
}

User.UserTypes = {
    'Local': 'local',
    'Google': 'google'
};

User.generateHash = function (password) {
    
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.validEmail = function (email) {
    
    //var emailRegExp = new RegExp("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", "i");
    var emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    
    return emailRegExp.test(String(email));
};

User.prototype.authenticate = function (password) {
    
    return bcrypt.compareSync(password, this.password);
};

User.LocalUser = function () {
    
    var userProperties = [
        'email',
        'password'
    ];
    
    User.call(this, arguments, userProperties);
};

User.LocalUser.prototype = Object.create(User.prototype);

User.LocalUser.prototype.constructor = User.LocalUser;

User.GoogleUser = function () {
    
    var userProperties = [
        'token',
        'emails',
        'displayName'
    ];
    
    User.call(this, [ arguments, userProperties ]);
};

User.GoogleUser.prototype = Object.create(User.prototype);

User.GoogleUser.prototype.constructor = User.GoogleUser;

module.exports = User;