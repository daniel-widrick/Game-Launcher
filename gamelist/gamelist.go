package Gamelist

import (
	"encoding/json"
	"log"
	"os"
	"strings"
)

type CategoryList []Category

type Category struct {
	Icon string //The display text for the category
	Name string //The value that matches in the tag in the GameList
}

type GameList []Game

type Game struct {
	BoxArt   string //Url or path to box art image
	Platform string //platform disignation
	Category string //string that matches Category.Name
	Title    string //Title text to display over box art
	Exec     string //command to launch title
	LaunchID int    //ID used to lookup launch cmd from ui
}

type GameBrowser struct {
	Categories CategoryList
	Games      GameList
}

// Attempt to load json object into GamesList
func (gb *GameBrowser) Load(path string) error {
	//load json file into GameList object
	gb.Games = GameList{}

	// Read the JSON file
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	// Unmarshal JSON into GameList
	err = json.Unmarshal(data, &gb.Games)
	if err != nil {
		return err
	}

	return nil
}

// Generate category list from loaded game list
func (gb *GameBrowser) GenerateCategories() {
	gb.Categories = CategoryList{}
	lastCat := ""
	launchID := 0
	for i, v := range gb.Games {
		sortTitle := gb.SanitizeTitle(v.Title)
		firstChar := strings.ToUpper(string(sortTitle[0]))
		if lastCat != firstChar || lastCat == "" {
			cat := Category{
				Icon: firstChar,
				Name: firstChar,
			}
			gb.Categories = append(gb.Categories, cat)
			lastCat = firstChar
		}
		gb.Games[i].Category = lastCat
		gb.Games[i].LaunchID = launchID
		launchID++ // Increment the LaunchID for each game
	}
}

// Create and return a new GameBrowser object populated
// from the default load location
func Init() *GameBrowser {
	gb := GameBrowser{}
	err := gb.Load("games.json")
	if err != nil {
		//TODO: Handle gracefully?
		log.Fatalf("Error loading game list: %v", err)
	}
	gb.SortGameList()
	gb.GenerateCategories()
	log.Printf("Loaded %d games", len(gb.Games))
	log.Printf("Loaded %d categories", len(gb.Categories))
	log.Printf("Game Browser: %v", gb)

	return &gb
}
