import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';
import { Problem, getProblems, getCategories, ProblemCategory } from '~/src/lib/database';
import { Button } from './Button';
import { Modal } from './Modal';

type FilterOptions = {
  status?: 'open' | 'solved' | 'closed';
  categoryId?: string;
};

type ProblemWithRelations = Problem & {
  categories?: {
    name: string;
  };
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderProblem = ({ item }: { item: ProblemWithRelations }) => (
    <Pressable
      style={[styles.problemCard, { backgroundColor: theme.background.secondary }]}
      onPress={() => {/* TODO: Navigate to problem details */}}
    >
      <Text style={[styles.problemTitle, { color: theme.text.primary }]}>{item.title}</Text>
      <Text style={[styles.problemDescription, { color: theme.text.secondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.problemMeta}>
        <Text style={[styles.problemStatus, { color: theme.text.secondary }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
        {item.categories && (
          <Text style={[styles.problemCategory, { color: theme.text.secondary }]}>
            {item.categories.name}
          </Text>
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Filter"
          onPress={() => setShowFilters(true)}
          variant="secondary"
          className="mr-2"
        />
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
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  list: {
    padding: 16,
  },
  problemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  problemStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  problemCategory: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
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
  },
}); 