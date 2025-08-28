import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome, Feather } from '@expo/vector-icons';

// Types aligned with README.md data structure
export interface Review {
  id: string;
  author: string;
  date: string; // ISO string or YYYY/MM/DD
  content: string;
  likes: number;
  txHash?: string;
}

export interface MentorDetail {
  id: string;
  name: string;
  subject: string;
  school: string;
  tags: string[];
  rating: number; // e.g., 4.8
  ratingCount: number; // e.g., 128
  ratingDist: { // percentage distribution 0~100
    five: number; four: number; three: number; two: number; one: number;
  };
  reviews: Review[];
}

export default function MentorDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params?.id ?? 'zhang-laoshi';

  // mock data; in real app fetch by id
  const data: MentorDetail = useMemo(() => {
    const MOCKS: Record<string, MentorDetail> = {
      'zhang-laoshi': {
        id: 'zhang-laoshi',
        name: '张老师',
        subject: '计算机体系结构',
        school: '清华大学',
        tags: ['严谨', '逻辑清晰', '作业适中'],
        rating: 4.8,
        ratingCount: 128,
        ratingDist: { five: 85, four: 10, three: 3, two: 1, one: 1 },
        reviews: [
          { id: 'r1', author: '学生A', date: '2025/05/01', content: '讲义结构很清楚，考试难度中等。', likes: 24, txHash: '0xabc...123' },
          { id: 'r2', author: '学生B', date: '2025/04/25', content: '课堂互动多，但作业稍微偏多。', likes: 15, txHash: '0xdef...456' },
        ],
      },
      'li-jiaoshou': {
        id: 'li-jiaoshou',
        name: '李教授',
        subject: '人工智能导论',
        school: '北京大学',
        tags: ['互动多', '项目驱动', '作业偏多'],
        rating: 4.5,
        ratingCount: 96,
        ratingDist: { five: 70, four: 22, three: 6, two: 1, one: 1 },
        reviews: [
          { id: 'r1', author: '学生C', date: '2025/05/03', content: '课堂节奏快，项目很多但很有收获。', likes: 31, txHash: '0x111...aaa' },
          { id: 'r2', author: '学生D', date: '2025/04/20', content: '需要自学能力强，上课互动频繁。', likes: 12, txHash: '0x222...bbb' },
        ],
      },
      'wang-boshi': {
        id: 'wang-boshi',
        name: '王博士',
        subject: '分布式系统',
        school: '上海交通大学',
        tags: ['课件扎实', '考试偏难', '案例丰富'],
        rating: 4.6,
        ratingCount: 75,
        ratingDist: { five: 68, four: 24, three: 6, two: 1, one: 1 },
        reviews: [
          { id: 'r1', author: '学生E', date: '2025/05/10', content: '理论 + 实践结合，实验有挑战。', likes: 19, txHash: '0x333...ccc' },
          { id: 'r2', author: '学生F', date: '2025/04/18', content: '考试略难但很公平。', likes: 9, txHash: '0x444...ddd' },
        ],
      },
    };

    return MOCKS[id] ?? MOCKS['zhang-laoshi'];
  }, [id]);

  const [draft, setDraft] = useState('');
  const [stars, setStars] = useState(1);
  const pulse = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] });

  const onSubmit = () => {
    // TODO: hook on-chain submit
    router.push({ pathname: '/add-comment', params: { id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0A0A0A' }]}> 
      <View style={styles.inkOverlay} />
      <View style={styles.inkBlob1} />
      <View style={styles.inkBlob2} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="#EAEAEA" />
          </TouchableOpacity>
          <ThemedText style={styles.topTitle}>{data.name} · {data.subject}</ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {/* Card: Summary */}
        <View style={[styles.card, { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' }]}> 
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FontAwesome key={i} name={i < Math.floor(data.rating) ? 'star' : 'star-o'} size={16} color="#FFD166" style={{ marginRight: 2 }} />
              ))}
              <ThemedText style={{ color: '#EAEAEA', marginLeft: 8, fontWeight: '600' }}>{data.rating.toFixed(1)}</ThemedText>
              <ThemedText style={{ color: '#9BA1A6', marginLeft: 6 }}>({data.ratingCount} 评价)</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="link" size={14} color="#9BA1A6" />
              <ThemedText style={{ color: '#9BA1A6', marginLeft: 6 }}>on-chain</ThemedText>
            </View>
          </View>

          <View style={styles.row}> 
            <ThemedText style={styles.metaKey}>学校</ThemedText>
            <ThemedText style={styles.metaVal}>{data.school}</ThemedText>
          </View>
          <View style={styles.row}> 
            <ThemedText style={styles.metaKey}>学科</ThemedText>
            <ThemedText style={styles.metaVal}>{data.subject}</ThemedText>
          </View>
          <View style={[styles.row, { alignItems: 'flex-start' }]}> 
            <ThemedText style={styles.metaKey}>标签</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
              {data.tags.map((t, idx) => (
                <View key={t + idx} style={styles.tagPill}><ThemedText style={styles.tagText}>{t}</ThemedText></View>
              ))}
            </View>
          </View>
        </View>

        {/* Rating Distribution */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <ThemedText style={styles.sectionTitle}>📊 评分分布</ThemedText>
          {(
            [
              { label: '★★★★★', value: data.ratingDist.five, key: 'five' },
              { label: '★★★★☆', value: data.ratingDist.four, key: 'four' },
              { label: '★★★☆☆', value: data.ratingDist.three, key: 'three' },
              { label: '★★☆☆☆', value: data.ratingDist.two, key: 'two' },
              { label: '★☆☆☆☆', value: data.ratingDist.one, key: 'one' },
            ] as const
          ).map((row) => (
            <View key={row.key} style={styles.distRow}>
              <ThemedText style={styles.distLabel}>{row.label}</ThemedText>
              <View style={styles.distBarBg}>
                <View style={[styles.distBarFill, { width: `${row.value}%` }]} />
              </View>
              <ThemedText style={styles.distPct}>{row.value}%</ThemedText>
            </View>
          ))}
        </View>

        {/* Latest Reviews */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <ThemedText style={styles.sectionTitle}>📝 最新评价（链上可查）</ThemedText>
          <View style={styles.sectionDivider} />
          {data.reviews.map(r => (
            <View key={r.id} style={[styles.card, { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', marginTop: 12 }]}> 
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={{ color: '#EAEAEA', fontWeight: '600' }}>👤 {r.author}</ThemedText>
                <ThemedText style={{ color: '#9BA1A6' }}>{r.date}</ThemedText>
              </View>
              <ThemedText style={{ color: '#CFCFCF', marginTop: 8 }}>
                “{r.content}”
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity style={styles.likeBtn} activeOpacity={0.7}>
                  <Feather name="thumbs-up" size={14} color="#00FF88" />
                  <ThemedText style={{ color: '#00FF88', marginLeft: 6 }}> {r.likes}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                  <Feather name="external-link" size={14} color="#9BA1A6" />
                  <ThemedText style={{ color: '#9BA1A6', marginLeft: 6 }}>TxHash➡</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={{ alignSelf: 'center', marginTop: 12 }} onPress={() => router.push({ pathname: '/mentor', params: { id } })}>
            <ThemedText style={{ color: '#EAEAEA' }}>[ 查看全部评价 ➜ ]</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Write a review */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <ThemedText style={styles.sectionTitle}>💬 写下你的评价</ThemedText>
          <View style={styles.sectionDivider} />
          <View style={[styles.card, { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', marginTop: 12 }]}> 
            <TextInput
              placeholder="✍️ 体验、建议…"
              placeholderTextColor="#9BA1A6"
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              multiline
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={{ color: '#9BA1A6', marginRight: 8 }}>评分:</ThemedText>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setStars(i + 1)} style={{ marginRight: 4 }}>
                    <FontAwesome name={i < stars ? 'star' : 'star-o'} size={18} color="#FFD166" />
                  </TouchableOpacity>
                ))}
              </View>
              <Animated.View style={[styles.submitBtnPulse, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
              <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={onSubmit}>
                <Feather name="link" size={14} color="#0A0A0A" />
                <ThemedText style={styles.submitBtnText}>上传到链上</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.95)' },
  inkBlob1: { position: 'absolute', top: -80, left: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.06)' },
  inkBlob2: { position: 'absolute', bottom: -60, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)' },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6, justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#EAEAEA', fontSize: 16, fontWeight: '600' },

  sectionTitle: { color: '#EAEAEA', fontWeight: '600', fontSize: 16 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8 },

  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  metaKey: { color: '#9BA1A6', width: 52 },
  metaVal: { color: '#EAEAEA', flex: 1 },
  tagPill: { backgroundColor: 'rgba(0,255,136,0.12)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8, marginBottom: 8 },
  tagText: { color: '#00FF88', fontSize: 12 },

  distRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  distLabel: { color: '#CFCFCF', width: 64, fontSize: 12 },
  distBarBg: { flex: 1, height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  distBarFill: { height: 8, backgroundColor: '#00FF88' },
  distPct: { color: '#9BA1A6', marginLeft: 8, width: 40, textAlign: 'right', fontSize: 12 },

  likeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,255,136,0.08)' },

  input: { minHeight: 80, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 12, color: '#EAEAEA' },
  submitBtnPulse: { position: 'absolute', right: 28, width: 44, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,255,136,0.25)' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00FF88', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  submitBtnText: { color: '#0A0A0A', marginLeft: 6, fontWeight: '700' },
});
