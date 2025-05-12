// pages/upload.tsx
import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSolana } from '../hooks/useSolana'; // Your hook to interact with Solana program/API
import { generateAesKey, encryptFile, exportKey } from '../lib/encryption';
import api from '../lib/api'; // Your backend API helper

const UploadPage: React.FC = () => {
  const { user, token } = useAuth();
  const { program, provider } = useSolana(); // Get Anchor program instance and provider
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file || !user || !token || !provider?.wallet || !program) {
        setError('Missing file, user authentication, or Solana connection.');
        return;
    }

    setIsUploading(true);
    setError(null);
    setStatus('1. Generating encryption key...');

    try {
        // 1. Generate AES key (Key Management is CRITICAL - needs secure storage/derivation)
        const aesKey = await generateAesKey();
        // !! DANGER: How do you store/recover this key? This is the hardest part.
        // For MVP demo, maybe just store raw exported key in localStorage (INSECURE!)
        const rawKey = await exportKey(aesKey);
        localStorage.setItem(`key_${file.name}`, Buffer.from(rawKey).toString('hex')); // Highly insecure example!
        setStatus('2. Encrypting file...');

        // 2. Encrypt the file client-side & get hash
        const { iv, encryptedBlob, hash: encryptedDataHash } = await encryptFile(aesKey, file);
        setStatus('3. Uploading encrypted file to storage...');

        // 3. Upload encrypted blob to backend -> decentralized storage (e.g., IPFS via backend endpoint)
        const formData = new FormData();
        formData.append('file', encryptedBlob, file.name); // Send encrypted blob
        // Add IV and other metadata if backend needs it for storage structure
        // formData.append('iv', Buffer.from(iv).toString('hex'));

        // *** Replace with your actual backend upload endpoint ***
        const uploadResponse = await api.uploadFileToDecentralizedStorage(formData, token);
        const cid = uploadResponse.cid; // Get CID from backend response

        if (!cid) {
            throw new Error('Failed to upload file to decentralized storage.');
        }
        setStatus('4. Registering record on Solana...');

        // 4. Call backend endpoint to register the record on Solana
        // Backend constructs and sends the transaction using its keypair as payer,
        // but requires user's public key as the 'owner'.
        // Alternatively, construct TX frontend and have backend sign as payer (Gas Station)
        // Or simplest for now: backend pays, uses user pubkey from token.
        const registrationResponse = await api.registerRecordOnChain({
            cid: cid,
            encryptedDataHash: encryptedDataHash,
            fileName: file.name,
            // ownerPublicKey: user.walletAddress // Backend gets this from JWT
        }, token);

        if (!registrationResponse.success) {
             throw new Error(registrationResponse.error || 'Failed to register record on Solana.');
        }

        setStatus(`Success! Record registered with CID: ${cid}`);
        setFile(null); // Clear file input

    } catch (err: any) {
        console.error("Upload failed:", err);
        setError(`Upload failed: ${err.message}`);
        setStatus('Upload failed.');
    } finally {
        setIsUploading(false);
    }
}, [file, user, token, provider, program]); // Dependencies


  return (
    <div>
      <h2>Upload New Medical Record</h2>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      <button onClick={handleUpload} disabled={!file || isUploading}>
        {isUploading ? 'Uploading...' : 'Encrypt and Upload'}
      </button>
      {status && <p>Status: {status}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p style={{ color: 'orange', marginTop: '1rem' }}>
        <strong>Warning:</strong> Encryption key management is simplified for this demo.
        In a real application, securely storing and recovering the AES key is critical.
      </p>
    </div>
  );
};

export default UploadPage;