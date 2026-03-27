ENCRYPTION 1 — ONLINE VERSION
-------------------------------------------------------------------
A lightweight, browser-based encryption tool that runs entirely on your device.
Originally inspired by Encryption 1 (1998–2001), a desktop encryption tool developed in Visual C++, this modern version brings the same philosophy of privacy and user control into a portable, zero-install web format.

CORE PRINCIPLES
	Local-first: All encryption and decryption happen in your browser
	No servers: No data is transmitted, stored, or logged
	No accounts: No login, no tracking, no personal data collection
	Portable: Can be used from a USB drive on multiple machines
	Transparent: Fully open source and auditable

HOW IT WORKS
	Encryption algorithm: AES-GCM (256-bit)
	Key derivation: PBKDF2 with SHA-256
	Random salt and IV generated for each encryption

ENCRYPTION FLOW
	User enters text and password
	A cryptographic key is derived from the password
	Text is encrypted locally in the browser
	A file is generated containing:
		ciphertext
		salt
		IV (nonce)
		metadata
	File is automatically downloaded to the user’s device

DECRYPTION FLOW
	User selects encrypted file
	Enters the password
	Key is re-derived
	File is decrypted locally


FEATURES
	Encrypt text into a downloadable file
	Decrypt files locally
	Password strength meter
	Works offline (single HTML file)
	No installation required
	Cross-browser compatible (modern browsers)


⚠️⚠️ IMPORTANT NOTES ⚠️⚠️

Passwords CANNOT be recovered: If you forget your password, the encrypted data is permanently inaccessible
Public computers are not secure: Try to avoid decrypting sensitive information on shared or untrusted machines
Password strength matters: Use long passphrases whenever possible


TRANSPARENCY AND TRUST
	This project is fully open source.
	You are encouraged to:
		Review the code
		Verify how encryption is implemented
		Use it offline if preferred
	There are no hidden processes, tracking mechanisms, or server interactions.

BACKGROUND
Encryption 1 was originally developed between 1998 and 2001 as a desktop application using algorithms such as:
Blowfish
Skipjack
TEA (Tiny Encryption Algorithm)
This online version reflects a modern evolution of that work, using current cryptographic standards and browser capabilities to give users direct control over their own data and privacy.

🌐 Philosophy
This tool reflects a simple idea: Your privacy is YOURS.

👤 Author
Seán L. Young
YLCLearning Systems
sean@speakupmethod.com
https://www.speakupmethod.com
