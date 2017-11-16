
// get user (id | name | token)
// set user (name, token)
// get user_local (id | name | token)
// set user_local (name, token)
// get user_google
// set user_google

/** Public **/

// addUserLocal (userLocal) // returns true if successful
// addUserGoogle (userGoogle) // returns true if successful
// getUser (sessionToken) // returns User + sessionToken
// getUserLocal (userLocalId) // returns User + sessionToken
// getUserGoogle (userGoogleId) // returns User + sessionToken

/** Private **/

// getUserById (userId) // returns User
// getUserByEmail (userEmail) // returns User

module.exports = function (app, io) {
    
    var db = require('redis').createClient();
    
    function getUserByName (userName) {
        
        db.hscan("users:index", 0, function (err, results) {
            
            if (!err) {
                
                console.info("Got results.");
            }
            else {
                
                console.err(err.message);
            }
        });
    }
    
    function getUserByEmail (userEmail) {
        
        
    }
    
    function getUserLocalById (userLocalId) {
        
        // lookup the user ID in the users:local table
    }
    
    function getUserGoogleById (userGoogleId) {
        
        // lookup the user ID in the users:google table
    }
    
    function addUserLocal (userLocal) {
        
        /**
         * 1a. Check if the user has a users entry by using getUserByEmail
         *    - returns the User with the matching e-mail
         * 1b. Check if the user has a users entry by using getUserByName
         *    - returns the User with the matching name
         * 2a. Create a new users:local entry and record the userLocalId
         * 2b. Create a new users:password entry and record the hashed and salted password
         * 4. Use the existing user:index entry or create a new one and assign it the userLocalId
         * 5. Return the generic User object with session token
         */
    }
    
    function addUserGoogle (userGoogle) {
        
        /**
         * 1. Check if user exists by looking up the ID using getUserGoogleById
         *    - this will return a User if successful, or err if not
         * 2. Create a new users:google record and record its userGoogleId
         * 3a. Check if the user has a users:local entry by using getUserByEmail
         *    - returns the userIndexId for the users:index entry with the matching e-mail
         * 3b. Check if the user has a users:local entry by using getUserByName
         *    - returns the userIndexId for the users:index entry with the matching name
         * 4. Use the existing user:index entry or create a new one and assign it the userGoogleId
         * 5. Return the generic User object with session token
         */
    }
    
    
};