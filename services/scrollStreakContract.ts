// The address of the daily streak smart contract on the Scroll chain.
export const streakContractAddress = '0x7123f9398f765624a7C96f23ECE0881Dd29dF2E6';

// The Application Binary Interface (ABI) for the streak contract.
// This defines the functions we can call on the contract.
export const streakContractAbi = [
  // Read-only function to get a user's current streak
  "function getStreak(address user) public view returns (uint256)",
  
  // A function that writes to the blockchain to check in for the day
  "function checkIn() public"
];