/*
 * Main server setup and configuration file
 */

var cookie = require('cookie');
var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jsonWebToken = require('jsonwebtoken');
var socketio = require('socket.io');
var passport = require('passport');
var sprintf = require('sprintf-js').sprintf;
var uuid = require('uuid');

var authConfig = require('./config/auth');
var tokenConfig = require('./config/token');

var app = module.exports = express();
var server = http.createServer(app);
var io = socketio.listen(server);

var Dict = require('collections/dict');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var User = require('./app/models/user');

app.set('jwtSecret', tokenConfig.secret);
  
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// app.configure(function () {
  
//   app.set('jwtSecret', tokenConfig.secret);
  
//   app.use(express.static(path.resolve(__dirname, 'public')));
//   app.use(cookieParser());
//   app.use(bodyParser.urlencoded({ extended: false }));
//   app.use(bodyParser.json());
//   app.use(passport.initialize());
//   app.use(passport.session());
// });

var userAPI = require('./app/components/users/users-module')(app, io);

var googleAuthStack = { };

passport.use('google', new GoogleStrategy(authConfig['googleAuth'], 
  function (accessToken, refreshToken, profile, done) {
    
    console.log('Something happened.');
    
    done(null, profile);
  }));

passport.use('local', new LocalStrategy(
  function (email, password, done) {
    
    if (!User.validEmail(email)) {
      
      return done(null, false, { message: "E-mail address not accepted." });
    }
    else if (!!!password) {
      
      return done(null, false, { message: "Password cannot be blank." });
    }
    else {
      
      var user = null;
      
      // lookup the user
      userAPI.getUserByEmail(User.UserTypes.Local, email)
        .then(function (userObj) {
          
          if (!!userObj) {
            
            user = new User.LocalUser(userObj);
            
            console.log(sprintf("Passport: Retrieved user '%s'.", user.email));
            
            // verify their password
            
            if (!user.authenticate(password)) {
              
              done(null, false, { message: "Wrong password." });
            }
            else {
              
              done(null, user);
            }
          }
          else {
            
            done(null, false, { message: "User not registered." });
          }
        });
    }
  }));
  


passport.serializeUser(function(user, done) {
  
  done(null, user.email);
});

passport.deserializeUser(function (email, done) {
  
  userAPI.getUserByEmail(User.UserTypes.Local, email, function (user) {
    
    if (!!user) {
      
      done(null, user);
    }
  });
});

app.get('/login/google', 
  function (req, res, next) {
  
    console.log('Authenticating Google...');
  
    passport.authenticate('google', { scope: [ 'email profile' ] })(req, res, next);
  });
  
app.get('/login/google/callback',
  function (req, res, next) {
    
    console.log('Google auth response received.');
    
    var sessionCookie = req.cookies[tokenConfig.cookieSession];
    
    var userSocket = null;
    
    passport.authenticate('google', { }, function (err, profile, info) {
      
      console.log('Google auth complete.');
      
      var socketCallback = function (result) {
        
        if (!!userSocket) {
          
          userSocket.emit('complete', result);
        }
      };
      
      if (!!sessionCookie) {
        
        userSocket = googleAuthStack[sessionCookie];
        
        delete googleAuthStack[sessionCookie];
      }
      
      if (!err) {
        
        if (!profile) {
          
          console.error('No profile returned.');
          
          socketCallback(false);
        }
        else {
        
          console.log(sprintf('Got user \'%s\'.', profile.displayName));
          
          socketCallback(profile);
        }
      }
      else {
        
        socketCallback(false);
        
        return next(err);
      }
    })(req, res, next);
  });
  
app.get('*', 
  function (req, res, next) {
    
    var sessionCookie = req.cookies[tokenConfig.cookieSession];
    
    if (!sessionCookie) {
      
      var sessionToken = jsonWebToken.sign({ id: uuid.v4(), timestamp: Date.now() }, app.get('jwtSecret'));
      
      res.cookie(tokenConfig.cookieSession, sessionToken, { httpOnly: true });
    }
    
    res.redirect('/');
  });

app.post('/login/local',
  function (req, res, next) {
    
    passport.authenticate(User.UserTypes.Local, { session: false }, function (err, user, info) {
      
      if (err) {
        
        return next(err);
      }
      
      // invalid user, return error message
      if (!user) {
        
        res.json(info);
      }
      
      // valid user, get the token and send it back
      else {
        
        var token = jsonWebToken.sign(user, app.get('jwtSecret'), { expiresIn: "5h" });
        
        res.json({ token: token, username: user.email });
      }
    })(req, res, next);
  });
  
app.post('/register/local',
  function (req, res, next) {
    
    var user = null;
      
    console.info('User registering...');
      
    var userEmail = req.body.username,
      userPassword = req.body.password;
    
    userAPI.getUserByEmail(User.UserTypes.Loca, userEmail, function (userObj) {
        
      if (!!userObj) {
        
        // user exists
        res.json({ message: "Username already registered." });
      }
      else {
        
        // validate email and register user
        if (!User.validEmail(userEmail)) {
          
          return res.json({ message: "E-mail address not accepted." });
        }
        else if (!!!userPassword) {
          
          return res.json({ message: "Password cannot be blank." });
        }
        else {
          
          // register the user
          
          var newUser = new User.LocalUser(userEmail, User.generateHash(userPassword));
          
          // add the user to the DB
          
          userAPI.addUser(User.UserTypes.Local, newUser, function (userAdded) {
            
            user = userAdded;
            
            console.log(sprintf("Passport: Registered new user '%s'.", user.email));
            
            res.json(false);
          });
        }
      }
    });
  });

var googleSockets = io.of('/auth/google', function (socket) {
  
  console.log('Google auth socket connected.');
  
  var sessionCookie = cookie.parse(socket.handshake.headers.cookie)[tokenConfig.cookieSession];
  
  var userSocket = socket;
  
  socket.on('login', function (callback) {
    
    if (!!sessionCookie) {
      
      // var timestamp = Date.now();
      
      // var token = jsonWebToken.sign({ client: clientInfo, time: timestamp }, app.get('jwtSecret'), { expiresIn: "5m" });
      
      googleAuthStack[sessionCookie] = userSocket;
      
      callback.call(null, true);
    }
    else {
      
      callback.call(null, false);
    }
  });
});

var rootSockets = io.of('/', function (socket) {
  
  console.log('New socket connected in root sockets.');
  
  socket.on('authenticate', function (token, callback) {
    
    jsonWebToken.verify(token, app.get('jwtSecret'), function (err, decoded) {
      
      if (!err) {
        
        callback.call(null, null, decoded.email);
      }
      else {
        
        callback.call(null, err.message, null);
      }
    });
  });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  
  var addr = server.address();
  
  console.log("BenDev server listening at", addr.address + ":" + addr.port);
  
  // Test things
  
  userAPI.getUserByName("People Person")
    .then(function (user) {
      
        console.info("Got the user by name.");
      }, 
      function (err) {
        
        console.error(err);
      });
  
  userAPI.getUserByEmail(User.UserTypes.Local, "person@people.com")
    .then(function (user) {
      
        console.info("Got the user by email.");
      }, 
      function (err) {
        
        console.error(err);
      });
    
    userAPI.addUserLocal({ 'name':'Surly Pink', 'email': 'surly.pink@gmail.com' })
      .then(function (user) {
        
        console.info("User was added.");
      },
      function (err) {
        
        console.error(err);
      });
});