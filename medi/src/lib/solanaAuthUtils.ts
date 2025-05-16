// /medi/src/lib/solanaAuthUtils.ts
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Verifies that the provided Base58-encoded signature is valid for the given
 * wallet address (public key) and message.
 */
export function verifySignature(
  publicKeyString: string, // Base58 encoded public key
  signatureString: string, // Base58 encoded signature
  messageString: string    // The original message string that was signed
): boolean {
  try {
    const publicKey = bs58.decode(publicKeyString);
    const signature = bs58.decode(signatureString);
    const message = new TextEncoder().encode(messageString);

    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}