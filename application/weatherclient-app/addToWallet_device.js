'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: WEATHERDEVICE_ADMIN
 *  User Organization: WEATHERDEVICE
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { Wallets } = require('fabric-network'); // Wallet Library provided by Fabric

async function main(certificatePath, privateKeyPath, deviceId) {

    // Main try/catch block
    try {
        // A wallet is a filesystem path that stores a collection of Identities
        const wallet = await Wallets.newFileSystemWallet('./identity/weatherdevice');

        // Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
        const certificate = fs.readFileSync(certificatePath).toString();

        // IMPORTANT: Change the private key name to the key generated on your computer
        const privatekey = fs.readFileSync(privateKeyPath).toString();

        // Load credentials into wallet
        const identityLabel = (deviceId) ? deviceId : 'WEATHERDEVICE_ADMIN';
        const identity = {
            credentials: {
                certificate: certificate,
                privateKey: privatekey,
            },
            mspId: 'weatherdeviceMSP',
            type: 'X.509',
        };

        await wallet.put(identityLabel, identity);

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
        throw new Error(error);
    }
}

module.exports.execute = main;