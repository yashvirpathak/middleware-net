let deviceModel = (message) => {
    let model = {
        deviceId: message.device_id,
        temperature: message.temperature,
        city: message.device_city,
        metadata: {
            deviceType: message.device_type,
            description: message.description ? message.description : ''
        }
    }

    return model;
}

module.exports = deviceModel;