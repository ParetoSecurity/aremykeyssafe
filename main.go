package main

import (
	"aremykeyssafe/ssh"
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/imroc/req/v3"
)

func main() {

	team := os.Args[1]
	file, err := os.Open(team)

	if err != nil {
		log.Fatalf("failed opening file: %s", err)
	}

	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)
	var users []string

	for scanner.Scan() {
		users = append(users, scanner.Text())
	}

	file.Close()

	for _, user := range users {
		url := fmt.Sprintf("https://github.com/%s.keys", user)
		res, err := req.Get(url)
		if err != nil {
			panic(err)
		}
		for _, key := range strings.Split(res.String(), "\n") {
			if len(key) > 8 {
				size, _ := ssh.Decode(key)
				fmt.Printf("%s with %s size: %d\n", user, strings.Split(key, " ")[0], size)
			}
		}
	}
}
