import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme/colors';
import { getComments, Comment } from '../lib/database';

interface CommentWithUser extends Comment {
  user: {
    id: string;
    profiles: {
      username: string;
      avatar_url: string | null;
    } | null;
  };
}

interface CommentListProps {
  problemId: string;
  onCommentPress?: (comment: CommentWithUser) => void;
}

export function CommentList({ problemId, onCommentPress }: CommentListProps) {
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const result = await getComments(problemId);
      setComments(result);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [problemId]);

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

  const renderComment = ({ item: comment }: { item: CommentWithUser }) => (
    <Pressable
      style={[styles.commentCard, { backgroundColor: theme.background.secondary }]}
      onPress={() => onCommentPress?.(comment)}
    >
      <View style={styles.commentHeader}>
        <Text style={[styles.username, { color: theme.text.primary }]}>
          {comment.user.profiles?.username || 'Anonymous'}
        </Text>
        <Text style={[styles.timestamp, { color: theme.text.tertiary }]}>
          {formatDate(comment.created_at)}
        </Text>
      </View>
      <Text style={[styles.content, { color: theme.text.secondary }]}>
        {comment.content}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Loading comments...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      renderItem={renderComment}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
          No comments yet. Be the first to comment!
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  commentCard: {
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
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 16,
  },
}); 