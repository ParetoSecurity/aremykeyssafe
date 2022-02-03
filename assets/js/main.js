document.addEventListener("DOMContentLoaded", function () {

    function render(source, keys) {
        const results = document.getElementById("results");
        const template = document.getElementById("result");
        for (const key of keys) {
            const li = template.content.cloneNode(true);
            li.querySelector("#status").textContent = key.status;
            li.querySelector("#source").textContent = source;
            li.querySelector("#key").textContent = key.key;
            li.querySelector("#size").textContent = key.size;
            results.appendChild(li);
        }
    }

    function goPromise(fn, msg) {
        return new Promise((resolve, reject) => {
            fn(msg, (err, message) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(message);
            });
        });
    }

    async function parseKeys(keys) {
        return await Promise.all(keys.map(async (key) => {
            if (key.startsWith("ssh-ed25519")) {
                return { "key": key, "size": 256, "status": "✅" }
            }
            if (key.startsWith("dsa")) {
                return { "key": key, "size": 0, "status": "❌" }
            }
            if (key.startsWith("ecdsa")) {
                return { "key": key, "size": 521, "status": "✅" }
            }
            if (key.startsWith("ssh-rsa")) {
                let size = Number(await goPromise(getSSHKeyLength, key));
                return { "key": key, "size": size, "status": size >= 2048 ? "✅" : "❌" }
            }
            return { "key": key, "size": 0, "status": "❌" }
        }))
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
            document.getElementById("results").innerHTML = '';

            fetch(`/cors/github/${handle.value}`)
                .then(res => {
                    const text = res.text()
                    // broken response
                    if (text.indexOf("html") !== -1) {
                        return "";
                    }
                    return text
                })
                .then(text => text.split("\n"))
                .then(keys => keys.filter(key => key.length > 8))
                .then(async (keys) => await parseKeys(keys))
                .catch(err => {
                    console.error(err)
                })
                .then(keys => render("GitHub", keys))


            fetch(`/cors/gitlab/${handle.value}`)
                .then(res => {
                    const text = res.text()
                    // broken response
                    if (text.indexOf("html") !== -1) {
                        return "";
                    }
                    return text
                })
                .then(text => text.split("\n"))
                .then(keys => keys.filter(key => key.length > 8))
                .then(async (keys) => await parseKeys(keys))
                .then(keys => render("GitLab", keys))
                .catch(err => {
                    console.error(err)
                })
            handle.disabled = false;
            checkButton.disabled = false;
        });
    }
    init();
});
