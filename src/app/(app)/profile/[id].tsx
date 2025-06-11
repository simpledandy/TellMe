import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { colors } from '../../../theme/colors';
import { getProfile, Profile, getProblems } from '../../../lib/database';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface SocialLink {
  platform: string;
  url: string | null;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function ProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    fetchProfile();
    fetchUserProblems();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const result = await getProfile(id);
      console.log('Profile data:', JSON.stringify(result, null, 2));
      setProfile(result);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProblems = async () => {
    try {
      const result = await getProblems({ userId: id });
      setProblems(result || []);
    } catch (error) {
      console.error('Error fetching user problems:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const getSocialLinks = (profile: Profile): SocialLink[] => {
    const links: SocialLink[] = [];
    if (profile.social_links) {
      if (profile.social_links.website) {
        links.push({ platform: 'Website', url: profile.social_links.website, icon: 'globe-outline' });
      }
      if (profile.social_links.github) {
        links.push({ platform: 'GitHub', url: profile.social_links.github, icon: 'logo-github' });
      }
      if (profile.social_links.twitter) {
        links.push({ platform: 'Twitter', url: profile.social_links.twitter, icon: 'logo-twitter' });
      }
      if (profile.social_links.linkedin) {
        links.push({ platform: 'LinkedIn', url: profile.social_links.linkedin, icon: 'logo-linkedin' });
      }
      if (profile.social_links.instagram) {
        links.push({ platform: 'Instagram', url: profile.social_links.instagram, icon: 'logo-instagram' });
      }
    }
    return links;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={[styles.errorText, { color: theme.text.secondary }]}>
          Profile not found
        </Text>
      </View>
    );
  }

  const socialLinks = getSocialLinks(profile);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.background.secondary }]}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.accent.secondary }]}>
              <Text style={[styles.avatarText, { color: theme.accent.primary }]}>
                {profile.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.username, { color: theme.text.primary }]}>
          @{profile.username}
        </Text>
        {profile.full_name && (
          <Text style={[styles.fullName, { color: theme.text.secondary }]}>
            {profile.full_name}
          </Text>
        )}
        {profile.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={theme.text.tertiary} />
            <Text style={[styles.location, { color: theme.text.tertiary }]}>
              {profile.location}
            </Text>
          </View>
        )}
        {profile.bio && (
          <Text style={[styles.bio, { color: theme.text.secondary }]}>
            {profile.bio}
          </Text>
        )}
        {socialLinks.length > 0 && (
          <View style={styles.socialLinks}>
            {socialLinks.map((link) => (
              <Pressable
                key={link.platform}
                style={[styles.socialLink, { backgroundColor: theme.background.primary }]}
                onPress={() => link.url && Linking.openURL(link.url)}
              >
                <Ionicons name={link.icon} size={20} color={theme.accent.primary} />
              </Pressable>
            ))}
          </View>
        )}
        {isOwnProfile && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.accent.primary }]}
              onPress={handleEditProfile}
            >
              <Ionicons name="pencil" size={20} color={theme.text.primary} />
              <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                Edit Profile
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.background.primary }]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.text.secondary} />
              <Text style={[styles.actionButtonText, { color: theme.text.secondary }]}>
                Sign Out
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {((profile.interests && profile.interests.length > 0) || (profile.skills && profile.skills.length > 0)) && (
        <View style={[styles.section, { backgroundColor: theme.background.secondary }]}>
          {profile.interests && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Interests
              </Text>
              <View style={styles.tags}>
                {Array.isArray(profile.interests) 
                  ? profile.interests.map((interest) => (
                      <View
                        key={interest}
                        style={[styles.tag, { backgroundColor: theme.accent.secondary }]}
                      >
                        <Text style={[styles.tagText, { color: theme.accent.primary }]}>
                          {interest}
                        </Text>
                      </View>
                    ))
                  : typeof profile.interests === 'string' && (
                      <View
                        style={[styles.tag, { backgroundColor: theme.accent.secondary }]}
                      >
                        <Text style={[styles.tagText, { color: theme.accent.primary }]}>
                          {profile.interests}
                        </Text>
                      </View>
                    )
                }
              </View>
            </View>
          )}
          {profile.skills && profile.skills.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Skills
              </Text>
              <View style={styles.tags}>
                {profile.skills.map((skill) => (
                  <View
                    key={skill}
                    style={[styles.tag, { backgroundColor: theme.accent.secondary }]}
                  >
                    <Text style={[styles.tagText, { color: theme.accent.primary }]}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.background.secondary }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Activity
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>
              {problems.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              Problems
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>
              {profile.reputation}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              Reputation
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 16,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialLink: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    marginTop: 16,
    gap: 8,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
}); 