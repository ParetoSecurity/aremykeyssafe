
function render(keys) {
    const results = document.getElementById("results");
    for (const key of keys) {
        let text = `Key ${key.key} with size ${key.size} from Github is ${key.size >= 2048 ? "✅" : "❌"}`;
        var li = document.createElement("li");
        results.appendChild(document.createTextNode(text));
    }
}

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
    const checkButton = document.getElementById("check");
    const handle = document.getElementById("handle");
    const go = new Go();
    let result = await WebAssembly.instantiateStreaming(fetch("/wasm/main.wasm?" + Math.round(new Date().getTime() / 1000)), go.importObject)
    go.run(result.instance);

    handle.disabled = false;
    handle.addEventListener("blur", async () => {
        if (handle.value.length > 1) {
            checkButton.disabled = false;
        } else {
            checkButton.disabled = true;
        }
    });
    checkButton.addEventListener("click", async () => {
        handle.disabled = true;
        checkButton.disabled = true;

        fetch(`/cors/github/${handle.value}`)
            .then(res => res.text())
            .then(text => text.split("\n"))
            .then(keys => keys.filter(key => key.startsWith("ssh-rsa")))
            .then(async (keys) => await Promise.all(keys.map(async (key) => {
                return { "key": key, "size": Number(await getSSHKeyLengthPromise(key)) }
            })))
            .then(render)
            .catch(err => {
                console.error(err)
            })

        handle.disabled = false;
        checkButton.disabled = false;
    });
}
init();
