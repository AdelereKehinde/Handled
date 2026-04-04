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
import { Colors, Spacing, Radius } from '../theme';

const LAST_UPDATED = 'January 1, 2025';

const SECTIONS = [
  {
    id: 'intro',
    title: '1. Introduction',
    content: `Welcome to Handled ("we", "us", or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our mobile application and related services.

By using Handled, you consent to the collection and use of your information as described in this policy. If you do not agree, please discontinue use of the app immediately.`,
  },
  {
    id: 'collection',
    title: '2. Data We Collect',
    content: `We collect the following categories of personal data:

• Identity Data: username, age, gender, profile picture
• Contact Data: email address
• Usage Data: decision patterns, app interactions, session duration
• Device Data: device type, OS version, unique device identifiers
• ADHD Profile Data: self-reported challenges and preferences you provide during onboarding

We collect data directly from you (e.g. during signup), automatically (e.g. usage analytics), and optionally through third-party services.`,
  },
  {
    id: 'usage',
    title: '3. How We Use Your Data',
    content: `We use your data for the following purposes:

• To create and manage your account
• To deliver personalized decision support
• To improve app features and performance
• To send transactional communications (OTPs, notifications)
• To comply with legal obligations
• To detect and prevent fraud or misuse

We do NOT sell your personal data to advertisers or third-party marketers.`,
  },
  {
    id: 'adhd',
    title: '4. ADHD Personalization Data',
    content: `Handled collects sensitive information related to ADHD challenges to personalize your experience. This includes:

• Decision fatigue levels
• Task paralysis triggers
• Hyperfocus patterns
• Emotional regulation preferences

This data is treated with the highest level of care. It is:

• Stored encrypted at rest
• Never shared with third parties without explicit consent
• Used solely to improve your in-app experience
• Deletable at any time from your account settings`,
  },
  {
    id: 'security',
    title: '5. Data Security',
    content: `We implement industry-standard security measures including:

• AES-256 encryption for stored data
• TLS 1.3 for data in transit
• Regular security audits and penetration testing
• Access control policies limiting employee data access
• Secure token-based authentication (JWT)

Despite our best efforts, no method of electronic transmission is 100% secure. We encourage users to use strong passwords and to notify us immediately of any suspected breach.`,
  },
  {
    id: 'rights',
    title: '6. Your Rights',
    content: `Depending on your jurisdiction, you may have the following rights:

• Right to Access: Request a copy of your data
• Right to Rectification: Correct inaccurate data
• Right to Erasure: Request deletion of your account and data
• Right to Portability: Export your data in a machine-readable format
• Right to Object: Opt out of certain processing activities
• Right to Withdraw Consent: At any time, for consent-based processing

To exercise your rights, contact us at: privacy@handled.app`,
  },
  {
    id: 'cookies',
    title: '7. Cookies & Tracking',
    content: `Our mobile application uses the following tracking technologies:

• Session Tokens: Required for authentication and security
• Analytics Identifiers: Anonymous usage tracking to improve performance
• Crash Reporting: Automatic crash logs sent to our infrastructure

We do not use advertising cookies or cross-site tracking. You can disable analytics tracking from your account settings at any time.`,
  },
  {
    id: 'third',
    title: '8. Third-Party Services',
    content: `Handled uses the following third-party services, each with their own privacy policies:

• Expo (React Native): App delivery and updates
• AWS / Cloud Provider: Secure backend infrastructure
• SendGrid or similar: Transactional email delivery (OTPs)
• Sentry (optional): Error reporting and monitoring

We do not integrate Facebook Pixel, Google Ads, or any behavioral advertising networks. All third-party integrations are reviewed for compliance before use.`,
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make significant changes, we will:

• Notify you via push notification or email
• Update the "Last Updated" date at the top of this page
• Require re-acknowledgment if changes affect your rights materially

Continued use of Handled after changes constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: `If you have any questions about this Privacy Policy, your data, or your rights, contact us:

📧 Email: privacy@handled.app
📍 Address: Handled Technologies Ltd., Lagos, Nigeria
🕐 Response Time: Within 72 business hours

We take all privacy inquiries seriously and will respond promptly.`,
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
    a: "Yes. Providing ADHD challenge information during onboarding is optional. The app functions without it, though personalization features will be limited.",
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.shieldBadge}>
            <Text style={styles.shieldEmoji}>🛡️</Text>
          </View>
          <Text style={styles.heroTitle}>Your Privacy,{'\n'}Our Priority</Text>
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
        <Text style={styles.faqTitle}>Frequently Asked{'\n'}Questions</Text>
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
    borderBottomColor: Colors.whiteAlpha10,
  },
  backBtn: { padding: 4 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  topTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
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
    backgroundColor: 'rgba(108,92,231,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  shieldEmoji: { fontSize: 40 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.whiteAlpha30,
    marginBottom: 16,
  },
  heroBadge: {
    backgroundColor: 'rgba(0,207,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.25)',
  },
  heroBadgeText: {
    color: Colors.glow,
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
    color: Colors.primaryLight,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  sectionContent: {
    fontSize: 14,
    color: Colors.whiteAlpha60,
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
    backgroundColor: Colors.whiteAlpha10,
  },
  divLabel: {
    color: Colors.whiteAlpha30,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // FAQ
  faqTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 36,
    marginBottom: 8,
  },
  faqSub: {
    fontSize: 15,
    color: Colors.whiteAlpha60,
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
    color: Colors.whiteAlpha30,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: Colors.glow,
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: 12,
    color: Colors.whiteAlpha10,
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
    color: '#fff',
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
    borderTopColor: Colors.whiteAlpha10,
  },
  answer: {
    fontSize: 13,
    color: Colors.whiteAlpha60,
    lineHeight: 21,
    paddingTop: 12,
  },
});
