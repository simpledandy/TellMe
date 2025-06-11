import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { colors } from '../../../theme/colors';
import { getProblems, Problem } from '../../../lib/database';
import { CommentList } from '../../../components/CommentList';
import { CommentInput } from '../../../components/CommentInput';

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

export default function ProblemDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const result = await getProblems({ problemId: id });
      if (result && result.length > 0) {
        setProblem(result[0]);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    // Refresh the problem to get updated comment count
    fetchProblem();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Loading problem...
        </Text>
      </View>
    );
  }

  if (!problem) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={[styles.errorText, { color: theme.text.secondary }]}>
          Problem not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.background.secondary }]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{problem.title}</Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.text.tertiary }]}>
            Posted {formatDate(problem.created_at)}
          </Text>
          <Text style={[styles.metaText, { color: theme.text.tertiary }]}>
            by {problem.user_id} {/* TODO: Replace with actual username */}
          </Text>
        </View>
        <Text style={[styles.description, { color: theme.text.secondary }]}>
          {problem.description}
        </Text>
        <View style={styles.tags}>
          <Pressable
            style={[styles.tag, { backgroundColor: theme.accent.secondary }]}
            onPress={() => {/* TODO: Filter by status */}}
          >
            <Text style={[styles.tagText, { color: theme.accent.primary }]}>
              {problem.status}
            </Text>
          </Pressable>
          {problem.category_id && (
            <Pressable
              style={[styles.tag, { backgroundColor: theme.accent.secondary }]}
              onPress={() => {/* TODO: Filter by category */}}
            >
              <Text style={[styles.tagText, { color: theme.accent.primary }]}>
                {problem.category_id} {/* TODO: Replace with category name */}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.commentsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Comments
        </Text>
        <CommentList problemId={problem.id} />
      </View>

      <CommentInput problemId={problem.id} onCommentAdded={handleCommentAdded} />
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
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
  commentsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
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