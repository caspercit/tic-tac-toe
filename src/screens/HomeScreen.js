import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
  FlatList,
  TextInput as TextInputRN,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { GameContext } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

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
    changePlayerName,
    playerAvatars,
    changePlayerAvatar,
    roomCode,
    playerSymbol,
    createOnlineRoom,
    joinOnlineRoom,
    messages,
    chatMessages,
    sendMessage,
    sendSticker,
    STICKERS,
    showChat,
    setShowChat,
    moveHistory,
    gameTimer,
    vibrationEnabled,
    triggerHaptic,
  } = useContext(GameContext);

  const [codeInput, setCodeInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('player1');
  const [showWinnerEffect, setShowWinnerEffect] = useState(false);
  
  const [boardScale] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [chatBounce] = useState(new Animated.Value(1));

  const winnerName =
    seriesWinner === 'X'
      ? playerNames.player1
      : seriesWinner === 'O'
      ? playerNames.player2
      : null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animación de rebote para el chat
  useEffect(() => {
    if ((gameMode === 'online' ? chatMessages.length : messages.length) > 0 && !showChat) {
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.spring(chatBounce, { toValue: 1.15, friction: 3, tension: 40, useNativeDriver: true }),
          Animated.spring(chatBounce, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
        ]),
        { delay: 3000 }
      );
      bounceAnimation.start();
      return () => bounceAnimation.stop();
    }
  }, [chatMessages, messages, gameMode, showChat]);

  useEffect(() => {
    if (seriesWinner) {
      setShowWinnerEffect(true);
      Animated.sequence([
        Animated.spring(boardScale, { toValue: 1.05, friction: 3, useNativeDriver: true }),
        Animated.spring(boardScale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => setShowWinnerEffect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [seriesWinner]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const confirmExitToMenu = () => {
    Alert.alert(
      "Exit Game",
      "Are you sure you want to exit to main menu? Your current progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Exit", 
          style: "destructive",
          onPress: () => setGameMode(null)
        }
      ]
    );
  };

  // ========== PANTALLA DE SELECCIÓN DE MODO (MENÚ PRINCIPAL) ==========
  if (!gameMode) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#020617', '#0f172a', '#1e1b4b', '#2e1065']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bg}
        >
          <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoGlow} />
              <LinearGradient
                colors={['#38bdf8', '#818cf8', '#c084fc', '#f472b6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logo}>◈</Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.menuTitle}>TIC TAC TOE</Text>
            <View style={styles.titleDecoration}>
              <View style={styles.titleDot} />
              <View style={styles.titleLine} />
              <Text style={styles.menuSubtitle}>ELITE EDITION</Text>
              <View style={styles.titleLine} />
              <View style={styles.titleDot} />
            </View>

            <View style={styles.profilesContainer}>
              <TouchableOpacity 
                style={styles.profileCard}
                onPress={() => {
                  setSelectedPlayer('player1');
                  setTempName(playerNames.player1);
                  setShowProfileModal(true);
                }}
              >
                <LinearGradient
                  colors={['rgba(56,189,248,0.2)', 'rgba(56,189,248,0.05)']}
                  style={styles.profileCardGradient}
                >
                  <Text style={styles.profileCardAvatar}>{playerAvatars.player1}</Text>
                  <Text style={styles.profileCardName}>{playerNames.player1}</Text>
                  <View style={styles.profileCardBadge}>
                    <Ionicons name="create-outline" size={10} color="#38bdf8" />
                    <Text style={styles.profileCardBadgeText}>EDIT</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.vsPill}>
                <Text style={styles.vsPillText}>VS</Text>
              </View>

              <TouchableOpacity 
                style={styles.profileCard}
                onPress={() => {
                  setSelectedPlayer('player2');
                  setTempName(playerNames.player2);
                  setShowProfileModal(true);
                }}
              >
                <LinearGradient
                  colors={['rgba(244,114,182,0.2)', 'rgba(244,114,182,0.05)']}
                  style={styles.profileCardGradient}
                >
                  <Text style={styles.profileCardAvatar}>{playerAvatars.player2}</Text>
                  <Text style={styles.profileCardName}>{playerNames.player2}</Text>
                  <View style={styles.profileCardBadge}>
                    <Ionicons name="create-outline" size={10} color="#f472b6" />
                    <Text style={styles.profileCardBadgeText}>EDIT</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.menuButtons}>
              <TouchableOpacity onPress={() => setGameMode('bot')} style={styles.menuButton}>
                <LinearGradient
                  colors={['#2563eb', '#1d4ed8', '#1e3a8a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuGradient}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="hardware-chip" size={24} color="#fff" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuButtonText}>VS BOT</Text>
                    <Text style={styles.menuButtonSubtext}>Play against AI</Text>
                  </View>
                  <View style={styles.menuButtonBadge}>
                    <Text style={styles.menuButtonBadgeText}>AI</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setGameMode('local')} style={styles.menuButton}>
                <LinearGradient
                  colors={['#ec4899', '#db2777', '#9d174d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuGradient}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="people" size={24} color="#fff" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuButtonText}>LOCAL</Text>
                    <Text style={styles.menuButtonSubtext}>Two players</Text>
                  </View>
                  <View style={styles.menuButtonBadge}>
                    <Text style={styles.menuButtonBadgeText}>2P</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={createOnlineRoom} style={styles.menuButton}>
                <LinearGradient
                  colors={['#10b981', '#059669', '#064e3b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuGradient}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="globe" size={24} color="#fff" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuButtonText}>ONLINE</Text>
                    <Text style={styles.menuButtonSubtext}>Multiplayer</Text>
                  </View>
                  <View style={styles.menuButtonBadge}>
                    <Text style={styles.menuButtonBadgeText}>MP</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.joinSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitle}>JOIN MATCH</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.joinInputContainer}>
                <View style={styles.joinInputWrapper}>
                  <Ionicons name="key-outline" size={18} color="#fbbf24" style={styles.joinIcon} />
                  <TextInput
                    style={styles.joinInput}
                    placeholder="ENTER ROOM CODE"
                    placeholderTextColor="#64748b"
                    value={codeInput}
                    onChangeText={setCodeInput}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <TouchableOpacity style={styles.joinButton} onPress={() => joinOnlineRoom(codeInput)}>
                  <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.joinGradient}>
                    <Text style={styles.joinButtonText}>JOIN</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.difficultySection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitle}>BOT DIFFICULTY</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.difficultyGrid}>
                {[
                  { id: 'facil', label: 'EASY', icon: 'happy-outline', color: '#34d399', gradient: ['#34d399', '#059669'] },
                  { id: 'medio', label: 'MEDIUM', icon: 'swap-horizontal-outline', color: '#fbbf24', gradient: ['#fbbf24', '#d97706'] },
                  { id: 'dificil', label: 'HARD', icon: 'bulb-outline', color: '#f87171', gradient: ['#f87171', '#dc2626'] },
                ].map((diff) => (
                  <TouchableOpacity
                    key={diff.id}
                    style={[
                      styles.difficultyCard,
                      botDifficulty === diff.id && styles.difficultyCardActive,
                    ]}
                    onPress={() => setBotDifficulty(diff.id)}
                  >
                    <LinearGradient
                      colors={botDifficulty === diff.id ? diff.gradient : ['#1f2937', '#111827']}
                      style={styles.difficultyGradient}
                    >
                      <Ionicons name={diff.icon} size={26} color={botDifficulty === diff.id ? '#fff' : diff.color} />
                      <Text style={[styles.difficultyLabel, botDifficulty === diff.id && styles.difficultyLabelActive]}>
                        {diff.label}
                      </Text>
                      {botDifficulty === diff.id && (
                        <View style={styles.difficultyCheck}>
                          <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Profile Modal */}
          <Modal visible={showProfileModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <Animated.View style={[styles.profileModal, { opacity: fadeAnim }]}>
                <LinearGradient
                  colors={['#1e1b4b', '#2e1065', '#4c1d95']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profileModalGradient}
                >
                  <View style={styles.modalHandle} />
                  <Text style={styles.profileModalTitle}>CUSTOMIZE PROFILE</Text>
                  
                  <View style={styles.profileAvatarPreview}>
                    <Text style={styles.previewAvatar}>{playerAvatars[selectedPlayer]}</Text>
                    <Text style={styles.previewName}>{tempName || playerNames[selectedPlayer]}</Text>
                  </View>

                  <Text style={styles.profileLabel}>PLAYER NAME</Text>
                  <TextInputRN
                    style={styles.profileInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Enter name"
                    placeholderTextColor="#64748b"
                    maxLength={15}
                  />

                  <Text style={styles.profileLabel}>SELECT AVATAR</Text>
                  <View style={styles.avatarGrid}>
                    {['🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🏆', '⭐', '🔥', '💎', '👑', '⚡', '🦄', '🐉', '🤖', '👾'].map((avatar, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.avatarOption,
                          playerAvatars[selectedPlayer] === avatar && styles.avatarSelected,
                        ]}
                        onPress={() => changePlayerAvatar(selectedPlayer, avatar)}
                      >
                        <Text style={styles.avatarEmoji}>{avatar}</Text>
                        {playerAvatars[selectedPlayer] === avatar && (
                          <View style={styles.avatarCheck}>
                            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.profileModalButtons}>
                    <TouchableOpacity
                      style={styles.profileSaveButton}
                      onPress={() => {
                        changePlayerName(selectedPlayer, tempName);
                        setShowProfileModal(false);
                      }}
                    >
                      <LinearGradient colors={['#10b981', '#059669']} style={styles.profileSaveGradient}>
                        <Text style={styles.profileSaveText}>SAVE CHANGES</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.profileCancelButton}
                      onPress={() => setShowProfileModal(false)}
                    >
                      <Text style={styles.profileCancelText}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </Modal>
        </LinearGradient>
      </>
    );
  }

  // ========== PANTALLA DE JUEGO ==========
  const unreadCount = gameMode === 'online' ? chatMessages.length : messages.length;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e1b4b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {showWinnerEffect && (
          <Animated.View style={[styles.winnerEffectContainer, { opacity: fadeAnim }]}>
            <LinearGradient colors={['#fbbf24', '#f59e0b', '#ea580c']} style={styles.winnerEffectGradient}>
              <Ionicons name="trophy" size={20} color="#fff" />
              <Text style={styles.winnerEffectText}>SERIES CHAMPION!</Text>
              <Ionicons name="trophy" size={20} color="#fff" />
            </LinearGradient>
          </Animated.View>
        )}

        {/* Botones flotantes superior izquierda y derecha */}
        <View style={styles.floatingButtonsContainer}>
          {/* Botón Chat (izquierda) */}
          <Animated.View style={{ transform: [{ scale: chatBounce }] }}>
            <TouchableOpacity onPress={() => setShowChat(true)}>
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.floatingChatButton}
              >
                <Ionicons name="chatbubbles" size={22} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.floatingChatBadge}>
                    <Text style={styles.floatingChatBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Botón Salir (derecha) */}
          <TouchableOpacity onPress={confirmExitToMenu}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.floatingExitButton}
            >
              <Ionicons name="exit-outline" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.gameContainer} 
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {/* Players Header */}
          <View style={styles.playersHeader}>
            <View style={styles.playerCard}>
              <Text style={styles.playerCardAvatar}>{playerAvatars.player1}</Text>
              <Text style={styles.playerCardName}>{playerNames.player1}</Text>
              <View style={[styles.playerCardIndicator, styles.playerXIndicator]} />
            </View>
            
            <View style={styles.vsBadge}>
              <Text style={styles.vsBadgeText}>VS</Text>
            </View>
            
            <View style={styles.playerCard}>
              <View style={[styles.playerCardIndicator, styles.playerOIndicator]} />
              <Text style={styles.playerCardName}>{playerNames.player2}</Text>
              <Text style={styles.playerCardAvatar}>{playerAvatars.player2}</Text>
            </View>
          </View>

          {/* Info Bar */}
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Ionicons name="game-controller" size={12} color="#94a3b8" />
              <Text style={styles.infoText}>{gameMode.toUpperCase()}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="time" size={12} color="#94a3b8" />
              <Text style={styles.infoText}>{formatTime(gameTimer)}</Text>
            </View>
            {gameMode === 'bot' && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <Ionicons name="bulb" size={12} color="#fbbf24" />
                  <Text style={styles.infoText}>{botDifficulty.toUpperCase()}</Text>
                </View>
              </>
            )}
          </View>

          {/* Score Board */}
          <View style={styles.scoreBoard}>
            <View style={styles.scoreTeam}>
              <Text style={styles.scoreAvatar}>{playerAvatars.player1}</Text>
              <Text style={styles.scoreValue}>{score.player1}</Text>
              <Text style={styles.scoreLabel}>WINS</Text>
            </View>
            
            <View style={styles.scoreCenter}>
              <Text style={styles.scoreRound}>ROUND {round}</Text>
              <Text style={styles.scoreDraws}>DRAWS: {score.draws}</Text>
            </View>
            
            <View style={styles.scoreTeam}>
              <Text style={styles.scoreValue}>{score.player2}</Text>
              <Text style={styles.scoreLabel}>WINS</Text>
              <Text style={styles.scoreAvatar}>{playerAvatars.player2}</Text>
            </View>
          </View>

          {/* Sudden Death */}
          {suddenDeath && (
            <View style={styles.suddenDeathAlert}>
              <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.suddenDeathGradient}>
                <Ionicons name="flash" size={14} color="#fff" />
                <Text style={styles.suddenDeathAlertText}>SUDDEN DEATH</Text>
                <Ionicons name="flash" size={14} color="#fff" />
              </LinearGradient>
            </View>
          )}

          {/* Turn Indicator */}
          <View style={styles.turnIndicator}>
            <LinearGradient
              colors={isXTurn ? ['#3b82f6', '#1d4ed8'] : ['#ec4899', '#be185d']}
              style={styles.turnGradient}
            >
              <View style={styles.turnSymbol}>
                <Text style={styles.turnSymbolText}>{isXTurn ? 'X' : 'O'}</Text>
              </View>
              <Text style={styles.turnText}>
                {seriesWinner
                  ? 'GAME COMPLETE'
                  : `${isXTurn ? playerNames.player1 : playerNames.player2}'S TURN`}
              </Text>
            </LinearGradient>
          </View>

          {/* Game Board */}
          <Animated.View style={[styles.boardWrapper, { transform: [{ scale: boardScale }] }]}>
            <View style={styles.board}>
              {board.map((cell, idx) => {
                const isWinning = winningLine.includes(idx);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.gameCell,
                      isWinning && styles.winningCell,
                      cell && styles.filledCell,
                    ]}
                    onPress={() => {
                      triggerHaptic('light');
                      makeMove(idx);
                    }}
                    disabled={!!seriesWinner || (gameMode === 'bot' && !isXTurn)}
                  >
                    {cell && (
                      <Text style={[styles.gameCellText, cell === 'X' ? styles.xColor : styles.oColor]}>
                        {cell}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={resetRound}>
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.actionBtnGradient}>
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>NEW ROUND</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={resetScore}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.actionBtnGradient}>
                <Ionicons name="stats-chart" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>RESET SCORE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Chat Modal */}
        <Modal visible={showChat} transparent animationType="slide">
          <View style={styles.chatModalOverlay}>
            <View style={styles.chatModal}>
              <LinearGradient colors={['#1e1b4b', '#0f172a']} style={styles.chatModalGradient}>
                <View style={styles.chatHeader}>
                  <View style={styles.chatHeaderLeft}>
                    <Ionicons name="chatbubbles" size={20} color="#60a5fa" />
                    <Text style={styles.chatTitle}>GAME CHAT</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowChat(false)}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={gameMode === 'online' ? chatMessages : messages}
                  keyExtractor={(item, index) => item.id || index.toString()}
                  style={styles.chatMessages}
                  contentContainerStyle={styles.chatMessagesContent}
                  renderItem={({ item }) => (
                    <View style={[styles.chatBubble, item.sender === 'X' ? styles.chatBubbleLeft : styles.chatBubbleRight]}>
                      <Text style={styles.chatSender}>{item.senderName}</Text>
                      <Text style={styles.chatMessageText}>{item.isSticker ? `🎨 ${item.text}` : item.text}</Text>
                      <Text style={styles.chatTimestamp}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  )}
                />

                {showStickers && (
                  <View style={styles.stickerPanel}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {STICKERS.map((sticker) => (
                        <TouchableOpacity
                          key={sticker.id}
                          style={styles.stickerBtn}
                          onPress={() => {
                            sendSticker(sticker);
                            setShowStickers(false);
                          }}
                        >
                          <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                          <Text style={styles.stickerName}>{sticker.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.chatInputBar}>
                  <TouchableOpacity onPress={() => setShowStickers(!showStickers)} style={styles.stickerToggle}>
                    <Ionicons name="happy" size={24} color={showStickers ? '#60a5fa' : '#64748b'} />
                  </TouchableOpacity>
                  
                  <View style={styles.chatInputWrapper}>
                    <TextInputRN
                      style={styles.chatInput}
                      value={messageInput}
                      onChangeText={setMessageInput}
                      placeholder="Type a message..."
                      placeholderTextColor="#64748b"
                    />
                  </View>
                  
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => {
                      if (messageInput.trim()) {
                        sendMessage(messageInput);
                        setMessageInput('');
                      }
                    }}
                  >
                    <LinearGradient colors={['#10b981', '#059669']} style={styles.sendBtnGradient}>
                      <Ionicons name="send" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Winner Modal */}
        <Modal transparent visible={!!seriesWinner} animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.winnerModal, { transform: [{ scale: boardScale }] }]}>
              <LinearGradient
                colors={['#1e1b4b', '#2e1065', '#4c1d95']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.winnerModalGradient}
              >
                <View style={styles.trophyIcon}>
                  <Ionicons name="trophy" size={56} color="#fbbf24" />
                </View>
                <Text style={styles.winnerModalTitle}>CHAMPION</Text>
                <Text style={styles.winnerModalName}>{winnerName}</Text>
                <Text style={styles.winnerModalSubtext}>Won the series!</Text>
                <TouchableOpacity style={styles.winnerModalBtn} onPress={resetGame}>
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.winnerModalBtnGradient}>
                    <Text style={styles.winnerModalBtnText}>PLAY AGAIN</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
}

