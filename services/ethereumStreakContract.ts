// The address of the daily streak smart contract on the Ethereum chain.
export const streakContractAddress = '0xc83030e4c48Eb33205051991943c7f1D3B62A6dB';

// The Application Binary Interface (ABI) for the streak contract.
// This defines the functions we can call on the contract.
export const streakContractAbi = [
  // Read-only function to get a user's current streak
  "function getStreak(address user) public view returns (uint256)",
  
  // A function that writes to the blockchain to check in for the day
  "function checkIn() public"
];
