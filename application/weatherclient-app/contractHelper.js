const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
let gateway;

async function getContractInstance() {

    // A gateway defines which peer is used to access Fabric network
    // It uses a common connection profile (CCP) to connect to a Fabric Peer
    // A CCP is defined manually in file connection-profile-weatherdevice.yaml
    gateway = new Gateway();

    // A wallet is where the credentials to be used for this transaction exist
    const wallet = await Wallets.newFileSystemWallet('./identity/weatherclient');

    // What is the username of this Client user accessing the network?
    const fabricUserName = 'WEATHERCLIENT_ADMIN';

    // Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
    let connectionProfile = yaml.load(fs.readFileSync('./connection-profile-weatherclient.yaml', 'utf8'));

    // Set connection options; identity and wallet
    let connectionOptions = {
        wallet: wallet,
        identity: fabricUserName,
        discovery: { enabled: false, asLocalhost: true }
    };

    // Connect to gateway using specified parameters
    console.log('.....Connecting to Fabric Gateway');
    await gateway.connect(connectionProfile, connectionOptions);

    // Access property weather channel
    console.log('.....Connecting to channel - weatherchannel');
    const channel = await gateway.getNetwork('weatherchannel');

    // Get instance of deployed Weathernet contract
    // @param Name of chaincode
    // @param Name of smart contract
    console.log('.....Connecting to weathernet Smart Contract');
    return channel.getContract('weathernet', 'org.middleware-network.weathernet');
}

function disconnect() {
    console.log('.....Disconnecting from Fabric Gateway');
    gateway.disconnect();
}

module.exports = { getContractInstance, disconnect }