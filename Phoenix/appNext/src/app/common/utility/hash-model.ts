import { FormGroup } from '../ngx-strongly-typed-forms/model';

export class HashModel {
  private storage: { [key: string]: { hashCode: string; formGroup: FormGroup<any> } } = {};

  constructor() {
    this.storage = {};
  }

  public getFormGroup<T>(toUseHashCode: boolean, modelName: string, model: T, index: number, creationFn: () => any): FormGroup<T> {
    if (toUseHashCode) {
      // const hashCode: number = HashModel.getHashCode(JSON.stringify(model));
      const hashCode: string = this.md5(JSON.stringify(model));
      const storageInstanceName = modelName + '[' + index.toString() + ']';
      // debugger;
      if (!this.storage[storageInstanceName] || this.storage[storageInstanceName].hashCode !== hashCode) {
        // debugger;
        // console.log('HashModel.' + storageInstanceName + ':' + (this.storage[storageInstanceName] ? this.storage[storageInstanceName].hashCode : 'null') + '=>' + hashCode);
        this.storage[storageInstanceName] = { hashCode: hashCode, formGroup: creationFn() };
      }
      return this.storage[storageInstanceName].formGroup;
    } else {
      return creationFn();
    }
  }

  // public static getHashCode(value: string): number {
  //   // https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
  //   let hash = 0;
  //   if (value.length === 0) {
  //     return hash;
  //   }
  //   for (let i = 0; i < value.length; i++) {
  //     const char = value.charCodeAt(i);
  //     // tslint:disable-next-line:no-bitwise
  //     hash = (hash << 5) - hash + char;
  //     // tslint:disable-next-line:no-bitwise
  //     hash = hash & hash; // Convert to 32bit integer
  //   }
  //   return hash;
  // }

  private md5 = modelStringified => {
    // https://github.com/killmenot/webtoolkit.md5
    const RotateLeft = (lValue, iShiftBits) => {
      // tslint:disable-next-line:no-bitwise
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    const AddUnsigned = (lX, lY) => {
      let lX4, lY4, lX8, lY8, lResult;
      // tslint:disable-next-line:no-bitwise
      lX8 = lX & 0x80000000;
      // tslint:disable-next-line:no-bitwise
      lY8 = lY & 0x80000000;
      // tslint:disable-next-line:no-bitwise
      lX4 = lX & 0x40000000;
      // tslint:disable-next-line:no-bitwise
      lY4 = lY & 0x40000000;
      // tslint:disable-next-line:no-bitwise
      lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      // tslint:disable-next-line:no-bitwise
      if (lX4 & lY4) {
        // tslint:disable-next-line:no-bitwise
        return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      }
      // tslint:disable-next-line:no-bitwise
      if (lX4 | lY4) {
        // tslint:disable-next-line:no-bitwise
        if (lResult & 0x40000000) {
          // tslint:disable-next-line:no-bitwise
          return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        } else {
          // tslint:disable-next-line:no-bitwise
          return lResult ^ 0x40000000 ^ lX8 ^ lY8;
        }
      } else {
        // tslint:disable-next-line:no-bitwise
        return lResult ^ lX8 ^ lY8;
      }
    };

    // tslint:disable-next-line:no-shadowed-variable
    const F = (x, y, z) => {
      // tslint:disable-next-line:no-bitwise
      return (x & y) | (~x & z);
    };

    // tslint:disable-next-line:no-shadowed-variable
    const G = (x, y, z) => {
      // tslint:disable-next-line:no-bitwise
      return (x & z) | (y & ~z);
    };

    // tslint:disable-next-line:no-shadowed-variable
    const H = (x, y, z) => {
      // tslint:disable-next-line:no-bitwise
      return x ^ y ^ z;
    };

    // tslint:disable-next-line:no-shadowed-variable
    const I = (x, y, z) => {
      // tslint:disable-next-line:no-bitwise
      return y ^ (x | ~z);
    };

    // tslint:disable-next-line:no-shadowed-variable
    const FF = (a, b, c, d, x, s, ac) => {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    // tslint:disable-next-line:no-shadowed-variable
    const GG = (a, b, c, d, x, s, ac) => {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    // tslint:disable-next-line:no-shadowed-variable
    const HH = (a, b, c, d, x, s, ac) => {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    // tslint:disable-next-line:no-shadowed-variable
    const II = (a, b, c, d, x, s, ac) => {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    const ConvertToWordArray = (stringObj: string) => {
      let lWordCount;
      const lMessageLength = stringObj.length;
      const lNumberOfWords_temp1 = lMessageLength + 8;
      const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      const lWordArray = Array(lNumberOfWords - 1);
      let lBytePosition = 0;
      let lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        // tslint:disable-next-line:no-bitwise
        lWordArray[lWordCount] = lWordArray[lWordCount] | (stringObj.charCodeAt(lByteCount) << lBytePosition);
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      // tslint:disable-next-line:no-bitwise
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      // tslint:disable-next-line:no-bitwise
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      // tslint:disable-next-line:no-bitwise
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    };

    const WordToHex = lValue => {
      let WordToHexValue = '',
        WordToHexValue_temp = '',
        lByte,
        lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        // tslint:disable-next-line:no-bitwise
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = '0' + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    };

    const Utf8Encode = stringObj => {
      stringObj = stringObj.replace(/\r\n/g, '\n');
      let utftext = '';

      for (let n = 0; n < stringObj.length; n++) {
        const cc = stringObj.charCodeAt(n);

        if (cc < 128) {
          utftext += String.fromCharCode(cc);
        } else if (cc > 127 && cc < 2048) {
          // tslint:disable-next-line:no-bitwise
          utftext += String.fromCharCode((cc >> 6) | 192);
          // tslint:disable-next-line:no-bitwise
          utftext += String.fromCharCode((cc & 63) | 128);
        } else {
          // tslint:disable-next-line:no-bitwise
          utftext += String.fromCharCode((cc >> 12) | 224);
          // tslint:disable-next-line:no-bitwise
          utftext += String.fromCharCode(((cc >> 6) & 63) | 128);
          // tslint:disable-next-line:no-bitwise
          utftext += String.fromCharCode((cc & 63) | 128);
        }
      }

      return utftext;
    };

    let x = Array();
    let k, AA, BB, CC, DD, a, b, c, d;
    const S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22;
    const S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20;
    const S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23;
    const S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;

    modelStringified = Utf8Encode(modelStringified);

    x = ConvertToWordArray(modelStringified);

    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = AddUnsigned(a, AA);
      b = AddUnsigned(b, BB);
      c = AddUnsigned(c, CC);
      d = AddUnsigned(d, DD);
    }

    const temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
  };
}
