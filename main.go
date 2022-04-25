package main

import (
	"aremykeyssafe/ssh"
	"syscall/js"

	"github.com/ProtonMail/gopenpgp/v2/crypto"
)

func getSSHKeyLength(this js.Value, args []js.Value) interface{} {
	key := args[0].String()
	callback := args[len(args)-1:][0]
	bitLen, fingerprint, err := ssh.Decode(key)
	if err != nil {
		callback.Invoke(err, js.Null(), js.Null())
	}
	callback.Invoke(js.Null(), bitLen, fingerprint)
	return nil
}

func getGPGExpired(this js.Value, args []js.Value) interface{} {
	pubKey := args[0].String()
	callback := args[len(args)-1:][0]
	gpgKey, err := crypto.NewKeyFromArmored(pubKey)
	if err != nil {
		callback.Invoke(err, js.Null(), js.Null())
	}
	callback.Invoke(js.Null(), gpgKey.IsExpired())
	return nil
}

func main() {
	block := make(chan bool)
	js.Global().Set("getSSHKeyLength", js.FuncOf(getSSHKeyLength))
	js.Global().Set("getGPGExpired", js.FuncOf(getGPGExpired))
	<-block
}
