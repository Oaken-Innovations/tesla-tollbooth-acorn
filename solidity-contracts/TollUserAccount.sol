pragma solidity ^0.4.6;

import "VehicleDirectory.sol";

contract TollUserAccount {
    /* A toll user has: vehicles and amount owed */
    bytes legalName;
    uint public userCreatedTimestamp;
    uint public credits = 0; /* in wei */
    uint public owed = 0; /* in wei */
    address public TM;
    address public VD;
    address owner;
    mapping(bytes32 => bool) public accountVINs;
    
    function TollUserAccount (bytes inputLegalName, address inputVD, address inputTM) {
        owner = msg.sender;
        legalName = inputLegalName;
        VD = inputVD;
        TM = inputTM;
        userCreatedTimestamp = block.timestamp;
    }
    
    function addVIN(bytes32 VIN) {
        accountVINs[VIN] = true;
        VehicleDirectory(VD).setVehicleOwner(VIN, this);
    }
    
    function removeVIN(bytes32 VIN) {
        accountVINs[VIN] = false;
        VehicleDirectory(VD).setVehiclePrevOwner(VIN, this);
        VehicleDirectory(VD).setVehicleOwner(VIN, 0x0);
    }
    
    function collectToll(uint tollCharge) {
        owed += tollCharge;
    }
 
    /* Responses
     * 0: Payment failed. Refunding your payment.
     * 1: Payment success. Only a partial payment.
     * 2: Payment success. Bill fully paid.
     * 3: Payment success. Paid with too much ether. Adding extra to credits.
     * 4: Payment failed. Already paid in full.
     */
    function payToll() payable returns(uint response) {
        uint amtSent = msg.value / 2;
        if(owed == 0) {
            return 4;
        } else if ((amtSent * 2) <= owed) {
            owed -= (amtSent * 2);
            return 1;
        } else if (amtSent * 2 > owed) {
            credits += ((amtSent * 2) - owed);
            owed -= (amtSent * 2);
            return 3;
        } else {
            return 0;
        }
    }
    
    function withdraw() payable onlyOwnerOrVD {
        
    }
    
    function adjustOwed(bool add, uint adjustment) onlyOwnerOrTollGate {
        if (add)
            owed += adjustment;
        else
            owed -= adjustment;
    }
    
    /* Modifers */
    modifier onlyOwnerOrVD {
        if (msg.sender != owner || msg.sender != VD) {
        } throw;
        _;
    }
    
    modifier onlyOwnerOrTollGate {
        if (msg.sender != owner || VehicleDirectory(VD).checkTollGate(msg.sender)) {
        } throw;
        _;
    }
}