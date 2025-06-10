import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '~/utils/supabase';

type Problem = {
  id: string;
  description: string;
  created_at: string;
  user_id: string;
  is_solved: boolean;
  solved_at: string | null;
};

export function ProblemFeed() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProblems();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <FlatList
      data={problems}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerClassName="px-4 py-2"
      renderItem={({ item }) => (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg text-gray-800 mb-2">{item.description}</Text>
          <Text className="text-sm text-gray-500">
            {formatDate(item.created_at)}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-gray-500 text-lg">No problems shared yet</Text>
        </View>
      }
    />
  );
} 