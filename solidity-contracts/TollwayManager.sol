pragma solidity ^0.4.6;

import "TollGate.sol";
import "VehicleDirectory.sol";

contract TollwayManager {
    address public owner;
    address public VD;
    
    
    function TollwayManager() {
        owner = msg.sender;
        TollEvent(block.timestamp, msg.sender, this, "Welcome to your tollway system.");
    }
    
    function createVD() {
        VD = new VehicleDirectory();
        TollEvent(block.timestamp, msg.sender, VD, "Created VD.");
        setVD(VD);
    }
    
    function setVD(address newVD) {
        VD = newVD;
        TollEvent(block.timestamp, msg.sender, VD, "Set VD.");
    }
    
    function getVD() returns (address) {
        return VD;
    }
    
    function createTollGate(bytes name, bytes location, uint inputCostPerAxel)
                           returns (address TD) {
       TD = new TollGate(name, location, inputCostPerAxel);
       TollEvent(block.timestamp, msg.sender, TD, "Created toll gate.");
       addTollGate(TD);
       return TD;
    }
    
    function addTollGate(address inputTollGate) {
        VehicleDirectory(VD).addTollGateToList(inputTollGate);
        TollEvent(block.timestamp, msg.sender, inputTollGate, "Added toll gate.");
    }
    
    function removeTollgate(address inputTollGate) {
        VehicleDirectory(VD).removeTollGateFromList(inputTollGate);
        TollEvent(block.timestamp, msg.sender, inputTollGate, "Removed toll gate.");
    }
    
    function createTollUserAccount(bytes inputLegalName) {
        address TUA = new TollUserAccount (inputLegalName, VD, this);
        TollEvent(block.timestamp, msg.sender, TUA, "Created Toll User Account.");
    }

    /* Events */
    event TollEvent         (uint eventTimeStamp,
                            address indexed callingAddress, 
                            address indexed resourceAddress, 
                            bytes indexed description);
}