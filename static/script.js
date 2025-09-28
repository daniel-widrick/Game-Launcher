class GameLauncherNavigation {
    constructor() {
        this.currentCategoryIndex = 0;
        this.currentGameIndex = -1;
        this.categories = [];
        this.isInGameList = false;
        
        this.init();
    }

    init() {
        // Get all category rows
        this.categories = Array.from(document.querySelectorAll('.game-index-row'));
        
        // Add initial-load class for staggered animations
        this.categories.forEach(cat => cat.classList.add('initial-load'));
        
        // Remove initial-load class after animations complete
        setTimeout(() => {
            this.categories.forEach(cat => cat.classList.remove('initial-load'));
        }, 1000);
        
        // Set up initial focus
        this.focusCategory(0);
        this.showCategory(this.categories[0]);
        
        // Add keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add mouse support (clicking should update navigation state)
        this.setupMouseSupport();
        
        console.log('Game Launcher Navigation initialized');
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.navigateUp();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateDown();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateLeft();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateRight();
                break;
            case 'Enter':
                e.preventDefault();
                this.selectCurrent();
                break;
            case 'Escape':
                e.preventDefault();
                this.exitGameList();
                break;
        }
    }

    navigateUp() {
        if (this.isInGameList) {
            const games = this.getCurrentGames();
            const gamesPerRow = this.calculateGamesPerRow(games);
            
            if (this.currentGameIndex >= gamesPerRow) {
                // Move up within game grid
                this.currentGameIndex -= gamesPerRow;
                this.focusGame(this.currentGameIndex);
            } else {
                // We're in the top row of games - try to move to previous category
                if (this.currentCategoryIndex > 0) {
                    // Move to previous category
                    this.currentCategoryIndex--;
                    this.enterGameList(); // Auto-open the new category
                    this.focusCategory(this.currentCategoryIndex); // Update category focus
                    // Focus the last game in the bottom row of the new category
                    const newGames = this.getCurrentGames();
                    if (newGames.length > 0) {
                        const gamesPerRowNew = this.calculateGamesPerRow(newGames);
                        const lastRowStartIndex = Math.floor((newGames.length - 1) / gamesPerRowNew) * gamesPerRowNew;
                        const targetCol = Math.min(this.currentGameIndex % gamesPerRow, (newGames.length - 1) % gamesPerRowNew);
                        this.currentGameIndex = Math.min(lastRowStartIndex + targetCol, newGames.length - 1);
                        this.focusGame(this.currentGameIndex);
                    }
                } else {
                    // At the first category - stay in current position, don't exit
                    console.log('Already at the first category - cannot move up further');
                }
            }
        } else {
            // Navigate between categories
            if (this.currentCategoryIndex > 0) {
                this.currentCategoryIndex--;
                this.focusCategory(this.currentCategoryIndex);
                this.showCategory(this.categories[this.currentCategoryIndex]);
            }
        }
    }

    navigateDown() {
        if (this.isInGameList) {
            const games = this.getCurrentGames();
            const gamesPerRow = this.calculateGamesPerRow(games);
            const maxIndex = games.length - 1;
            
            if (this.currentGameIndex + gamesPerRow <= maxIndex) {
                // Move down within game grid
                this.currentGameIndex += gamesPerRow;
                this.focusGame(this.currentGameIndex);
            } else {
                // We're in the bottom row of games - try to move to next category
                if (this.currentCategoryIndex < this.categories.length - 1) {
                    // Move to next category
                    this.currentCategoryIndex++;
                    this.enterGameList(); // Auto-open the new category
                    this.focusCategory(this.currentCategoryIndex); // Update category focus
                    // Focus the first game in the top row of the new category
                    const newGames = this.getCurrentGames();
                    if (newGames.length > 0) {
                        const gamesPerRowNew = this.calculateGamesPerRow(newGames);
                        const targetCol = Math.min(this.currentGameIndex % gamesPerRow, (newGames.length - 1) % gamesPerRowNew);
                        this.currentGameIndex = Math.min(targetCol, newGames.length - 1);
                        this.focusGame(this.currentGameIndex);
                    }
                } else {
                    // At the last category - stay in current position, don't exit
                    // Could add visual feedback here (like a bounce effect)
                    console.log('Already at the last category - cannot move down further');
                }
            }
        } else {
            // Navigate between categories
            this.hideCategory();
            if (this.currentCategoryIndex < this.categories.length - 1) {
                this.currentCategoryIndex++;
                this.focusCategory(this.currentCategoryIndex);
                this.showCategory(this.categories[this.currentCategoryIndex]);
            }
        }
    }

    navigateLeft() {
        if (this.isInGameList) {
            const gamesPerRow = this.calculateGamesPerRow(this.getCurrentGames());
            const currentRow = Math.floor(this.currentGameIndex / gamesPerRow);
            const currentCol = this.currentGameIndex % gamesPerRow;
            
            if (currentCol > 0) {
                // Move left within the row
                this.currentGameIndex--;
                this.focusGame(this.currentGameIndex);
            } else {
                // We're in the leftmost column - exit to category
                this.exitGameList();
            }
        }
        // If not in game list, left arrow does nothing (stay in categories)
    }

    navigateRight() {
        if (this.isInGameList) {
            const games = this.getCurrentGames();
            if (this.currentGameIndex < games.length - 1) {
                this.currentGameIndex++;
                this.focusGame(this.currentGameIndex);
            }
        } else {
            // Enter game list from category
            this.enterGameList();
        }
    }

    selectCurrent() {
        if (this.isInGameList) {
            const games = this.getCurrentGames();
            const currentGame = games[this.currentGameIndex];
            if (currentGame) {
                console.log('Selected game:', currentGame.textContent);
                // Add your game launch logic here
                this.triggerGameSelect(currentGame);
            }
        } else {
            // Enter game list
            this.enterGameList();
        }
    }

    showCategory(currentCategory) {
        this.categories.forEach(cat => cat.classList.remove('nav-active'));
        currentCategory.classList.add('nav-active');
    }
    enterGameList() {
        const currentCategory = this.categories[this.currentCategoryIndex];
        const gameList = currentCategory.querySelector('.game-list');
        
        if (gameList) {
            // Hide all other categories first
            this.showCategory(currentCategory);
            this.isInGameList = true;
            this.currentGameIndex = 0;
            this.focusGame(0);
        }
    }

    exitGameList() {
        if (this.isInGameList) {
            // Hide game lists and focus category
            //this.categories.forEach(cat => cat.classList.remove('nav-active'));
            
            this.isInGameList = false;
            this.currentGameIndex = -1;
            this.focusCategory(this.currentCategoryIndex);
        }
    }
    hideCategory() {
        this.categories.forEach(cat => cat.classList.remove('nav-active'));
    }

    focusCategory(index) {
        // Remove focus from all categories and games
        this.clearAllFocus();
        
        // Focus the category
        const category = this.categories[index];
        if (category) {
            const title = category.querySelector('.game-index-title');
            if (title) {
                title.classList.add('nav-focused');
                title.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    focusGame(index) {
        const games = this.getCurrentGames();
        
        // Remove focus from all games
        games.forEach(game => game.classList.remove('nav-focused'));
        
        // Focus the current game
        if (games[index]) {
            games[index].classList.add('nav-focused');
            games[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    getCurrentGames() {
        const currentCategory = this.categories[this.currentCategoryIndex];
        return Array.from(currentCategory.querySelectorAll('.game-item'));
    }

    calculateGamesPerRow(games) {
        if (games.length === 0) return 1;
        
        // Estimate based on game width and container width
        // This is a rough calculation - you might need to adjust
        const gameWidth = 180; // 160px + margins
        const containerWidth = window.innerWidth - 200; // Account for margins and category title
        return Math.floor(containerWidth / gameWidth) || 1;
    }

    clearAllFocus() {
        // Remove all navigation focus classes
        document.querySelectorAll('.nav-focused').forEach(el => {
            el.classList.remove('nav-focused');
        });
    }

    setupMouseSupport() {
        // Update navigation state when user clicks
        this.categories.forEach((category, catIndex) => {
            const title = category.querySelector('.game-index-title');
            if (title) {
                title.addEventListener('click', () => {
                    // Use proper navigation methods for consistent behavior
                    this.currentCategoryIndex = catIndex;
                    if (this.isInGameList) {
                        // If we're in game mode, exit first
                        this.exitGameList();
                    }
                    this.focusCategory(catIndex);
                    this.showCategory(category);
                });
            }

            const games = category.querySelectorAll('.game-item');
            games.forEach((game, gameIndex) => {
                game.addEventListener('click', () => {
                    // Use proper navigation methods for consistent behavior
                    this.currentCategoryIndex = catIndex;
                    this.currentGameIndex = gameIndex;
                    
                    // Enter game list properly (this handles hiding other categories)
                    this.enterGameList();
                    this.focusGame(gameIndex);
                });
            });
        });
    }

    triggerGameSelect(gameElement) {
        // Add a visual feedback for selection
        gameElement.classList.add('game-selected');
        setTimeout(() => {
            gameElement.classList.remove('game-selected');
        }, 300);
        
        // You can add your game launching logic here
        // For example: window.electronAPI.launchGame(gameElement.textContent);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameLauncherNavigation();
});