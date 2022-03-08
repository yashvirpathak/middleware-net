// Import all function modules
const serDeviceData = require('./setDeviceData');
const mqtt = require('mqtt');  // require mqtt
const config = require('./config.json');
const client = mqtt.connect(`mqtt://${config.broker_host}:${config.broker_port}`);
const deviceModel = require('./deviceModel');

client.on('connect', function () {
    console.log('connected');
    client.subscribe(config.subscribe_topics);
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(topic + ' - ' + message.toString());
    let msgJson = JSON.parse(message.toString());
    let model = deviceModel(msgJson);

    serDeviceData.execute(model.deviceId, model.city, model.temperature, model.metadata).then((resolve, reject) => {
        console.log('Device data submitted on the Network');
        const result = {
            status: 'success',
            message: 'Device Data submitted on the Network',
            company: resolve
        };
        console.log(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            console.log(result);
        });

})

