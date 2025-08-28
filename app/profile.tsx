import { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Alert, ScrollView, TextInput, Linking, AppState, StyleSheet } from "react-native";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion-react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

if (!process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS) {
  throw new Error("EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS is not set in your environment file");
}

const contractAddress = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS as string;

type Profile = {
  displayName: string;
  bio: string;
  avatar: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    website?: string;
  };
};

export default function Profile() {
  // Abstraxion hooks
  const { data: account, login, logout, isConnected, isConnecting } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const placeholderColor = useThemeColor({}, 'placeholder');

  // State variables
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Profile>({
    displayName: "",
    bio: "",
    avatar: "",
    socialLinks: {}
  });
  
  const themedStyles = useMemo(() => ({
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
      textAlign: 'center' as const,
    },
    mainContainer: {
      flex: 1,
      gap: 20,
    },
    section: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.05)',
      marginHorizontal: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      marginBottom: 15,
      color: '#00FF88',
      fontSize: 18,
      fontWeight: '600' as const,
    },
    profileHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 15,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    profileInfo: {
      flex: 1,
    },
    displayName: {
      marginBottom: 5,
    },
    addressText: {
      fontSize: 14,
      flexWrap: 'wrap' as const,
      flexShrink: 1,
      color: textColor,
    },
    bioText: {
      fontSize: 16,
      lineHeight: 24,
      color: textColor,
    },
    socialLink: {
      paddingVertical: 8,
    },
    socialLinkText: {
      fontSize: 16,
      color: tintColor,
    },
    input: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      fontSize: 16,
      borderColor: borderColor,
      backgroundColor: backgroundColor,
    },
    bioInput: {
      height: 100,
      textAlignVertical: 'top' as const,
    },
    socialInput: {
      marginTop: 10,
    },
    buttonContainer: {
      gap: 10,
    },
    menuButton: {
      padding: 12,
      borderRadius: 10,
      alignItems: 'center' as const,
      backgroundColor: '#00FF88',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)'
    },
    fullWidthButton: {
      width: '100%' as const,
    },
    buttonText: {
      color: '#0A0A0A',
      fontSize: 14,
      fontWeight: '700' as const,
      letterSpacing: 0.2,
    },
    disabledButton: {
      opacity: 0.5,
    },
    connectButtonContainer: {
      width: '100%' as const,
      paddingHorizontal: 20,
      alignItems: 'center' as const,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: 20,
    },
    loadingText: {
      textAlign: 'center' as const,
      fontSize: 16,
      color: textColor,
    },
  }), [backgroundColor, borderColor, textColor, tintColor, cardColor, placeholderColor]);

  // Background ink overlay styles (defined before use)
  const bgStyles = StyleSheet.create({
    container: { flex: 1 },
    inkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.95)' },
    inkBlob1: { position: 'absolute', top: -80, left: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.06)' },
    inkBlob2: { position: 'absolute', bottom: -60, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)' },
  });

  // Short address variable removed (not used)

  // Actions

  const handleDisconnect = () => {
    // Use logout from the component-level hook
    if (typeof logout === 'function') {
      Alert.alert(
        '确认断开连接',
        '您确定要断开钱包连接吗？',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '断开连接', 
            style: 'destructive',
            onPress: () => {
              logout();
              Alert.alert('已断开连接', '钱包连接已断开');
            }
          }
        ]
      );
    } else {
      Alert.alert('错误', '无法断开连接，请重试');
    }
  };


  // Fetch profile
  const fetchProfile = async () => {
    if (!queryClient) {
      console.log("Query client not initialized");
      setLoading(false);
      return;
    }
    
    if (!account?.bech32Address) {
      console.log("Account address not available");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching profile for address:", account.bech32Address);
      console.log("Using contract address:", contractAddress);
      
      const response = await queryClient.queryContractSmart(
        contractAddress,
        {
          UserDocuments: {
            owner: account.bech32Address,
            collection: "profiles"
          }
        }
      );
      
      console.log("Profile response:", response);
      
      if (response?.documents) {
        const profileDoc = response.documents.find(([id]: [string, any]) => id === account.bech32Address);
        if (profileDoc) {
          const profileData = JSON.parse(profileDoc[1].data);
          console.log("Found profile data:", profileData);
          setProfile(profileData);
          setEditedProfile(profileData);
        } else {
          console.log("No profile document found, initializing empty profile");
          // Initialize with empty profile if none exists
          const emptyProfile: Profile = {
            displayName: "",
            bio: "",
            avatar: "",
            socialLinks: {}
          };
          setProfile(emptyProfile);
          setEditedProfile(emptyProfile);
        }
      } else {
        console.log("No documents in response, initializing empty profile");
        // Initialize with empty profile if none exists
        const emptyProfile: Profile = {
          displayName: "",
          bio: "",
          avatar: "",
          socialLinks: {}
        };
        setProfile(emptyProfile);
        setEditedProfile(emptyProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Initialize with empty profile on error
      const emptyProfile: Profile = {
        displayName: "",
        bio: "",
        avatar: "",
        socialLinks: {}
      };
      setProfile(emptyProfile);
      setEditedProfile(emptyProfile);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    if (!client || !account) return;
    
    setLoading(true);
    try {
      await client.execute(
        account.bech32Address,
        contractAddress,
        {
          Set: {
            collection: "profiles",
            document: account.bech32Address,
            data: JSON.stringify(editedProfile)
          }
        },
        "auto"
      );
      
      setProfile(editedProfile);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch profile when account changes
  useEffect(() => {
    console.log("Account changed, fetching profile");
    console.log("Account:", account);
    console.log("Is connected:", isConnected);
    console.log("Query client:", queryClient ? "available" : "not available");
    
    // Reset loading state if not connected
    if (!isConnected) {
      setLoading(false);
      return;
    }
    
    // Wait for both queryClient and account to be available
    if (queryClient && account?.bech32Address) {
      fetchProfile();
    } else {
      // Reset loading state if either is not available
      setLoading(false);
    }
  }, [account?.bech32Address, isConnected, queryClient]);

  // Add effect to handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isConnected && account?.bech32Address && queryClient) {
        console.log("App became active, refreshing profile");
        fetchProfile();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isConnected, account?.bech32Address, queryClient]);

  return (
    <View style={[bgStyles.container, { backgroundColor: '#0A0A0A' }]}> 
      <View style={bgStyles.inkOverlay} />
      <View style={bgStyles.inkBlob1} />
      <View style={bgStyles.inkBlob2} />
      <ScrollView 
        contentContainerStyle={themedStyles.contentContainer}
      >

        {!isConnected ? (
          <View style={themedStyles.connectButtonContainer}>
            <TouchableOpacity
              onPress={login}
              style={[themedStyles.menuButton, themedStyles.fullWidthButton, isConnecting && themedStyles.disabledButton]}
              disabled={isConnecting}
            >
              <ThemedText style={themedStyles.buttonText}>
                {isConnecting ? "连接中..." : "连接钱包"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={themedStyles.loadingContainer}>
            <ThemedText style={themedStyles.loadingText}>加载中...</ThemedText>
          </View>
        ) : isEditing ? (
          <View style={themedStyles.mainContainer}>
            <View style={themedStyles.section}>
              <ThemedText style={themedStyles.sectionTitle}>昵称</ThemedText>
              <TextInput
                style={[themedStyles.input, { color: textColor }]}
                value={editedProfile.displayName}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, displayName: text })}
                placeholder="输入昵称"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={themedStyles.section}>
              <ThemedText style={themedStyles.sectionTitle}>简介</ThemedText>
              <TextInput
                style={[themedStyles.input, themedStyles.bioInput, { color: textColor }]}
                value={editedProfile.bio}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, bio: text })}
                placeholder="输入简介"
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={themedStyles.section}>
              <ThemedText style={themedStyles.sectionTitle}>头像链接</ThemedText>
              <TextInput
                style={[themedStyles.input, { color: textColor }]}
                value={editedProfile.avatar}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, avatar: text })}
                placeholder="输入头像链接"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={themedStyles.section}>
              <ThemedText style={themedStyles.sectionTitle}>社交链接</ThemedText>
              <TextInput
                style={themedStyles.input}
                value={editedProfile.socialLinks.twitter || ""}
                onChangeText={(text) => setEditedProfile({
                  ...editedProfile,
                  socialLinks: { ...editedProfile.socialLinks, twitter: text }
                })}
                placeholder="Twitter 链接"
                placeholderTextColor="#666"
              />
              <TextInput
                style={[themedStyles.input, themedStyles.socialInput]}
                value={editedProfile.socialLinks.github || ""}
                onChangeText={(text) => setEditedProfile({
                  ...editedProfile,
                  socialLinks: { ...editedProfile.socialLinks, github: text }
                })}
                placeholder="GitHub 链接"
                placeholderTextColor="#666"
              />
              <TextInput
                style={[themedStyles.input, themedStyles.socialInput]}
                value={editedProfile.socialLinks.website || ""}
                onChangeText={(text) => setEditedProfile({
                  ...editedProfile,
                  socialLinks: { ...editedProfile.socialLinks, website: text }
                })}
                placeholder="个人网站链接"
                placeholderTextColor="#666"
              />
            </View>

            <View style={themedStyles.buttonContainer}>
              <TouchableOpacity
                onPress={updateProfile}
                style={[themedStyles.menuButton, themedStyles.fullWidthButton, loading && themedStyles.disabledButton]}
                disabled={loading}
              >
                <ThemedText style={themedStyles.buttonText}>
                  {loading ? "保存中..." : "保存"}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(false);
                  setEditedProfile(profile || editedProfile);
                }}
                style={[themedStyles.menuButton, themedStyles.secondaryButton, themedStyles.fullWidthButton]}
              >
                <ThemedText style={themedStyles.buttonText}>取消</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={themedStyles.mainContainer}>
            {/* Header & Wallet */}
            <View style={themedStyles.section}>
              <ThemedText type="title" style={{ textAlign: 'center', color: '#00FF88', fontSize: 22, fontWeight: '700', marginBottom: 30, textShadowColor: 'rgba(0,255,136,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>MentorX - Xion Powered</ThemedText>
              
              <ThemedText style={{ color: '#CCCCCC', fontSize: 14, marginBottom: 8 }}>钱包地址</ThemedText>
              <ThemedText style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, marginBottom: 20 }}>{account?.bech32Address || '未连接'}</ThemedText>
              
              <TouchableOpacity onPress={handleDisconnect} style={[themedStyles.menuButton, themedStyles.fullWidthButton]}>
                <ThemedText style={themedStyles.buttonText}>断开连接</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Rewards / Points */}
            <TouchableOpacity onPress={() => Alert.alert('奖励/积分', '即将上线')}>
              <View style={themedStyles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <ThemedText style={themedStyles.sectionTitle}>奖励/积分</ThemedText>
                  <ThemedText style={{ color: '#00FF88', fontSize: 18 }}>{'>'}</ThemedText>
                </View>
                <ThemedText style={{ color: '#FFFFFF', fontSize: 16 }}>CAO币: 120</ThemedText>
              </View>
            </TouchableOpacity>

            {/* My Reviews */}
            <TouchableOpacity onPress={() => Alert.alert('我的评价', '即将上线') }>
              <View style={themedStyles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <ThemedText style={themedStyles.sectionTitle}>我的评价</ThemedText>
                  <ThemedText style={{ color: '#00FF88', fontSize: 18 }}>{'>'}</ThemedText>
                </View>
                <ThemedText style={{ color: '#FFFFFF', fontSize: 16 }}>• 已发布: 5</ThemedText>
              </View>
            </TouchableOpacity>

            {profile?.bio && (
              <View style={themedStyles.section}>
                <ThemedText style={themedStyles.sectionTitle}>简介</ThemedText>
                <ThemedText style={[themedStyles.bioText, { color: '#FFFFFF' }]}>{profile.bio}</ThemedText>
              </View>
            )}

            {(profile?.socialLinks?.twitter || profile?.socialLinks?.github || profile?.socialLinks?.website) && (
              <View style={themedStyles.section}>
                <ThemedText style={themedStyles.sectionTitle}>社交链接</ThemedText>
                {profile.socialLinks.twitter && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(profile.socialLinks.twitter!)}
                    style={themedStyles.socialLink}
                  >
                    <ThemedText style={themedStyles.socialLinkText}>Twitter</ThemedText>
                  </TouchableOpacity>
                )}
                {profile.socialLinks.github && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(profile.socialLinks.github!)}
                    style={themedStyles.socialLink}
                  >
                    <ThemedText style={themedStyles.socialLinkText}>GitHub</ThemedText>
                  </TouchableOpacity>
                )}
                {profile.socialLinks.website && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(profile.socialLinks.website!)}
                    style={themedStyles.socialLink}
                  >
                    <ThemedText style={themedStyles.socialLinkText}>网站</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={[themedStyles.menuButton, themedStyles.fullWidthButton]}
            >
              <ThemedText style={themedStyles.buttonText}>编辑资料</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}