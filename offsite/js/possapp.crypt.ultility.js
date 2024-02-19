
/******************************************
 * Encryption/Decryption Process
 ******************************************/
/**
 * Encryption AES/3DES
 * @param settings - crypt settings
 * @param data - data to encrypt
 * @returns encryptedData - encrypted data
 */
var encryptData = function encryptData(settings, data){
	var mode = CONSTANTS.EFT.CRYPT_MODE.CBC.value;//default
	var padding = CONSTANTS.EFT.CRYPT_PAD.PKCS7_PADDING.value;//default
	var iv = "";
	var encryptedData = null;

	//sets mode for encryption
	if(settings.mode == CONSTANTS.EFT.CRYPT_MODE.CBC.name){
		mode = CONSTANTS.EFT.CRYPT_MODE.CBC.value;
	} else if(settings.mode == CONSTANTS.EFT.CRYPT_MODE.ECB.name){
		mode = CONSTANTS.EFT.CRYPT_MODE.ECB.value;
	}

	//sets padding for encryption
	if(settings.padding == CONSTANTS.EFT.CRYPT_PAD.ZERO_PADDING.name){
		padding = CONSTANTS.EFT.CRYPT_PAD.ZERO_PADDING.value;
	} else if (settings.padding = CONSTANTS.EFT.CRYPT_PAD.NO_PADDING.name){
		padding = CONSTANTS.EFT.CRYPT_PAD.NO_PADDING.value;
	}

	if(settings.encryptionType.toUpperCase() == CONSTANTS.EFT.CRYPT_TYPE.AES){
		encryptedData = CryptoJS.AES.encrypt(
			data,
			CryptoJS.enc.Utf8.parse(settings.passPhrase),
			{
				iv: CryptoJS.enc.Utf8.parse(iv),
				mode: mode,
				padding: padding
			}
		);
	} else if (settings.encryptionType.toUpperCase() == CONSTANTS.EFT.CRYPT_TYPE.TRIPLEDES){
		encryptedData = CryptoJS.TripleDES.encrypt(
			data,
			CryptoJS.enc.Utf8.parse(settings.passPhrase),
			{
				iv: CryptoJS.enc.Utf8.parse(iv),
				mode: mode,
				padding: padding
			}
		);
	}

	return encryptedData.ciphertext.toString(CryptoJS.enc.Hex);
};

/**
 * Decrypt data encryted to AES/3DES.
 * @param data - data to encrypt
 * @returns plainText - encrypted data
 */
var decryptData = function decryptData(settings, encryptedData){
	var mode = CONSTANTS.EFT.CRYPT_MODE.CBC.value;//default
	var padding = CONSTANTS.EFT.CRYPT_PAD.PKCS7_PADDING.value;//default
	var iv = "";
	var plainText = "";

	//sets mode for decryption
	if(settings.mode == CONSTANTS.EFT.CRYPT_MODE.CBC.name){
		mode = CONSTANTS.EFT.CRYPT_MODE.CBC.value;
	} else if(settings.mode == CONSTANTS.EFT.CRYPT_MODE.ECB.name){
		mode = CONSTANTS.EFT.CRYPT_MODE.ECB.value;
	}

	//sets padding for encryption
	if(settings.padding == CONSTANTS.EFT.CRYPT_PAD.ZERO_PADDING.name){
		padding = CONSTANTS.EFT.CRYPT_PAD.ZERO_PADDING.value;
	} else if (settings.padding = CONSTANTS.EFT.CRYPT_PAD.NO_PADDING.name){
		padding = CONSTANTS.EFT.CRYPT_PAD.NO_PADDING.value;
	}

	if(settings.encryptionType.toUpperCase() == CONSTANTS.EFT.CRYPT_TYPE.AES){
		plainText = CryptoJS.AES.decrypt(
			{
				ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
			},
			CryptoJS.enc.Utf8.parse(settings.passPhrase),
			{
				iv: CryptoJS.enc.Hex.parse(iv),
				mode: mode,
				padding: padding
			}
		);
	} else if (settings.encryptionType.toUpperCase() == CONSTANTS.EFT.CRYPT_TYPE.TRIPLEDES){
		plainText = CryptoJS.TripleDES.decrypt(
			{
				ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
			},
			CryptoJS.enc.Utf8.parse(settings.passPhrase),
			{
				iv: CryptoJS.enc.Hex.parse(iv),
				mode: mode,
				padding: padding
			}
		);
	}

	return plainText.toString();
};