BenDev - NodeJS Development/POC Environment

This project is a web application written in Angular2+Typescript. It runs on a NodeJS Express web server, with Redis datastore.

Grunt is used to build and run the server. Follow the steps below to get it up and running.

1. Run `npm install` to retrieve all required packages.
2. Run `grunt` to compile the code and start the Redis instance.
3. Run `grunt serverStart` to initialize the Express server.
4. Navigate to `http://localhost:8080/` to witness the magic.

I spent a lot of time on the authentication module. The server code is a bit messy and needs refactoring, but it should work to create a local account or use Google authentication.
