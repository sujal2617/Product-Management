import React, { useEffect, useState } from 'react';
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

            if (data) {
                setNote(
                    data.content || ''
                );

                setNoteId(data.id);
            }

            setLoading(false);
        };

    const handleSave =
        async () => {
            if (!noteId) {
                Alert.alert(
                    'Error',
                    'Note row not found in database'
                );
                return;
            }

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

            if (error) {
                Alert.alert(
                    'Error',
                    error.message
                );
                return;
            }

            Alert.alert(
                'Saved',
                'Notes saved successfully'
            );
        };

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
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text
                        style={
                            styles.saveButtonText
                        }
                    >
                        Save
                    </Text>
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