package service

import (
	"math/rand"
)

const slugLength = 7

func SlugGenerator(_ string) string {
	const alphaBase62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	slug := make([]byte, slugLength)
	for i := range slug {
		slug[i] = alphaBase62[rand.Intn(len(alphaBase62))]
	}
	return string(slug)
}
