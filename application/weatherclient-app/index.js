const express = require('express');
const app = express();
const port = 4000;

// Import all function modules
const addToWalletDevice = require('./addToWallet_device');
const addToWalletClient = require('./addToWallet_client');
const cityMeanTemperature = require('./cityMeanTemperature');
const viewDeviceData = require('./viewDeviceData');
const deviceMalfunctionEvent = require('./deviceMalfunctionEvent');

// Define Express app settings
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma App');

app.get('/', (req, res) => res.send('Hello Manufacturer'));

app.post('/addToWallet/device', (req, res) => {
    addToWalletDevice.execute(req.body.certificatePath, req.body.privateKeyPath).then(() => {
        console.log('Device Credentials added to wallet');
        const result = {
            status: 'success',
            message: 'Device credentials added to wallet'
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/addToWallet/client', (req, res) => {
    addToWalletClient.execute(req.body.certificatePath, req.body.privateKeyPath).then(() => {
        console.log('Client Credentials added to wallet');
        const result = {
            status: 'success',
            message: 'Client credentials added to wallet'
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/viewDeviceData', (req, res) => {
    viewDeviceData.execute(req.body.deviceId).then((resolve, reject) => {
        console.log('View Device data submitted on the Network');
        const result = {
            status: 'success',
            message: 'View Device Data submitted on the Network',
            data: resolve
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/cityMeanTemperature', (req, res) => {
    cityMeanTemperature.execute(req.body.city).then((resolve, rejecet) => {
        console.log('Get city Mean Temperature submitted on the Network');
        const result = {
            status: 'success',
            message: 'Get city Mean Temperature submitted on the Network',
            currentstate: resolve
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});


app.listen(port, () => console.log(`Middleware network client listening on port ${port}!`));