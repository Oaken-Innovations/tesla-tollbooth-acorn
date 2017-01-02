var GPIO = require('onoff').Gpio,
    redled = new GPIO(22, 'out'),
    greenled = new GPIO(23,'out'),
    //RFID Port
    SerialPort = require('serialport'),
    //Card Scan
    cardscan;
 
//Open serial line from RFID
var port = new SerialPort('/dev/ttyUSB0', {
  parser: SerialPort.parsers.readline('\n'),
  baudRate: 9600
});

//first turn red light on.
redled.writeSync(1);

//make sure green light is off.
greenled.writeSync(0);
console.log('Gate IS DOWN!');

// import ethereum web3 nodejs library
var Web3 = require('web3');

// set your web3 object
var web3 = new Web3();

// set the web3 object local blockchain node
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));


// log some web3 object values to make sure we're all connected
if (web3.isConnected()){
console.log("Ethereum node successfully connected to version:");
console.log(web3.version.node);
}
// test to see if a local coinbase is running ... we'll need this account to interact with a contract.
var coinbase = web3.eth.accounts[0];

// if default wallet/account isn't set - this won't have a value.  needed to interact with a contract.
console.log("Using Wallet ID: " + coinbase);
// let's print the balance of the wallet/account to test coinbase settings
// no worries if this is 0... don't need money to read events!
var balance = web3.eth.getBalance(coinbase);
console.log("Balance " + balance.toString(10) + " wei");
// Set the local node default account in order to interact with the contract 
// (can't interact with a contract if it doesn't know 'who' it is interacting with)
web3.eth.defaultAccount = web3.eth.accounts[0];

// Setup the TollBooth Contract Object with the ABI and Contract Address
// We will send any RFID ID to signal that the car wants to pay toll
var TollBoothABIString = '[{"constant":true,"inputs":[],"name":"storedData","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"x","type":"string"}],"name":"set","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"x","type":"string"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"storedData","type":"string"}],"name":"fileStored","type":"event"}]';
var TollBoothABI = JSON.parse(TollBoothABIString);
var TollBoothContractAddress = '0x71cc267e7da60e1758df795dc2bddc7c36563889';
var tollBooth = web3.eth.contract(TollBoothABI).at(TollBoothContractAddress);

// Setup the PayToll Contract Object with the ABI and Contract address
// We will monitor this for the RFID ID payment confirmation and take action
var PayTollABIString = '[{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"x","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"IPFSLoc","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"IDPaying","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"x","type":"string"},{"name":"y","type":"string"}],"name":"set","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"string"},{"indexed":false,"name":"IPFS","type":"string"}],"name":"tollPaid","type":"event"}]';
var PayTollABI = JSON.parse(PayTollABIString);
var PayTollContractAddress = '0x16ba5d688f0e88fa36913a5271655c566c0b65fa';
var payToll = web3.eth.contract(PayTollABI).at(PayTollContractAddress);

console.log('\n********* Ready to charge toll! *********');

//Monitor RFID for a scan.
port.on('data', function (data) {

   cardscan = data.trim();

  //***logic here to see if card holder will execute payment contract.
  // post RFID card ID to WannaPay? contract.  
  // '82003CF2CA86'

  
   
  console.log('\n\n\n*********'+' RFID SCANNED: ' + cardscan + ' *********');


  console.log('Updating TollBooth Contract with RFID: '+ cardscan);
  tollBooth.set(cardscan, function(error, result){
        if(!error){
            console.log('With Transaction ID: '+ result);
            console.log('**********************************************');
          }
        else
            console.error(error);

  })




  //***monitor PayToll contract for RFID ID in boradcast event.
  var event = payToll.tollPaid( {}, function(error, result) {

    if (!error) {

      var contractCardID = result.args.ID.trim();
      var IPFSLoc = result.args.IPFS.trim();


      // when Pay event is fired, output the value 'carddata' from the result object and the block number
      console.log('\n********* Toll Pay Contract Event Signaled *********');

      console.log('\n********* Toll Paid by: ' + contractCardID+ ' *********');
      console.log('IPFS Loc: http://ipfs.io/ipfs/' + IPFSLoc);
      console.log('**********************************************');


      //IF the card that the paytoll contract matches with the id of the scanned card, then lift the gate.


      if (contractCardID.toString == cardscan.toString){
      

        
        //If card passes, blink green light (raise toll gate)
        redled.writeSync(0);  // Turn redLED off.
        greenled.writeSync(1); // Turn greenLED on.
        console.log('\n********* Opening Gate *********');
        setTimeout(function(){ 
        		 redled.writeSync(1);  // Turn redLED on.
        		 greenled.writeSync(0); // Turn greenLED off.
               console.log('\n********* Closing Gate *********');
          }, 7000);  
      }
    }
  });

});