// ========== ESTILOS COMPLETOS ==========
const styles = StyleSheet.create({
  bg: { flex: 1 },
  
  // ========== MENU STYLES ==========
  menuContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoWrapper: { position: 'relative', marginBottom: 16 },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56,189,248,0.3)',
    top: -10,
    left: -10,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { fontSize: 36, fontWeight: '900', color: '#fff' },
  menuTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  titleDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 24,
  },
  titleDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#38bdf8' },
  titleLine: { width: 25, height: 1, backgroundColor: 'rgba(56,189,248,0.3)' },
  menuSubtitle: { fontSize: 9, color: '#64748b', letterSpacing: 2 },
  profilesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  profileCard: {
    width: 90,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
  },
  profileCardGradient: { alignItems: 'center', paddingVertical: 12, gap: 6 },
  profileCardAvatar: { fontSize: 32 },
  profileCardName: { color: '#fff', fontSize: 11, fontWeight: '700' },
  profileCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  profileCardBadgeText: { color: '#38bdf8', fontSize: 7, fontWeight: '700' },
  vsPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251,191,36,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  vsPillText: { color: '#fbbf24', fontSize: 12, fontWeight: '900' },
  menuButtons: { width: '100%', gap: 10, marginBottom: 24 },
  menuButton: { borderRadius: 16, overflow: 'hidden' },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: { flex: 1 },
  menuButtonText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  menuButtonSubtext: { fontSize: 9, color: 'rgba(255,255,255,0.6)' },
  menuButtonBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  menuButtonBadgeText: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },
  joinSection: { width: '100%', marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionLine: { width: 30, height: 1, backgroundColor: 'rgba(251,191,36,0.3)' },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: '#fbbf24', letterSpacing: 1.5 },
  joinInputContainer: { flexDirection: 'row', gap: 10 },
  joinInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  joinIcon: { marginRight: 6 },
  joinInput: { flex: 1, paddingVertical: 12, color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  joinButton: { borderRadius: 14, overflow: 'hidden' },
  joinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  joinButtonText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  difficultySection: { width: '100%', marginBottom: 24 },
  difficultyGrid: { flexDirection: 'row', gap: 10 },
  difficultyCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  difficultyGradient: { alignItems: 'center', paddingVertical: 14, gap: 6 },
  difficultyLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  difficultyLabelActive: { color: '#fff' },
  difficultyCheck: { position: 'absolute', top: 6, right: 6 },
  difficultyCardActive: { shadowColor: '#fbbf24', shadowRadius: 12, shadowOpacity: 0.4 },
  
  // ========== PROFILE MODAL ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileModal: { width: '95%', maxHeight: '80%', borderRadius: 28, overflow: 'hidden' },
  profileModalGradient: { padding: 20, alignItems: 'center' },
  modalHandle: { width: 35, height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 16 },
  profileModalTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 1.5, marginBottom: 16 },
  profileAvatarPreview: { alignItems: 'center', marginBottom: 20 },
  previewAvatar: { fontSize: 50, marginBottom: 6 },
  previewName: { color: '#60a5fa', fontSize: 14, fontWeight: '700' },
  profileLabel: { alignSelf: 'flex-start', color: '#94a3b8', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  profileInput: {
    width: '100%',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
  },
  avatarSelected: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' },
  avatarEmoji: { fontSize: 24 },
  avatarCheck: { position: 'absolute', bottom: -2, right: -2 },
  profileModalButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  profileSaveButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  profileSaveGradient: { paddingVertical: 12, alignItems: 'center' },
  profileSaveText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  profileCancelButton: { flex: 1, backgroundColor: '#334155', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  profileCancelText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  
  // ========== GAME STYLES ==========
  // Botones flotantes
  floatingButtonsContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  floatingChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingExitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingChatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  floatingChatBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gameContainer: { 
    flexGrow: 1, 
    paddingHorizontal: 20, 
    paddingTop: 70,  // Espacio para los botones flotantes
    paddingBottom: 30, 
    alignItems: 'center' 
  },
  playersHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 16, 
    paddingHorizontal: 10 
  },
  playerCard: { alignItems: 'center', gap: 6, flex: 1 },
  playerCardAvatar: { fontSize: 32 },
  playerCardName: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  playerCardIndicator: { width: 6, height: 6, borderRadius: 3 },
  playerXIndicator: { backgroundColor: '#3b82f6' },
  playerOIndicator: { backgroundColor: '#ec4899' },
  vsBadge: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(251,191,36,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#fbbf24' 
  },
  vsBadgeText: { color: '#fbbf24', fontSize: 12, fontWeight: '900' },
  infoBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(30,27,75,0.6)', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    marginBottom: 16, 
    gap: 12, 
    alignSelf: 'center' 
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  infoDivider: { width: 1, height: 12, backgroundColor: '#334155' },
  scoreBoard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#1e1b4b', 
    borderRadius: 24, 
    paddingVertical: 16, 
    paddingHorizontal: 12, 
    marginBottom: 16, 
    width: '100%', 
    borderWidth: 1, 
    borderColor: 'rgba(56,189,248,0.2)' 
  },
  scoreTeam: { alignItems: 'center', flex: 1, gap: 4 },
  scoreAvatar: { fontSize: 22 },
  scoreValue: { fontSize: 32, fontWeight: '900', color: '#fff' },
  scoreLabel: { fontSize: 9, color: '#64748b', fontWeight: '700', letterSpacing: 1 },
  scoreCenter: { alignItems: 'center', paddingHorizontal: 16 },
  scoreRound: { fontSize: 14, fontWeight: '900', color: '#fbbf24', letterSpacing: 1 },
  scoreDraws: { fontSize: 10, color: '#64748b', marginTop: 4 },
  suddenDeathAlert: { borderRadius: 20, overflow: 'hidden', marginBottom: 12, width: '100%' },
  suddenDeathGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  suddenDeathAlertText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  turnIndicator: { borderRadius: 30, overflow: 'hidden', marginBottom: 20, width: '100%' },
  turnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 },
  turnSymbol: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  turnSymbolText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  turnText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  boardWrapper: { marginBottom: 20, alignItems: 'center' },
  board: { 
    width: Math.min(width - 60, 320), 
    height: Math.min(width - 60, 320), 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    backgroundColor: '#1e1b4b', 
    borderRadius: 20, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: 'rgba(56,189,248,0.3)' 
  },
  gameCell: { 
    width: '33.33%', 
    height: '33.33%', 
    borderRightWidth: 1, 
    borderBottomWidth: 1, 
    borderColor: 'rgba(56,189,248,0.15)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  filledCell: { backgroundColor: 'rgba(0,0,0,0.2)' },
  winningCell: { backgroundColor: 'rgba(16,185,129,0.25)' },
  gameCellText: { fontSize: 40, fontWeight: '900' },
  xColor: { color: '#60a5fa', textShadowColor: '#60a5fa', textShadowRadius: 15 },
  oColor: { color: '#fb7185', textShadowColor: '#fb7185', textShadowRadius: 15 },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  actionBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  actionBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  
  // Chat Modal
  chatModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'flex-end' },
  chatModal: { height: '75%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  chatModalGradient: { flex: 1, padding: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(56,189,248,0.2)' },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  chatMessages: { flex: 1 },
  chatMessagesContent: { paddingBottom: 16 },
  chatBubble: { maxWidth: '80%', marginBottom: 12, padding: 12, borderRadius: 20 },
  chatBubbleLeft: { alignSelf: 'flex-start', backgroundColor: 'rgba(59,130,246,0.15)', borderBottomLeftRadius: 4 },
  chatBubbleRight: { alignSelf: 'flex-end', backgroundColor: 'rgba(236,72,153,0.15)', borderBottomRightRadius: 4 },
  chatSender: { fontSize: 10, fontWeight: '700', color: '#60a5fa', marginBottom: 4 },
  chatMessageText: { fontSize: 14, color: '#fff' },
  chatTimestamp: { fontSize: 9, color: '#64748b', marginTop: 4, alignSelf: 'flex-end' },
  stickerPanel: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(56,189,248,0.2)', marginBottom: 12 },
  stickerBtn: { alignItems: 'center', marginRight: 16 },
  stickerEmoji: { fontSize: 36, marginBottom: 4 },
  stickerName: { fontSize: 9, color: '#64748b' },
  chatInputBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(56,189,248,0.2)' },
  stickerToggle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  chatInputWrapper: { flex: 1, backgroundColor: '#1e1b4b', borderRadius: 25, overflow: 'hidden' },
  chatInput: { paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendBtnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  // Winner Modal
  winnerModal: { width: '80%', borderRadius: 32, overflow: 'hidden' },
  winnerModalGradient: { padding: 28, alignItems: 'center', gap: 10 },
  trophyIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(251,191,36,0.1)', alignItems: 'center', justifyContent: 'center' },
  winnerModalTitle: { fontSize: 18, fontWeight: '900', color: '#fbbf24', letterSpacing: 3 },
  winnerModalName: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center' },
  winnerModalSubtext: { fontSize: 11, color: '#94a3b8', marginBottom: 6 },
  winnerModalBtn: { borderRadius: 25, overflow: 'hidden', marginTop: 6 },
  winnerModalBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, gap: 6 },
  winnerModalBtnText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  
  winnerEffectContainer: { position: 'absolute', top: 40, left: 0, right: 0, zIndex: 100, alignItems: 'center' },
  winnerEffectGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25 },
  winnerEffectText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
});