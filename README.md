# 🎮 Game Launcher

A modern, web-based game launcher with gamepad support and TV-friendly interface. Built with Go backend and JavaScript frontend, featuring console-style navigation and automatic game sorting.

- **📊 JSON Configuration**: Easy game management through simple JSON file

## 🚀 Quick Start

### Prerequisites

- Go 1.25.0 or later
- Web browser (Chrome, Firefox, Edge, Safari)
- Optional: Xbox-compatible gamepad

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/daniel-widrick/game-launcher.git
   cd game-launcher
   ```

2. **Configure your games**
   
   Edit `games.json` to add your games:
   ```json
   [
       {
           "BoxArt": "/path/to/boxart.jpg",
           "Platform": "Windows",
           "Title": "My Awesome Game",
           "exec": "C:\\Games\\MyGame\\game.exe"
       }
   ]
   ```

3. **Run the launcher**
   ```bash
   go run ./cmd/main.go
   ```

4. **Open in browser**
   
   Navigate to `http://localhost:3067`

## 🎮 Controls

### Keyboard
- **Arrow Keys**: Navigate between categories and games
- **Enter**: Select category or launch game
- **Escape**: Exit game list back to categories

### Gamepad (Xbox Controller)
- **D-Pad/Left Stick**: Navigate
- **A Button/X Button**: Select/Launch
- **B Button/Y Button**: Back/Cancel

### Mouse
- **Click**: Navigate and select
- **Double-Click**: Launch games

## 📝 Configuration

### Game Configuration (`games.json`)

**Example:**
```json
[
    {
        "BoxArt": "/images/minecraft.jpg",
        "Platform": "Windows",
        "Title": "Minecraft",
        "exec": "C:\\Games\\Minecraft\\MinecraftLauncher.exe"
    },
    {
        "BoxArt": "/images/steam-game.jpg",
        "Platform": "Steam",
        "Title": "Portal 2",
        "exec": "steam://run/620"
    }
]
```

### Server Configuration

Default server runs on `localhost:3067`.