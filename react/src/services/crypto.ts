import CryptoJS from 'crypto-js';

class CryptoService {
  private readonly SECRET_KEY: string;

  constructor() {
    this.SECRET_KEY = this.getSecretKey();
  }

  private getSecretKey(): string {
    const userAgent = navigator.userAgent || '';
    const language = navigator.language || '';
    const platform = navigator.platform || '';
    
    const combined = `${userAgent}-${language}-${platform}-farmacia-dpsp-2024`;
    return CryptoJS.SHA256(combined).toString().substring(0, 32);
  }

  encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      return data;
    }
  }

  decrypt(encryptedData: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        console.error('Falha ao descriptografar dados');
        return null;
      }
      
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      return null;
    }
  }

  encryptObject<T>(obj: T): string {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      console.error('Erro ao criptografar objeto:', error);
      return JSON.stringify(obj);
    }
  }

  decryptObject<T>(encryptedData: string): T | null {
    try {
      const decrypted = this.decrypt(encryptedData);
      if (!decrypted) {
        return null;
      }
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Erro ao descriptografar objeto:', error);
      return null;
    }
  }
}

export const cryptoService = new CryptoService();

