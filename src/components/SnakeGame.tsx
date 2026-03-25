import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const directionRef = useRef(INITIAL_DIRECTION);
  const lastMoveDirectionRef = useRef(INITIAL_DIRECTION);
  const foodRef = useRef({ x: 5, y: 5 });
  const gameBoardRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync with state for the interval closure
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    let attempts = 0;
    while (attempts < 100) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood?.x && segment.y === newFood?.y)) {
        return newFood;
      }
      attempts++;
    }
    return { x: 0, y: 0 }; // Fallback
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    lastMoveDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    const newFood = generateFood(INITIAL_SNAKE);
    setFood(newFood);
    foodRef.current = newFood;
    gameBoardRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !gameOver) {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused || gameOver) return;

      // Check against the direction the snake *last moved*, not the one it's about to move.
      // This prevents rapid double-keypress suicides.
      const { x, y } = lastMoveDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOver]);

  useEffect(() => {
    if (isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        lastMoveDirectionRef.current = currentDir; // Update last moved direction
        const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

        // Check collisions
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          // Use setTimeout to avoid state updates during render phase
          setTimeout(() => setGameOver(true), 0);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];
        const currentFood = foodRef.current;

        // Check food
        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          setTimeout(() => {
            setScore(s => s + 100);
            setFood(generateFood(newSnake));
          }, 0);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 100);
    return () => clearInterval(intervalId);
  }, [isPaused, gameOver, generateFood]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl font-mono">
      {/* Score Board */}
      <div className="flex items-center justify-between w-full px-6 py-4 bg-[#050505] border-4 border-[#00FFFF]">
        <div className="flex flex-col justify-center">
          <span 
            className="text-6xl font-black text-[#FF00FF] glitch" 
            data-text={score.toString().padStart(4, '0')}
          >
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver}
            className="px-4 py-2 text-2xl bg-[#050505] text-[#00FFFF] border-2 border-[#00FFFF] hover:bg-[#00FFFF] hover:text-[#050505] transition-none disabled:opacity-50"
          >
            {isPaused ? 'EXECUTE' : 'HALT'}
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-2 text-2xl bg-[#050505] text-[#FF00FF] border-2 border-[#FF00FF] hover:bg-[#FF00FF] hover:text-[#050505] transition-none"
          >
            PURGE
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div
        ref={gameBoardRef}
        tabIndex={0}
        className="relative outline-none bg-[#050505] border-4 border-[#FF00FF] overflow-hidden"
        style={{
          width: GRID_SIZE * 20,
          height: GRID_SIZE * 20,
        }}
      >
        {/* Grid Background Effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{
               backgroundImage: 'linear-gradient(to right, #00FFFF 1px, transparent 1px), linear-gradient(to bottom, #00FFFF 1px, transparent 1px)',
               backgroundSize: '20px 20px'
             }}>
        </div>

        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className="absolute"
              style={{
                left: segment.x * 20,
                top: segment.y * 20,
                width: 20,
                height: 20,
                backgroundColor: isHead ? '#FF00FF' : '#00FFFF',
                border: '1px solid #050505'
              }}
            />
          );
        })}

        <div
          className="absolute"
          style={{
            left: food.x * 20,
            top: food.y * 20,
            width: 20,
            height: 20,
            backgroundColor: '#FFFFFF',
            border: '2px solid #FF00FF',
            animation: 'glitch-anim-1 0.5s infinite'
          }}
        />

        {/* Overlays */}
        {(gameOver || (isPaused && score === 0 && !gameOver)) && (
          <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center z-20">
            <h2 
              className={`text-6xl font-black mb-8 ${gameOver ? 'text-[#FF00FF]' : 'text-[#00FFFF]'} glitch`} 
              data-text={gameOver ? 'FATAL_ERR' : 'AWAIT_CMD'}
            >
              {gameOver ? 'FATAL_ERR' : 'AWAIT_CMD'}
            </h2>
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-[#050505] border-4 border-[#00FFFF] text-[#00FFFF] text-3xl font-bold uppercase hover:bg-[#00FFFF] hover:text-[#050505]"
            >
              {gameOver ? 'REBOOT_SYS' : 'INIT_SEQ'}
            </button>
          </div>
        )}
      </div>
      
      <div className="text-[#00FFFF] text-2xl tracking-widest uppercase animate-pulse">
        INPUT: [W,A,S,D] OR [ARROWS]
      </div>
    </div>
  );
}
