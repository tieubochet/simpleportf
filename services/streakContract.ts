// The address of the daily streak smart contract on the Base chain.
export const streakContractAddress = '0x899bffa2af4504eec57b8c8f12d8150c4d792830';

// The Application Binary Interface (ABI) for the streak contract.
// This defines the functions we can call on the contract, based on the provided source code.
export const streakContractAbi = [
  // Read-only function to get a user's current streak
  "function getStreak(address user) public view returns (uint256)",
  
  // A function that writes to the blockchain to check in for the day
  "function checkIn() public"
];