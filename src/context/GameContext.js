import React, { createContext, useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '../firebase/firebaseConfig';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [gameMode, setGameMode] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);

  const [playerNames, setPlayerNames] = useState({
    player1: 'Player X',
    player2: 'Player O',
  });

  const [playerAvatars, setPlayerAvatars] = useState({
    player1: '🎮',
    player2: '🎯',
  });

  const [playerColors, setPlayerColors] = useState({
    player1: '#60a5fa',
    player2: '#f472b6',
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
    totalMoves: 0,
    winStreak: 0,
    bestStreak: 0,
  });

  const [history, setHistory] = useState([]);

  const [round, setRound] = useState(1);
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [seriesWinner, setSeriesWinner] = useState(null);
  const [roundWinners, setRoundWinners] = useState([]);

  const [botDifficulty, setBotDifficulty] = useState('medio');

  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [theme, setTheme] = useState('dark');

  const [gameTimer, setGameTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [roomCode, setRoomCode] = useState('');
  const [playerSymbol, setPlayerSymbol] = useState(null);

  const [onlinePlayers, setOnlinePlayers] = useState({
    player1: { name: 'Waiting...', online: false, avatar: '🎮' },
    player2: { name: 'Waiting...', online: false, avatar: '🎯' },
  });

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

  const STICKERS = [
    { id: '😎', name: 'Cool', emoji: '😎' },
    { id: '🔥', name: 'Fire', emoji: '🔥' },
    { id: '🎉', name: 'Party', emoji: '🎉' },
    { id: '🤯', name: 'Mind Blown', emoji: '🤯' },
    { id: '👑', name: 'King', emoji: '👑' },
    { id: '⚡', name: 'Lightning', emoji: '⚡' },
  ];

  useEffect(() => {
    loadHistoryFromStorage();
  }, []);

  const loadHistoryFromStorage = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('gameHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const saveHistoryToStorage = async (historyData) => {
    try {
      await AsyncStorage.setItem('gameHistory', JSON.stringify(historyData));
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const addToHistory = (result, finalBoard, line, duration, movesCount) => {
    let normalizedResult = result;
    let winnerName = '';

    if (result === 'X') {
      normalizedResult = 'X';
      winnerName = playerNames.player1;
    } else if (result === 'O') {
      normalizedResult = 'O';
      winnerName = playerNames.player2;
    } else {
      normalizedResult = 'DRAW';
      winnerName = 'Empate';
    }

    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString(),
      round,
      mode: gameMode,
      result: normalizedResult,
      winnerName,
      scoreAtEnd: {
        player1: score.player1,
        player2: score.player2,
        draws: score.draws,
      },
      finalBoard: [...finalBoard],
      winningLine: line || [],
      duration,
      moves: movesCount,
      player1: playerNames.player1,
      player2: playerNames.player2,
      player1Avatar: playerAvatars.player1,
      player2Avatar: playerAvatars.player2,
      botDifficulty: gameMode === 'bot' ? botDifficulty : null,
    };

    setHistory(prevHistory => {
      const updatedHistory = [historyItem, ...prevHistory];
      saveHistoryToStorage(updatedHistory);
      return updatedHistory;
    });

    return historyItem;
  };

  const triggerHaptic = (style = 'light') => {
    if (!vibrationEnabled) return;

    if (Platform.OS !== 'web') {
      Vibration.vibrate(style === 'heavy' ? 100 : 50);
    }
  };

  const getEmptyCells = (currentBoard) => {
    return currentBoard
      .map((value, index) => (value === null ? index : null))
      .filter(value => value !== null);
  };

  const checkWinner = (currentBoard) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const [a, b, c] = WINNING_LINES[i];

      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line: [a, b, c] };
      }
    }

    if (!currentBoard.includes(null)) {
      return { winner: 'EMPATE', line: [] };
    }

    return { winner: null, line: [] };
  };

  const sendMessage = async (text, isSticker = false) => {
    if (!text.trim() && !isSticker) return;

    const senderSymbol = gameMode === 'online'
      ? playerSymbol
      : isXTurn
        ? 'X'
        : 'O';

    const message = {
      id: Date.now().toString(),
      text,
      sender: senderSymbol,
      senderName:
        senderSymbol === 'X'
          ? playerNames.player1
          : playerNames.player2,
      timestamp: new Date().toISOString(),
      isSticker,
      avatar:
        senderSymbol === 'X'
          ? playerAvatars.player1
          : playerAvatars.player2,
    };

    if (gameMode === 'online' && roomCode) {
      try {
        await updateDoc(doc(db, 'rooms', roomCode), {
          chatMessages: arrayUnion(message),
        });
      } catch (error) {
        console.log('Error sending message:', error);
      }
    } else {
      setMessages(prev => [...prev, message]);
    }
  };

  const sendSticker = (sticker) => {
    sendMessage(sticker.emoji, true);
  };

  const clearChat = async () => {
    setMessages([]);
    setChatMessages([]);

    if (gameMode === 'online' && roomCode) {
      try {
        await updateDoc(doc(db, 'rooms', roomCode), {
          chatMessages: [],
        });
      } catch (error) {
        console.log('Error clearing chat:', error);
      }
    }
  };

  const clearHistoryOnly = async () => {
    setHistory([]);

    try {
      await AsyncStorage.removeItem('gameHistory');
    } catch (error) {
      console.log('Error deleting history:', error);
    }

    if (gameMode === 'online' && roomCode) {
      try {
        await updateDoc(doc(db, 'rooms', roomCode), {
          history: [],
        });
      } catch (error) {
        console.log('Error clearing online history:', error);
      }
    }
  };

  const resetPreferences = () => {
    setVibrationEnabled(true);
    setTheme('dark');
    setBotDifficulty('medio');
  };

  const getRandomMove = (emptyCells) => {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const getSmartMove = (currentBoard, emptyCells) => {
    for (let move of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'O';

      if (checkWinner(testBoard).winner === 'O') {
        return move;
      }
    }

    for (let move of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'X';

      if (checkWinner(testBoard).winner === 'X') {
        return move;
      }
    }

    if (currentBoard[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter(
      index => currentBoard[index] === null
    );

    if (corners.length > 0) return getRandomMove(corners);

    return getRandomMove(emptyCells);
  };

  const getBotMove = (currentBoard) => {
    const emptyCells = getEmptyCells(currentBoard);

    if (emptyCells.length === 0) return null;
    if (botDifficulty === 'facil') return getRandomMove(emptyCells);
    if (botDifficulty === 'medio') return getSmartMove(currentBoard, emptyCells);

    return getRandomMove(emptyCells);
  };

  const updateStats = (result, movesCount) => {
    setStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      xWins: prev.xWins + (result === 'X' ? 1 : 0),
      oWins: prev.oWins + (result === 'O' ? 1 : 0),
      draws: prev.draws + (result === 'EMPATE' ? 1 : 0),
      totalMoves: prev.totalMoves + movesCount,
      winStreak: result !== 'EMPATE' ? prev.winStreak + 1 : 0,
      bestStreak: Math.max(
        prev.bestStreak,
        result !== 'EMPATE' ? prev.winStreak + 1 : 0
      ),
    }));
  };

  const calculateRoundData = (result) => {
    const p1Gain = result === 'X' || result === 'EMPATE' ? 1 : 0;
    const p2Gain = result === 'O' || result === 'EMPATE' ? 1 : 0;
    const drawGain = result === 'EMPATE' ? 1 : 0;

    const newScore = {
      player1: score.player1 + p1Gain,
      player2: score.player2 + p2Gain,
      draws: score.draws + drawGain,
    };

    let newRound = round;
    let newSuddenDeath = suddenDeath;
    let newSeriesWinner = seriesWinner;

    if (suddenDeath) {
      if (result !== 'EMPATE') {
        newSeriesWinner = result;
      } else {
        newRound = round + 1;
      }
    } else if (newScore.player1 >= 3 && newScore.player2 >= 3) {
      newSuddenDeath = true;
      newRound = round + 1;
    } else if (newScore.player1 >= 3) {
      newSeriesWinner = 'X';
    } else if (newScore.player2 >= 3) {
      newSeriesWinner = 'O';
    } else {
      newRound = round + 1;
    }

    return {
      newScore,
      newRound,
      newSuddenDeath,
      newSeriesWinner,
    };
  };

  const handleRoundEnd = (result, finalBoard, line) => {
    const movesCount = moveHistory.length + 1;

    const {
      newScore,
      newRound,
      newSuddenDeath,
      newSeriesWinner,
    } = calculateRoundData(result);

    setScore(newScore);
    updateStats(result, movesCount);
    addToHistory(result, finalBoard, line, gameTimer, movesCount);

    setIsTimerRunning(false);

    if (result !== 'EMPATE') {
      sendMessage(
        `🎉 ${result === 'X' ? playerNames.player1 : playerNames.player2} wins round ${round}!`,
        true
      );
    } else {
      sendMessage(`🤝 Round ${round} is a draw!`, true);
    }

    setTimeout(() => {
      setRound(newRound);
      setSuddenDeath(newSuddenDeath);
      setSeriesWinner(newSeriesWinner);

      if (!newSeriesWinner) {
        resetRound();
      }

      setMoveHistory([]);
      setGameTimer(0);
    }, 1000);
  };

  const finishOnlineRound = async (result, finalBoard, line) => {
    const movesCount = moveHistory.length + 1;

    const {
      newScore,
      newRound,
      newSuddenDeath,
      newSeriesWinner,
    } = calculateRoundData(result);

    const historyItem = addToHistory(
      result,
      finalBoard,
      line,
      gameTimer,
      movesCount
    );

    updateStats(result, movesCount);

    setScore(newScore);
    setRound(newRound);
    setSuddenDeath(newSuddenDeath);
    setSeriesWinner(newSeriesWinner);
    setMoveHistory([]);
    setGameTimer(0);
    setIsTimerRunning(false);

    await updateDoc(doc(db, 'rooms', roomCode), {
      board: newSeriesWinner ? finalBoard : Array(9).fill(null),
      isXTurn: true,
      winningLine: newSeriesWinner ? line : [],
      winner: result,
      score: newScore,
      round: newRound,
      suddenDeath: newSuddenDeath,
      seriesWinner: newSeriesWinner,
      history: arrayUnion(historyItem),
    });
  };

  const makeMove = async (index, forcedPlayer = null) => {
    if (gameMode === 'online') {
      return makeOnlineMove(index);
    }

    const winnerCheck = checkWinner(board);

    if (board[index] || seriesWinner || winnerCheck.winner) return;

    const currentPlayer = forcedPlayer || (isXTurn ? 'X' : 'O');

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    setBoard(newBoard);

    setMoveHistory(prev => [
      ...prev,
      {
        player: currentPlayer,
        position: index,
        time: Date.now(),
      },
    ]);

    if (moveHistory.length === 0 && !isTimerRunning) {
      setIsTimerRunning(true);
    }

    const result = checkWinner(newBoard);

    if (result.winner) {
      setWinningLine(result.line);
      handleRoundEnd(result.winner, newBoard, result.line);
      triggerHaptic('heavy');
    } else {
      triggerHaptic('light');
      setIsXTurn(prev => !prev);
    }
  };

  const createOnlineRoom = async () => {
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      await setDoc(doc(db, 'rooms', code), {
        board: Array(9).fill(null),
        isXTurn: true,
        winningLine: [],
        score: { player1: 0, player2: 0, draws: 0 },
        round: 1,
        suddenDeath: false,
        seriesWinner: null,
        history: [],
        playerNames: {
          player1: {
            name: playerNames.player1,
            online: true,
            avatar: playerAvatars.player1,
          },
          player2: {
            name: 'Waiting...',
            online: false,
            avatar: '🎯',
          },
        },
        chatMessages: [],
      });

      setRoomCode(code);
      setPlayerSymbol('X');
      setGameMode('online');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const joinOnlineRoom = async (code) => {
    try {
      if (!code) {
        alert('Enter code');
        return;
      }

      const cleanCode = code.trim();
      const roomRef = doc(db, 'rooms', cleanCode);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        alert('Room not found');
        return;
      }

      await updateDoc(roomRef, {
        playerO: true,
        'playerNames.player2': {
          name: playerNames.player2,
          online: true,
          avatar: playerAvatars.player2,
        },
      });

      setRoomCode(cleanCode);
      setPlayerSymbol('O');
      setGameMode('online');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const makeOnlineMove = async (index) => {
    try {
      if (!roomCode || board[index] || seriesWinner) return;

      const currentTurn = isXTurn ? 'X' : 'O';

      if (playerSymbol !== currentTurn) {
        alert('Not your turn');
        return;
      }

      const newBoard = [...board];
      newBoard[index] = playerSymbol;

      const newMove = {
        player: playerSymbol,
        position: index,
        time: Date.now(),
      };

      setMoveHistory(prev => [...prev, newMove]);

      if (moveHistory.length === 0 && !isTimerRunning) {
        setIsTimerRunning(true);
      }

      const result = checkWinner(newBoard);

      if (result.winner) {
        await updateDoc(doc(db, 'rooms', roomCode), {
          board: newBoard,
          isXTurn: !isXTurn,
          winningLine: result.line,
          winner: result.winner,
        });

        setBoard(newBoard);
        setWinningLine(result.line);

        await finishOnlineRound(result.winner, newBoard, result.line);
      } else {
        await updateDoc(doc(db, 'rooms', roomCode), {
          board: newBoard,
          isXTurn: !isXTurn,
          winningLine: [],
        });

        setBoard(newBoard);
        setIsXTurn(!isXTurn);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetRound = () => {
    if (gameMode === 'online' && roomCode) {
      updateDoc(doc(db, 'rooms', roomCode), {
        board: Array(9).fill(null),
        isXTurn: true,
        winningLine: [],
        winner: null,
      });

      return;
    }

    setBoard(Array(9).fill(null));
    setWinningLine([]);
    setIsXTurn(true);
    setMoveHistory([]);
    setGameTimer(0);
    setIsTimerRunning(false);
  };

  const resetScore = () => {
    const cleanScore = { player1: 0, player2: 0, draws: 0 };

    setScore(cleanScore);
    setRound(1);
    setSuddenDeath(false);
    setSeriesWinner(null);
    setRoundWinners([]);
    resetRound();

    if (gameMode === 'online' && roomCode) {
      updateDoc(doc(db, 'rooms', roomCode), {
        score: cleanScore,
        round: 1,
        suddenDeath: false,
        seriesWinner: null,
      });
    }
  };

  const resetStats = async () => {
    setStats({
      gamesPlayed: 0,
      xWins: 0,
      oWins: 0,
      draws: 0,
      totalMoves: 0,
      winStreak: 0,
      bestStreak: 0,
    });

    setHistory([]);

    try {
      await AsyncStorage.removeItem('gameHistory');
    } catch (error) {
      console.log('Error deleting history:', error);
    }

    if (gameMode === 'online' && roomCode) {
      updateDoc(doc(db, 'rooms', roomCode), {
        history: [],
      });
    }
  };

  const resetGame = async () => {
    setBoard(Array(9).fill(null));
    setScore({ player1: 0, player2: 0, draws: 0 });

    setStats({
      gamesPlayed: 0,
      xWins: 0,
      oWins: 0,
      draws: 0,
      totalMoves: 0,
      winStreak: 0,
      bestStreak: 0,
    });

    setRound(1);
    setSuddenDeath(false);
    setSeriesWinner(null);
    setGameMode(null);
    setIsXTurn(true);
    setWinningLine([]);
    setRoomCode('');
    setPlayerSymbol(null);
    setMessages([]);
    setChatMessages([]);
    setMoveHistory([]);
    setGameTimer(0);
    setIsTimerRunning(false);
  };

  const changePlayerName = (player, name) => {
    setPlayerNames(prev => ({
      ...prev,
      [player]: name.trim() || prev[player],
    }));
  };

  const changePlayerAvatar = (player, avatar) => {
    setPlayerAvatars(prev => ({
      ...prev,
      [player]: avatar,
    }));
  };

  const changePlayerColor = (player, color) => {
    setPlayerColors(prev => ({
      ...prev,
      [player]: color,
    }));
  };

  useEffect(() => {
    let interval;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (
      gameMode === 'bot' &&
      !isXTurn &&
      !seriesWinner &&
      !checkWinner(board).winner
    ) {
      const emptyCells = getEmptyCells(board);

      if (emptyCells.length > 0) {
        const timer = setTimeout(() => {
          const bestMove = getBotMove(board);

          if (bestMove !== null && !board[bestMove]) {
            makeMove(bestMove, 'O');
          }
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
        setChatMessages(data.chatMessages || []);

        if (data.history) {
          setHistory(data.history);
          saveHistoryToStorage(data.history);
        }

        if (data.playerNames) {
          setOnlinePlayers(data.playerNames);
        }
      }
    });

    return () => unsubscribe();
  }, [gameMode, roomCode]);

  return (
    <GameContext.Provider
      value={{
        board,
        isXTurn,
        gameMode,
        setGameMode,
        winningLine,
        moveHistory,

        playerNames,
        changePlayerName,
        playerAvatars,
        changePlayerAvatar,
        playerColors,
        changePlayerColor,

        score,
        stats,
        history,

        round,
        suddenDeath,
        seriesWinner,
        roundWinners,

        botDifficulty,
        setBotDifficulty,

        messages,
        chatMessages,
        sendMessage,
        sendSticker,
        STICKERS,
        showChat,
        setShowChat,
        clearChat,

        vibrationEnabled,
        setVibrationEnabled,
        triggerHaptic,

        theme,
        setTheme,
        resetPreferences,

        gameTimer,

        roomCode,
        playerSymbol,
        createOnlineRoom,
        joinOnlineRoom,
        onlinePlayers,

        makeMove,
        resetRound,
        resetScore,
        resetStats,
        resetGame,
        clearHistoryOnly,

        addXP: () => {},
        levelUp: () => {},
        checkAchievements: () => {},
        getHint: () => null,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;