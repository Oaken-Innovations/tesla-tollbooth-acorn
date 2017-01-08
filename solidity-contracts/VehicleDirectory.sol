pragma solidity ^0.4.6;

contract VehicleDirectory {

    /* VINLookup stores a bytes32 value with a bytes32 VIN associated */
    mapping(bytes32 => Vehicle) public VINLookup;
    mapping(address => bool) public isATollGate;
    
    struct Vehicle {
        address vehicleOwner;
        address previousOwner;
        uint year;
        bytes make;
        bytes model;
        bytes color;
        bytes licensePlate;
        bytes8 state;
        uint8 axels;
    }

    function createVehicle (bytes32 VIN, address vehicleOwner, uint year, 
                           bytes make, bytes model, bytes color,
                           bytes licensePlate, bytes8 state, uint8 axels) {
        VINLookup[VIN] = Vehicle(vehicleOwner, 0x0, year, make, model, color,
                                licensePlate, state, axels);
    }
    
    function addTollGateToList(address newTollGate) {
        
    }
    
    function addTollGate(address inputTollGate) {
        isATollGate[inputTollGate] = true;
        TollEvent(block.timestamp, msg.sender, inputTollGate, "Added toll gate.");
    }
    
    function removeTollGateFromList(address inputTollGate) {
        isATollGate[inputTollGate] = false;
        TollEvent(block.timestamp, msg.sender, inputTollGate, "Removed toll gate.");
    }
    
    function checkTollGate(address inputTollGate) returns (bool){
        return isATollGate[inputTollGate];
    }

    function vehicleOwnerLookup (bytes32 VIN) returns (address vehicleOwner) {
        return (VINLookup[VIN].vehicleOwner);
    }
    
    function vehicleAxelsLookup (bytes32 VIN) returns (uint8 axels) {
        return (VINLookup[VIN].axels);
    }
    
    function setVehicleOwner (bytes32 VIN, address vehicleOwner) {
        VINLookup[VIN].vehicleOwner = vehicleOwner;
    }
    
    function setVehiclePrevOwner (bytes32 VIN, address prevOwner) {
        VINLookup[VIN].previousOwner = prevOwner;
    }
    
    function sendVehicleDescription (bytes32 VIN) returns (uint year, 
                           bytes make, bytes model, bytes color,
                           bytes licensePlate, bytes8 state) {
        return (VINLookup[VIN].year, VINLookup[VIN].make, VINLookup[VIN].model, 
        VINLookup[VIN].color, VINLookup[VIN].licensePlate, VINLookup[VIN].state);
    }
    
    event TollEvent         (uint eventTimeStamp,
                            address indexed callingAddress, 
                            address indexed resourceAddress, 
                            bytes indexed description);
}