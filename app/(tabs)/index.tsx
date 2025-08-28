import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';

if (!process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS) {
  throw new Error("EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS is not set in your environment file");
}

export default function Index() {
  // Theme colors used by the connect-wallet template
  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = useThemeColor({}, 'button');
  const buttonTextColor = useThemeColor({}, 'buttonText');

  // Abstraxion
  const { login, isConnected, isConnecting } = useAbstraxionAccount();

  // Early return: show simple title + connect button when not connected
  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor }]}> 
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <ThemedText type="title" style={styles.title}>首页 Home</ThemedText>
          <View style={styles.connectButtonContainer}>
            <TouchableOpacity
              onPress={login}
              style={[
                styles.menuButton,
                styles.fullWidthButton,
                isConnecting && styles.disabledButton,
                { backgroundColor: buttonColor }
              ]}
              disabled={isConnecting}
            >
              <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <ThemedText type="title" style={styles.title}>首页 Home</ThemedText>
        <View style={styles.mainContainer}>
          <ThemedText>已连接，主页业务逻辑待实现。</ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
    gap: 20,
  },
  connectButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  menuButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  fullWidthButton: {
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
