// The address of the daily streak smart contract on the Monad chain.
export const streakContractAddress = '0x76C6CEcA5be89F6b7213c57f485d23724371c322';

// The Application Binary Interface (ABI) for the streak contract.
// This defines the functions we can call on the contract.
export const streakContractAbi = [
  // Read-only function to get a user's current streak
  "function getStreak(address user) public view returns (uint256)",
  
  // A function that writes to the blockchain to check in for the day
  "function checkIn() public"
];
