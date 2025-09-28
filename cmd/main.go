package main

import (
	"log"

	Gamelist "github.com/daniel-widrick/game-launcher/gamelist"
	Web "github.com/daniel-widrick/game-launcher/web"
)

func main() {
	log.Printf("Starting Game Launcher")
	gb := Gamelist.Init()
	ws := Web.Init(gb)
	log.Printf("Web server running: %v", ws)
}
