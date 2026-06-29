import { ArrowLeft, ArrowRight, Check, Clock3, Trophy, UsersRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/dictionaries';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const SLIDES = [
  {
    bodyKey: 'onboarding.bodyOne',
    icon: UsersRound,
    titleKey: 'onboarding.titleOne',
  },
  {
    bodyKey: 'onboarding.bodyTwo',
    icon: Clock3,
    titleKey: 'onboarding.titleTwo',
  },
  {
    bodyKey: 'onboarding.bodyThree',
    icon: Trophy,
    titleKey: 'onboarding.titleThree',
  },
] satisfies {
  bodyKey: TranslationKey;
  icon: typeof UsersRound;
  titleKey: TranslationKey;
}[];

type OnboardingProps = {
  onFinish: () => Promise<void> | void;
};

export function Onboarding({ onFinish }: OnboardingProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;
  const Icon = slide.icon;
  const progress = useMemo(() => `${index + 1}/${SLIDES.length}`, [index]);

  function goNext() {
    if (isLast) {
      void onFinish();
      return;
    }

    setIndex((current) => current + 1);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.topbar}>
          <Logo compact />
          <Pressable accessibilityRole="button" onPress={() => void onFinish()} style={styles.skip}>
            <Text style={[styles.skipText, { color: colors.muted }]}>{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={[styles.eyebrow, { color: colors.amberDeep }]}>
            {t('onboarding.eyebrow')} · {progress}
          </Text>

          <View
            style={[
              styles.iconStage,
              {
                backgroundColor: colors.petroleum,
                shadowColor: colors.petroleum,
              },
            ]}
          >
            <Icon color={colors.amber} size={72} strokeWidth={1.8} />
          </View>

          <Text style={[styles.title, { color: colors.petroleum }]}>{t(slide.titleKey)}</Text>
          <Text style={[styles.copy, { color: colors.muted }]}>{t(slide.bodyKey)}</Text>

          <View style={styles.dots}>
            {SLIDES.map((item, itemIndex) => (
              <View
                key={item.titleKey}
                style={[
                  styles.dot,
                  {
                    backgroundColor: itemIndex === index ? colors.petroleum : colors.border,
                    width: itemIndex === index ? 26 : 9,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isFirst}
            onPress={() => setIndex((current) => Math.max(0, current - 1))}
            style={[
              styles.secondaryAction,
              {
                borderColor: colors.border,
                opacity: isFirst ? 0.35 : 1,
              },
            ]}
          >
            <ArrowLeft color={colors.petroleum} size={18} strokeWidth={2.7} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={goNext}
            style={[styles.primaryAction, { backgroundColor: colors.petroleum }]}
          >
            <Text style={[styles.primaryText, { color: colors.surface }]}>
              {isLast ? t('onboarding.start') : t('onboarding.next')}
            </Text>
            {isLast ? (
              <Check color={colors.surface} size={19} strokeWidth={3} />
            ) : (
              <ArrowRight color={colors.surface} size={19} strokeWidth={2.8} />
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  body: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    padding: spacing.screen,
  },
  copy: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 330,
    textAlign: 'center',
  },
  dot: {
    borderRadius: 999,
    height: 9,
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 28,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 28,
    textTransform: 'uppercase',
  },
  iconStage: {
    alignItems: 'center',
    borderRadius: 28,
    height: 142,
    justifyContent: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    width: 142,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '900',
  },
  safeArea: {
    flex: 1,
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  skip: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    fontSize: 35,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
    marginTop: 34,
    maxWidth: 350,
    textAlign: 'center',
  },
  topbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
