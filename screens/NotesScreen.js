import React, { useEffect, useRef, useState } from 'react';
import {
    TextInput,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    Alert,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import {
    COLORS,
    SPACING,
    RADIUS,
    SHADOW,
} from '../theme';

export default function NotesScreen() {
    const [note, setNote] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [noteId, setNoteId] =
        useState(null);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {
        fetchNote();
    }, []);

    const fetchNote =
        async () => {
            const { data, error } =
                await supabase
                    .from('app_notes')
                    .select('*')
                    .limit(1)
                    .maybeSingle();

            if (error) {
                Alert.alert(
                    'Error',
                    'Could not load notes'
                );
            }

            if (data) {
                setNote(
                    data.content || ''
                );

                setNoteId(data.id);
            }

            setLoading(false);
        };

    const inFlight = useRef(false);
    
      const runGuarded = async (task) => {
        if (inFlight.current) return;
        inFlight.current = true;
        setSaving(true);
        try {
          await task();
        } finally {
          inFlight.current = false;
          setSaving(false);
        }
      };
    
const handleSave = () =>
        runGuarded(async () => {
            if (!noteId) {
                Alert.alert(
                    'Error',
                    'Note row not found in database'
                );
                return;
            }

            setSaving(true);

            const { error } =
                await supabase
                    .from('app_notes')
                    .update({
                        content: note,
                        updated_at:
                            new Date()
                                .toISOString(),
                    })
                    .eq(
                        'id',
                        noteId
                    );

            setSaving(false);

            if (error) {
                Alert.alert(
                    'Error',
                    'Failed to save notes'
                );
                return;
            }

            Alert.alert(
                'Saved',
                'Notes saved successfully'
            );
        });

    if (loading) {
        return (
            <SafeAreaView
                style={styles.safe}
            >
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={styles.safe}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        saving && { opacity: 0.6 },
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                    <Text
                        style={
                            styles.saveButtonText
                        }
                    >
                        Save
                    </Text>
                    )}
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                multiline
                placeholder="Write notes..."
                placeholderTextColor={
                    COLORS.subText
                }
                value={note}
                onChangeText={setNote}
                textAlignVertical="top"
            />
        </SafeAreaView>
    );
}

const styles =
    StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor:
            COLORS.background,
            padding: SPACING.lg,
        },

        header: {
            alignItems: 'flex-end',
            marginBottom: 14,
        },

        saveButton: {
            backgroundColor:
            COLORS.primary,
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: RADIUS.md,
            ...SHADOW,
        },

        saveButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '700',
        },

        input: {
            flex: 1,
            fontSize: 18,
            color: COLORS.text,
            lineHeight: 28,
            backgroundColor:
            COLORS.white,
            borderRadius: RADIUS.md,
            padding: 18,
            ...SHADOW,
        },
    });