'use strict';

/**
 * This is a Node.JS application to request to register a New Company on the Network
 */

const helper = require('./contractHelper');
const sendmail = require('sendmail')();
const schedule = require('node-schedule');

async function main() {

    try {
        const job = schedule.scheduleJob('* * 23 * *', function (fireDate) {
            console.log('This job runs every 24 hours');
            await listenDeviceMalfunctionEvent();
        });
    } catch (error) {

        console.log(`\n\n ${error} \n\n`);
        throw new Error(error);
    }
}

async function listenDeviceMalfunctionEvent() {

    try {
        const weathernetContract = await helper.getContractInstance();

        // Checking device status
        console.log('.....Requesting to add drug on the Network');
        const eventBuffer = await weathernetContract.submitTransaction('publishDeviceEvent');

        // Defining listener callback
        const listener = async (event) => {
            if (event.eventName === 'deviceMalfunctionEvent') {
                let evtData = JSON.parse(event.payload.toString());
                await sendEmailAlert(evtData);
            }
        }

        // Adding listener for Device Malfunction Event
        weathernetContract.addContractListener(listener);

    } catch (error) {

        console.log(`\n\n ${error} \n\n`);
        throw new Error(error);

    } finally {

        // Disconnect from the fabric gateway
        helper.disconnect();

    }
}

/**
 * Function to send email with device details
 * @param {Object} deviceData - Malfunction Device data 
 */
let sendEmailAlert = async (deviceData) => {
    let content = 'Not receiving data for these devices - ' + JSON.stringify(deviceData);
    sendmail({
        from: 'no-reply@ymiddleware-network.com',
        to: 'admin@middleware-network.com, developers@middleware-network.com',
        subject: 'Device Malfunction Alert',
        html: content,
    }, function (err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
    });
}

module.exports.execute = main;