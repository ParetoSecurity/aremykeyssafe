document.addEventListener("DOMContentLoaded", function () {

    function render(sourceUrl, source, keys) {
        const results = document.getElementById("results");
        const template = document.getElementById("result");
        for (const key of keys) {
            const li = template.content.cloneNode(true);
            li.querySelector("#status").textContent = key.status;
            li.querySelector("#source").textContent = source;
            li.querySelector("#source").setAttribute("href", sourceUrl);
            li.querySelector("#key").setAttribute("title", key.key);
            li.querySelector("#key").textContent = key.fingeprint;
            li.querySelector("#size").textContent = key.size;
            results.appendChild(li);
        }
    }

    function renderGPG(sourceUrl, source, key) {
        const results = document.getElementById("results");
        const template = document.getElementById("result");
        const li = template.content.cloneNode(true);
        li.querySelector("#status").textContent = key.status;
        li.querySelector("#source").textContent = source;
        li.querySelector("#source").setAttribute("href", sourceUrl);
        li.querySelector("#key").setAttribute("title", key.key);
        li.querySelector("#key").textContent = key.keyType;
        li.querySelector("#size").textContent = key.size;
        results.appendChild(li);
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
            fn(msg, (err, size, fingeprint) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ "size": Number(size), "fingeprint": fingeprint });
            });
        });
    }

    function goPromiseGPG(fn, msg) {
        return new Promise((resolve, reject) => {
            fn(msg, (err, expired, keyType, bitLen) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ "size": Number(bitLen), "expired": expired, "keyType": keyType });
            });
        });
    }

    async function parseGPG(key) {
        if (key.includes("This user hasn't uploaded any GPG keys") || key.includes("Note:")) {
            return { "key": "", "keyType": "", "status": "🍪", "expired": false }
        }
        let decoded = await goPromiseGPG(getGPGExpired, key);
        var status = "⚙️"
        if (decoded.keyType == "ed25519") {
            status = decoded.size >= 256 ? "✅" : "❌"
        }
        if (decoded.keyType == "ecdsa") {
            status = decoded.size == 521 ? "✅" : "❌";
        }
        if (decoded.keyType == "rsa") {
            status = decoded.size >= 2048 ? decoded.size >= 4096 ? "✅" : "🍄" : "❌"
        }
        return { "key": key, "status": decoded.expired ? "⏰" : status, "keyType": decoded.keyType, "size": decoded.size }
    }

    async function parseKeys(keys) {
        return await Promise.all(keys.map(async (key) => {
            if (key.startsWith("ssh-ed25519")) {
                let decoded = await goPromise(getSSHKeyLength, key);
                return { "key": key, "size": decoded.size, "fingeprint": decoded.fingeprint, "status": decoded.size >= 256 ? "✅" : "❌" }
            }
            if (key.startsWith("dsa")) {
                return { "key": key, "size": 0, "fingerprint": key, "status": "❌" }
            }
            if (key.startsWith("ecdsa")) {
                let decoded = await goPromise(getSSHKeyLength, key);
                let status = decoded.size == 521 ? "✅" : "❌";
                if (key.includes("-nistp") && decoded.size != 521) {
                    // https://stribika.github.io/2015/01/04/secure-secure-shell.html#:~:text=ECDH%20curve%20choice%3A%20This%20eliminates%209%2D11%20because%20NIST%20curves%20suck.%20They%20leak%20secrets%20through%20timing%20side%20channels%20and%20off%2Dcurve%20inputs.%20Also%2C%20NIST%20is%20considered%20harmful%20and%20cannot%20be%20trusted.
                    status = "🍄";
                }
                return { "key": key, "size": decoded.size, "fingeprint": decoded.fingeprint, "status": status }
            }
            if (key.startsWith("ssh-rsa")) {
                let decoded = await goPromise(getSSHKeyLength, key);
                return { "key": key, "size": decoded.size, "fingeprint": decoded.fingeprint, "status": decoded.size >= 2048 ? decoded.size >= 4096 ? "✅" : "🍄" : "❌" }
            }
            return { "key": key, "size": 0, "fingerprint": key, "status": "❌" }
        }))
    }
    async function onEdit() {
        const checkButton = document.getElementById("check");
        const handle = document.getElementById("handle");
        if (handle.value.length > 1) {
            checkButton.disabled = false;
        } else {
            checkButton.disabled = true;
        }
    }

    async function runChecks() {
        const checkButton = document.getElementById("check");
        const handle = document.getElementById("handle");
        const results = document.getElementById("results");
        const searching = document.getElementById("searching");
        handle.disabled = true;
        checkButton.disabled = true;
        results.innerHTML = '';
        results.style.display = 'none';
        searching.style.display = 'block';
        const ghFetch = fetch(`/cors/github/${handle.value}`)
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

        const ghGPGFetch = fetch(`/cors/githubgpg/${handle.value}`)
            .then(async (res) => {
                const text = await res.text()
                // broken response
                if (text.indexOf("html") !== -1) {
                    return "";
                }
                return text
            })
            .then(async (key) => await parseGPG(key))
            .catch(err => {
                console.error(err)
            })
            .then(key => key.key != "" ? renderGPG(`https://github.com/${handle.value}.gpg`, "GitHub public GPG", key) : noResults("GitHub GPG"))


        const giFetch = fetch(`/cors/gitlab/${handle.value}`)
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

        Promise.all([ghFetch, giFetch]).then(() => {
            handle.disabled = false;
            checkButton.disabled = false;
            const url = new URL(window.location);
            url.searchParams.set('handle', handle.value);
            window.history.pushState({}, '', url);
            setTimeout(() => {
                results.style.display = 'block';
                searching.style.display = 'none';
            }, 1000);
        });


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
