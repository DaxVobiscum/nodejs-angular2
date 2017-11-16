/**
 * Provides access to the redis DB and users store
 */

module.exports = function (app, io) {

  var sprintf = require('sprintf-js').sprintf;
  
  var jsonWebToken = require('jsonwebtoken');
  var socketioJwt = require('socketio-jwt');
  
  // var cookies = require('cookie');
  // var merge = require('merge');
  
  //var vsprintf = require('sprintf-js').vsprintf;
  
  var Dict = require('collections/dict');
  
  //var users = require('../bin/users.js');
  
  var User = require('./models/user');
  
  var db = require('redis').createClient();
  
  var users_api = null;
  
  var users = {};
  
  users[User.UserTypes.Local] = new Dict(null);
  users[User.UserTypes.Google] = new Dict(null);
  
  function addUser (userType, user, callback) {
    
    var usersDB = sprintf("users:%s", userType),
      userId = sprintf("user:%d", users[userType].length + 1);
    
    db.hset(usersDB, userId, JSON.stringify(user), function (err, result) {
      
      if (!err) {
        
        console.log(sprintf("User '%s' added to DB '%s'.", user.email, usersDB));
        
        getUsers(userType, function () {
          
          callback(user);
        });
      }
    });
  }
  
  function getUsers(userType, callback) {
    
    db.hgetall(sprintf("users:%s", userType), function (err, resultSet) {
      
      if (!!err) {
        
        console.log(err.message);
      }
      else if (!!resultSet) {
        
        users[userType].clear();
        
        for (var userKey in resultSet) {
          
          var userObj = JSON.parse(resultSet[userKey]);
          
          var user = null;
          
          if (User.UserTypes.Local === userType) {
            
            user = new User.LocalUser(userObj);
          }
          else if (User.UserTypes.Google === userType) {
            
            user = new User.GoogleUser(userObj);
          }
          
          if (!!user) {
          
            users[userType].set(userKey, user);
          }
        }
        
        if ("function" === typeof callback) {
          
          callback();
        }
      }
    });
  }
  
  function getUserById(userId, callback) {
    
    if (!!userId) {
      
      var userKey = sprintf("user:%d", userId);
      
      // Check local
      if (users.has(userKey)) {
        
        callback(users[userKey]);
      }
      
      // Check DB
      else {
        
        db.hget("users", userKey, function (err, result) {
            
            if (!!err) {
              
              console.log(err.message);
            }
            else if (!!result) {
              
              users.set(userKey, result);
              
              callback(result);
            }
          });
      }
    }
  }
  
  function getUserByEmail (userType, userEmail, callback) {
    
    if (!!userType && !!userEmail) {
      
      console.log(sprintf("Get user '%s'...", userEmail));
      
      var matchingUsers = [];
      
      var userEntries = users[userType].values();
      
      var userEntry = userEntries.next();
      
      var user = null;
      
      while (!userEntry.done) {
        
        var userObj = userEntry.value || null;
      
        if (!!userObj && !!userObj.email 
          && (String(userEmail).toLowerCase() === String(userObj.email).toLowerCase())) {
          
            matchingUsers.push(userObj);
        }
        
        userEntry = userEntries.next();
      }
      
      if (0 < matchingUsers.length) {
        
        user = matchingUsers[0] || null;
        
        if (!!user) {
          
          console.log(sprintf("User '%s' retrieved.", user.email));
        }
      }
      
      callback.call(null, user);
    }
  }
  
  function getUserByName (userType, userName, callback) {
    
    if (!!userType && !!userName) {
      
      console.log(sprintf("Get user '%s'...", userName));
        
      var matchingUsers = users[userType].values().filter(user => {
            
          return (!!user && !!user.name 
            && (String(userName).toLowerCase() === String(user.name).toLowerCase()));
        }),
      user = null;
      
      if (0 < matchingUsers.length) {
        
        user = matchingUsers[0] || null;
        
        if (!!user) {
          
          console.log(sprintf("User '%s' retrieved.", user.name));
        }
      }
      
      callback.call(null, user);
    }
  }
  
  /** Event Handlers **/
  
  function onConnect (socket) {
    
    console.log(socket.decoded_token.email, 'connected');
    
    socket.on('getUser', onGetUser);
  }
  
  function onGetUser (userOptions, callback) {
    
    if (!!userOptions) {
      
      if (!!userOptions.email) {
        
        getUserByEmail("local", userOptions.email, function (user) {
          
          callback(user);
        });
      }
      else if (!!userOptions.name) {
        
        getUserByName("local", userOptions.name, function (user) {
        
          callback(user);
        });
      }
    }
  }
    
  getUsers("local");
  
  users_api = io.of('/users', onConnect);
  
  users_api.use(socketioJwt.authorize({
    secret: app.get('jwtSecret'),
    handshake: true
  }));
  
  // users_api.on('connection', function (socket) {
    
  //   try {
      
  //     console.log(socket.decoded_token.email, 'connected');
  //   }
  //   catch (err) {
      
  //     console.error(err.message);
  //   }
    
  //   socket.on('getUserByEmail', function (userEmail, callback) {
      
  //     getUserByEmail("local", userEmail, function (user) {
        
  //       callback(user);
  //     });
  //   });
    
  //   socket.on('getUserByName', function (userName, callback) {
      
  //     getUserByName("local", userName,function (user) {
        
  //       callback(user);
  //     });
  //   });
  // });
    
  return {
    addUser: addUser,
    getUserByEmail: getUserByEmail,
    getUserByName: getUserByName
  };
};