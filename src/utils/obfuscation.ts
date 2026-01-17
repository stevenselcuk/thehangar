import LZString from 'lz-string';

/**
 * Encryption key derived from game constant
 * In production, this could be more sophisticated, but for obfuscation purposes this is sufficient
 */
const OBFUSCATION_KEY = 'HANGAR_770_M_9M_MRO';

/**
 * Convert string to hex string
 */
function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hex += charCode.toString(16).padStart(4, '0');
  }
  return hex;
}

/**
 * Convert hex string back to string
 */
function hexToString(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 4) {
    const charCode = parseInt(hex.substring(i, i + 4), 16);
    str += String.fromCharCode(charCode);
  }
  return str;
}

/**
 * Simple XOR cipher with rotating key
 * Not cryptographically secure, but prevents casual editing
 */
function xorCipher(input: string, key: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

/**
 * Obfuscates a string using compression, XOR encryption, and Base64 encoding
 * This prevents casual editing in browser dev tools
 * 
 * Process: Compress → XOR Encrypt → Hex Encode → Base64 Encode
 * 
 * @param data - The plain string to obfuscate
 * @returns Obfuscated string safe for export
 * @throws Error if obfuscation fails
 */
export function obfuscate(data: string): string {
  try {
    // Step 1: Compress the data using LZ-String
    const compressed = LZString.compressToUTF16(data);
    
    if (!compressed) {
      throw new Error('Compression failed');
    }

    // Step 2: Apply XOR cipher
    const encrypted = xorCipher(compressed, OBFUSCATION_KEY);

    // Step 3: Convert to hex to avoid invalid characters for btoa
    const hexEncoded = stringToHex(encrypted);

    // Step 4: Base64 encode for safe transport
    const encoded = btoa(hexEncoded);

    return encoded;
  } catch (error) {
    throw new Error(`Obfuscation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deobfuscates a string that was obfuscated with the obfuscate() function
 * 
 * Process: Base64 Decode → Hex Decode → XOR Decrypt → Decompress
 * 
 * @param encoded - The obfuscated string to decode
 * @returns Original plain string
 * @throws Error if deobfuscation fails (invalid format, corrupted data, etc.)
 */
export function deobfuscate(encoded: string): string {
  try {
    // Step 1: Base64 decode
    const hexEncoded = atob(encoded);

    // Step 2: Validate hex string format
    // Must be multiple of 4 (since each char is 4 hex digits)
    if (hexEncoded.length % 4 !== 0) {
      throw new Error('Invalid hex encoding - corrupted data');
    }

    // Step 3: Convert hex back to string
    const encrypted = hexToString(hexEncoded);

    // Step 4: Apply XOR cipher (XOR is symmetric, same operation decrypts)
    const compressed = xorCipher(encrypted, OBFUSCATION_KEY);

    // Step 5: Decompress
    const decompressed = LZString.decompressFromUTF16(compressed);

    if (decompressed === null) {
      throw new Error('Decompression failed - data may be corrupted');
    }

    return decompressed;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Decompression failed')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('Invalid hex')) {
      throw error;
    }
    throw new Error(`Deobfuscation failed: ${error instanceof Error ? error.message : 'Invalid format'}`);
  }
}

/**
 * Validates if a string appears to be a valid obfuscated export
 * Does basic checks without full deobfuscation
 * 
 * @param encoded - String to validate
 * @returns true if string appears to be valid obfuscated data
 */
export function isValidObfuscatedString(encoded: string): boolean {
  if (!encoded || typeof encoded !== 'string') {
    return false;
  }

  // Check if it's valid Base64
  try {
    atob(encoded);
    return true;
  } catch {
    return false;
  }
}
