/**
 * Function to map message fields into Data model
 * @param {message} message - message to be parsed 
 * @returns 
 */
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