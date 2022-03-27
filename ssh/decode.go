package ssh

import (
	"crypto/ecdsa"
	"crypto/ed25519"
	"crypto/rsa"
	"encoding/binary"
	"errors"

	"golang.org/x/crypto/ssh"
)

func Decode(key string) (int, error) {
	parsedKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(key))
	if err != nil {
		return 0, "", err
	}
	fingerprint := ssh.FingerprintLegacyMD5(parsedKey)
	pubCrypto := parsedKey.(ssh.CryptoPublicKey).CryptoPublicKey()

	var bitLen int
	switch pub := pubCrypto.(type) {
	case *rsa.PublicKey:
		bitLen = pub.N.BitLen()
	case *ecdsa.PublicKey:
		bitLen = pub.Curve.Params().BitSize
	case ed25519.PublicKey:
		bitLen = binary.Size(pub) * 8
	default:
		return 0, "", errors.New("Unsuported")
	}
	return bitLen, fingerprint, nil
}
