import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import { GameContext } from '../context/GameContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function NeonScreen({ children }) {
  return (
    <LinearGradient colors={['#020617', '#111827', '#1e1b4b']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

function StatsScreen() {
  const { stats, score, round, suddenDeath, seriesWinner } = useContext(GameContext);

  return (
    <NeonScreen>
      <Text style={styles.title}>🏆 ESTADÍSTICAS</Text>

      <View style={styles.card}>
        <Text style={styles.stat}>Partidas jugadas: {stats.gamesPlayed}</Text>
        <Text style={styles.stat}>Victorias X: {stats.xWins}</Text>
        <Text style={styles.stat}>Victorias O: {stats.oWins}</Text>
        <Text style={styles.stat}>Empates: {stats.draws}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Serie actual</Text>
        <Text style={styles.stat}>Ronda: {round}</Text>
        <Text style={styles.stat}>Jugador X: {score.player1}</Text>
        <Text style={styles.stat}>Jugador O: {score.player2}</Text>
        <Text style={styles.stat}>Empates: {score.draws}</Text>
        <Text style={styles.stat}>Muerte súbita: {suddenDeath ? 'Activada ⚡' : 'No'}</Text>
        <Text style={styles.stat}>Ganador: {seriesWinner || 'Aún no hay'}</Text>
      </View>
    </NeonScreen>
  );
}

function HistoryScreen() {
  const { history } = useContext(GameContext);

  return (
    <NeonScreen>
      <Text style={styles.title}>📜 HISTORIAL</Text>

      {history.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.text}>Todavía no hay partidas registradas.</Text>
        </View>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.historyTitle}>Ronda {item.round}</Text>
            <Text style={styles.text}>Resultado: {item.resultText}</Text>
            <Text style={styles.text}>Modo: {item.mode}</Text>
          </View>
        ))
      )}
    </NeonScreen>
  );
}

function SettingsScreen() {
  const { resetGame, resetScore, resetStats, botDifficulty, setBotDifficulty } =
    useContext(GameContext);

  return (
    <NeonScreen>
      <Text style={styles.title}>⚙️ CONFIGURACIÓN</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Dificultad del bot</Text>

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
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Opciones</Text>

        <TouchableOpacity style={styles.button} onPress={resetScore}>
          <Text style={styles.buttonText}>Reiniciar marcador</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={resetStats}>
          <Text style={styles.buttonText}>Reiniciar estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={resetGame}>
          <Text style={styles.buttonText}>Reiniciar todo</Text>
        </TouchableOpacity>
      </View>
    </NeonScreen>
  );
}

function AboutScreen() {
  return (
    <NeonScreen>
      <Text style={styles.title}>ℹ️ ACERCA DE</Text>

      <View style={styles.card}>
        <Text style={styles.text}>🎮 Tic Tac Toe Pro</Text>
        <Text style={styles.text}>Proyecto hecho con React Native y Expo.</Text>
        <Text style={styles.text}>
          Incluye modo local, bot, online, marcador, historial, estadísticas,
          dificultad del bot y muerte súbita.
        </Text>
      </View>
    </NeonScreen>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#020617',
          borderTopWidth: 2,
          borderTopColor: '#22d3ee',
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
        },
      }}
    >
      <Tab.Screen name="Juego" component={HomeScreen} options={{
        tabBarLabel: 'Jugar',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🎮</Text>,
      }} />

      <Tab.Screen name="Estadisticas" component={StatsScreen} options={{
        tabBarLabel: 'Stats',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🏆</Text>,
      }} />

      <Tab.Screen name="Historial" component={HistoryScreen} options={{
        tabBarLabel: 'Historial',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📜</Text>,
      }} />

      <Tab.Screen name="Configuracion" component={SettingsScreen} options={{
        tabBarLabel: 'Config',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>⚙️</Text>,
      }} />

      <Tab.Screen name="Acerca" component={AboutScreen} options={{
        tabBarLabel: 'Info',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>ℹ️</Text>,
      }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
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
  title: {
    color: '#e0f2fe',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 25,
    textAlign: 'center',
    textShadowColor: '#22d3ee',
    textShadowRadius: 18,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: '#22d3ee',
    marginBottom: 18,
  },
  stat: {
    color: '#e2e8f0',
    fontSize: 17,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  historyItem: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: '#fb7185',
    marginBottom: 12,
  },
  historyTitle: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontWeight: '900',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22d3ee',
  },
  dangerButton: {
    backgroundColor: '#be123c',
    padding: 14,
    borderRadius: 14,
    marginTop: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fb7185',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
});