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
        
        // Add gamepad support
        this.setupGamepadSupport();
        
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
                    this.focusCategory(this.currentCategoryIndex, false); // Update category focus (no scroll)
                    // Focus the last game in the bottom row of the new category
                    const newGames = this.getCurrentGames();
                    if (newGames.length > 0) {
                        const gamesPerRowNew = this.calculateGamesPerRow(newGames);
                        const lastRowStartIndex = Math.floor((newGames.length - 1) / gamesPerRowNew) * gamesPerRowNew;
                        const targetCol = Math.min(this.currentGameIndex % gamesPerRow, (newGames.length - 1) % gamesPerRowNew);
                        this.currentGameIndex = Math.min(lastRowStartIndex + targetCol, newGames.length - 1);
                        this.focusGameWithoutScroll(this.currentGameIndex); // Focus without scroll
                        // Do single scroll to the target game after all DOM updates
                        setTimeout(() => {
                            const targetGame = this.getCurrentGames()[this.currentGameIndex];
                            if (targetGame) {
                                this.scrollToCenter(targetGame);
                            }
                        }, 400);
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
                this.showCategory(this.categories[this.currentCategoryIndex]);
                this.focusCategory(this.currentCategoryIndex);
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
                    this.focusCategory(this.currentCategoryIndex, false); // Update category focus (no scroll)
                    // Focus the first game in the top row of the new category
                    const newGames = this.getCurrentGames();
                    if (newGames.length > 0) {
                        const gamesPerRowNew = this.calculateGamesPerRow(newGames);
                        const targetCol = Math.min(this.currentGameIndex % gamesPerRow, (newGames.length - 1) % gamesPerRowNew);
                        this.currentGameIndex = Math.min(targetCol, newGames.length - 1);
                        this.focusGameWithoutScroll(this.currentGameIndex); // Focus without scroll
                        // Do single scroll to the target game after all DOM updates
                        setTimeout(() => {
                            const targetGame = this.getCurrentGames()[this.currentGameIndex];
                            if (targetGame) {
                                this.scrollToCenter(targetGame);
                            }
                        }, 400);
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
                this.showCategory(this.categories[this.currentCategoryIndex]);
                this.focusCategory(this.currentCategoryIndex);
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

    focusCategory(index, shouldScroll = true) {
        // Remove focus from all categories and games
        this.clearAllFocus();
        
        // Focus the category
        const category = this.categories[index];
        if (category) {
            const title = category.querySelector('.game-index-title');
            if (title) {
                title.classList.add('nav-focused');
                
                // Only scroll if requested (avoid competing scrolls during category transitions)
                if (shouldScroll) {
                    // Scroll to the first game in this category for better visual reference
                    const games = Array.from(category.querySelectorAll('.game-item'));
                    if (games.length > 0) {
                        setTimeout(() => {
                            this.scrollToCenter(games[0]);
                        }, 400);
                    }
                }
            }
        }
    }    focusGame(index) {
        const games = this.getCurrentGames();
        
        // Remove focus from all games
        games.forEach(game => game.classList.remove('nav-focused'));
        
        // Focus the current game
        if (games[index]) {
            games[index].classList.add('nav-focused');
            // Delay scrolling to ensure DOM updates are complete
            setTimeout(() => {
                this.scrollToCenter(games[index]);
            }, 400);
        }
    }

    focusGameWithoutScroll(index) {
        const games = this.getCurrentGames();
        
        // Remove focus from all games
        games.forEach(game => game.classList.remove('nav-focused'));
        
        // Focus the current game without scrolling
        if (games[index]) {
            games[index].classList.add('nav-focused');
        }
    }

    scrollToCenter(element) {
        if (!element) return;
        // If this is a game-item, ensure its parent .game-list is fully expanded for measurement
        const gameList = element.closest('.game-list');
        let restore = null;
        if (gameList && (!gameList.classList.contains('scroll-measure'))) {
            // Save original styles
            restore = {
                maxHeight: gameList.style.maxHeight,
                opacity: gameList.style.opacity,
                visibility: gameList.style.visibility,
                transition: gameList.style.transition
            };
            // Force expanded state for measurement
            gameList.style.maxHeight = '2000px';
            gameList.style.opacity = '1';
            gameList.style.visibility = 'visible';
            gameList.style.transition = 'none';
            gameList.classList.add('scroll-measure');
            // Force reflow
            gameList.offsetHeight;
        }

        // Now measure
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const header = document.querySelector('.main-header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const availableViewportHeight = viewportHeight - headerHeight;
        const availableViewportCenter = headerHeight + (availableViewportHeight / 2);
        const elementCenter = rect.top + rect.height / 2;
        const scrollOffset = elementCenter - availableViewportCenter;
        const currentScroll = window.pageYOffset;
        const targetScroll = currentScroll + scrollOffset;
        const padding = 20;
        const finalTarget = Math.max(padding, targetScroll);

        // Restore styles if we changed them
        if (gameList && restore) {
            gameList.style.maxHeight = restore.maxHeight;
            gameList.style.opacity = restore.opacity;
            gameList.style.visibility = restore.visibility;
            gameList.style.transition = restore.transition;
            gameList.classList.remove('scroll-measure');
        }

        // Debug logging
        // console.log('Scrolling to center (predicted):', { ... });

        // Smooth scroll to center the element
        window.scrollTo({
            top: finalTarget,
            behavior: 'smooth'
        });
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
        console.log('triggerGameSelect called with:', gameElement);
        
        // Add a visual feedback for selection
        gameElement.classList.add('game-selected');
        setTimeout(() => {
            gameElement.classList.remove('game-selected');
        }, 300);
        
        // Get the LaunchID from the data attribute
        const launchID = gameElement.dataset.launchId;
        console.log('LaunchID extracted:', launchID);
        console.log('Dataset:', gameElement.dataset);
        
        if (launchID) {
            console.log('Sending fetch request to:', `/launch/${launchID}`);
            // Send request to launch endpoint
            fetch(`/launch/${launchID}`, {
                method: 'GET'
            })
            .then(response => {
                console.log('Fetch response received:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Launch request successful:', data);
                // You could add additional UI feedback here
            })
            .catch(error => {
                console.error('Launch request failed:', error);
                // You could add error handling UI here
            });
        } else {
            console.error('No LaunchID found for game element');
            console.error('Element HTML:', gameElement.outerHTML);
        }
    }

    // Gamepad Support
    setupGamepadSupport() {
        this.gamepadIndex = -1;
        this.gamepadLastInput = 0;
        this.gamepadInputDelay = 150; // Initial delay for all inputs
        
        // Enhanced input tracking for smooth acceleration
        this.gamepadInputState = {
            up: { pressed: false, firstPress: 0, lastAction: 0 },
            down: { pressed: false, firstPress: 0, lastAction: 0 },
            left: { pressed: false, firstPress: 0, lastAction: 0 },
            right: { pressed: false, firstPress: 0, lastAction: 0 }
        };
        
        // Timing configuration
        this.gamepadTiming = {
            initialDelay: 300,      // First repeat delay (ms)
            fastRepeatDelay: 120,   // Fast repeat delay after acceleration (ms)
            accelerationTime: 800   // Time to reach max speed (ms)
        };
        
        // Check for gamepad connection
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad.id);
            this.gamepadIndex = e.gamepad.index;
            this.startGamepadPolling();
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected');
            this.gamepadIndex = -1;
            this.stopGamepadPolling();
        });
        
        // Check for already connected gamepads
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                console.log('Found existing gamepad:', gamepads[i].id);
                this.gamepadIndex = i;
                this.startGamepadPolling();
                break;
            }
        }
    }
    
    startGamepadPolling() {
        if (this.gamepadPolling) return;
        
        this.gamepadPolling = true;
        const poll = () => {
            if (!this.gamepadPolling) return;
            
            this.pollGamepad();
            requestAnimationFrame(poll);
        };
        requestAnimationFrame(poll);
    }
    
    stopGamepadPolling() {
        this.gamepadPolling = false;
    }
    
    pollGamepad() {
        const now = Date.now();
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.gamepadIndex];
        
        if (!gamepad) return;
        
        // D-pad or left stick navigation
        const leftStickX = gamepad.axes[0];
        const leftStickY = gamepad.axes[1];
        const dpadUp = gamepad.buttons[12].pressed;
        const dpadDown = gamepad.buttons[13].pressed;
        const dpadLeft = gamepad.buttons[14].pressed;
        const dpadRight = gamepad.buttons[15].pressed;
        
        // Action buttons
        const buttonA = gamepad.buttons[0].pressed;
        const buttonB = gamepad.buttons[1].pressed;
        const buttonX = gamepad.buttons[2].pressed;
        const buttonY = gamepad.buttons[3].pressed;
        
        // Current input states
        const currentInputs = {
            up: dpadUp || leftStickY < -0.5,
            down: dpadDown || leftStickY > 0.5,
            left: dpadLeft || leftStickX < -0.5,
            right: dpadRight || leftStickX > 0.5
        };
        
        // Handle directional inputs with acceleration
        for (const [direction, isPressed] of Object.entries(currentInputs)) {
            const inputState = this.gamepadInputState[direction];
            
            if (isPressed) {
                if (!inputState.pressed) {
                    // First press - immediate action
                    inputState.pressed = true;
                    inputState.firstPress = now;
                    inputState.lastAction = now;
                    this.executeDirectionalInput(direction);
                } else {
                    // Held input - check for repeat with acceleration
                    const holdTime = now - inputState.firstPress;
                    const timeSinceLastAction = now - inputState.lastAction;
                    
                    // Calculate current repeat delay based on hold time
                    let currentDelay;
                    if (holdTime < this.gamepadTiming.initialDelay) {
                        // Still in initial delay period
                        currentDelay = this.gamepadTiming.initialDelay;
                    } else {
                        // Calculate smooth acceleration
                        const accelerationProgress = Math.min(
                            (holdTime - this.gamepadTiming.initialDelay) / this.gamepadTiming.accelerationTime,
                            1
                        );
                        
                        // Smooth curve for acceleration (ease-in)
                        const curve = accelerationProgress * accelerationProgress;
                        currentDelay = this.gamepadTiming.initialDelay * (1 - curve) + 
                                     this.gamepadTiming.fastRepeatDelay * curve;
                    }
                    
                    if (timeSinceLastAction >= currentDelay) {
                        inputState.lastAction = now;
                        this.executeDirectionalInput(direction);
                    }
                }
            } else {
                // Input released
                inputState.pressed = false;
            }
        }
        
        // Handle action buttons (simple debouncing)
        if ((buttonA || buttonX) && (now - this.gamepadLastInput > this.gamepadInputDelay)) {
            this.selectCurrent();
            this.gamepadLastInput = now;
        } else if ((buttonB || buttonY) && (now - this.gamepadLastInput > this.gamepadInputDelay)) {
            if (this.isInGameList) {
                this.exitGameList();
            }
            this.gamepadLastInput = now;
        }
    }
    
    executeDirectionalInput(direction) {
        switch (direction) {
            case 'up':
                this.navigateUp();
                break;
            case 'down':
                this.navigateDown();
                break;
            case 'left':
                this.navigateLeft();
                break;
            case 'right':
                this.navigateRight();
                break;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameLauncherNavigation();
});