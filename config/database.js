module.exports = {
    name: 'BD_NodeJS_App',
    secret: 'YOUR_SECRET',
    port: '6379',
    host: process.env.IP || '127.0.0.1'
};