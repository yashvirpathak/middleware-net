'use strict';

/**
 * This is a Node.JS application to request to register a New Company on the Network
 */

const helper = require('./contractHelper');

async function main(city) {

    try {
        const weathernetContract = await helper.getContractInstance();


        console.log('.....Requesting to view device data');
        const cityDataBuffer = await weathernetContract.submitTransaction('getCityMeanTemperature', city);

        // process response
        console.log('.....Processing city mean temperature Transaction Response \n\n');
        let cityData = JSON.parse(cityDataBuffer.toString());
        
        console.log('\n\n.....city mean temperature Transaction Complete!');
        return cityData;

    } catch (error) {

        console.log(`\n\n ${error} \n\n`);
        throw new Error(error);

    } finally {

        // Disconnect from the fabric gateway
        helper.disconnect();

    }
}

module.exports.execute = main;