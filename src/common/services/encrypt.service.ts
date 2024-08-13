import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class EncryptService {
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get('ENCRYPT_SECRET_KEY');
  }

  public encrypt = (data: string): string => {
    return CryptoJS.AES.encrypt(data, this.secretKey).toString();
  };

  public decrypt = (cipherText: string): string => {
    const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
}
