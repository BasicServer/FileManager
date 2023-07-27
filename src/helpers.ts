import {BindableObject} from "@frugal-ui/base";
import {enc} from "crypto-js";
import {decrypt, encrypt} from "crypto-js/aes";
import {ClearPasswordPreferences} from "./Data/defaults";

// Encryption
export interface EncryptionFnCfg {
	fileContents: BindableObject<string>;
	password: BindableObject<string>;
	clearPasswordPreference: BindableObject<string>;
	isSaved: BindableObject<boolean>;
}

export function encryptFile(configuration: EncryptionFnCfg) {
	const { fileContents, password, clearPasswordPreference, isSaved } = configuration;

	try {
		const res = encrypt(fileContents.value, password.value).toString();
		fileContents.value = res;
		isSaved.value = false;

		if (
			clearPasswordPreference.value ==
				ClearPasswordPreferences.Immediate ||
			clearPasswordPreference.value == ClearPasswordPreferences.Encryption
		)
			password.value = '';
	} catch (error) {
		alert(`Encryption failed: ${error}`);
	}
}

export function decryptFile(configuration: EncryptionFnCfg) {
	const { fileContents, password, clearPasswordPreference, isSaved } = configuration;

	try {
		const decrypted = decrypt(fileContents.value, password.value);
		if (decrypted.sigBytes < 0) throw 'wrong password';
		const res = decrypted.toString(enc.Utf8);
		fileContents.value = res;
		isSaved.value = false;

		if (clearPasswordPreference.value == ClearPasswordPreferences.Immediate)
			password.value = '';
	} catch {
		alert('Decryption failed. Check your password');
	}
}
