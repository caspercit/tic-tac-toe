import React, { createContext, useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [gameMode, setGameMode] = useState(null);

  const [playerNames, setPlayerNames] = useState({
    player1: 'Jugador 1',
    player2: 'Jugador 2 / Bot',
  });

  const [score, setScore] = useState({
    player1: 0,
    player2: 0,
    draws: 0,
  });

  const [stats, setStats] = useState({
    gamesPlayed: 0,
    xWins: 0,
    oWins: 0,
    draws: 0,
  });

  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(1);
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [seriesWinner, setSeriesWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [botDifficulty, setBotDifficulty] = useState('medio');

  const [roomCode, setRoomCode] = useState('');
  const [playerSymbol, setPlayerSymbol] = useState(null);

  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  useEffect(() => {
    if (gameMode === 'bot' && !isXTurn && !seriesWinner) {
      const emptyCells = getEmptyCells(board);

      if (emptyCells.length > 0) {
        const timer = setTimeout(() => {
          const bestMove = getBotMove(board);
          makeMove(bestMove, 'O');
        }, 600);

        return () => clearTimeout(timer);
      }
    }
  }, [isXTurn, gameMode, board, seriesWinner]);

  useEffect(() => {
    if (gameMode !== 'online' || !roomCode) return;

    const roomRef = doc(db, 'rooms', roomCode);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        setBoard(data.board || Array(9).fill(null));
        setIsXTurn(data.isXTurn ?? true);
        setWinningLine(data.winningLine || []);
        setScore(data.score || { player1: 0, player2: 0, draws: 0 });
        setRound(data.round || 1);
        setSuddenDeath(data.suddenDeath || false);
        setSeriesWinner(data.seriesWinner || null);
      }
    });

    return () => unsubscribe();
  }, [gameMode, roomCode]);

  const getEmptyCells = (currentBoard) => {
    return currentBoard
      .map((value, index) => (value === null ? index : null))
      .filter((value) => value !== null);
  };

  const makeMove = async (index, forcedPlayer = null) => {
    if (gameMode === 'online') {
      return makeOnlineMove(index);
    }

    if (board[index] || seriesWinner || checkWinner(board).winner) return;

    const currentPlayer = forcedPlayer || (isXTurn ? 'X' : 'O');
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);

    if (result.winner) {
      setWinningLine(result.line || []);
      handleRoundEnd(result.winner);
    } else {
      setIsXTurn((prev) => !prev);
    }
  };

  const checkWinner = (currentBoard) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const [a, b, c] = WINNING_LINES[i];

      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return {
          winner: currentBoard[a],
          line: [a, b, c],
        };
      }
    }

    if (!currentBoard.includes(null)) {
      return {
        winner: 'EMPATE',
        line: [],
      };
    }

    return {
      winner: null,
      line: [],
    };
  };

  const handleRoundEnd = (result) => {
    const resultText =
      result === 'X'
        ? playerNames.player1
        : result === 'O'
        ? playerNames.player2
        : 'Empate';

    const historyItem = {
      id: Date.now().toString(),
      round,
      result,
      resultText,
      mode: gameMode,
    };

    setHistory((prev) => [historyItem, ...prev]);

    setStats((prev) => ({
      gamesPlayed: prev.gamesPlayed + 1,
      xWins: prev.xWins + (result === 'X' ? 1 : 0),
      oWins: prev.oWins + (result === 'O' ? 1 : 0),
      draws: prev.draws + (result === 'EMPATE' ? 1 : 0),
    }));

    let p1Gain = 0;
    let p2Gain = 0;
    let drawGain = 0;

    if (result === 'X') p1Gain = 1;
    if (result === 'O') p2Gain = 1;
    if (result === 'EMPATE') {
      p1Gain = 1;
      p2Gain = 1;
      drawGain = 1;
    }

    const newP1Score = score.player1 + p1Gain;
    const newP2Score = score.player2 + p2Gain;

    setScore({
      player1: newP1Score,
      player2: newP2Score,
      draws: score.draws + drawGain,
    });

    setTimeout(() => {
      if (suddenDeath) {
        if (result !== 'EMPATE') {
          setSeriesWinner(result);
          return;
        }

        resetRound();
        return;
      }

      if (newP1Score >= 3 && newP2Score >= 3) {
        setSuddenDeath(true);
        resetRound();
      } else if (newP1Score >= 3) {
        setSeriesWinner('X');
      } else if (newP2Score >= 3) {
        setSeriesWinner('O');
      } else {
        setRound((prev) => prev + 1);
        resetRound();
      }
    }, 900);
  };

  const createOnlineRoom = async () => {
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      await setDoc(doc(db, 'rooms', code), {
        board: Array(9).fill(null),
        isXTurn: true,
        winner: null,
        seriesWinner: null,
        winningLine: [],
        score: { player1: 0, player2: 0, draws: 0 },
        round: 1,
        suddenDeath: false,
        playerX: true,
        playerO: false,
      });

      setRoomCode(code);
      setPlayerSymbol('X');
      setGameMode('online');
      setBoard(Array(9).fill(null));
      setIsXTurn(true);
      setSeriesWinner(null);
      setWinningLine([]);
      setScore({ player1: 0, player2: 0, draws: 0 });
      setRound(1);
      setSuddenDeath(false);

      alert(`Sala creada: ${code}`);
    } catch (error) {
      console.log(error);
      alert('Error al crear sala: ' + error.message);
    }
  };

  const joinOnlineRoom = async (code) => {
    try {
      if (!code) {
        alert('Escribe un código de sala');
        return;
      }

      const cleanCode = code.trim();
      const roomRef = doc(db, 'rooms', cleanCode);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        alert('La sala no existe');
        return;
      }

      await updateDoc(roomRef, {
        playerO: true,
      });

      setRoomCode(cleanCode);
      setPlayerSymbol('O');
      setGameMode('online');

      alert(`Te uniste a la sala: ${cleanCode}`);
    } catch (error) {
      console.log(error);
      alert('Error al unirse: ' + error.message);
    }
  };

  const makeOnlineMove = async (index) => {
    try {
      if (!roomCode) return;
      if (board[index]) return;
      if (seriesWinner) return;

      const currentTurn = isXTurn ? 'X' : 'O';

      if (playerSymbol !== currentTurn) {
        alert('No es tu turno');
        return;
      }

      const newBoard = [...board];
      newBoard[index] = playerSymbol;

      const result = checkWinner(newBoard);

      let newScore = { ...score };
      let newRound = round;
      let newSuddenDeath = suddenDeath;
      let newSeriesWinner = null;

      if (result.winner) {
        if (result.winner === 'X') newScore.player1 += 1;
        if (result.winner === 'O') newScore.player2 += 1;

        if (result.winner === 'EMPATE') {
          newScore.player1 += 1;
          newScore.player2 += 1;
          newScore.draws += 1;
        }

        if (newSuddenDeath) {
          if (result.winner !== 'EMPATE') {
            newSeriesWinner = result.winner;
          }
        } else if (newScore.player1 >= 3 && newScore.player2 >= 3) {
          newSuddenDeath = true;
        } else if (newScore.player1 >= 3) {
          newSeriesWinner = 'X';
        } else if (newScore.player2 >= 3) {
          newSeriesWinner = 'O';
        } else {
          newRound += 1;
        }

        await updateDoc(doc(db, 'rooms', roomCode), {
          board: newBoard,
          isXTurn: !isXTurn,
          winner: result.winner,
          winningLine: result.line || [],
          score: newScore,
          round: newRound,
          suddenDeath: newSuddenDeath,
          seriesWinner: newSeriesWinner,
        });

        setTimeout(async () => {
          if (!newSeriesWinner) {
            await updateDoc(doc(db, 'rooms', roomCode), {
              board: Array(9).fill(null),
              isXTurn: true,
              winner: null,
              winningLine: [],
            });
          }
        }, 1000);

        return;
      }

      await updateDoc(doc(db, 'rooms', roomCode), {
        board: newBoard,
        isXTurn: !isXTurn,
        winner: null,
        winningLine: [],
        score: newScore,
        round: newRound,
        suddenDeath: newSuddenDeath,
        seriesWinner: newSeriesWinner,
      });
    } catch (error) {
      console.log(error);
      alert('Error al jugar online: ' + error.message);
    }
  };

  const getBotMove = (currentBoard) => {
    const emptyCells = getEmptyCells(currentBoard);

    if (botDifficulty === 'facil') return getRandomMove(emptyCells);
    if (botDifficulty === 'medio') return getSmartMove(currentBoard, emptyCells);
    if (botDifficulty === 'dificil') return getPerfectMove(currentBoard);

    return getRandomMove(emptyCells);
  };

  const getRandomMove = (emptyCells) => {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const getSmartMove = (currentBoard, emptyCells) => {
    for (let move of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'O';
      if (checkWinner(testBoard).winner === 'O') return move;
    }

    for (let move of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'X';
      if (checkWinner(testBoard).winner === 'X') return move;
    }

    if (currentBoard[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter((idx) => currentBoard[idx] === null);

    if (corners.length > 0) return getRandomMove(corners);

    return getRandomMove(emptyCells);
  };

  const getPerfectMove = (currentBoard) => {
    let bestScore = -Infinity;
    let move = null;

    for (let index of getEmptyCells(currentBoard)) {
      const newBoard = [...currentBoard];
      newBoard[index] = 'O';

      const moveScore = minimax(newBoard, 0, false);

      if (moveScore > bestScore) {
        bestScore = moveScore;
        move = index;
      }
    }

    return move;
  };

  const minimax = (currentBoard, depth, isMaximizing) => {
    const result = checkWinner(currentBoard).winner;

    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'EMPATE') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;

      for (let index of getEmptyCells(currentBoard)) {
        const newBoard = [...currentBoard];
        newBoard[index] = 'O';

        const moveScore = minimax(newBoard, depth + 1, false);
        bestScore = Math.max(moveScore, bestScore);
      }

      return bestScore;
    }

    let bestScore = Infinity;

    for (let index of getEmptyCells(currentBoard)) {
      const newBoard = [...currentBoard];
      newBoard[index] = 'X';

      const moveScore = minimax(newBoard, depth + 1, true);
      bestScore = Math.min(moveScore, bestScore);
    }

    return bestScore;
  };

  const resetOnlineRoom = async () => {
    if (!roomCode) return;

    await updateDoc(doc(db, 'rooms', roomCode), {
      board: Array(9).fill(null),
      isXTurn: true,
      winner: null,
      winningLine: [],
      score: { player1: 0, player2: 0, draws: 0 },
      round: 1,
      suddenDeath: false,
      seriesWinner: null,
    });
  };

  const resetRound = () => {
    if (gameMode === 'online') {
      resetOnlineRoom();
      return;
    }

    setBoard(Array(9).fill(null));
    setWinningLine([]);
    setIsXTurn(true);
  };

  const resetScore = () => {
    setScore({
      player1: 0,
      player2: 0,
      draws: 0,
    });

    setRound(1);
    setSuddenDeath(false);
    setSeriesWinner(null);
    resetRound();
  };

  const resetStats = () => {
    setStats({
      gamesPlayed: 0,
      xWins: 0,
      oWins: 0,
      draws: 0,
    });

    setHistory([]);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setScore({
      player1: 0,
      player2: 0,
      draws: 0,
    });
    setStats({
      gamesPlayed: 0,
      xWins: 0,
      oWins: 0,
      draws: 0,
    });
    setHistory([]);
    setRound(1);
    setSuddenDeath(false);
    setSeriesWinner(null);
    setGameMode(null);
    setIsXTurn(true);
    setWinningLine([]);
    setRoomCode('');
    setPlayerSymbol(null);
  };

  const changePlayerName = (player, name) => {
    setPlayerNames((prev) => ({
      ...prev,
      [player]: name.trim() || prev[player],
    }));
  };

  return (
    <GameContext.Provider
      value={{
        board,
        isXTurn,
        gameMode,
        setGameMode,

        playerNames,
        changePlayerName,

        score,
        stats,
        history,

        round,
        suddenDeath,
        seriesWinner,
        winningLine,
        botDifficulty,
        setBotDifficulty,

        roomCode,
        playerSymbol,
        createOnlineRoom,
        joinOnlineRoom,

        makeMove,
        resetRound,
        resetScore,
        resetStats,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};