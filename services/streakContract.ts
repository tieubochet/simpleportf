// The address of the daily streak smart contract on the Base chain.
export const streakContractAddress = '0x36c0C88847FBbBE143fa3442980C485A2b9837ad';

// The Application Binary Interface (ABI) for the streak contract.
// This defines the functions we can call on the contract.
export const streakContractAbi = [
  // Read-only functions to get data from the contract
  "function getStreak(address user) view returns (uint256)",
  "function canClaim(address user) view returns (bool)",
  "function lastClaimedTimestamp(address user) view returns (uint256)",
  
  // A function that writes to the blockchain to claim the daily streak
  "function claim()"
];