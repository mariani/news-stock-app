import React, {useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNewsStore} from '@/store/news-store';
import {useStocksStore} from '@/store/stocks-store';
import {useSettingsStore} from '@/store/settings-store';
import {AVAILABLE_TOPICS} from '@/constants/topics';
import {colors, spacing, fontSize} from '@/constants/theme';
import type {NewsTopic} from '@/types/settings';

function SectionHeader({title}: {title: string}) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function SettingsScreen() {
  const selectedTopics = useNewsStore(s => s.selectedTopics);
  const addTopic = useNewsStore(s => s.addTopic);
  const removeTopic = useNewsStore(s => s.removeTopic);
  const rssFeedUrls = useNewsStore(s => s.rssFeedUrls);
  const addRssFeed = useNewsStore(s => s.addRssFeed);
  const removeRssFeed = useNewsStore(s => s.removeRssFeed);
  const sportsTeams = useNewsStore(s => s.sportsTeams);
  const addSportsTeam = useNewsStore(s => s.addSportsTeam);
  const removeSportsTeam = useNewsStore(s => s.removeSportsTeam);
  const liveScoresEnabled = useSettingsStore(s => s.liveScoresEnabled);
  const setLiveScoresEnabled = useSettingsStore(s => s.setLiveScoresEnabled);
  const weatherEnabled = useSettingsStore(s => s.weatherEnabled);
  const setWeatherEnabled = useSettingsStore(s => s.setWeatherEnabled);
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  const watchlists = useStocksStore(s => s.watchlists);
  const createWatchlist = useStocksStore(s => s.createWatchlist);
  const deleteWatchlist = useStocksStore(s => s.deleteWatchlist);

  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const handleToggleTopic = (topic: NewsTopic) => {
    if (selectedTopics.includes(topic)) {
      removeTopic(topic);
    } else {
      addTopic(topic);
    }
  };

  const handleAddFeed = () => {
    const url = newFeedUrl.trim();
    if (url) {
      addRssFeed(url);
      setNewFeedUrl('');
    }
  };

  const handleRemoveFeed = (url: string) => {
    Alert.alert('Remove Feed', `Remove this RSS feed?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: () => removeRssFeed(url)},
    ]);
  };

  const handleAddTeam = () => {
    const teams = newTeamName
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    teams.forEach(addSportsTeam);
    if (teams.length > 0) {
      setNewTeamName('');
    }
  };

  const handleRemoveTeam = (team: string) => {
    if (confirm(`Remove "${team}" from your teams?`)) {
      removeSportsTeam(team);
    }
  };

  const handleCreateWatchlist = () => {
    const name = newWatchlistName.trim();
    if (name) {
      createWatchlist(name);
      setNewWatchlistName('');
    }
  };

  const handleDeleteWatchlist = (id: string, name: string) => {
    Alert.alert('Delete Watchlist', `Delete "${name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteWatchlist(id),
      },
    ]);
  };

  const LANGUAGES = [
    {code: 'en', label: 'English'},
    {code: 'es', label: 'Spanish'},
    {code: 'fr', label: 'French'},
    {code: 'de', label: 'German'},
    {code: 'it', label: 'Italian'},
    {code: 'pt', label: 'Portuguese'},
    {code: 'nl', label: 'Dutch'},
    {code: 'ru', label: 'Russian'},
    {code: 'zh', label: 'Chinese'},
    {code: 'ar', label: 'Arabic'},
  ];

  return (
    <ScrollView style={styles.container}>
      <SectionHeader title="Language" />
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.topicRow}
          onPress={() => setLanguagePickerOpen(true)}>
          <Text style={styles.topicLabel}>News Language</Text>
          <Text style={styles.dropdownValue}>
            {LANGUAGES.find(l => l.code === language)?.label ?? 'English'} ▾
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={languagePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguagePickerOpen(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLanguagePickerOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={styles.modalOption}
                onPress={() => {
                  setLanguage(lang.code);
                  setLanguagePickerOpen(false);
                }}>
                <Text
                  style={[
                    styles.modalOptionText,
                    language === lang.code && styles.modalOptionTextActive,
                  ]}>
                  {lang.label}
                </Text>
                {language === lang.code && (
                  <Text style={styles.modalCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <SectionHeader title="Weather" />
      <View style={styles.section}>
        <View style={styles.topicRow}>
          <Text style={styles.topicLabel}>Show Weather</Text>
          <Switch
            value={weatherEnabled}
            onValueChange={setWeatherEnabled}
            trackColor={{false: colors.border, true: colors.primary}}
          />
        </View>
      </View>

      <SectionHeader title="News Topics" />
      <View style={styles.section}>
        {AVAILABLE_TOPICS.map(topic => (
          <View key={topic.value} style={styles.topicRow}>
            <Text style={styles.topicLabel}>{topic.label}</Text>
            <Switch
              value={selectedTopics.includes(topic.value)}
              onValueChange={() => handleToggleTopic(topic.value)}
              trackColor={{false: colors.border, true: colors.primary}}
            />
          </View>
        ))}
      </View>

      <SectionHeader title="RSS Feeds" />
      <View style={styles.section}>
        {rssFeedUrls.map(url => (
          <TouchableOpacity
            key={url}
            style={styles.listRow}
            onLongPress={() => handleRemoveFeed(url)}>
            <Text style={styles.feedUrl} numberOfLines={1}>
              {url}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/feed.xml"
            placeholderTextColor={colors.textSecondary}
            value={newFeedUrl}
            onChangeText={setNewFeedUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddFeed}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionHeader title="Sports Teams" />
      <View style={styles.section}>
        <View style={styles.topicRow}>
          <Text style={styles.topicLabel}>Live Scores</Text>
          <Switch
            value={liveScoresEnabled}
            onValueChange={setLiveScoresEnabled}
            trackColor={{false: colors.border, true: colors.primary}}
          />
        </View>
        {sportsTeams.map(team => (
          <View key={team} style={styles.listRow}>
            <Text style={styles.teamName}>{team}</Text>
            <TouchableOpacity onPress={() => handleRemoveTeam(team)}>
              <Text style={styles.removeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lakers, Yankees, Arsenal"
            placeholderTextColor={colors.textSecondary}
            value={newTeamName}
            onChangeText={setNewTeamName}
            onSubmitEditing={handleAddTeam}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTeam}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionHeader title="Watchlists" />
      <View style={styles.section}>
        {watchlists.map(list => (
          <TouchableOpacity
            key={list.id}
            style={styles.listRow}
            onLongPress={() => handleDeleteWatchlist(list.id, list.name)}>
            <Text style={styles.watchlistName}>{list.name}</Text>
            <Text style={styles.watchlistCount}>
              {list.symbols.length} stocks
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="New watchlist name"
            placeholderTextColor={colors.textSecondary}
            value={newWatchlistName}
            onChangeText={setNewWatchlistName}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateWatchlist}>
            <Text style={styles.addButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Long press on an RSS feed, sports team, or watchlist to delete it.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.surface,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topicLabel: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
  dropdownValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '80%',
    maxWidth: 320,
    paddingVertical: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalCheck: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  feedUrl: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  teamName: {
    fontSize: fontSize.lg,
    color: colors.text,
    flex: 1,
  },
  removeButton: {
    fontSize: fontSize.lg,
    color: colors.negative,
    paddingHorizontal: spacing.sm,
  },
  watchlistName: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
  watchlistCount: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  addButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
