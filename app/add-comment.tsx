import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';

type MentorLite = { id: string; name: string; subject: string; link?: string };
type MyReview = { id: string; date: string; content: string; stars: number; txHash?: string };

export default function AddComment() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');

  // Mentors: selectable and addable
  const initialMentors: MentorLite[] = useMemo(
    () => [
      { id: 'zhang-laoshi', name: '张老师', subject: '计算机体系', link: 'https://www.tsinghua.edu.cn/' },
      { id: 'li-jiaoshou', name: '李教授', subject: '人工智能导论', link: 'https://www.pku.edu.cn/' },
      { id: 'wang-boshi', name: '王博士', subject: '分布式系统', link: 'https://www.sjtu.edu.cn/' },
    ],
    []
  );
  const [mentors, setMentors] = useState<MentorLite[]>(initialMentors);
  const [selectedId, setSelectedId] = useState<string>(params?.id && mentors.some(m => m.id === params.id) ? String(params.id) : mentors[0].id);
  const selected = mentors.find(m => m.id === selectedId)!;

  // Add mentor UI
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newLink, setNewLink] = useState('');

  // Review form
  const [stars, setStars] = useState(4);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(true);

  // Local review management
  const [myReviews, setMyReviews] = useState<MyReview[]>([
    { id: 'me1', date: '2025/05/01', content: '讲课逻辑清晰，助教反馈及时。', stars: 4, txHash: '0xabc...111' },
    { id: 'me2', date: '2025/04/20', content: '课堂互动性很强。', stars: 5, txHash: '0xdef...222' },
  ]);

  const addMentor = () => {
    const nm = newName.trim();
    const ns = newSubject.trim() || '通识课程';
    const nl = newLink.trim();
    if (!nm) {
      Alert.alert('请输入导师姓名');
      return;
    }
    if (!/^https?:\/\//i.test(nl)) {
      Alert.alert('请填写导师的主页/学校官网链接', '示例：https://university.edu/xxx');
      return;
    }
    const slug = slugify(`${nm}-${ns}`);
    if (mentors.some(m => m.id === slug)) {
      Alert.alert('该导师已存在');
      return;
    }
    const m: MentorLite = { id: slug, name: nm, subject: ns, link: nl };
    const next = [...mentors, m];
    setMentors(next);
    setSelectedId(m.id);
    setAdding(false);
    setNewName('');
    setNewSubject('');
    setNewLink('');
  };

  const onSubmit = () => {
    if (!content.trim()) {
      Alert.alert('请填写文字评价');
      return;
    }
    // Mock on-chain submit
    const tx = `0x${Math.random().toString(16).slice(2,5)}...${Math.random().toString(16).slice(2,5)}`;
    const now = new Date();
    const date = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
    setMyReviews(prev => [{ id: `${Date.now()}`, date, content: content.trim(), stars, txHash: tx }, ...prev]);
    Alert.alert('已提交', anonymous ? '已匿名上链存证' : '已上链存证');
    // 跳转到导师详情
    router.push(`/mentor/${selected.id}`);
  };

  const removeLocal = (id: string) => {
    setMyReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0A0A0A' }]}> 
      <View style={styles.inkOverlay} />
      <View style={styles.inkBlob1} />
      <View style={styles.inkBlob2} />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={20} color="#EAEAEA" />
          <ThemedText style={{ color: '#EAEAEA', marginLeft: 4 }}>返回</ThemedText>
        </TouchableOpacity>
        <ThemedText style={{ color: '#EAEAEA', fontWeight: '700' }}>发布评价 ✍️</ThemedText>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Mentor select */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <ThemedText style={styles.sectionTitle}>🧑‍🎓 评价导师：<ThemedText style={{ color: '#00FF88' }}>{selected.name}</ThemedText>（{selected.subject}）</ThemedText>
          {selected.link ? (
            <TouchableOpacity onPress={() => Linking.openURL(selected.link!)} style={{ alignSelf: 'flex-start', marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="external-link" size={14} color="#9BA1A6" />
              <ThemedText style={{ color: '#9BA1A6', marginLeft: 6 }}>主页/官网</ThemedText>
            </TouchableOpacity>
          ) : null}
          <View style={styles.row}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mentors.map(m => (
                <TouchableOpacity key={m.id} onPress={() => setSelectedId(m.id)} style={[styles.pill, selected.id === m.id && styles.pillActive]}>
                  <ThemedText style={[styles.pillText, selected.id === m.id && styles.pillTextActive]}>{m.name} · {m.subject}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {!adding ? (
            <TouchableOpacity onPress={() => setAdding(true)} style={styles.addBtn}>
              <Feather name="plus" size={14} color="#00FF88" />
              <ThemedText style={{ color: '#00FF88', marginLeft: 6 }}>添加导师</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={[styles.card, { marginTop: 10 }]}> 
              <ThemedText style={{ color: '#9BA1A6' }}>新导师</ThemedText>
              <TextInput
                placeholder="导师姓名"
                placeholderTextColor="#9BA1A6"
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                placeholder="课程/学科"
                placeholderTextColor="#9BA1A6"
                style={[styles.input, { marginTop: 8 }]}
                value={newSubject}
                onChangeText={setNewSubject}
              />
              <TextInput
                placeholder="主页/学校官网简介链接（https://）"
                placeholderTextColor="#9BA1A6"
                autoCapitalize="none"
                keyboardType="url"
                style={[styles.input, { marginTop: 8 }]}
                value={newLink}
                onChangeText={setNewLink}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                <TouchableOpacity onPress={() => { setAdding(false); setNewName(''); setNewSubject(''); }} style={[styles.smallBtn, { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1 }]}> 
                  <ThemedText style={{ color: '#CFCFCF' }}>取消</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={addMentor} style={[styles.smallBtn, { backgroundColor: '#00FF88', marginLeft: 8 }]}> 
                  <ThemedText style={{ color: '#0A0A0A', fontWeight: '700' }}>添加</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Stars */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <ThemedText style={styles.sectionTitle}>⭐ 评分选择：</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {[1,2,3,4,5].map(s => (
              <TouchableOpacity key={s} onPress={() => setStars(s)} style={[styles.starBtn, stars === s && styles.starBtnActive]}>
                <ThemedText style={[styles.starText, stars === s && styles.starTextActive]}>{starString(s)}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <ThemedText style={styles.sectionTitle}>💬 文字评价：</ThemedText>
          <View style={[styles.textBox]}> 
            <TextInput
              multiline
              placeholder="课堂氛围很好，作业量适中，对论文辅导也很有帮助。"
              placeholderTextColor="#9BA1A6"
              style={styles.textArea}
              value={content}
              onChangeText={setContent}
            />
          </View>
        </View>

        {/* Options */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={[styles.cardRow]}> 
            <ThemedText style={{ color: '#EAEAEA' }}>🔒 匿名开关：</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch value={anonymous} onValueChange={setAnonymous} thumbColor={anonymous ? '#00FF88' : '#CFCFCF'} trackColor={{ true: 'rgba(0,255,136,0.4)', false: 'rgba(255,255,255,0.2)' }} />
              <ThemedText style={{ color: '#9BA1A6', marginLeft: 8 }}>{anonymous ? '✓ 匿名发布' : '实名'}</ThemedText>
            </View>
          </View>
          <View style={[styles.cardRow, { marginTop: 10 }]}> 
            <ThemedText style={{ color: '#EAEAEA' }}>⛓ 存证方式：</ThemedText>
            <View style={styles.chainPill}><ThemedText style={{ color: '#0A0A0A', fontWeight: '700' }}>上链存储 ✔</ThemedText></View>
          </View>
        </View>

        {/* Submit */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={onSubmit}>
            <Feather name="upload" size={16} color="#0A0A0A" />
            <ThemedText style={styles.submitText}>提交评价并上链</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 20, marginHorizontal: 16 }} />

        {/* My reviews */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <ThemedText style={styles.sectionTitle}>📂 我的评价管理</ThemedText>
          {myReviews.map(r => (
            <View key={r.id} style={[styles.card, { marginTop: 10 }]}> 
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ color: '#EAEAEA' }}>👤 你 · {r.date}</ThemedText>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="external-link" size={14} color="#9BA1A6" />
                  <ThemedText style={{ color: '#9BA1A6', marginLeft: 6 }}>TxHash➡</ThemedText>
                </TouchableOpacity>
              </View>
              <ThemedText style={{ color: '#CFCFCF', marginTop: 8 }}>“{r.content}”</ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'space-between' }}>
                <ThemedText style={{ color: '#FFD166' }}>评分: {starString(r.stars)}</ThemedText>
                <TouchableOpacity onPress={() => removeLocal(r.id)}>
                  <ThemedText style={{ color: '#FF6B6B' }}>❌ 删除本地缓存</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function starString(s: number) {
  return '★'.repeat(s) + '☆'.repeat(5 - s);
}

function slugify(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.95)' },
  inkBlob1: { position: 'absolute', top: -80, left: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.06)' },
  inkBlob2: { position: 'absolute', bottom: -60, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },

  sectionTitle: { color: '#EAEAEA', fontWeight: '600', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },

  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pillActive: { backgroundColor: 'rgba(0,255,136,0.18)', borderColor: 'rgba(0,255,136,0.6)' },
  pillText: { color: '#CFCFCF', fontSize: 12 },
  pillTextActive: { color: '#00FF88', fontWeight: '700' },
  addBtn: { alignSelf: 'flex-start', marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(0,255,136,0.1)' },

  card: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 12 },
  cardRow: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  input: { marginTop: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 10, color: '#EAEAEA' },
  textBox: { borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  textArea: { minHeight: 120, color: '#EAEAEA' },

  starBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8, marginBottom: 8 },
  starBtnActive: { backgroundColor: 'rgba(0,255,136,0.18)', borderColor: '#00FF88' },
  starText: { color: '#CFCFCF' },
  starTextActive: { color: '#00FF88', fontWeight: '700' },

  chainPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#00FF88' },

  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00FF88', paddingVertical: 12, borderRadius: 12 },
  submitText: { color: '#0A0A0A', marginLeft: 8, fontWeight: '700' },
});
