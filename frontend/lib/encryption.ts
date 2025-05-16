// lib/encryption.ts

// Generate a secure random key (MUST be stored securely by the user,
// perhaps derived from signature or password, or managed via external service)
export async function generateAesKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256, // 128, 192, or 256 bits
      },
      true, // Can extract key material (needed for backup/sharing)
      ['encrypt', 'decrypt'] // Key usages
    );
  }
  
  // Export the key to a raw format (e.g., for storage or transport)
  export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
      return window.crypto.subtle.exportKey('raw', key);
  }
  
  // Import a key from raw format
  export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
      return window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
      );
  }
  
  
  // Encrypt ArrayBuffer data using AES-GCM
  export async function encryptData(key: CryptoKey, data: ArrayBuffer): Promise<{ iv: Uint8Array, encryptedData: ArrayBuffer }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for GCM is standard
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );
    return { iv, encryptedData };
  }
  
  // Decrypt ArrayBuffer data using AES-GCM
  export async function decryptData(key: CryptoKey, iv: Uint8Array, encryptedData: ArrayBuffer): Promise<ArrayBuffer> {
    return window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );
  }
  
  // Helper to encrypt a File object
  export async function encryptFile(key: CryptoKey, file: File): Promise<{ iv: Uint8Array, encryptedBlob: Blob, hash: string }> {
      const fileBuffer = await file.arrayBuffer();
      const { iv, encryptedData } = await encryptData(key, fileBuffer);
      const encryptedBlob = new Blob([encryptedData], { type: file.type }); // Maintain original mime type if needed
  
      // Calculate hash of the *encrypted* data for Solana integrity check
      const hashBuffer = await crypto.subtle.digest('SHA-256', encryptedData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
      return { iv, encryptedBlob, hash: hashHex };
  }
  
  // Helper to decrypt data back into a Blob (e.g., for download)
  export async function decryptBlob(key: CryptoKey, iv: Uint8Array, encryptedBlob: Blob, originalFileType: string): Promise<Blob> {
      const encryptedBuffer = await encryptedBlob.arrayBuffer();
      const decryptedBuffer = await decryptData(key, iv, encryptedBuffer);
      return new Blob([decryptedBuffer], { type: originalFileType });
  }
  
  
  // --- Key Re-encryption for Sharing (Conceptual using RSA-OAEP) ---
  // NOTE: Requires requester to have an RSA key pair. Simplified example.
  // In practice, use established libraries or protocols like Lit Protocol.
  
  // Assume requesterPublicKey is an imported CryptoKey (type 'public', usage 'encrypt')
  export async function reEncryptAesKeyForRequester(
      aesKeyToShare: CryptoKey, // The symmetric key for the file
      requesterPublicKey: CryptoKey
  ): Promise<ArrayBuffer> {
      const exportedAesKey = await exportKey(aesKeyToShare); // Export AES key to raw bytes
      return window.crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          requesterPublicKey,
          exportedAesKey
      );
  }
  
  // Assume recipientPrivateKey is an imported CryptoKey (type 'private', usage 'decrypt')
  export async function decryptSharedAesKey(
      encryptedAesKey: ArrayBuffer,
      recipientPrivateKey: CryptoKey
  ): Promise<CryptoKey> {
      const decryptedRawKey = await window.crypto.subtle.decrypt(
          { name: 'RSA-OAEP' },
          recipientPrivateKey,
          encryptedAesKey
      );
      return importKey(decryptedRawKey); // Import the raw bytes back into an AES-GCM key
  }