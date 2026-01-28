package service

import (
	"fmt"
	"math/rand"
	"path"
)

func SlugGenerator(url string) string {

	alpha_base62 := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	myPath := path.Base(url)

	slug := make([]byte, 8)

	for i := 0; i < 8; i++ {
		slug[i] = alpha_base62[rand.Intn(62)]
	}

	fmt.Println(myPath)
	return string(slug)
}
