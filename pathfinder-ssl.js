const fs = require('fs');
const pki = require('node-forge').pki;
const express = require('express')
const app = express();

const ca = fs.readFileSync('./certs/ca.crt')
const caStore = pki.createCaStore([pki.certificateFromPem(ca)])

const getCert = (headers) => `
-----BEGIN CERTIFICATE-----
${headers['x-ssl-cert']}
-----END CERTIFICATE-----
`


app.use('*', (req, res, next) => {
    try {
        const cert = getCert(req.headers)
        console.log(cert)
        pki.verifyCertificateChain(caStore, [pki.certificateFromPem(cert)])
    } catch (e) {
        console.log(e)
        console.log(JSON.stringify(req.headers))
        return res.status(401).send(e.message || 'Invalid client certificate')
    }
    next()
})

app.get('*', function (req, res) {
    const { originalUrl, headers, secure } = req
    res.json({
        path: originalUrl,
        headers,
        secure
    })
})

app.listen(8080, () => {
    console.log(`pathfinder listening at 8080`)
})
