import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { GameContext } from '../context/GameContext';

export default function HomeScreen() {
  const {
    board,
    gameMode,
    setGameMode,
    score,
    round,
    suddenDeath,
    seriesWinner,
    makeMove,
    resetGame,
    resetRound,
    resetScore,
    isXTurn,
    winningLine = [],
    botDifficulty,
    setBotDifficulty,
    playerNames,
    roomCode,
    playerSymbol,
    createOnlineRoom,
    joinOnlineRoom,
  } = useContext(GameContext);

  const [codeInput, setCodeInput] = useState('');

  const winnerName =
    seriesWinner === 'X'
      ? playerNames.player1
      : seriesWinner === 'O'
      ? playerNames.player2
      : null;

  if (!gameMode) {
    return (
      <LinearGradient colors={['#020617', '#111827', '#1e1b4b']} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.logo}>⚡</Text>
          <Text style={styles.title}>NEON TIC TAC TOE</Text>
          <Text style={styles.subtitle}>Elige tu modo de batalla</Text>

          <TouchableOpacity style={styles.neonButtonBlue} onPress={() => setGameMode('bot')}>
            <Text style={styles.menuText}>🤖 Contra Bot</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.neonButtonPink} onPress={() => setGameMode('local')}>
            <Text style={styles.menuText}>👥 Dos jugadores</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>🌐 Modo online</Text>

          <TouchableOpacity style={styles.neonButtonGreen} onPress={createOnlineRoom}>
            <Text style={styles.menuText}>📱 Crear sala online</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Código de sala"
            placeholderTextColor="#64748b"
            value={codeInput}
            onChangeText={setCodeInput}
            keyboardType="numeric"
            maxLength={4}
          />

          <TouchableOpacity
            style={styles.neonButtonGreen}
            onPress={() => joinOnlineRoom(codeInput)}
          >
            <Text style={styles.menuText}>🔗 Unirse a sala</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>🤖 Dificultad del bot</Text>

          <View style={styles.difficultyRow}>
            {['facil', 'medio', 'dificil'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  botDifficulty === level && styles.difficultyActive,
                ]}
                onPress={() => setBotDifficulty(level)}
              >
                <Text style={styles.difficultyText}>{level.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#020617', '#111827', '#1e1b4b']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>⚡ NEON TIC TAC TOE</Text>
        <Text style={styles.modeHeader}>MODO: {gameMode.toUpperCase()}</Text>

        {gameMode === 'bot' && (
          <Text style={styles.botText}>Dificultad: {botDifficulty.toUpperCase()}</Text>
        )}

        {gameMode === 'online' && (
          <View style={styles.onlineBox}>
            <Text style={styles.onlineText}>Sala: {roomCode}</Text>
            <Text style={styles.onlineText}>Tú eres: {playerSymbol}</Text>
            <Text style={styles.onlineHint}>Comparte el código con el otro teléfono</Text>
          </View>
        )}

        {suddenDeath && (
          <Text style={styles.suddenDeathAlert}>⚡ MUERTE SÚBITA ACTIVADA ⚡</Text>
        )}

        <View style={styles.scoreBoard}>
          <Text style={styles.scoreText}>RONDA {round} / 5</Text>

          <View style={styles.scoreRow}>
            <View style={styles.playerCardBlue}>
              <Text style={styles.playerLabel}>
                {gameMode === 'online' ? 'Jugador X' : playerNames.player1}
              </Text>
              <Text style={styles.xScore}>{score.player1}</Text>
            </View>

            <Text style={styles.vs}>VS</Text>

            <View style={styles.playerCardPink}>
              <Text style={styles.playerLabel}>
                {gameMode === 'online' ? 'Jugador O' : playerNames.player2}
              </Text>
              <Text style={styles.oScore}>{score.player2}</Text>
            </View>
          </View>

          <Text style={styles.draws}>Empates: {score.draws}</Text>
        </View>

        <View style={styles.turnBox}>
          <Text style={[styles.turnText, isXTurn ? styles.xColor : styles.oColor]}>
            {seriesWinner
              ? 'Partida finalizada'
              : isXTurn
              ? '🔵 Turno de X'
              : '🔴 Turno de O'}
          </Text>
        </View>

        <View style={styles.board}>
          {board.map((cell, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.cell,
                winningLine.includes(idx) && styles.winningCell,
              ]}
              onPress={() => makeMove(idx)}
              disabled={!!seriesWinner || (gameMode === 'bot' && !isXTurn)}
            >
              <Text
                style={[
                  styles.cellText,
                  cell === 'X' ? styles.xColor : styles.oColor,
                ]}
              >
                {cell}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.smallButton} onPress={resetRound}>
            <Text style={styles.buttonText}>Nueva ronda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton} onPress={resetScore}>
            <Text style={styles.buttonText}>Marcador</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>↩ Volver al menú</Text>
        </TouchableOpacity>

        <Modal transparent visible={!!seriesWinner} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>🏆 VICTORIA 🏆</Text>
              <Text style={styles.modalWinner}>{winnerName}</Text>
              <Text style={styles.modalText}>Ganó la serie</Text>

              <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
                <Text style={styles.buttonText}>Jugar otra vez</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  logo: {
    fontSize: 70,
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#e0f2fe',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#22d3ee',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    letterSpacing: 1,
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
  },

  sectionTitle: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 12,
    textAlign: 'center',
  },

  modeHeader: {
    color: '#22d3ee',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },

  botText: {
    color: '#facc15',
    fontWeight: 'bold',
    marginBottom: 10,
  },

  neonButtonBlue: {
    backgroundColor: '#0f172a',
    width: 295,
    padding: 16,
    borderRadius: 18,
    marginVertical: 9,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22d3ee',
  },

  neonButtonPink: {
    backgroundColor: '#0f172a',
    width: 295,
    padding: 16,
    borderRadius: 18,
    marginVertical: 9,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fb7185',
  },

  neonButtonGreen: {
    backgroundColor: '#0f172a',
    width: 295,
    padding: 16,
    borderRadius: 18,
    marginVertical: 9,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },

  menuText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#020617',
    color: '#fff',
    width: 295,
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#475569',
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 17,
  },

  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },

  difficultyButton: {
    backgroundColor: '#020617',
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#475569',
  },

  difficultyActive: {
    backgroundColor: '#be123c',
    borderColor: '#fb7185',
  },

  difficultyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  onlineBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    padding: 15,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#facc15',
  },

  onlineText: {
    color: '#facc15',
    fontWeight: 'bold',
    fontSize: 16,
  },

  onlineHint: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },

  suddenDeathAlert: {
    color: '#fb7185',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    textShadowColor: '#fb7185',
    textShadowRadius: 15,
  },

  scoreBoard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 16,
    borderRadius: 22,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#334155',
  },

  scoreText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerCardBlue: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 13,
    width: 115,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22d3ee',
  },

  playerCardPink: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 13,
    width: 115,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fb7185',
  },

  playerLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },

  xScore: {
    color: '#22d3ee',
    fontSize: 30,
    fontWeight: '900',
  },

  oScore: {
    color: '#fb7185',
    fontSize: 30,
    fontWeight: '900',
  },

  vs: {
    color: '#facc15',
    fontWeight: '900',
    marginHorizontal: 10,
  },

  draws: {
    color: '#cbd5e1',
    marginTop: 12,
    fontWeight: 'bold',
  },

  turnBox: {
    backgroundColor: '#020617',
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#334155',
  },

  turnText: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  board: {
    width: 325,
    height: 325,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#020617',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 22,
    borderWidth: 3,
    borderColor: '#22d3ee',
  },

  cell: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },

  winningCell: {
    backgroundColor: '#14532d',
  },

  cellText: {
    fontSize: 54,
    fontWeight: '900',
  },

  xColor: {
    color: '#22d3ee',
    textShadowColor: '#22d3ee',
    textShadowRadius: 15,
  },

  oColor: {
    color: '#fb7185',
    textShadowColor: '#fb7185',
    textShadowRadius: 15,
  },

  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  smallButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#22d3ee',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  resetButton: {
    backgroundColor: '#be123c',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fb7185',
    marginBottom: 20,
  },

  resetText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  modalCard: {
    backgroundColor: '#020617',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#facc15',
  },

  modalTitle: {
    color: '#facc15',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },

  modalWinner: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  modalText: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 20,
  },

  modalButton: {
    backgroundColor: '#be123c',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fb7185',
  },
});