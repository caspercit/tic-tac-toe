import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GameContext } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

export default function HistoryScreen() {
    const { history } = useContext(GameContext);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getWinnerIcon = (result) => {
        if (result === 'X') return { icon: 'close', color: '#ef4444', gradient: ['#ef4444', '#dc2626'] };
        if (result === 'O') return { icon: 'radio-button-off', color: '#10b981', gradient: ['#10b981', '#059669'] };
        if (result === 'Draw') return { icon: 'albums', color: '#f59e0b', gradient: ['#f59e0b', '#d97706'] };
        return { icon: 'trophy', color: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha desconocida';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) {
                return `Hoy, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else if (days === 1) {
                return `Ayer, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else if (days < 7) {
                return `Hace ${days} días`;
            }
            
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getWinnerName = (result, winnerName) => {
        if (winnerName && winnerName !== 'unknown') return winnerName;
        if (result === 'X') return 'PLAYER X';
        if (result === 'O') return 'PLAYER O';
        if (result === 'Draw') return 'DRAW';
        return result;
    };

    const getModeIcon = (mode) => {
        switch(mode?.toLowerCase()) {
            case 'bot': return { icon: 'hardware-chip', color: '#3b82f6' };
            case 'online': return { icon: 'globe', color: '#10b981' };
            default: return { icon: 'people', color: '#ec4899' };
        }
    };

    return (
        <LinearGradient
            colors={['#020617', '#0f172a', '#1e1b4b']}
            style={styles.bgGradient}
        >
            <View style={styles.screen}>
                {/* Header Premium */}
                <Animated.View style={[styles.headerPremium, { opacity: fadeAnim }]}>
                    <View style={styles.headerGlow} />
                    <LinearGradient
                        colors={['#38bdf8', '#818cf8', '#c084fc']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerIconCircle}
                    >
                        <Ionicons name="time" size={40} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.title}>HISTORY</Text>
                    <View style={styles.statsBadge}>
                        <Text style={styles.statsBadgeText}>
                            {history.length} {history.length === 1 ? 'GAME' : 'GAMES'}
                        </Text>
                    </View>
                </Animated.View>

                {history.length === 0 ? (
                    <Animated.View 
                        style={[
                            styles.emptyContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={styles.emptyIconWrapper}>
                            <LinearGradient
                                colors={['rgba(56,189,248,0.1)', 'rgba(56,189,248,0.05)']}
                                style={styles.emptyIconContainer}
                            >
                                <Ionicons name="document-text-outline" size={80} color="#334155" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.emptyText}>No Games Yet</Text>
                        <Text style={styles.emptySubtext}>Play your first game to see your history</Text>
                        <View style={styles.emptyDecoration}>
                            <View style={styles.emptyDot} />
                            <View style={styles.emptyLine} />
                            <View style={styles.emptyDot} />
                        </View>
                    </Animated.View>
                ) : (
                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {history.map((item, index) => {
                            const winnerInfo = getWinnerIcon(item.result);
                            const winnerDisplay = getWinnerName(item.result, item.winnerName);
                            const isDraw = item.result === 'Draw';
                            const modeInfo = getModeIcon(item.mode);
                            
                            return (
                                <Animated.View
                                    key={item.id || index}
                                    style={[
                                        styles.cardWrapper,
                                        {
                                            opacity: fadeAnim,
                                            transform: [{
                                                translateX: fadeAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [index % 2 === 0 ? -50 : 50, 0],
                                                })
                                            }]
                                        }
                                    ]}
                                >
                                    <TouchableOpacity 
                                        activeOpacity={0.7}
                                        style={styles.card}
                                    >
                                        <LinearGradient
                                            colors={[`${winnerInfo.color}15`, `${winnerInfo.color}05`]}
                                            style={styles.cardGradient}
                                        >
                                            {/* Card Header */}
                                            <View style={styles.cardHeader}>
                                                <View style={styles.matchInfo}>
                                                    <LinearGradient
                                                        colors={isDraw ? ['#f59e0b', '#d97706'] : winnerInfo.gradient}
                                                        style={styles.matchNumber}
                                                    >
                                                        <Text style={styles.matchNumberText}>#{history.length - index}</Text>
                                                    </LinearGradient>
                                                    <View style={styles.matchDate}>
                                                        <Ionicons name="calendar" size={10} color="#64748b" />
                                                        <Text style={styles.matchDateText}>
                                                            {formatDate(item.date || item.timestamp)}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <LinearGradient
                                                    colors={isDraw ? ['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)'] : [`${winnerInfo.color}20`, `${winnerInfo.color}05`]}
                                                    style={[styles.winnerBadge, isDraw && styles.drawBadge]}
                                                >
                                                    <Ionicons 
                                                        name={winnerInfo.icon} 
                                                        size={14} 
                                                        color={isDraw ? '#f59e0b' : winnerInfo.color} 
                                                    />
                                                    <Text style={[styles.winnerText, isDraw && styles.drawText]}>
                                                        {winnerDisplay}
                                                    </Text>
                                                </LinearGradient>
                                            </View>

                                            {/* Card Body */}
                                            <View style={styles.cardBody}>
                                                <View style={styles.statsGrid}>
                                                    <View style={styles.statItem}>
                                                        <View style={[styles.statIconBg, { backgroundColor: `${modeInfo.color}20` }]}>
                                                            <Ionicons name={modeInfo.icon} size={18} color={modeInfo.color} />
                                                        </View>
                                                        <Text style={styles.statLabel}>MODE</Text>
                                                        <Text style={styles.statValue}>{item.mode?.toUpperCase() || 'LOCAL'}</Text>
                                                    </View>
                                                    
                                                    <View style={styles.statDivider} />
                                                    
                                                    <View style={styles.statItem}>
                                                        <View style={[styles.statIconBg, { backgroundColor: '#8b5cf620' }]}>
                                                            <Ionicons name="repeat" size={18} color="#8b5cf6" />
                                                        </View>
                                                        <Text style={styles.statLabel}>ROUND</Text>
                                                        <Text style={styles.statValue}>{item.round || 1}</Text>
                                                    </View>
                                                    
                                                    <View style={styles.statDivider} />
                                                    
                                                    <View style={styles.statItem}>
                                                        <View style={[styles.statIconBg, { backgroundColor: '#10b98120' }]}>
                                                            <Ionicons name="footsteps" size={18} color="#10b981" />
                                                        </View>
                                                        <Text style={styles.statLabel}>MOVES</Text>
                                                        <Text style={styles.statValue}>{item.moves || 0}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Card Footer with Performance Indicator */}
                                            <View style={styles.cardFooter}>
                                                <View style={styles.performanceBar}>
                                                    <View style={[styles.performanceFill, { width: `${Math.min(100, ((item.moves || 0) / 20) * 100)}%`, backgroundColor: winnerInfo.color }]} />
                                                </View>
                                                <Text style={styles.performanceText}>
                                                    {item.moves <= 5 ? '⚡ PERFECT' : item.moves <= 9 ? '✨ GOOD' : '📊 AVERAGE'}
                                                </Text>
                                            </View>

                                            {/* Decorative elements */}
                                            <View style={[styles.cardAccent, isDraw && styles.drawAccent]} />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                        
                        {/* Footer with total stats */}
                        <View style={styles.historyFooter}>
                            <LinearGradient
                                colors={['rgba(56,189,248,0.1)', 'rgba(56,189,248,0.05)']}
                                style={styles.footerGradient}
                            >
                                <Text style={styles.footerText}>TOTAL GAMES: {history.length}</Text>
                                <View style={styles.footerDot} />
                                <Text style={styles.footerText}>★ LEGENDARY ★</Text>
                            </LinearGradient>
                        </View>
                        
                        <View style={styles.bottomPadding} />
                    </ScrollView>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    bgGradient: {
        flex: 1,
    },
    screen: {
        flex: 1,
    },
    
    // Header Premium Styles
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
    title: {
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
    
    // Scroll View
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconWrapper: {
        marginBottom: 24,
    },
    emptyIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.2)',
    },
    emptyText: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1,
    },
    emptySubtext: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
    },
    emptyDecoration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
    },
    emptyDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#38bdf8',
    },
    emptyLine: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(56,189,248,0.3)',
    },
    
    // Card Styles
    cardWrapper: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cardGradient: {
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.1)',
        borderRadius: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(56,189,248,0.1)',
    },
    matchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    matchNumber: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    matchNumberText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    matchDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    matchDateText: {
        color: '#64748b',
        fontSize: 10,
    },
    winnerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    drawBadge: {
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
    },
    winnerText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    drawText: {
        color: '#f59e0b',
    },
    cardBody: {
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
    },
    statValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(56,189,248,0.1)',
    },
    cardFooter: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    performanceBar: {
        height: 3,
        backgroundColor: 'rgba(56,189,248,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    performanceFill: {
        height: '100%',
        borderRadius: 2,
    },
    performanceText: {
        color: '#475569',
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 1,
        textAlign: 'center',
    },
    cardAccent: {
        height: 3,
        width: '100%',
        backgroundColor: '#ef4444',
    },
    drawAccent: {
        backgroundColor: '#f59e0b',
    },
    
    // History Footer
    historyFooter: {
        marginTop: 20,
        marginBottom: 10,
        borderRadius: 16,
        overflow: 'hidden',
    },
    footerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.1)',
        borderRadius: 16,
    },
    footerText: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    footerDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#38bdf8',
    },
    bottomPadding: {
        height: 30,
    },
});