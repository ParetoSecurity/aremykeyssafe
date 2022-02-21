document.addEventListener("DOMContentLoaded", function () {

    function render(sourceUrl, source, keys) {
        const results = document.getElementById("results");
        const template = document.getElementById("result");
        for (const key of keys) {
            const li = template.content.cloneNode(true);
            li.querySelector("#status").textContent = key.status;
            li.querySelector("#source").textContent = source;
            li.querySelector("#source").setAttribute("href", sourceUrl);
            li.querySelector("#key").textContent = key.key;
            li.querySelector("#size").textContent = key.size;
            results.appendChild(li);
        }
    }

    function noResults(source) {
        const results = document.getElementById("results");
        const template = document.getElementById("no-result");
        const li = template.content.cloneNode(true);
        li.querySelector("#source").textContent = source;
        results.appendChild(li);
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
                let size = Number(await goPromise(getSSHKeyLength, key));
                return { "key": key, "size": size, "status": size >= 256 ? "✅" : "❌" }
            }
            if (key.startsWith("dsa")) {
                return { "key": key, "size": 0, "status": "❌" }
            }
            if (key.startsWith("ecdsa")) {
                let size = Number(await goPromise(getSSHKeyLength, key));
                return { "key": key, "size": size, "status": size == 521 ? "✅" : "❌" }
            }
            if (key.startsWith("ssh-rsa")) {
                let size = Number(await goPromise(getSSHKeyLength, key));
                return { "key": key, "size": size, "status": size >= 2048 ? size >= 4096 ? "✅" : "🍄" : "❌" }
            }
            return { "key": key, "size": 0, "status": "❌" }
        }))
    }
    async function onEdit() {
        if (handle.value.length > 1) {
            checkButton.disabled = false;
        } else {
            checkButton.disabled = true;
        }
    }

    async function runChecks() {
        handle.disabled = true;
        checkButton.disabled = true;
        document.getElementById("results").innerHTML = 'Getting information...';

        fetch(`/cors/github/${handle.value}`)
            .then(async (res) => {
                const text = await res.text()
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
            .then(keys => keys.length ? render(`https://github.com/${handle.value}.keys`, "GitHub", keys) : noResults("GitHub"))


        fetch(`/cors/gitlab/${handle.value}`)
            .then(async (res) => {
                const text = await res.text()
                // broken response
                if (text.indexOf("html") !== -1) {
                    return "";
                }
                return text
            })
            .then(text => text.split("\n"))
            .then(keys => keys.filter(key => key.length > 8))
            .then(async (keys) => await parseKeys(keys))
            .then(keys => keys.length ? render(`https://gitlab.com/${handle.value}.keys`, "GitLab", keys) : noResults("GitLab"))
            .catch(err => {
                console.error(err)
            })
        handle.disabled = false;
        checkButton.disabled = false;

        const url = new URL(window.location);
        url.searchParams.set('handle', handle.value);
        window.history.pushState({}, '', url);
    }

    async function init() {
        const checkButton = document.getElementById("check");
        const handle = document.getElementById("handle");
        const go = new Go();
        let result = await WebAssembly.instantiateStreaming(fetch("/wasm/main.wasm?v2"), go.importObject)
        go.run(result.instance);

        const user = new URLSearchParams(document.location.search).get("handle")
        if (user) {
            handle.value = user;
            checkButton.disabled = false;
        }
        handle.disabled = false;
        handle.addEventListener("blur", onEdit);
        handle.addEventListener("keydown", onEdit);
        checkButton.addEventListener("click", runChecks);
    }
    init();
});
