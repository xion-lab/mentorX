import { View, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Animated, Image } from "react-native";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEffect, useRef } from 'react';

// Removed expo-linear-gradient to avoid native module error in current build

if (!process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS) {
  throw new Error("EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS is not set in your environment file");
}

export default function Index() {
  // Theme colors used by the connect-wallet template
  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = useThemeColor({}, 'button');
  const buttonTextColor = useThemeColor({}, 'buttonText');
  const textColor = useThemeColor({}, 'text');

  // Abstraxion (single hook call). Only connect on explicit tap.
  const accountApi = useAbstraxionAccount() as any;
  const { login, isConnected, isConnecting } = accountApi;
  const logout: (() => void) | undefined = accountApi?.logout;

  // Animated sheen effect over the button (black/white hacker vibe)
  const sheen = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sheen, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(sheen, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sheen]);

  const sheenTranslate = sheen.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 220],
  });

  // Early return: show simple title + connect button when not connected
  if (!isConnected) {
    return (
      <ImageBackground
        source={require('../assets/images/bg.jpg')}
        resizeMode="cover"
        style={styles.bg}
      >
        <View style={styles.overlay} />

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.hero}>
            <View style={styles.brandRow}>
              <Image source={require('../assets/images/dog-logo.jpg')} style={styles.logo} resizeMode="contain" />
              <ThemedText type="title" style={[styles.brand, { color: '#00FF88' }]}>MentorX</ThemedText>
            </View>
            <ThemedText style={[styles.slogan, { color: '#EAEAEA' }]}>欢迎来到查询导师系统</ThemedText>
            <ThemedText style={[styles.subtle, { color: '#C8C8C8' }]}>Anonymous • Decentralized • Secure</ThemedText>
          </View>

          <View style={styles.connectButtonContainer}>
            <TouchableOpacity
              onPress={login}
              style={[
                styles.menuButton,
                styles.fullWidthButton,
                isConnecting && styles.disabledButton,
                { borderColor: '#FFFFFF33', borderWidth: 1 }
              ]}
              disabled={isConnecting}
            >
              {/* Animated sheen strip */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.sheen,
                  {
                    transform: [{ translateX: sheenTranslate }, { rotate: '15deg' }],
                  },
                ]}
              />
              <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>
                {isConnecting ? 'INITIALIZING...' : '匿名进入'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.matrixHint}>
            <ThemedText style={[styles.hintText, { color: '#D0D0D0' }]}>Initializing secure channel...</ThemedText>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/bg.jpg')}
      resizeMode="cover"
      style={styles.bg}
    >
      <View style={styles.overlay} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <Image source={require('../assets/images/dog-logo.jpg')} style={styles.logo} resizeMode="contain" />
            <ThemedText type="title" style={[styles.brand, { color: '#00FF88' }]}>MentorX</ThemedText>
          </View>
          <ThemedText style={[styles.slogan, { color: '#EAEAEA' }]}>欢迎来到查询导师系统</ThemedText>
          <ThemedText style={[styles.subtle, { color: '#C8C8C8' }]}>Connected • Ready</ThemedText>
        </View>

        {/* Temporary disconnect button for testing */}
        <View style={styles.connectButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              if (typeof logout === 'function') logout();
            }}
            style={[styles.menuButton, styles.fullWidthButton, { borderColor: '#FFFFFF33', borderWidth: 1, backgroundColor: '#111' }]}
          >
            <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>断开连接</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 30,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 6,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    textAlign: 'center',
  },
  subtle: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
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
    borderWidth: 1,
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
    position: 'relative',
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
  matrixHint: {
    marginTop: 16,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    opacity: 0.7,
  },
  sheen: {
    position: 'absolute',
    top: -10,
    left: 0,
    height: '140%',
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
  },
});
