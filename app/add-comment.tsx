import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AddComment() {
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor: bg }]}> 
      <ThemedText type="title" style={{ color: text }}>添加评论</ThemedText>
      <ThemedText style={{ color: text, marginTop: 8 }}>这里将实现添加评论表单 ...</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
