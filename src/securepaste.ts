import * as base64 from "byte-base64";
import * as pako from "pako";
import * as nacl from "tweetnacl";
import {decodeUTF8, encodeUTF8} from "tweetnacl-util";

export function compress(input_str: string){
    return base64.bytesToBase64(pako.deflate(input_str));
}

export function decompress(input_str: string){
    return pako.inflate(base64.base64ToBytes(input_str), {to: 'string'})
}

export function compressAndEncrypt(inputStr: string, passwordStr: string){
    return base64.bytesToBase64(encrypt(pako.deflate(inputStr), passwordStr));
}

export function decryptAndDecompress(inputStr: string, passwordStr: string){
    return pako.inflate(decrypt(base64.base64ToBytes(inputStr), passwordStr), {to: 'string'})
}

function encrypt(messageBytes: Uint8Array, passwordStr: string){
    const passwordBytes = decodeUTF8(passwordStr);
    const hashedPasswordBytes = nacl.hash(passwordBytes).slice(0,nacl.secretbox.keyLength);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const box = nacl.secretbox(messageBytes, nonce, hashedPasswordBytes);
    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);
    return fullMessage;
}

function decrypt(messageBytesWithNonce: Uint8Array, passwordStr: string){
    const passwordBytes = decodeUTF8(passwordStr);
    const hashedPasswordBytes = nacl.hash(passwordBytes).slice(0,nacl.secretbox.keyLength);
    const nonce = messageBytesWithNonce.slice(0, nacl.secretbox.nonceLength);
    const message = messageBytesWithNonce.slice(
        nacl.secretbox.nonceLength,
        messageBytesWithNonce.length
    );
    const decrypted = nacl.secretbox.open(message, nonce, hashedPasswordBytes);
    if (!decrypted) {
        throw new Error("Could not decrypt message");
    }
    return decrypted;
}

