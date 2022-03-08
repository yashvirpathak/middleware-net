'use strict';

/**
 * This is a Node.JS application to request to register a New Company on the Network
 */

const helper = require('./contractHelper');

async function main() {

    try {
        const weathernetContract = await helper.getContractInstance();

        console.log('.....Requesting network healthcheck');
        const healthcheckBuffer = await weathernetContract.submitTransaction('healthcheck');

        // process response
        console.log('.....Processing network healthcheck transaction \n\n');
        let healthcheckData = JSON.parse(deviceDataBuffer.toString());
        
        console.log('\n\n.....network healthcheck Transaction Complete!');
        return healthcheckData;

    } catch (error) {

        console.log(`\n\n ${error} \n\n`);
        throw new Error(error);

    } finally {

        // Disconnect from the fabric gateway
        helper.disconnect();

    }
}

module.exports.execute = main;