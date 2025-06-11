import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';
import { Problem, getProblems, getCategories, ProblemCategory } from '~/src/lib/database';
import { Button } from './Button';
import { Modal } from './Modal';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

type FilterOptions = {
  status?: 'open' | 'solved' | 'closed';
  categoryId?: string;
};

type ProblemWithRelations = Problem & {
  categories?: {
    name: string;
  } | null;
};

function FilterContent({ filters, setFilters, categories }: { 
  filters: FilterOptions; 
  setFilters: (filters: FilterOptions) => void;
  categories: ProblemCategory[];
}) {
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];

  return (
    <View style={styles.filterContent}>
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.text.primary }]}>Status</Text>
        <View style={styles.filterOptions}>
          {['open', 'solved', 'closed'].map((status) => (
            <Pressable
              key={status}
              style={[
                styles.filterOption,
                filters.status === status && { backgroundColor: theme.accent.primary },
              ]}
              onPress={() => setFilters({ ...filters, status: status as FilterOptions['status'] })}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  { color: filters.status === status ? '#fff' : theme.text.primary },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.text.primary }]}>Category</Text>
        <View style={styles.filterOptions}>
          <Pressable
            style={[
              styles.filterOption,
              !filters.categoryId && { backgroundColor: theme.accent.primary },
            ]}
            onPress={() => setFilters({ ...filters, categoryId: undefined })}
          >
            <Text
              style={[
                styles.filterOptionText,
                { color: !filters.categoryId ? '#fff' : theme.text.primary },
              ]}
            >
              All
            </Text>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.filterOption,
                filters.categoryId === category.id && { backgroundColor: theme.accent.primary },
              ]}
              onPress={() => setFilters({ ...filters, categoryId: category.id })}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  { color: filters.categoryId === category.id ? '#fff' : theme.text.primary },
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export function ProblemFeed() {
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];
  const [problems, setProblems] = useState<ProblemWithRelations[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchProblems = async () => {
    try {
      const result = await getProblems(filters);
      setProblems(result);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProblems();
    fetchCategories();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProblems();
  };

  const handleProblemPress = (problemId: string) => {
    router.push({
      pathname: '/problem/[id]',
      params: { id: problemId }
    });
  };

  const renderProblem = ({ item }: { item: ProblemWithRelations }) => (
    <Pressable
      key={item.id}
      style={[styles.problemCard, { backgroundColor: theme.background.secondary }]}
      onPress={() => handleProblemPress(item.id)}
    >
      <Text style={[styles.problemTitle, { color: theme.text.primary }]}>{item.title}</Text>
      <Text style={[styles.problemDescription, { color: theme.text.secondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.problemMeta}>
        <Text style={[styles.metaText, { color: theme.text.tertiary }]}>
          Posted {formatDate(item.created_at)}
        </Text>
        <Text style={[styles.metaText, { color: theme.text.tertiary }]}>
          by {item.user_id} {/* TODO: Replace with actual username */}
        </Text>
      </View>
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: theme.accent.secondary }]}>
          <Text style={[styles.tagText, { color: theme.accent.primary }]}>
            {item.status}
          </Text>
        </View>
        {item.categories && (
          <View style={[styles.tag, { backgroundColor: theme.accent.secondary }]}>
            <Text style={[styles.tagText, { color: theme.accent.primary }]}>
              {item.categories.name}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Button
          variant="secondary"
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
          title="Filter"
        >
          Filter
        </Button>
      </View>

      <FlatList
        data={problems}
        renderItem={renderProblem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
            No problems found
          </Text>
        }
      />

      <Modal
        visible={showFilters}
        title="Filter Problems"
        onClose={() => setShowFilters(false)}
        buttons={[
          {
            text: 'Reset',
            onPress: () => {
              setFilters({});
              setShowFilters(false);
            },
            style: 'cancel',
          },
          {
            text: 'Apply',
            onPress: () => setShowFilters(false),
          },
        ]}
      >
        <FilterContent
          filters={filters}
          setFilters={setFilters}
          categories={categories}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterButton: {
    alignSelf: 'flex-start',
  },
  list: {
    padding: 16,
  },
  problemCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  problemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  problemDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  problemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
  },
  tags: {
    flexDirection: 'row',
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
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  filterContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 