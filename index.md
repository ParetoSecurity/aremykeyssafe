## Type in your GitHub or GitLab handle and click Check

<script defer data-domain="aremykeyssafe.com" src="https://plausible.io/js/plausible.js"></script>
<script src="/wasm/go.js?{{ site.time | date: '%s%N' }}"></script>

<p class="search-api">
  <input placeholder="GitHub or GitLab username" id="handle" disabled name="handle" type="text" />
  <button disabled id="check" value="Check">Check</button>
</p>
<ul id="results"></ul>
<div id="searching" style="display:none;" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
<h4>Legend</h4>
<ul id="legend" style="font-size: 80%">
<li>✅ - Key is safe</li>
<li>🍄 - Fine, but not recommended</li>
<li>❌ - Key needs to be replaced</li>
</ul>

## How does this work?

First, you must know that GitHub and GitLab publish your public SSH keys, which means all SSH keys you registered with them. This in itself is not an issue, and it's useful if you want to send someone an encrypted message or add SSH keys to the authorized list on some device. 

This website fetches those public keys and analyzes them. On GitHub that could be [https://github.com/dz0ny.keys](https://github.com/dz0ny.keys) and on GitLab [https://gitlab.com/dz0ny.keys](https://gitlab.com/dz0ny.keys). Then a small [Golang application](https://github.com/paretosecurity/aremykeyssafe/blob/wasm/main.go) is run as WebAssembly in your browser. This way, even if you have an outdated key (we will talk about this below), I won't know.

Bash alternative for this kind of check would be `ssh-keygen -l -f ~/.ssh/<public_key>.pub`.

## Outdated key?

How can SSH keys be outdated? When I started programming 15 years ago, the default key size for an RSA key was 1024 bytes, and I had that key following me around for a long time. These days if you want to pass the CIS or SOC 2 compliance, you need stronger keys. 

## What are recommended key sizes

Recommended key sizes are as follows:

- For the RSA algorithm at least 2048, recommended 4096
- The DSA algorithm should not be used
- For the ECDSA algorithm, it should be 521
- For the ED25519, the key size should be 256 or larger

Sources [NIST](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-57pt3r1.pdf), [SSH Academy](https://www.ssh.com/academy/ssh/keygen#choosing-an-algorithm-and-key-size).

### Since when is GitHub publishing my keys?!?
This has been public knowledge for about a decade: [changelog.com/posts/github-exposes-public-ssh-keys-for-its-users](https://changelog.com/posts/github-exposes-public-ssh-keys-for-its-users)

Can it be used to cause harm? Yes, potentially. That is why you need to make sure your keys are using strong encryption by not having old keys laying around.

The [GitHub docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) have a great guide that you can follow. TLDR: the ED25519 should be used whenever possible.


<script src="/assets/js/main.js?{{ site.time | date: '%s%N' }}"></script>

<template id="result">
<li><span id="status"></span> <a href="#" id="source"></a> key <small id="key" data-hash=""></small> with size <strong id="size"></strong></li>
</template>

<template id="no-result">
<li>No supported keys were found on <span id="source"></span>.</li>
</template>

<a href="https://github.com/ParetoSecurity/aremykeyssafe"><img loading="lazy" width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_orange_ff7600.png?resize=149%2C149" class="attachment-full size-full jetpack-lazy-image" alt="Fork me on GitHub" data-recalc-dims="1" data-lazy-src="https://github.blog/wp-content/uploads/2008/12/forkme_right_orange_ff7600.png?resize=149%2C149&is-pending-load=1" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"><noscript><img loading="lazy" width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_orange_ff7600.png?resize=149%2C149" class="attachment-full size-full" alt="Fork me on GitHub" data-recalc-dims="1"></noscript></a>
