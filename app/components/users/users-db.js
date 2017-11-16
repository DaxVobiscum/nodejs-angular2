"use strict";
module.exports = (function () {
    
    var sprintf = require('sprintf-js').sprintf;
    
    var Dict = require('collections/dict');
    var Promise = require('bluebird');
    
    var User = require('../../models/user');
  
    var db = require('redis').createClient();
    
    const usersCount = "users:count";
    const usersIndexHash = "users:index";
    const usersLocalHash = "users:local";
    const usersGoogleHash = "users:google";
    
    const userIdFormat = "user:%d";
    
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
    
    function DEPRECATED_getUserByEmail (userType, userEmail, callback) {
    
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
    
    function DEPRECATED_getUserByName (userType, userName, callback) {
    
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
    
    var getUserById = function (userHash, userId) {
        
        return new Promise((resolve, reject) => {
            
            db.hgetAsync(userHash, userId)
                .then(function (user) {
                    
                    resolve(user);
                },
                function (err) {
                    
                    reject(err.message);
                });
        });
    };
    
    function getUserLocalById (userId) {
        
        return getUserById(usersLocalHash, userId);
    }
    
    function getUserGoogleById (userId) {
        
        return getUserById(usersGoogleHash, userId);
    }
    
    var addUser = function (userHash, user) {
        
        /** TODO
         * 1. Get user by e-mail to see if they're already registered in the index
         *    - if already registered, check the target hash to see if they have a record
         *    - if the record exists, notify the call chain; otherwise create the new entry //
         *      in the target hash using the existing user:id
         * 2. If there's no index entry, create it and Increment users:count
         *    - once created in the index, create the entry in the target hash
         */
        
        return new Promise((resolve, reject) => {
            
            function addUserAsync (user) {
                
                return db.getAsync(usersCount)
                    .then(function (userCount) {
                        
                        var newUserId = sprintf(userIdFormat, userCount);
                        
                        return db.hsetAsync(userHash, newUserId, JSON.stringify(user))
                            .then(function () {
                                
                                return resolve(false);
                            },
                            function (err) {
                                
                                return reject(err);
                            });
                    },
                    function (err) {
                        
                        reject(err);
                    });
            }
            
            function addUserSuccess (user) {
                
                if (!!user) {
                    
                    console.log(sprintf("User was already added: %s", user.name));
                    
                    return resolve(user);
                }
            }
            
            function addUserFail (err) {
                
                if (!err) {
                    
                    // user not found, create it
                    
                    return addUserAsync(user);
                }
            }
            
            if (!!user.email) {
                
                return getUserByEmail(User.UserTypes.Local, user.email).then(addUserSuccess, addUserFail);
            }
            else if (!!user.name) {
                
                return getUserByName(user.name).then(addUserSuccess, addUserFail)
            }
            else {
                
                return reject({ 'message': 'Invalid user.' });
            }
        });
    };
    
    function addUserLocal (userLocal) {
        
        return addUser(usersLocalHash, userLocal);
    }
    
    function addUserGoogle (userGoogle) {
        
        return addUser(usersGoogleHash, userGoogle);
    }
    
    var getUser = function (checkFn) {
        
        return new Promise((resolve, reject) => {
            
            var currentIndex = 0;
            
            var user = null;
            
            var handleErrorFn = function (err) {
                
                console.error(err.message);
            };
            
            var handlResultsFn = function (results) {
                
                var newIndex = parseInt(results[0]);
                
                var users = results[1]
                    .filter(function (value, index) {
                        
                        return (1 === index % 2);
                    });
                
                user = checkFn.call(this, users);
                
                if (0 < newIndex && !user) {
                    
                    currentIndex = newIndex;
                    
                    db.hscanAsync(usersIndexHash, currentIndex)
                        .then(handlResultsFn, handleErrorFn);
                }
                else if (!!user) {
                    
                    var userEmail = user.email || "N/A";
                    var userName = user.name || userEmail;
                    var userPassword = user.password || null;
                    
                    var resolveUser = function () {
                        
                        resolve({
                            'name': userName,
                            'email': userEmail,
                            'password': userPassword
                        });
                    };
                    
                    if (!!user.localId) {
                        
                        getUserLocalById(user.localId)
                            .then(function (userLocal) {
                                
                                if (!!userLocal) {
                                    
                                    userLocal = JSON.parse(userLocal);
                                    
                                    userEmail = userLocal.email || "N/A";
                                    userName = userLocal.name || userEmail;
                                }
                            })
                            .finally(resolveUser);
                    }
                    else {
                        
                        resolveUser();
                    }
                }
                else {
                    
                    reject(null);
                }
            };
            
            db.hscanAsync(usersIndexHash, currentIndex)
                .then(handlResultsFn, handleErrorFn);
        });
    };
    
    function getUserByEmail (userType, userEmail) {
        
        return getUser(function (users) {
            
            var user = null;
            
            for (let userIndex of users) {
                
                userIndex = JSON.parse(userIndex);
                
                if (!!userIndex.email && userEmail.toLowerCase() === userIndex.email.toLowerCase()) {
                    
                    user = userIndex;
                }
            }
            
            return user;
        });
    }
        
    function getUserByName (userName) {
        
        return getUser(function (users) {
            
            var user = null;
            
            for (let userIndex of users) {
                
                userIndex = JSON.parse(userIndex);
                
                if (!!userIndex.name && userName.toLowerCase() === userIndex.name.toLowerCase()) {
                    
                    user = userIndex;
                }
            }
            
            return user;
        });
    }
        
    Promise.promisifyAll(db);
        
    return {
        addUserLocal: addUserLocal,
        addUserGoogle: addUserGoogle,
        getUsers: getUsers,
        getUserById: getUserById,
        getUserByEmail: getUserByEmail,
        getUserByName: getUserByName
    };
})();