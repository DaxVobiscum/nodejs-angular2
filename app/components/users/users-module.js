/**
 * Provides access to the redis DB and users store
 */
 
module.exports = function (app, io) {
    
    var usersDB = require('./users-db');
    
    var sprintf = require('sprintf-js').sprintf;
    
    var socketioJwt = require('socketio-jwt');
    
    var users_api = null;
    
    function onConnect (socket) {
    
        console.log(sprintf('User \'%s\' was authenticated for socket namespace \'/users\'.', socket.decoded_token.email));
        
        socket.on('getUser', onGetUser);
    }
    
    function onGetUser (userOptions, callback) {
    
        if (!!userOptions) {
            
            if (!!userOptions.email) {
                
                usersDB.getUserByEmail("local", userOptions.email, function (user) {
                
                    callback(user);
                });
            }
            else if (!!userOptions.name) {
            
                usersDB.getUserByName("local", userOptions.name, function (user) {
                
                    callback(user);
                });
            }
        }
    }
    
    usersDB.getUsers("local");
    
    users_api = io.of('/users', onConnect);
    
    users_api.use(socketioJwt.authorize({
        secret: app.get('jwtSecret'),
        handshake: true
    }));
    
    return Object.assign({}, 
        usersDB);
};