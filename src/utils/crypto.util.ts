// RSA-OAEP Encryption for React Native using node-forge
// Install: npm install node-forge
// Note: node-forge works in React Native with proper polyfills

let forge: any = null;

// Try to import node-forge (will be null if not installed)
try {
  // @ts-ignore - node-forge might not be installed
  forge = require('node-forge');
} catch (error) {
  console.warn("node-forge not installed. Please run: npm install node-forge");
}

export const encryptAesKey = (data: string, publicKeyPem: string): string => {
  if (!publicKeyPem || publicKeyPem === "dummy-public-key" || !publicKeyPem) {
    throw new Error("Public key not available");
  }

  // If node-forge is not available, throw an error
  if (!forge) {
    throw new Error("node-forge library not installed. Please run: npm install node-forge");
  }

  try {
    // Convert the public key PEM into a public key object
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Encrypt the data using RSA-OAEP (matching the website's implementation)
    const encryptedData = publicKey.encrypt(data, "RSA-OAEP");

    // Encode the encrypted data as Base64
    return forge.util.encode64(encryptedData);
  } catch (error: any) {
    console.error("RSA-OAEP Encryption error:", error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

function fromBase64Url(base64url: string): string {
  base64url = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = 4 - (base64url.length % 4);
  if (padding < 4) {
    base64url += "=".repeat(padding);
  }
  return base64url;
}

export function convertJwkToPem(jwk: { n: string; e: string }): string {
  // Convert JWK to PEM format using node-forge (matching website implementation)
  
  if (!forge) {
    console.error("node-forge not available for JWK conversion");
    return "";
  }

  try {
    // Convert base64url to base64
    const n = fromBase64Url(jwk.n);
    const e = fromBase64Url(jwk.e);

    // Decode base64 to get raw bytes (matching website implementation)
    const modulusBytes = forge.util.decode64(n);
    const exponentBytes = forge.util.decode64(e);

    // Convert bytes to BigInteger (matching website implementation)
    const modulus = new forge.jsbn.BigInteger(
      forge.util.bytesToHex(modulusBytes),
      16
    );
    const exponent = new forge.jsbn.BigInteger(
      forge.util.bytesToHex(exponentBytes),
      16
    );

    // Create RSA public key from modulus and exponent
    const publicKey = forge.pki.setRsaPublicKey(modulus, exponent);
    
    // Convert to PEM format
    const pem = forge.pki.publicKeyToPem(publicKey);

    return pem;
  } catch (error) {
    console.error("Error converting JWK to PEM:", error);
    return ""; // Return empty string if conversion fails
  }
}
