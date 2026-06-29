import { router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { privacyPolicies } from '@/features/privacy/privacy';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

const GOOGLE_PRIVACY_URL = 'https://policies.google.com/privacy';

export default function PrivacyScreen() {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const copy = privacyPolicies[locale];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo compact />
          <Button label={copy.backHome} onPress={() => router.replace('/')} variant="ghost" />
        </View>

        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.petroleum }]}>{copy.title}</Text>
          <Text style={[styles.updated, { color: colors.amberDeep }]}>{copy.updated}</Text>
          <Text style={[styles.intro, { color: colors.muted }]}>{copy.intro}</Text>
        </View>

        <Card style={styles.compactCard} title={copy.overviewLabel}>
          <View style={styles.overviewList}>
            {copy.overview.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.overviewItem,
                  { backgroundColor: colors.warmWhite, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.overviewTitle, { color: colors.petroleum }]}>
                  {item.title}
                </Text>
                <Text style={[styles.overviewBody, { color: colors.muted }]}>{item.body}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.compactCard} title={copy.noteTitle}>
          <Text style={[styles.paragraph, { color: colors.muted }]}>{copy.noteBody}</Text>
        </Card>

        {copy.sections.map((section) => (
          <Card key={section.id} style={styles.compactCard} title={section.title}>
            {section.body.map((paragraph) => (
              <Text key={paragraph} style={[styles.paragraph, { color: colors.muted }]}>
                {paragraph}
              </Text>
            ))}
            {section.items && (
              <View style={styles.itemList}>
                {section.items.map((item) => (
                  <Text key={item} style={[styles.item, { color: colors.petroleum }]}>
                    {item}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        ))}

        <Button
          fullWidth
          label={copy.googlePrivacy}
          onPress={() => void Linking.openURL(GOOGLE_PRIVACY_URL)}
          variant="outline"
        />

        <Text style={[styles.footer, { color: colors.muted }]}>{copy.footer}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    padding: 18,
    paddingBottom: 34,
  },
  compactCard: {
    borderRadius: 14,
    padding: 14,
    shadowOpacity: 0,
  },
  footer: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hero: {
    gap: 8,
    paddingVertical: 8,
  },
  intro: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  item: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
  },
  itemList: {
    gap: 8,
    marginTop: 10,
  },
  overviewBody: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  overviewItem: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
    padding: 12,
  },
  overviewList: {
    gap: 10,
    marginTop: 4,
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  paragraph: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 8,
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 32,
  },
  updated: {
    fontSize: 12,
    fontWeight: '900',
  },
});
