export interface SignedMessage {
    message: string;
    publicKey: string;
    signature: string;
    chainKey?: string;
  }