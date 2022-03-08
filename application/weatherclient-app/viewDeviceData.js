'use strict';

/**
 * This is a Node.JS application to request to register a New Company on the Network
 */

const helper = require('./contractHelper');

async function main(deviceId) {

    try {
        const weathernetContract = await helper.getContractInstance();


        console.log('.....Requesting to view device data');
        const deviceDataBuffer = await weathernetContract.submitTransaction('viewDeviceHistory', deviceId);

        // process response
        console.log('.....Processing view device Transaction Response \n\n');
        let deviceData = JSON.parse(deviceDataBuffer.toString());
        
        console.log('\n\n.....View Device Transaction Complete!');
        return deviceData;

    } catch (error) {

        console.log(`\n\n ${error} \n\n`);
        throw new Error(error);

    } finally {

        // Disconnect from the fabric gateway
        helper.disconnect();

    }
}

module.exports.execute = main;