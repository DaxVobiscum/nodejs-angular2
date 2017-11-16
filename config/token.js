var uuid = require('uuid');

module.exports = {
    cookieSession: 'bendev-nodejs-surlyp.c9.session',
    secret: uuid.v4()
};