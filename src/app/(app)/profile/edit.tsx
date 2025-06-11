import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { colors } from '../../../theme/colors';
import { getProfile, updateProfile, Profile } from '../../../lib/database';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfilePage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({
    username: '',
    full_name: '',
    bio: '',
    social_links: {},
    interests: [],
    skills: [],
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const result = await getProfile(user!.id);
      if (result) {
        setProfile(result);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await updateProfile(user.id, profile);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayInput = (field: 'interests' | 'skills', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setProfile(prev => ({ ...prev, [field]: items }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.form, { backgroundColor: theme.background.secondary }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Basic Information
          </Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Username</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.username}
              onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
              placeholder="Enter username"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.full_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
              placeholder="Enter full name"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Bio</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.text.tertiary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Social Links
          </Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Website</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.social_links?.website}
              onChangeText={(text) => handleSocialLinkChange('website', text)}
              placeholder="https://your-website.com"
              placeholderTextColor={theme.text.tertiary}
              keyboardType="url"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>GitHub</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.social_links?.github}
              onChangeText={(text) => handleSocialLinkChange('github', text)}
              placeholder="github.com/username"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Twitter</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.social_links?.twitter}
              onChangeText={(text) => handleSocialLinkChange('twitter', text)}
              placeholder="twitter.com/username"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>LinkedIn</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.social_links?.linkedin}
              onChangeText={(text) => handleSocialLinkChange('linkedin', text)}
              placeholder="linkedin.com/in/username"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Instagram</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.social_links?.instagram}
              onChangeText={(text) => handleSocialLinkChange('instagram', text)}
              placeholder="instagram.com/username"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Interests & Skills
          </Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Interests</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.interests?.join(', ')}
              onChangeText={(text) => handleArrayInput('interests', text)}
              placeholder="Enter interests (comma-separated)"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Skills</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={profile.skills?.join(', ')}
              onChangeText={(text) => handleArrayInput('skills', text)}
              placeholder="Enter skills (comma-separated)"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, { backgroundColor: theme.accent.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveButtonText, { color: theme.text.primary }]}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 100,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 