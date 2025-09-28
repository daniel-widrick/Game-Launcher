package Web

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os/exec"
	"strconv"
	"strings"
	"syscall"

	Gamelist "github.com/daniel-widrick/game-launcher/gamelist"
)

type WebServer struct {
	GB       *Gamelist.GameBrowser
	mux      *http.ServeMux
	template *template.Template
}

func Init(GB *Gamelist.GameBrowser) *WebServer {
	addr := "localhost:3067"
	ws := WebServer{}
	ws.GB = GB

	// Load the HTML template
	tmpl, err := template.ParseFiles("static/index.html")
	if err != nil {
		panic("Failed to load template: " + err.Error())
	}
	ws.template = tmpl

	ws.mux = http.NewServeMux()

	// Set up routes
	ws.mux.HandleFunc("/", ws.handleIndex)
	ws.mux.HandleFunc("/launch/", ws.handleLaunch)
	ws.mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	log.Printf("Starting web server on %s", addr)
	log.Fatal(http.ListenAndServe(addr, ws.mux))
	return &ws // This line will never be reached due to log.Fatal above
}

// Handler for the main index page
func (ws *WebServer) handleIndex(w http.ResponseWriter, r *http.Request) {
	// Sort the games before rendering
	ws.GB.SortGameList()

	// Render the template with GameBrowser data
	err := ws.template.Execute(w, ws.GB)
	if err != nil {
		http.Error(w, "Error rendering template: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// Handler for launching games by LaunchID
func (ws *WebServer) handleLaunch(w http.ResponseWriter, r *http.Request) {
	log.Printf("Launch request: %v", r.URL.Path)
	// Extract LaunchID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/launch/")
	launchID, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid launch ID", http.StatusBadRequest)
		return
	}

	// Find the game with the matching LaunchID
	var game *Gamelist.Game
	for i, g := range ws.GB.Games {
		if g.LaunchID == launchID {
			game = &ws.GB.Games[i]
			break
		}
	}

	if game == nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	// Launch the game process
	err = ws.launchGameProcess(game.Exec, game.Title)
	if err != nil {
		log.Printf("Failed to launch game '%s': %v", game.Title, err)
		http.Error(w, "Failed to launch game: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully launched game: %s (%s)", game.Title, game.Exec)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status": "success", "message": "Game launched successfully", "title": "` + game.Title + `"}`))
}

// launchGameProcess starts a detached process that will continue running even if this Go application closes
func (ws *WebServer) launchGameProcess(command, title string) error {
	// Split command into executable and arguments
	parts := strings.Fields(command)
	if len(parts) == 0 {
		return fmt.Errorf("empty command")
	}

	executable := parts[0]
	var args []string
	if len(parts) > 1 {
		args = parts[1:]
	}

	// Create the command
	cmd := exec.Command(executable, args...)

	// On Windows, we need to set specific attributes to detach the process
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP,
		HideWindow:    true, // Hide the console window if it's a console application
	}

	// Set the process to run independently
	cmd.Stdin = nil
	cmd.Stdout = nil
	cmd.Stderr = nil

	// Start the process
	err := cmd.Start()
	if err != nil {
		return fmt.Errorf("failed to start process: %w", err)
	}

	// Don't wait for the process to complete - let it run independently
	// We could optionally store the PID if we wanted to track launched processes
	log.Printf("Started detached process for '%s' with PID: %d", title, cmd.Process.Pid)

	return nil
}
