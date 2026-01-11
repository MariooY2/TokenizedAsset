export interface ContractAddresses {
  usdc: `0x${string}`;
  identityRegistry: `0x${string}`;
  artSecurityToken: `0x${string}`;
  artPriceOracle: `0x${string}`;
  primarySale: `0x${string}`;
  exitDistribution: `0x${string}`;
  governance: `0x${string}`;
}

export interface Identity {
  isVerified: boolean;
  approvedAt: bigint;
  expiryDate: bigint;
  country: string;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: bigint;
  artworkName: string;
  artist: string;
  creationYear: bigint;
  initialValuation: bigint;
  transfersEnabled: boolean;
}

export interface ProposalInfo {
  id: bigint;
  proposalType: number;
  description: string;
  proposer: `0x${string}`;
  createdAt: bigint;
  votingEnds: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
  status: number;
}

export enum ProposalType {
  EXIT_SALE = 0,
  EMERGENCY_PAUSE = 1,
  ENABLE_TRANSFERS = 2
}

export enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Executed = 2,
  Rejected = 3,
  Cancelled = 4
}
