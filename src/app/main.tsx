import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Text, Animated, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/src/contexts/AuthContext';

export default function Main() {
  const [inputText, setInputText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { user, signOut } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(1));
  const router = useRouter();

  const handleShare = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to share a problem');
        return;
      }

      const { data, error } = await supabase
        .from('problems')
        .insert([
          { 
            description: inputText,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting problem:', error);
        Alert.alert('Error', 'Failed to share your problem. Please try again.');
      } else {
        console.log('Problem shared:', data);
        setInputText('');
        setIsEditing(false);
        // Fade in the welcome screen
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        // Show success message
        Alert.alert(
          'Success',
          'Your problem has been shared!',
          [
            {
              text: 'View Feed',
              onPress: () => router.push('/feed'),
              style: 'default',
            },
            {
              text: 'Stay Here',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    // Fade out the welcome screen
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goToFeed = () => {
    router.push('/feed');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Home',
          headerRight: () => (
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => router.push('/feed')}
                className="mr-4"
              >
                <Text className="text-blue-500">View Feed</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} className="mr-4">
                <Text className="text-blue-500">Sign Out</Text>
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        {!isEditing ? (
          <Animated.View 
            style={{ opacity: fadeAnim }}
            className="flex-1 justify-center items-center px-6"
          >
            <Pressable 
              onPress={startEditing}
              className="w-full items-center"
            >
              <Text className="text-4xl font-light text-center text-gray-800 mb-8">
                What is your Problem Now?
              </Text>
            </Pressable>
            <TouchableOpacity 
              onPress={goToFeed}
              className="mt-4"
            >
              <Text className="text-blue-500 text-lg">
                No problem now
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View className="flex-1 px-6">
            <View className="flex-1 justify-center">
              <TextInput
                className="text-4xl font-light text-gray-800 text-center"
                value={inputText}
                onChangeText={setInputText}
                autoFocus={true}
                multiline
                placeholder="Type your problem here..."
                placeholderTextColor="#9CA3AF"
                textAlign="center"
              />
            </View>
            {inputText.length > 0 && (
              <View className="py-4">
                <TouchableOpacity
                  onPress={handleShare}
                  className="bg-blue-500 rounded-full py-4 px-8 self-end"
                >
                  <Text className="text-white text-lg font-medium">
                    Share Problem
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
