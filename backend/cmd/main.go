package main

import (
	"fmt"
)

//main.go

func main() {

	slug := SlugGenerator("https://whatTheHelly.com/free-r-kelly")

	fmt.Println(slug)
}
