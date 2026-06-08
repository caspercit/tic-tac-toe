import React, { useContext, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { GameContext } from '../context/GameContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

function StatsScreen() {
  const { stats } = useContext(GameContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const statCards = [
    { label: 'Total Games', value: stats.gamesPlayed, icon: 'game-controller', color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
    { label: 'X Wins', value: stats.xWins, icon: 'close', color: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
    { label: 'O Wins', value: stats.oWins, icon: 'radio-button-off', color: '#10b981', gradient: ['#10b981', '#059669'] },
    { label: 'Draws', value: stats.draws, icon: 'albums', color: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
    { label: 'Total Moves', value: stats.totalMoves, icon: 'footsteps', color: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] },
    { label: 'Best Streak', value: stats.bestStreak, icon: 'flame', color: '#ec4899', gradient: ['#ec4899', '#db2777'] },
  ];

  return (
    <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={styles.bgGradient}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.statsContainer} contentContainerStyle={styles.statsContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headerPremium, { opacity: fadeAnim }]}>
          <View style={styles.headerGlow} />
          <LinearGradient
            colors={['#38bdf8', '#818cf8', '#c084fc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIconCircle}
          >
            <Ionicons name="stats-chart" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.statsTitle}>STATISTICS</Text>
          <View style={styles.statsBadge}>
            <Text style={styles.statsBadgeText}>LIFETIME</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          {statCards.map((stat, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={[`${stat.color}15`, `${stat.color}05`]}
                style={styles.statCardGradient}
              >
                <View style={[styles.statIconWrapper, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon} size={28} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.statProgress, { backgroundColor: `${stat.color}30` }]}>
                  <View style={[styles.statProgressFill, { width: `${Math.min(100, stat.value * 2)}%`, backgroundColor: stat.color }]} />
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </Animated.View>

        <View style={styles.statsFooter}>
          <Text style={styles.statsFooterText}>★ ELITE PLAYER ★</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function SettingsScreen() {
  const { resetGame, resetScore, resetStats } = useContext(GameContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const settingsOptions = [
    { 
      title: 'Reset Score', 
      icon: 'refresh-circle', 
      color: '#f59e0b',
      gradient: ['#f59e0b', '#d97706'],
      action: resetScore,
      description: 'Reset current game score',
      warning: false
    },
    { 
      title: 'Reset Stats & History', 
      icon: 'trash-bin', 
      color: '#ef4444',
      gradient: ['#ef4444', '#dc2626'],
      action: resetStats,
      description: 'Clear all statistics and history',
      warning: true
    },
    { 
      title: 'Reset All', 
      icon: 'warning', 
      color: '#dc2626',
      gradient: ['#dc2626', '#b91c1c'],
      action: resetGame,
      description: 'Complete reset of everything',
      warning: true
    },
  ];

  return (
    <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={styles.bgGradient}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.settingsContainer} contentContainerStyle={styles.settingsContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headerPremium, { opacity: fadeAnim }]}>
          <View style={styles.headerGlow} />
          <LinearGradient
            colors={['#f472b6', '#ec4899', '#be185d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIconCircle}
          >
            <Ionicons name="settings-sharp" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.statsTitle}>SETTINGS</Text>
          <View style={styles.statsBadge}>
            <Text style={styles.statsBadgeText}>PREFERENCES</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.settingsList, { opacity: fadeAnim }]}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.settingsCard}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[`${option.color}15`, `${option.color}05`]}
                style={styles.settingsCardGradient}
              >
                <View style={[styles.settingsIcon, { backgroundColor: `${option.color}20` }]}>
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsTitle}>{option.title}</Text>
                  <Text style={styles.settingsDescription}>{option.description}</Text>
                </View>
                {option.warning ? (
                  <View style={styles.warningBadge}>
                    <Ionicons name="alert-triangle" size={14} color="#ef4444" />
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={20} color="#475569" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={styles.versionCard}>
          <LinearGradient
            colors={['rgba(56,189,248,0.1)', 'rgba(56,189,248,0.05)']}
            style={styles.versionGradient}
          >
            <Ionicons name="cube" size={20} color="#38bdf8" />
            <Text style={styles.versionText}>Tic Tac Toe Elite v3.0</Text>
            <View style={styles.versionDot} />
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.customTabBar, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0f172acc', '#0f172a', '#0f172a', '#0f172a']}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBarBlur} />
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'game-controller';
          let label = '';
          
          if (route.name === 'Juego') {
            iconName = isFocused ? 'game-controller' : 'game-controller-outline';
            label = 'PLAY';
          } else if (route.name === 'Estadisticas') {
            iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
            label = 'STATS';
          } else if (route.name === 'Historial') {
            iconName = isFocused ? 'time' : 'time-outline';
            label = 'HISTORY';
          } else if (route.name === 'Configuracion') {
            iconName = isFocused ? 'settings' : 'settings-outline';
            label = 'SETTINGS';
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {isFocused && (
                <Animated.View style={[styles.tabGlow, { backgroundColor: '#38bdf8' }]} />
              )}
              <View style={[styles.tabIconWrapper, isFocused && styles.tabIconFocused]}>
                <Ionicons
                  name={iconName}
                  size={isFocused ? 24 : 22}
                  color={isFocused ? '#38bdf8' : '#64748b'}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </Animated.View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Juego" component={HomeScreen} />
      <Tab.Screen name="Estadisticas" component={StatsScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Configuracion" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bgGradient: {
    flex: 1,
  },
  
  // Common Header
  headerPremium: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    top: 40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(56,189,248,0.15)',
    shadowColor: '#38bdf8',
    shadowRadius: 50,
    shadowOpacity: 0.5,
  },
  headerIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#38bdf8',
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  statsTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: 'rgba(56,189,248,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  statsBadge: {
    backgroundColor: 'rgba(56,189,248,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
  },
  statsBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  // Stats Screen
  statsContainer: {
    flex: 1,
  },
  statsContent: {
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.1)',
    borderRadius: 24,
  },
  statIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statProgress: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsFooter: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 20,
  },
  statsFooterText: {
    color: '#334155',
    fontSize: 10,
    letterSpacing: 2,
  },
  
  // Settings Screen
  settingsContainer: {
    flex: 1,
  },
  settingsContent: {
    paddingBottom: 40,
  },
  settingsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  settingsCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingsCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.1)',
    borderRadius: 20,
  },
  settingsIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingsDescription: {
    color: '#64748b',
    fontSize: 11,
  },
  warningBadge: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  versionCard: {
    marginTop: 30,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  versionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.1)',
    borderRadius: 16,
  },
  versionText: {
    color: '#475569',
    fontSize: 11,
    letterSpacing: 1,
  },
  versionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38bdf8',
  },
  
  // Custom Tab Bar
  customTabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarGradient: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabGlow: {
    position: 'absolute',
    top: -2,
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  tabIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIconFocused: {
    backgroundColor: 'rgba(56,189,248,0.15)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  tabLabelFocused: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});