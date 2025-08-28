import { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Animated, Image, ScrollView, Easing, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';

export default function Home() {
  const router = useRouter();

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const placeholder = useThemeColor({}, 'placeholder');
  const card = useThemeColor({}, 'card');

  // Wallet address (optional)
  const accountApi = (useAbstraxionAccount?.() as any) || {};
  const address: string | undefined = accountApi?.address || accountApi?.bech32Address || accountApi?.evmAddress;
  const masked = useMemo(() => (address ? `${address.slice(0,6)}...${address.slice(-4)}` : '0xAbC...1234'), [address]);

  // Header and hero animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroTranslate = useRef(new Animated.Value(12)).current;

  // Search bar focus and pulse animation
  const focus = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const onFocus = () => Animated.timing(focus, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  const onBlur = () => Animated.timing(focus, { toValue: 0, duration: 220, useNativeDriver: false }).start();
  const glowColor = focus.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.06)', 'rgba(0,255,136,0.16)'] });
  const borderColor = focus.interpolate({ inputRange: [0, 1], outputRange: [border, '#00FF88'] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.35] });

  // Hot mentors staggered animation
  const listAnim = useRef(new Animated.Value(0)).current; // 0..1

  // Search state and simple matcher
  const [query, setQuery] = useState('');
  const ALL = useMemo(
    () => [
      { id: 'zhang-laoshi', name: '张老师', subject: '计算机体系结构', school: '清华大学', tags: ['严谨','逻辑清晰'] },
      { id: 'li-jiaoshou', name: '李教授', subject: '人工智能导论', school: '北京大学', tags: ['项目驱动','互动多'] },
      { id: 'wang-boshi', name: '王博士', subject: '分布式系统', school: '上海交通大学', tags: ['案例丰富','考试偏难'] },
    ],
    []
  );

  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // 空查询，默认跳到热门第一名
      router.push(`/mentor/${ALL[0].id}`);
      return;
    }
    const scored = ALL.map((m) => {
      const hay = [m.name, m.subject, m.school, ...(m.tags || [])].join(' ').toLowerCase();
      const idx = hay.indexOf(q);
      let score = -1;
      if (idx === 0) score = 3; // 开头匹配优先
      else if (idx > 0) score = 2; // 包含
      else if (q.split(/\s+/).some((w) => w && hay.includes(w))) score = 1; // 拆词模糊
      return { m, score };
    })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length) {
      router.push(`/mentor/${scored[0].m.id}`);
    } else {
      Alert.alert('未找到匹配导师', '换个关键词试试：姓名/课程/学校');
    }
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerFade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 420, delay: 80, useNativeDriver: true }),
        Animated.timing(heroTranslate, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Pulsing search ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    ).start();

    // Stagger list reveal
    Animated.timing(listAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }).start();
  }, [headerFade, heroFade, heroTranslate, pulse, listAnim]);

  return (
    <View style={[styles.container, { backgroundColor: '#0A0A0A' }]}> 
      {/* Monochrome hacker background overlays */}
      <View style={styles.inkOverlay} />
      <View style={styles.inkBlob1} />
      <View style={styles.inkBlob2} />

      <View style={{ flex: 1 }}> 
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}> 
          <View style={styles.brandRow}>
            <Image source={require('../assets/images/dog-logo.jpg')} style={styles.logo} resizeMode="contain" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <View style={styles.brandTitleRow}>
                <ThemedText type="title" style={{ color: '#00FF88', letterSpacing: 1 }}>MentorX ✦ <ThemedText style={{ color: '#9BA1A6' }}>Xion Powered</ThemedText></ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarCircle}>
              <FontAwesome name="user" size={16} color="#EAEAEA" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Hero */}
        <Animated.View style={{ paddingHorizontal: 16, paddingTop: 6, opacity: heroFade, transform: [{ translateY: heroTranslate }], alignItems: 'center' }}>
          <ThemedText style={{ color: '#EAEAEA', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>🎓 找到最适合你的导师</ThemedText>
          <ThemedText style={{ color: '#CFCFCF', marginTop: 6, fontSize: 13, textAlign: 'center' }}>匿名 & 去中心化评价，真实可信</ThemedText>
        </Animated.View>

        {/* Search Section */}
        <View style={{ marginTop: 14 }}>
          <View style={styles.sectionDivider} />
          <View style={{ paddingHorizontal: 16, marginTop: -12, marginBottom: 8 }}>
            <ThemedText style={{ color: '#EAEAEA', fontSize: 16, fontWeight: '600' }}>🔍 搜索导师</ThemedText>
          </View>
          <Animated.View style={[styles.searchWrap, { backgroundColor: glowColor, borderColor, transform: [{ scale: ringScale }], opacity: ringOpacity }]}/>
          <Animated.View style={[styles.searchWrap, { backgroundColor: glowColor, borderColor }]}> 
            <Image source={require('../assets/images/dog-logo.jpg')} style={styles.searchIcon} />
            <TextInput
              placeholder="关键字/课程/院校"
              placeholderTextColor="#CFCFCF"
              style={[styles.searchInput]}
              selectionColor="rgba(0,255,136,0.3)"
              onFocus={onFocus}
              onBlur={onBlur}
              returnKeyType="search"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchGo}>
              <ThemedText style={styles.searchGoText}>Go</ThemedText>
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.sectionDivider} />
        </View>

        {/* Hot Mentors */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <ThemedText style={[styles.sectionTitle]}>🌟 热门导师榜</ThemedText>
          </View>
          {[
            { id: 'zhang-laoshi', rank: 1, name: '张老师', stars: 5, reviews: 128 },
            { id: 'li-jiaoshou', rank: 2, name: '李教授', stars: 4.5, reviews: 96 },
            { id: 'wang-boshi', rank: 3, name: '王博士', stars: 4.5, reviews: 75 },
          ].map((m, idx) => {
            const itemOpacity = listAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
            const itemTranslate = listAnim.interpolate({ inputRange: [0, 1], outputRange: [8 * (idx + 1), 0] });
            return (
              <TouchableOpacity key={m.rank} activeOpacity={0.85} onPress={() => router.push(`/mentor/${m.id}`)}>
                <Animated.View style={[styles.card, { backgroundColor: card, borderColor: 'rgba(255,255,255,0.1)', opacity: itemOpacity, transform: [{ translateY: itemTranslate }] }]}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.rankPill}><ThemedText style={styles.rankText}>#{m.rank}</ThemedText></View>
                      <ThemedText style={{ marginLeft: 8 }}>{m.name}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ThemedText style={{ color: '#FFD166', marginRight: 6 }}>{renderStars(m.stars)}</ThemedText>
                      <ThemedText style={{ color: '#9BA1A6' }}>{m.reviews} 条评价</ThemedText>
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Floating Add (+) button */}
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-comment')}>
          <ThemedText style={styles.fabText}>＋</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function renderStars(score: number) {
  const full = Math.floor(score);
  const half = score - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.95)' },
  inkBlob1: { position: 'absolute', top: -80, left: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.06)' },
  inkBlob2: { position: 'absolute', bottom: -60, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap' },
  logo: { width: 24, height: 24},
  rightHeader: { flexDirection: 'row', alignItems: 'center',marginLeft: -20 },
  addrPillUnderTitle: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)' },
  addrTextUnderTitle: { color: '#EAEAEA', marginLeft: 6, fontSize: 11, letterSpacing: 0.2 },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 32, height: 32 },

  searchWrap: {
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: { width: 20, height: 20, tintColor: '#CFCFCF', marginRight: 8 },
  searchInput: { flex: 1, height: 40, color: '#EAEAEA' },
  searchGo: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#00FF88' },
  searchGoText: { color: '#0A0A0A', fontSize: 12, fontWeight: '600' },

  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { marginHorizontal: 16, marginBottom: 8, color: '#EAEAEA', fontWeight: '600', fontSize: 16 },
  card: { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  rankPill: { backgroundColor: 'rgba(0,255,136,0.12)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  rankText: { color: '#00FF88', fontSize: 12 },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#000', marginTop: -2 },
});
