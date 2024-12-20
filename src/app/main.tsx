import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '~/utils/supabase';
import { Button } from '~/src/components/Button';

export default function Main() {
  const [inputText, setInputText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleShare = async () => {
    const { data, error } = await supabase
      .from('problems')
      .insert([{ description: inputText }]);

    if (error) {
      console.error('Error inserting problem:', error);
    } else {
      console.log('Problem shared:', data);
    }
    setInputText('');
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-center items-center bg-white"
    >
      <TouchableWithoutFeedback onPress={() => setIsEditing(true)}>
        <View className="flex-1 justify-center items-center w-full">
          {!isEditing && (
            <TextInput
              className="text-center text-4xl text-gray-600"
              placeholder="What is your problem now?"
              placeholderTextColor="#999"
              editable={false}
            />
          )}
          {isEditing && (
            <>
              <TextInput
                className={`w-full text-4xl ${inputText.length > 0 ? 'text-left' : 'text-center'}`}
                value={inputText}
                onChangeText={setInputText}
                autoFocus={true}
                multiline
              />
              <Button
                title="Share"
                onPress={handleShare}
                className="mt-4"
              />
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
