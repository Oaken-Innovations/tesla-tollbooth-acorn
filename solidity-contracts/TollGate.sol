pragma solidity ^0.4.6;

import "VehicleDirectory.sol";
import "TollUserAccount.sol";

contract TollGate {
    address public owner;
    bytes public name;
    bytes public location;
    uint public costPerAxel;
    bool decommissioned = false;
    
    
    function TollGate(bytes inputName, bytes inputLocation, uint inputCostPerAxel) {
        owner = msg.sender;
        name = inputName;
        location = inputLocation;
        costPerAxel = inputCostPerAxel;
    }
    
    function chargeToll(address VD, bytes32 VIN) notDecomissioned {
        uint charge = VehicleDirectory(VD).vehicleAxelsLookup(VIN) * costPerAxel;
        address vehicleOwner = VehicleDirectory(VD).vehicleOwnerLookup(VIN);
        TollUserAccount(vehicleOwner).collectToll(charge);
    }
    
    function decomissionToll() notDecomissioned {
        decommissioned = true;
    }
    
    /* Modifers */
    modifier notDecomissioned {
        if (decommissioned == false) {
        } throw;
        _;
    }
    
}