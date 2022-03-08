'use strict';

/**
 * This is a Node.JS application to request to register a New Company on the Network
 */

const helper = require('./contractHelper');

async function main(deviceId, city, temperature, metadata) {

    try {
        const weathernetContract = await helper.getContractInstance();


        console.log('.....Requesting to set device details on the Network');
        const deviceDataBuffer = await weathernetContract.submitTransaction('setDeviceData', deviceId, city, temperature, JSON.stringify(metadata));

        // process response
        console.log('.....Processing Add Drug Transaction Response \n\n');
        let status = JSON.parse(deviceDataBuffer.toString());
        console.log('\n\n.....Set device data Transaction Complete!');
        return status;

    } catch (error) {

        console.log(`\n\n ${error} \n\n`);
        throw new Error(error);

    } finally {

        // Disconnect from the fabric gateway
        helper.disconnect();

    }
}

module.exports.execute = main;