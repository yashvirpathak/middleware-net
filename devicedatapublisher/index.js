const mqtt = require('mqtt')  // require mqtt
const config = require('./config.json');
const client = mqtt.connect(`mqtt://${config.broker_host}:${config.broker_port}`) // create a client
// mqtt publish -h 127.0.0.1 -p 1883 -t 'devices/weather' -m 'hi'

let publishDeviceData = async () => {
    let counter = 0;
    while (true) {
        await delay(1000);

        counter++;
        config.devices.forEach(async (device) => {
            data = await generateDeviceData(device);
            if (data.publishFrequency && (counter % data.publishFrequency) == 0) {
                data.deviceData.forEach(d => {
                    client.publish(data.topic, JSON.stringify(d));
                });
                console.log('published');
                counter = 0;
            }
        })

    }
}

let generateDeviceData = async (device) => {
    let deviceData = [];

    for (let count = 0; count < device.device_count; count++) {
        dev = {};
        let max = device['std_val'] + 5;
        let min = device['std_val'] - 5;
        dev['device_id'] = device['type'] + "_" + count;
        dev['device_type'] = device['type'];
        dev['temperature'] = Math.floor(Math.random() * (max - min + 1)) + min;
        dev['device_city'] = device['city'];

        deviceData.push(dev);
    }

    return { deviceData: deviceData, publishFrequency: device['publish_frequency'], topic: device['publish_topic'] };
}

let delay = async (ms) => {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

client.on('connect', async () => {
    console.log('connected');
    await publishDeviceData();
})