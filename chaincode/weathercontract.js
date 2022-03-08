'use strict'

const { Contract } = require('fabric-contract-api');

/**
* Weather contract
*/
class WeatherContract extends Contract {
    constructor() {
        // custom namespace to refer to weathernet smart contract
        super('org.middleware-network.weathernet');
    }

    /**
    * Weather contract instantiate function
    * @param {Object} ctx - Transaction context 
    */
    async instantiate(ctx) {
        console.log('Weather smart contract instantiated');
    }

    /**
    * Function to save device data into ledger
    * @param {Object} ctx - Transaction context
    * @param {String} deviceId - Device identifier
    * @param {String} city - city where device is installed
    * @param {String} temperature - Temperature reading from device
    * @param {String} deviceMetadata - device metadata
    * @returns operation status
    */
    async setDeviceData(ctx, deviceId, city, temperature, deviceMetadata) {

        try {
            // generate device data keys
            const coreKey = ctx.stub.createCompositeKey('org.middleware-network.weathernet.core', [deviceId.toLowerCase()]);
            const metadataKey = ctx.stub.createCompositeKey('org.middleware-network.weathernet.metadata', [deviceId.toLowerCase()]);
            const cityKey = ctx.stub.createCompositeKey('org.middleware-network.weathernet.city', [city.toLowerCase()]);
            const devicesKey = ctx.stub.createCompositeKey('org.middleware-network.weathernet.deviceIds');

            // core fields
            let coreFields = {
                deviceId: deviceId,
                city: city,
                temperature: parseInt(temperature),
                createdDate: new Date()
            }

            // metadata fields
            let metadataFields = {
                metadata: deviceMetadata,
                createdData: new Date()
            }

            //check if city exists, update city devices else add new
            let cityDevices = await this.getStateInJson(ctx, cityKey);
            if (cityDevices && cityDevices[city.toLowerCase()]) {
                if (!cityDevices[city.toLowerCase()].includes(deviceId)) {
                    cityDevices[city.toLowerCase()].push(deviceId)
                }
            } else {
                cityDevices = {}
                cityDevices[city.toLowerCase()] = [];
                cityDevices[city.toLowerCase()].push(deviceId);
            }

            //check if device exists, update devices coll else add new
            let devicesColl = await this.getStateInJson(ctx, devicesKey);
            if (devicesColl && devicesColl.deviceIds) {
                if (!devicesColl.deviceIds.includes(deviceId.toLowerCase())) {
                    devicesColl.deviceIds.push(deviceId.toLowerCase())
                }
            } else {
                devicesColl = { deviceIds: [] }
                devicesColl.deviceIds.push(deviceId.toLowerCase());

            }

            // Storing the data on the ledger
            let coreFieldsBuffer = Buffer.from(JSON.stringify(coreFields));
            await ctx.stub.putState(coreKey, coreFieldsBuffer);

            let metadataFieldsBuffer = Buffer.from(JSON.stringify(metadataFields));
            await ctx.stub.putState(metadataKey, metadataFieldsBuffer);

            let cityBuffer = Buffer.from(JSON.stringify(cityDevices));
            await ctx.stub.putState(cityKey, cityBuffer);

            let deviceCollBuffer = Buffer.from(JSON.stringify(devicesColl));
            await ctx.stub.putState(devicesKey, deviceCollBuffer);

            // return true if operation is success
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }

    /**
    * Function to view the lifecycle of the device by fetching transactions from the blockchain
    * @param {object} ctx - Transaction context
    * @param {string} deviceId - devie for which history to be viewed
    * @returns History of transaction details of a Device
    */
    async viewDeviceHistory(ctx, deviceId) {
        try {
            const coreKey = ctx.stub.createCompositeKey('org.middleware-network.weathernet.core', [deviceId.toLowerCase()]);
            let resultsIterator = await ctx.stub.getHistoryForKey(coreKey);

            // Fetching details from the iterator
            let allResults = [];
            let res = await resultsIterator.next();
            while (!res.done) {
                if (res.value && res.value.value.toString()) {
                    let jsonRes = {};
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }

                    allResults.push(jsonRes);
                }
                res = await resultsIterator.next();
            }
            resultsIterator.close();

            // return history transactions of the device
            return JSON.stringify(allResults);
        }
        catch (err) {
            console.log(err);
            return { error: err.message }
        }
    }

    /**
    * Function to get mean city temperature
    * @param Object} ctx - Transaction context
    * @param {String} city - name of the city
    * @returns user object
    */
    async getCityMeanTemperature(ctx, city) {
        // generate city key
        const cityKey = ctx.stub.createCompositeKey('org.middleware-network.weathernet.city', [city.toLowerCase()]);

        // get city details from the ledger
        let cityDetails = await this.getStateInJson(ctx, cityKey);

        // validate city details
        if (!cityDetails || !cityDetails[city.toLowerCase()]) {
            throw new Error('Device data does not exists for this city - ' + city);
        }

        let cityDevices = cityDetails[city.toLowerCase()];
        let temperatureSum = 0;
        for (let count = 0; count < cityDevices.length; count++) {
            let deviceData = await getDeviceData(ctx, cityDevices[count]);
            if (deviceData) {
                temperatureSum += deviceData.temperature;
            }
        }

        // calculate mean temperature
        let meanTemperature = temperatureSum / cityDevices.length;

        // return city mean temperature
        return meanTemperature;
    }

    /**
    * Function to view user details
    * @param {Object} ctx - Transaction context
    * @param {String} name - name of the user
    * @param {String} aadharnumber - Aadhar number of the user 
    * @returns user details
    */
    async getDeviceData(ctx, deviceId) {
        // generate device key            
        const coreKey = ctx.stub.createCompositeKey('org.middleware-network.weathernet.core', [deviceId.toLowerCase()]);

        // get core device details from ledger
        let deviceCurrentState = await this.getStateInJson(ctx, coreKey);

        // validate user
        if (!deviceCurrentState) {
            console.log('device does not exists' + deviceId);
            return null;
        }

        // return user details
        return deviceCurrentState;
    }

    /**
     * Function to emit event when any device malfunction
     * @param {Object} ctx - Transaction context 
     */
    async publishDeviceEvent(ctx){
        await ctx.stub.setEvent('deviceMalfunctionEvent', Buffer.from('weather_0'));
    }

    /**
    * Function to get details from ledger
    * @param {Object} ctx - Transaction context
    * @param {String} key - composite key in ledger
    * @returns data in json
    */
    async getStateInJson(ctx, key) {
        // get details from ledger
        const dataBuffer = await ctx.stub
            .getState(key)
            .catch(err => console.log(err));

        if (dataBuffer.toString()) {
            let data = JSON.parse(dataBuffer.toString());

            return data;
        }

        return dataBuffer.toString();
    }
}

module.exports = WeatherContract;