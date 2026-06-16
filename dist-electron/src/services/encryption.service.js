"use strict";
// src/services/encryption.service.ts
// AES-256-GCM encryption for stored credentials
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const ENCODING = 'hex';
// Derive a stable key from a machine-specific seed
function deriveKey() {
    // Use a fixed app secret combined with Node's process details
    // In production Electron app, this could be extended with OS keychain
    const secret = process.env.WORKVAULT_SECRET ?? 'workvault-aes-key-v1-secure-local-storage';
    return crypto_1.default.scryptSync(secret, 'workvault-salt-2024', KEY_LENGTH);
}
let _key = null;
function getKey() {
    if (!_key) {
        _key = deriveKey();
    }
    return _key;
}
exports.EncryptionService = {
    /**
     * Encrypt a plaintext string.
     * Returns a hex string: iv:authTag:ciphertext
     */
    encrypt(plaintext) {
        try {
            const key = getKey();
            const iv = crypto_1.default.randomBytes(IV_LENGTH);
            const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
            const encrypted = Buffer.concat([
                cipher.update(plaintext, 'utf8'),
                cipher.final(),
            ]);
            const authTag = cipher.getAuthTag();
            // Format: iv(hex):authTag(hex):ciphertext(hex)
            return [
                iv.toString(ENCODING),
                authTag.toString(ENCODING),
                encrypted.toString(ENCODING),
            ].join(':');
        }
        catch (error) {
            console.error('[EncryptionService] Encryption failed:', error);
            throw new Error('Failed to encrypt value');
        }
    },
    /**
     * Decrypt an encrypted string produced by encrypt().
     */
    decrypt(encryptedData) {
        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                // Might be unencrypted legacy data — return as-is
                return encryptedData;
            }
            const [ivHex, authTagHex, ciphertextHex] = parts;
            const key = getKey();
            const iv = Buffer.from(ivHex, ENCODING);
            const authTag = Buffer.from(authTagHex, ENCODING);
            const ciphertext = Buffer.from(ciphertextHex, ENCODING);
            const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([
                decipher.update(ciphertext),
                decipher.final(),
            ]);
            return decrypted.toString('utf8');
        }
        catch (error) {
            console.error('[EncryptionService] Decryption failed:', error);
            // Return original if decryption fails (may be unencrypted)
            return encryptedData;
        }
    },
    /**
     * Check if a string appears to be encrypted by this service.
     */
    isEncrypted(value) {
        const parts = value.split(':');
        return (parts.length === 3 &&
            parts[0].length === IV_LENGTH * 2 &&
            parts[1].length === TAG_LENGTH * 2);
    },
    /**
     * Generate a secure random password.
     */
    generatePassword(options) {
        const { length, uppercase, lowercase, numbers, symbols } = options;
        let charset = '';
        if (uppercase)
            charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lowercase)
            charset += 'abcdefghijklmnopqrstuvwxyz';
        if (numbers)
            charset += '0123456789';
        if (symbols)
            charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (!charset)
            charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        const randomBytes = crypto_1.default.randomBytes(length);
        for (let i = 0; i < length; i++) {
            password += charset[randomBytes[i] % charset.length];
        }
        return password;
    },
    /**
     * Generate a UUID v4.
     */
    generateUUID() {
        return crypto_1.default.randomUUID();
    },
};
//# sourceMappingURL=encryption.service.js.map