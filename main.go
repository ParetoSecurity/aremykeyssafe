package main

import (
	"crypto/rsa"
	"syscall/js"

	"golang.org/x/crypto/ssh"
)

func getSSHKeyLength(this js.Value, args []js.Value) interface{} {
	key := args[0].String()
	callback := args[len(args)-1:][0]
	parsedKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(key))
	if err != nil {
		callback.Invoke(err, js.Null())
	}
	// To get back to an *rsa.PublicKey, we need to first upgrade to the
	// ssh.CryptoPublicKey interface
	parsedCryptoKey := parsedKey.(ssh.CryptoPublicKey)

	// Then, we can call CryptoPublicKey() to get the actual crypto.PublicKey
	pubCrypto := parsedCryptoKey.CryptoPublicKey()

	// Finally, we can convert back to an *rsa.PublicKey
	pub := pubCrypto.(*rsa.PublicKey)

	callback.Invoke(js.Null(), pub.N.BitLen())
	return nil
}

func main() {
	block := make(chan bool)
	js.Global().Set("getSSHKeyLength", js.FuncOf(getSSHKeyLength))
	<-block
}
