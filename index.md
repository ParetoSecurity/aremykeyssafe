# Are my SSH keys safe?
<label for="key">Enter your GitHub or GitLab username:</label>
<input id="key" disabled name="key" type="text" />
<div style="display: none">Results</div>
<button disabled id="check" value="Check">Check</button>
<ul id="results"></ul>
<script src="/wasm/go.js"></script>
<script src="/assets/js/main.js"></script>

## How this works

First, you must know that GitHub and GitLab publish your public SSH keys, which means all SSH keys you registered with them. This in itself is not an issue, and it's useful if you want to send someone an encrypted message or add SSH keys to the authorized list on some device. 

This website fetches those public keys and analyzes them. On GitHub that could be [https://github.com/dz0ny.keys](https://github.com/dz0ny.keys) and on GitLab [https://gitlab.com/dz0ny.keys](https://gitlab.com/dz0ny.keys). Then a small [Golang application](https://github.com/teamniteo/aremykeyssafe/blob/wasm/main.go) is run as WebAssembly in your browser. This way, even if you have an outdated key (we will talk about this below), I won't know. 

Bash alternative for this kind of check would be `ssh-keygen -l -f ~/.ssh/<public_key>.pub` if you want to run this for the entire company [Pareto Security](https://paretosecurity.com/security-checks/ssh-keys-strength) has this as one of the checks.

## Outdated key?

How can SSH keys be outdated? When I started programming 15 years ago, the default key size for an RSA key was 1024 bytes, and I had that key following me around for a long time. These days if you want to pass the CIS or SOC 2 compliance, you need stronger keys. 

## What are recommended key sizes

Recommended key sizes are as follows:

- For the RSA algorithm at least 2048, recommended 4096
- The DSA algorithm should not be used
- For the ECDSA algorithm, it should be 521
- For the ED25519, the key size should be 256 or larger

Sources [NIST](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-57pt3r1.pdf), [SSH Academy](https://www.ssh.com/academy/ssh/keygen#choosing-an-algorithm-and-key-size).

## What should I do if my keys are reported as outdated? 

The [Github docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) have a great guide that you can follow. TLDR: the ED25519 should be used whenever possible.

## Don't be E-Corp

Semi-inspired by this scene where no keys were used. 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/T4w6rloFpCI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Bonus: Send someone an encrypted message

Build the message:
```bash
ssh-keygen -f my_friends_public_key -e -m PKCS8 > zupo.pkcs
$ echo "this is my secret message" | openssl rsautl -encrypt -pubin -inkey zupo.pkcs | base64

QiuCXo+KcW5JL3Lfg/ADlRELdc/nhifHp10A+5BxpNC58yGs9JPEy1DUjJK6kI3bvTOwbUwMMk+LJOMh+Xy+96kn59kYoU+AU4zfl5LGVQ2qJZJuBTwZySt4HTXWZhaK/VWXE65QU6k/beS6PW3/2nq0W5sM0tINy/hinto7sNqsHZTC38xlSckge48E5UoPnCujKJV84YmykZPoXm/nGB5TvQ1kORSrsha3Q0YRgAcMFrARDrBhnVa1Yt8sXOQGMrYx8giWUeiD0CYyl97Cbdle2CdUsnC5cJCkV9f7fMdFOJseaOX+RIa06kiMiQAbtrT7xUHBZ7E6b8J56lvYeg==
```

And then my friend would decrypt with this private key:

```shell
echo "QiuCXo+KcW5JL3Lfg/ADlRELdc/nhifHp10A+5BxpNC58yGs9JPEy1DUjJK6kI3bvTOwbUwMMk+LJOMh+Xy+96kn59kYoU+AU4zfl5LGVQ2qJZJuBTwZySt4HTXWZhaK/VWXE65QU6k/beS6PW3/2nq0W5sM0tINy/hinto7sNqsHZTC38xlSckge48E5UoPnCujKJV84YmykZPoXm/nGB5TvQ1kORSrsha3Q0YRgAcMFrARDrBhnVa1Yt8sXOQGMrYx8giWUeiD0CYyl97Cbdle2CdUsnC5cJCkV9f7fMdFOJseaOX+RIa06kiMiQAbtrT7xUHBZ7E6b8J56lvYeg==" | base64 --decode | openssl rsautl -decrypt -inkey ~/.ssh/id_rsa
```
