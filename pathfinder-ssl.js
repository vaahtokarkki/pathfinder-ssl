const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

const privateKey = fs.readFileSync('/certs/server.key', 'utf8');
const certificate = fs.readFileSync('/certs/server.crt', 'utf8');
let ca

const { MTLS } = process.env

if (MTLS)
    ca = fs.readFileSync('/certs/ca.crt')

const credentials = { key: privateKey, cert: certificate, ca, rejectUnauthorized: MTLS }
const app = express();

app.get('*', function (req, res) {
    const { originalUrl, headers, secure } = req
    res.json({
        path: originalUrl,
        headers,
        secure
    })
})


const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)

httpServer.listen(8080)
httpsServer.listen(8443)

console.log('https in port 8443')
if (MTLS)
    console.log('mTLS is enabled')
console.log('http in port 8080')
