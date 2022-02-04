package main

import (
	"aremykeyssafe/ssh"
	"syscall/js"
)

func getSSHKeyLength(this js.Value, args []js.Value) interface{} {
	key := args[0].String()
	callback := args[len(args)-1:][0]
	bitLen, err := ssh.Decode(key)
	if err != nil {
		callback.Invoke(err, js.Null())
	}
	callback.Invoke(js.Null(), bitLen)
	return nil
}

func main() {
	block := make(chan bool)
	js.Global().Set("getSSHKeyLength", js.FuncOf(getSSHKeyLength))
	<-block
}
