module.exports = async function (awsmanager) {
    awsmanager.prototype.encryptFile = async function (fileContent, publicKeyArmored) {
        try {
            const publicKey = await this.pgp.readKey({armoredKey: publicKeyArmored});
            const encrypted = await this.pgp.encrypt({
                message: await this.pgp.createMessage({text: fileContent}),
                encryptionKeys: publicKey,
            });
            return encrypted;
        } catch(err) {
            this.log.error("PGP Encryption Error: ", err);
            return false;
        }
    }
    awsmanager.prototype.decryptFile = async function (fileContent,privateKeyArmored,passphrase) {
        try {
            const privateKey = await this.pgp.readPrivateKey({ armoredKey: privateKeyArmored });
            const decryptionKey = await this.pgp.decryptKey({
                privateKey,
                passphrase
            });
            const output = await this.pgp.decrypt({
                message:await this.pgp.readMessage({ armoredMessage:fileContent}),
               // verificationKeys: publicKey, // optional
                decryptionKeys: decryptionKey
            });
            return output.data;
        } catch(err) {
            this.log.error("PGP Decryption Error: ", err);
        }
        return null;
    }
}