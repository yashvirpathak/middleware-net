#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Updating Chaincode WEATHERNET On Middleware Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="weatherchannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="weatherdevice weatherclient"
TIMEOUT=15

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "New Version : "$VERSION

# import utils
. scripts/utils.sh

## Install new version of chaincode on peers of all 5 orgs making them endorsers
echo "Installing chaincode on peer0.weatherdevice.middleware-network.com.com ..."
installChaincode 0 'weatherdevice' $VERSION
echo "Installing chaincode on peer1.weatherdevice.middleware-network.com.com ..."
installChaincode 1 'weatherdevice' $VERSION
echo "Installing chaincode on peer0.weatherclient.middleware-network.com.com ..."
installChaincode 0 'weatherclient' $VERSION
echo "Installing chaincode on peer1.weatherclient.middleware-network.com.com ..."
installChaincode 1 'weatherclient' $VERSION

# Upgrade chaincode on the channel using peer0.weatherdevice
echo "Upgrading chaincode on channel using peer0.weatherdevice.middleware-network.com ..."
upgradeChaincode 0 'weatherdevice' $VERSION

echo
echo "========= All GOOD, Chaincode WEATHERNET Is Now Updated To Version '$VERSION' =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
