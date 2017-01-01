// file system library
var fs = require('fs');
// import ethereum web3 nodejs library
var Web3 = require('web3');
// set your web3 object
var web3 = new Web3();
// import ipfs nodejs library
var ipfsAPI = require('ipfs-api')
// set ipfs object
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'}) // leaving out the arguments will default to the$

var carid = '82003CCCEB99';

// set the web3 object local blockchain node
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// log some web3 object values to make sure we're all connected
console.log(web3.version.api);
console.log(web3.isConnected());
console.log(web3.version.node);

// test to see if a local coinbase is running ... we'll need this account to interact with a contract.
var coinbase = web3.eth.accounts[0];

// if default wallet/account isn't set - this won't have a value.  needed to interact with a contract.
console.log('Wallet: ' + coinbase);

//Tollbooth Contract - let's monitor this for our RFID ID
var TollBoothABIString = '[{"constant":true,"inputs":[],"name":"storedData","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"x","type":"string"}],"name":"set","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"x","type":"string"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"storedData","type":"string"}],"name":"fileStored","type":"event"}]';
var TollBoothABI = JSON.parse(TollBoothABIString);
var TollBoothContractAddress = '0x71cc267e7da60e1758df795dc2bddc7c36563889';
var tollBooth = web3.eth.contract(TollBoothABI).at(TollBoothContractAddress);


// Set the local node default account in order to interact with the contract
// (can't interact with a contract if it doesn't know 'who' it is interacting with)
web3.eth.defaultAccount = web3.eth.accounts[0];

// Setup the PayToll Contract Object with the ABI and Contract address
// We will pay this contract when our RFID ID is signaled
var PayTollABIString = '[{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"x","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"IPFSLoc","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"IDPaying","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"x","type":"string"},{"name":"y","type":"string"}],"name":"set","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"string"},{"indexed":false,"name":"IPFS","type":"string"}],"name":"tollPaid","type":"event"}]';
var PayTollABI = JSON.parse(PayTollABIString);
var PayTollContractAddress = '0x16ba5d688f0e88fa36913a5271655c566c0b65fa';
var payToll = web3.eth.contract(PayTollABI).at(PayTollContractAddress);





//monitor the contract and see when it signals a car ID wanting to pay toll

var event = tollBooth.fileStored( {}, function(error, result) {
  if (!error) {

  	console.log('Booth Event Fired! ');
  	console.log('\''+result.args.storedData+'\'');
  	console.log('\''+carid+'\'');
  	var idFromContract = result.args.storedData.trim();

  	console.log('Reprinting with Trim');
  	console.log('\''+idFromContract+'\'');
  	console.log('\''+carid+'\'');

  	//check to see if RFID ID signaled by the smart contract is equal to the one we're representing
  	if (idFromContract.toString == carid.toString){

  		//that's our car.  Let's collect can bus data, post to ipfs 
  		// and pay toll along with ipfs file location

		//spawn for canbus data
	  	const spawn = require('child_process').spawn;

		//candump -l any,0:0,#FFFFFFFF
		const ls = spawn('candump', ['-l','any,0:0,#FFFFFFFF']);


		var f;
		var file_to_go_to_ipfs;
		var ipfs_hash;


		setTimeout(function(){

			ls.kill('SIGINT');
			f = getNewestFile(".", new RegExp('.*\.log'));
			f = f.substr(1);
			console.log(f);
			fs.rename(f, 'latest_car.log' ,function(err, data){
		     	if (err) {
		     		throw err
		     	}

		        file_to_go_to_ipfs = fs.readFileSync('latest_car.log');
		        ipfs.add(file_to_go_to_ipfs, (err,result) => {
		         if (err) {
		            throw err
		          }
		          JSON.parse('{}');
		          ipfs_hash = result[0].hash;
		          console.log(ipfs_hash);
		          console.log(carid);
		          console.log('Updating Contract with \''+carid+'\',\''+ipfs_hash+'\'');

		          payToll.set(carid, ipfs_hash, function(error, result){
	                  if(!error)
	                      console.log(result);
	                  else
	                      console.error(error);
	              })

		     	})

			});
		 }, 1000);

  	}
  	

  



  }

});

function getNewestFile(dir, regexp) {
    newest = null
    files = fs.readdirSync(dir)
    one_matched = 0

    for (i = 0; i < files.length; i++) {

        if (regexp.test(files[i]) == false)
            continue
        else if (one_matched == 0) {
            newest = files[i]
            one_matched = 1
           continue
        }

        f1_time = fs.statSync(files[i]).mtime.getTime()
        f2_time = fs.statSync(newest).mtime.getTime()
        if (f1_time > f2_time)
            newest[i] = files[i]
    }

    if (newest != null)
        return (dir + newest)
    return null
}

