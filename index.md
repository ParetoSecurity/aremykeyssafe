# Are my SSH keys safe?
<label for="key">Enter your ssh-rsa key:</label> Example is from https://github.com/dz0ny.keys

<textarea disabled id="key" name="key"
          rows="5" cols="53">ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA8PmKyJdhN6/GaIWGJiK5a+bQMHVnpd23a26OLSor9bX15PP6JE2HE5DD2ekd4HkFESCGKW6CUkHbtBotq61NvbnqLfbzlRBOuoZQ9YYP1+NetR8ttWarDH8NvPEX8DAUA8uhoZ7Q/9VHhCo14KT8/YP53oAJfqIXxPsuixV8f/ORJcWyWpFobKRPQl7E592dmia9Il5SIcEKERttIvCl8YgFbpuSt18FP8ffe+1kNvD5AtOHsAZGaDlhouGZd83+lmAhxAi/0r2zWTCNtWJnH5er6Fqjtm5rgQEvIZTJb1BEK7r/pYxhgM9MBnIndawTNmoHP26fYztxa3LirH6Imw==</textarea>
<button disabled id="check" value="Check">Check</button>
<script src="go.js"></script>
<script src="main.js"></script>

## How this works

First, you must be aware that Github up and Gitlab publishes your public SSH keys, and that means all SSH keys you registered with them. This itself is not problematic and it's useful if you want to send someone an encrypted message or add SSH keys to the authorized list on some device. 

What this website does, it fetches those public keys, for Github that would be [https://github.com/dz0ny.keys](https://github.com/dz0ny.keys) and [https://gitlab.com/dz0ny.keys](https://gitlab.com/dz0ny.keys). Then a small [Golang application](https://github.com/teamniteo/aremykeyssafe/blob/wasm/main.go) is run as WebAssembly in your browser. This way even if you have an outdated key (we will talk about this in a bit) I won't know. 

Bash alternative for this kind of check would be `ssh-keygen -l -f ~/.ssh/<public_key>.pub` if you wan't to run this for the entire company [Pareto Security](https://paretosecurity.com/security-checks/ssh-keys-strength) has this as one of the checks.

## Outdated key?

How SSH keys can be outdated? Well in my case when I started programming 15 years ago, the default key size for an RSA key was 1024 bytes, and I had that key following me around for a long time. These days if you want to pass the CIS or SOC 2 compliance, you need strong keys. 

## What are recommended key sizes

Recommended key sizes are as follows:

- For the RSA algorithm at least 2048, recommended 4096
- The DSA algorithm should not be used
- For the ECDSA algorithm it should be 521
- For the ED25519 the key size should be 256 or larger

Sources [NIST](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-57pt3r1.pdf), [SSH Academy](https://www.ssh.com/academy/ssh/keygen#choosing-an-algorithm-and-key-size).

## What should I do if my keys are reported as outdated? 

The [Github docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) have a great guide that you can follow. TLDR: the ED25519 should be used whenever possible.

## Don't be E-Corp

Semi inspired by this scene, where no keys were used at all. 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/T4w6rloFpCI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Bonus: Send someone an encryped message

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
