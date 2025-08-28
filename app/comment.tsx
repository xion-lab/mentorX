import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';

export default function CommentScreen() {
  const { login, isConnected, isConnecting } = useAbstraxionAccount();
  const buttonColor = useThemeColor({}, 'button');
  const buttonTextColor = useThemeColor({}, 'buttonText');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>评价 Comment</ThemedText>

        {!isConnected ? (
          <View style={styles.connectButtonContainer}>
            <TouchableOpacity
              onPress={login}
              style={[styles.menuButton, styles.fullWidthButton, isConnecting && styles.disabledButton, { backgroundColor: buttonColor }]}
              disabled={isConnecting}
            >
              <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}> 
            <ThemedText>已连接，页面内容待补充。</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, paddingTop: 60 },
  title: { marginBottom: 20, textAlign: 'center' as const },
  connectButtonContainer: { width: '100%', paddingHorizontal: 20, alignItems: 'center' as const },
  menuButton: { padding: 15, borderRadius: 10, alignItems: 'center' as const },
  fullWidthButton: { width: '100%' as const },
  buttonText: { fontSize: 16, fontWeight: '500' as const },
  disabledButton: { opacity: 0.5 },
  placeholder: { alignItems: 'center' as const },
});
