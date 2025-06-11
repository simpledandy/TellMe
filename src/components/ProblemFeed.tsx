import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '~/utils/supabase';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';

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
  const { isDark } = useTheme();

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
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors[isDark ? 'dark' : 'light'].background.primary }}>
        <ActivityIndicator size="large" color={colors[isDark ? 'dark' : 'light'].accent.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={problems}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={colors[isDark ? 'dark' : 'light'].accent.primary}
        />
      }
      contentContainerClassName="px-4 py-2"
      style={{ backgroundColor: colors[isDark ? 'dark' : 'light'].background.primary }}
      renderItem={({ item }) => (
        <View 
          className="rounded-xl p-4 mb-4 shadow-sm border"
          style={{ 
            backgroundColor: colors[isDark ? 'dark' : 'light'].background.secondary,
            borderColor: colors[isDark ? 'dark' : 'light'].border.primary
          }}
        >
          <Text 
            className="text-lg mb-2"
            style={{ color: colors[isDark ? 'dark' : 'light'].text.primary }}
          >
            {item.description}
          </Text>
          <Text 
            className="text-sm"
            style={{ color: colors[isDark ? 'dark' : 'light'].text.secondary }}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center py-8">
          <Text 
            className="text-lg"
            style={{ color: colors[isDark ? 'dark' : 'light'].text.secondary }}
          >
            No problems shared yet
          </Text>
        </View>
      }
    />
  );
} 