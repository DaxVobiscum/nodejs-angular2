var bcrypt = require('bcrypt-nodejs');

function User () { }

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

function Client (name, token) {
    
    this.name = name || "";
    this.token = token || "";
}

User.Client = Client;

function Index (indexId, googleId, isAdmin) {
    
    this.indexId = indexId || null;
    this.googleId = googleId || null;
    this.isAdmin = isAdmin || false;
}

User.Index = Index;

function Google (googleId, profile) {
    
    this.googleId = googleId || null;
    this.profile = profile ||  { };
}

User.Google = Google;

function Name (indexId, name) {
    
    this.indexId = indexId || null;
    this.name = name || "";
}

User.Name = Name;

function Email (indexId, email) {
    
    this.indexId = indexId || null;
    this.email = email || "";
}

User.Email = Email;

function Secret (indexId, secret) {
    
    this.indexId = indexId || null;
    this.secret = secret || "";
}

User.Secret = Secret;

module.exports = User;