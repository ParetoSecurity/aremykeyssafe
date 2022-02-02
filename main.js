function getSSHKeyLengthPromise(msg) {
    return new Promise((resolve, reject) => {
        getSSHKeyLength(msg, (err, message) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(message);
        });
    });
}

async function init() {
    const go = new Go();
    let result = await WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
    go.run(result.instance);
    document.getElementById("check").disabled = false;
    document.getElementById("key").disabled = false;
    document.getElementById("check").addEventListener("click", async () => {
        const key = document.getElementById("key").value;
        const length = await getSSHKeyLengthPromise(key);
        if (Number(length) >= 4096){
            document.getElementById("key").value = `Key size is ${length}, you key is safe`;
        }else{
            document.getElementById("key").value = `Key size is ${length}, your key is not safe`;
        }
        document.getElementById("check").disabled = true;
        document.getElementById("key").disabled = true;
    });
}
init();