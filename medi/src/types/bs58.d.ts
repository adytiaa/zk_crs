declare module 'bs58' {
  /**
   * Encodes a Uint8Array or Buffer to a base58 string
   */
  export function encode(buffer: Uint8Array | Buffer): string;
  
  /**
   * Decodes a base58 string to a Uint8Array or Buffer
   */
  export function decode(str: string): Uint8Array;
  
  export default {
    encode,
    decode
  };
} 