// Pool Game Loader - Bridges the vanilla JS game to React
window.PoolGameLoader = {
  game: null,
  scriptsLoaded: false,
  
  init: function(containerId, canvasId, difficulty, onGameOver) {
    // If scripts already loaded, just start the game
    if (this.scriptsLoaded && window.Game) {
      this.startGame(containerId, canvasId, difficulty, onGameOver);
      return;
    }

    // Load all required scripts in correct dependency order
    const scripts = [
      '/Games/pool-game/engine/geom/Vector2.js',
      '/Games/pool-game/engine/system/Color.js',
      '/Games/pool-game/engine/system/Keys.js',
      '/Games/pool-game/engine/input/ButtonState.js',
      '/Games/pool-game/engine/input/Keyboard.js',
      '/Games/pool-game/engine/input/Mouse.js',
      '/Games/pool-game/engine/Canvas2D.js',
      '/Games/pool-game/engine/Global.js',
      '/Games/pool-game/engine/game_objects/Ball.js',
      '/Games/pool-game/engine/game_objects/Stick.js',
      '/Games/pool-game/engine/game_objects/Player.js',
      '/Games/pool-game/engine/game_objects/Score.js',
      '/Games/pool-game/engine/AI/Opponent.js',
      '/Games/pool-game/engine/AI/AIPolicy.js',
      '/Games/pool-game/engine/AI/AITrainer.js',
      '/Games/pool-game/engine/GamePolicy.js',
      '/Games/pool-game/engine/GameWorld.js',
      '/Games/pool-game/engine/menu/Label.js',
      '/Games/pool-game/engine/menu/Button.js',
      '/Games/pool-game/engine/menu/Menu.js',
      '/Games/pool-game/engine/Game.js',
      '/Games/pool-game/engine/Assets.js',  // Load Assets AFTER Game
    ];

    let loadedScripts = 0;
    
    const loadScript = (src, callback) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        callback();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.onload = callback;
      script.onerror = () => {
        console.error('Failed to load:', src);
        callback(); // Continue anyway
      };
      document.head.appendChild(script);
    };

    const loadNext = () => {
      if (loadedScripts < scripts.length) {
        loadScript(scripts[loadedScripts], () => {
          loadedScripts++;
          loadNext();
        });
      } else {
        console.log('All pool game scripts loaded');
        this.scriptsLoaded = true;
        setTimeout(() => {
          this.startGame(containerId, canvasId, difficulty, onGameOver);
        }, 100);
      }
    };

    loadNext();
  },

  startGame: function(containerId, canvasId, difficulty, onGameOver) {
    try {
      console.log('Starting pool game...');
      
      if (!window.Game) {
        console.error('Game engine not loaded');
        return;
      }

      // Initialize the game
      window.Game.start(containerId, canvasId, 800, 600);
      
      this.game = window.Game;
      
      console.log('Pool game started successfully');
    } catch (error) {
      console.error('Failed to start pool game:', error);
    }
  },

  cleanup: function() {
    if (this.game) {
      window.GAME_STOPPED = true;
      this.game = null;
    }
  }
};
