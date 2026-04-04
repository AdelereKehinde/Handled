import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';

const LAST_UPDATED = 'January 1, 2025';

const SECTIONS = [
  {
    id: 'intro',
    title: '1. Introduction',
    content:
      'Handled explains how we collect and use data when you use our app. By using Handled, you agree to this policy.',
  },
  {
    id: 'collection',
    title: '2. Data We Collect',
    content:
      'We collect basic account info (username, email, age), optional profile details, and usage or device data to run and improve the app.',
  },
  {
    id: 'usage',
    title: '3. How We Use Your Data',
    content:
      'We use data to run your account, personalize decisions, improve features, and send important messages. We do not sell your data.',
  },
  {
    id: 'adhd',
    title: '4. ADHD Personalization Data',
    content:
      'ADHD-related info is optional and used only for personalization. It is protected and can be removed from your account.',
  },
  {
    id: 'security',
    title: '5. Data Security',
    content:
      'We use encryption and access controls to protect data. No system is perfect, so use strong passwords and report concerns quickly.',
  },
  {
    id: 'rights',
    title: '6. Your Rights',
    content:
      'You can access, correct, export, or delete your data. Contact privacy@handled.app to make a request.',
  },
  {
    id: 'cookies',
    title: '7. Cookies & Tracking',
    content:
      'We use session tokens, analytics, and crash reports to keep the app secure and reliable. You can disable analytics in settings.',
  },
  {
    id: 'third',
    title: '8. Third-Party Services',
    content:
      'We use trusted providers for hosting, email, and monitoring. They process data only to provide their services.',
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content:
      'We may update this policy and will change the date above. Continued use means you accept updates.',
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content:
      'Questions or requests? Email privacy@handled.app. We respond within 72 business hours.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is my ADHD data shared with anyone?',
    a: 'No. Your ADHD personalization data is encrypted and used only to improve your in-app experience. We never share it with advertisers, employers, or third-party apps without your explicit consent.',
  },
  {
    q: 'Can I delete my account and all my data?',
    a: 'Yes. You can request full account deletion from Settings → Account → Delete Account. This permanently removes all your data from our systems within 30 days.',
  },
  {
    q: 'How is my password stored?',
    a: 'Passwords are hashed using bcrypt with a high cost factor and are never stored in plain text. Even our team cannot see your password.',
  },
  {
    q: 'Do you use my data to train AI models?',
    a: 'We do not use your personal or ADHD data to train external AI models. Any internal model improvements use anonymized, aggregated data only.',
  },
  {
    q: 'What happens if there is a data breach?',
    a: 'We will notify you within 72 hours of discovering a breach that affects your personal data, as required by applicable data protection laws. We will also take immediate steps to contain the breach and prevent further damage.',
  },
  {
    q: 'Can I use Handled without sharing ADHD data?',
    a: 'Yes. Providing ADHD challenge information during onboarding is optional. The app functions without it, though personalization features will be limited.',
  },
  {
    q: 'How long do you keep my data?',
    a: 'We retain your data for as long as your account is active. If you delete your account, your data is removed within 30 days. Anonymized analytics may be retained longer for statistical purposes.',
  },
];

const AccordionItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = open ? 0 : 1;
    Animated.parallel([
      Animated.spring(heightAnim, { toValue, useNativeDriver: false }),
      Animated.timing(rotateAnim, { toValue, duration: 200, useNativeDriver: true }),
    ]).start();
    setOpen(!open);
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={acc.wrapper}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.8} style={acc.header}>
        <Text style={acc.question}>{item.q}</Text>
        <Animated.Text style={[acc.arrow, { transform: [{ rotate }] }]}>▾</Animated.Text>
      </TouchableOpacity>
      {open && (
        <View style={acc.body}>
          <Text style={acc.answer}>{item.a}</Text>
        </View>
      )}
    </View>
  );
};

const SectionBlock = ({ section }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{section.title}</Text>
    <Text style={styles.sectionContent}>{section.content}</Text>
  </View>
);

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Privacy Policy</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Your Privacy,{"\n"}Our Priority</Text>
          <Text style={styles.heroSub}>Last updated: {LAST_UPDATED}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>✦ We never sell your data</Text>
          </View>
        </View>

        {/* Policy sections */}
        {SECTIONS.map((s) => (
          <SectionBlock key={s.id} section={s} />
        ))}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divLine} />
          <Text style={styles.divLabel}>FAQ</Text>
          <View style={styles.divLine} />
        </View>

        {/* FAQ */}
        <Text style={styles.faqTitle}>Frequently Asked{"\n"}Questions</Text>
        <Text style={styles.faqSub}>
          Still curious? Here are answers to what people ask most.
        </Text>

        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} item={item} />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Have a privacy concern? Email us at{' '}
            <Text style={styles.footerLink}>privacy@handled.app</Text>
          </Text>
          <Text style={styles.footerCopy}>© 2025 Handled Technologies Ltd.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: { padding: 4 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  topTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  shieldBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(159,71,241,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(159,71,241,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#9f47f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
  },
  heroBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
  },
  heroBadgeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Sections
  section: {
    marginBottom: 28,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  sectionContent: {
    fontSize: 14,
    color: Colors.textSoft,
    lineHeight: 22,
  },
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 28,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.cardBorder,
  },
  divLabel: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // FAQ
  faqTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textDark,
    lineHeight: 36,
    marginBottom: 8,
  },
  faqSub: {
    fontSize: 15,
    color: Colors.textSoft,
    marginBottom: 24,
    lineHeight: 22,
  },
  faqList: {
    gap: 12,
  },
  // Footer
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
});

const acc = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: 20,
  },
  arrow: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  answer: {
    fontSize: 13,
    color: Colors.textSoft,
    lineHeight: 21,
    paddingTop: 12,
  },
});
