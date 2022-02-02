## Welcome to GitHub Pages

You can use the [editor on GitHub](https://github.com/teamniteo/aremykeyssafe/edit/gh-pages/index.md) to maintain and preview the content for your website in Markdown files.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site, from the content in your Markdown files.

### POC

https://go.dev/play/p/eOVZItZkLFZ

```golang
package main

import (
	"crypto/rsa"
	"fmt"

	"golang.org/x/crypto/ssh"
)

func main() {
	key := "ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA8PmKyJdhN6/GaIWGJiK5a+bQMHVnpd23a26OLSor9bX15PP6JE2HE5DD2ekd4HkFESCGKW6CUkHbtBotq61NvbnqLfbzlRBOuoZQ9YYP1+NetR8ttWarDH8NvPEX8DAUA8uhoZ7Q/9VHhCo14KT8/YP53oAJfqIXxPsuixV8f/ORJcWyWpFobKRPQl7E592dmia9Il5SIcEKERttIvCl8YgFbpuSt18FP8ffe+1kNvD5AtOHsAZGaDlhouGZd83+lmAhxAi/0r2zWTCNtWJnH5er6Fqjtm5rgQEvIZTJb1BEK7r/pYxhgM9MBnIndawTNmoHP26fYztxa3LirH6Imw=="

	parsedKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(key))
	if err != nil {
		fmt.Errorf("ERROR! %s", err)
	}
	// To get back to an *rsa.PublicKey, we need to first upgrade to the
	// ssh.CryptoPublicKey interface
	parsedCryptoKey := parsedKey.(ssh.CryptoPublicKey)

	// Then, we can call CryptoPublicKey() to get the actual crypto.PublicKey
	pubCrypto := parsedCryptoKey.CryptoPublicKey()

	// Finally, we can convert back to an *rsa.PublicKey
	pub := pubCrypto.(*rsa.PublicKey)

	fmt.Printf("%d", pub.N.BitLen())
}

```

For more details see [Basic writing and formatting syntax](https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/teamniteo/aremykeyssafe/settings/pages). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
