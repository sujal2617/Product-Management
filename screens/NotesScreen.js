import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import {
  useTheme,
  SPACING,
  RADIUS,
  SHADOW,
} from '../theme';

import { useToast } from '../components/Toast';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "18 Nov, 3:42 pm"
function formatSaved(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

export default function NotesScreen() {
  const COLORS = useTheme();
  const toast = useToast();

  const styles = React.useMemo(
    () => makeStyles(COLORS),
    [COLORS]
  );

  // saved = what is in the database; draft = what is being typed
  const [saved, setSaved] = useState('');
  const [draft, setDraft] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [noteId, setNoteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // read mode by default so scrolling never moves the cursor or opens the keyboard
  const [editing, setEditing] = useState(false);

  const inputRef = useRef(null);
  const inFlight = useRef(false);

  const fetchNote = useCallback(async () => {
    const { data, error } = await supabase
      .from('app_notes')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.show("Couldn't load notes. Check internet.", 'error');
      return;
    }

    if (data) {
      setSaved(data.content || '');
      setUpdatedAt(data.updated_at || null);
      setNoteId(data.id);
    }
  }, [toast]);

  useEffect(() => {
    fetchNote().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNote();
    setRefreshing(false);
  };

  const startEditing = () => {
    setDraft(saved);
    setEditing(true);
  };

  const cancelEditing = () => {
    if (draft === saved) {
      setEditing(false);
      return;
    }

    Alert.alert(
      'Discard changes?',
      'Your changes to the note will be lost.',
      [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => setEditing(false),
        },
      ]
    );
  };

  const runGuarded = async (task) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    try {
      await task();
    } catch (e) {
      if (__DEV__) console.warn(e);
      toast.show("Couldn't save. Check internet and try again.", 'error');
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  const handleSave = () =>
    runGuarded(async () => {
      if (!noteId) {
        Alert.alert('Error', 'Note row not found in database');
        return;
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('app_notes')
        .update({ content: draft, updated_at: now })
        .eq('id', noteId);

      if (error) {
        toast.show("Couldn't save. Check internet and try again.", 'error');
        return;
      }

      setSaved(draft);
      setUpdatedAt(now);
      setEditing(false);
      toast.show('Note saved');
    });

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['left', 'right', 'bottom']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const savedLabel = formatSaved(updatedAt);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* TOOLBAR */}
        <View style={styles.toolbar}>
          <View style={styles.meta}>
            <MaterialIcons
              name={editing ? 'edit' : 'schedule'}
              size={16}
              color={COLORS.subText}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              {editing
                ? 'Editing…'
                : savedLabel
                  ? `Last saved ${savedLabel}`
                  : 'Shared shop notes'}
            </Text>
          </View>

          {editing ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={cancelEditing}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing"
              >
                <Text style={styles.secondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, saving && styles.dimmed]}
                onPress={handleSave}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Save note"
              >
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.onPrimary} />
                ) : (
                  <>
                    <MaterialIcons name="check" size={18} color={COLORS.onPrimary} />
                    <Text style={styles.primaryText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={startEditing}
              accessibilityRole="button"
              accessibilityLabel="Edit note"
            >
              <MaterialIcons name="edit" size={18} color={COLORS.onPrimary} />
              <Text style={styles.primaryText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* NOTE */}
        {editing ? (
          <View style={[styles.card, styles.cardEditing]}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              multiline
              placeholder="Write notes..."
              placeholderTextColor={COLORS.subText}
              value={draft}
              onChangeText={setDraft}
              textAlignVertical="top"
              scrollEnabled
            />
          </View>
        ) : (
          <ScrollView
            style={styles.card}
            contentContainerStyle={
              saved ? styles.readContent : styles.emptyContent
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          >
            {saved ? (
              <Text style={styles.noteText} selectable>
                {saved}
              </Text>
            ) : (
              <View style={styles.empty}>
                <MaterialIcons name="sticky-note-2" size={48} color={COLORS.subText} />
                <Text style={styles.emptyTitle}>No notes yet</Text>
                <Text style={styles.emptyHint}>Tap Edit to start writing.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
    },

    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    flex: {
      flex: 1,
    },

    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
      gap: SPACING.sm,
    },

    meta: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },

    metaText: {
      flexShrink: 1,
      fontSize: 13,
      color: COLORS.subText,
    },

    actions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },

    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      minHeight: 44,
      minWidth: 88,
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      ...SHADOW,
    },

    primaryText: {
      color: COLORS.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },

    secondaryButton: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.white,
    },

    secondaryText: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '600',
    },

    dimmed: {
      opacity: 0.6,
    },

    card: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: SPACING.md,
      ...SHADOW,
    },

    cardEditing: {
      borderColor: COLORS.primary,
      borderWidth: 2,
    },

    readContent: {
      padding: SPACING.md + 2,
    },

    emptyContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },

    noteText: {
      fontSize: 17,
      lineHeight: 28,
      color: COLORS.text,
    },

    input: {
      flex: 1,
      fontSize: 17,
      lineHeight: 28,
      color: COLORS.text,
      padding: SPACING.md + 2,
    },

    empty: {
      alignItems: 'center',
      gap: SPACING.xs,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
      marginTop: SPACING.sm,
    },

    emptyHint: {
      fontSize: 15,
      color: COLORS.subText,
    },
  });
