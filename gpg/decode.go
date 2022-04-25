package gpg

import (
	"crypto/dsa"
	"crypto/ecdsa"
	"crypto/ed25519"
	"crypto/rsa"
	"encoding/binary"
	"errors"

	"github.com/ProtonMail/gopenpgp/v2/crypto"
)

func Decode(key string) (bool, int, string, error) {
	gpgKey, err := crypto.NewKeyFromArmored(key)
	if err != nil {
		return false, 0, "", err
	}

	var bitLen int
	keyType := "unknown"
	switch pub := gpgKey.GetEntity().PrimaryKey.PublicKey.(type) {
	case *rsa.PublicKey:
		keyType = "rsa"
		bitLen = pub.N.BitLen()
	case *ecdsa.PublicKey:
		bitLen = pub.Curve.Params().BitSize
		keyType = "ecdsa"
	case *dsa.PublicKey:
		bitLen = pub.P.BitLen()
		keyType = "dsa"
	case ed25519.PublicKey:
		bitLen = binary.Size(pub) * 8
		keyType = "ed25519"
	default:
		return false, 0, "", errors.New("Unsuported")
	}
	return gpgKey.IsExpired(), bitLen, keyType, nil
}
