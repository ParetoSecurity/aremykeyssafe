package ssh

import "testing"

func Test_decode(t *testing.T) {

	tests := []struct {
		key     string
		want    int
		wantErr bool
	}{
		{"ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA8PmKyJdhN6/GaIWGJiK5a+bQMHVnpd23a26OLSor9bX15PP6JE2HE5DD2ekd4HkFESCGKW6CUkHbtBotq61NvbnqLfbzlRBOuoZQ9YYP1+NetR8ttWarDH8NvPEX8DAUA8uhoZ7Q/9VHhCo14KT8/YP53oAJfqIXxPsuixV8f/ORJcWyWpFobKRPQl7E592dmia9Il5SIcEKERttIvCl8YgFbpuSt18FP8ffe+1kNvD5AtOHsAZGaDlhouGZd83+lmAhxAi/0r2zWTCNtWJnH5er6Fqjtm5rgQEvIZTJb1BEK7r/pYxhgM9MBnIndawTNmoHP26fYztxa3LirH6Imw==", 2048, false},
		{"ecdsa-sha2-nistp521 AAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlzdHA1MjEAAACFBAFwEn0wgDAf4PivvOLeOSZK+Ym0y7qVpUd2WELYQawYiGveCuotU+mpB/V6BDcdhMEOJeEH9qtCiVO6BLVYSIQXTgFlWZ8kkJ/c9o4lXsOeF2eSRhtCZztmkQsSTb7/7eacy5bI/6TBTx+61JXklO66j52eH2Rc9Be3hbwsghv6NYU+XQ==", 521, false},
		{"ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAII9el2S9wSrotgpeROY4GZdPlpn3m2SjLk8uV/ToUvxU", 256, false},
	}
	for _, tt := range tests {
		t.Run(tt.key, func(t *testing.T) {
			got, _ , err := Decode(tt.key)
			if (err != nil) != tt.wantErr {
				t.Errorf("decode() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("decode() = %v, want %v", got, tt.want)
			}
		})
	}
}
