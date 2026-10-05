export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  iconName: string;
  category: string;
  isActive: boolean;
  order: number;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbService {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  detailed_description: string;
  icon_name: string;
  category: string;
  display_order: number;
  is_active: boolean;
  cover_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteContent<T = Record<string, any>> {
  key: string;
  section: string;
  content: T;
  updated_at?: string;
}

export interface AboutPageContent {
  headerKicker?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  storyBadge?: string;
  storyTitle?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  teamImageUrl?: string;
  value1?: string;
  value2?: string;
  visionTitle?: string;
  visionText?: string;
  visionFooterLabel?: string;
  missionTitle?: string;
  missionText?: string;
  missionFooterLabel?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryLabelEn?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryLabelEn?: string;
  ctaPrimaryTarget?: string;
  ctaSecondaryTarget?: string;
}

export interface TrustPillarItem {
  id?: string;
  num: string;
  title: string;
  desc: string;
  icon?: string;
  iconName?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TrustPillarsContent {
  sectionKicker?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  trustPillarsTitle?: string;
  trustPillarsSubtitle?: string;
  pillars?: TrustPillarItem[];
}

export interface WorkflowStepItem {
  id?: string;
  num: string;
  title: string;
  desc: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface WorkflowStepsContent {
  sectionKicker?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  workflowTitle?: string;
  workflowSubtitle?: string;
  steps?: WorkflowStepItem[];
}

export interface ContentsPageContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
}

export interface ServiceDetailContent {
  reassuranceTitle?: string;
  reassuranceText?: string;
  reassuranceItems?: string[];
  advisoryText?: string;
  consultationTitle?: string;
  consultationSubtitle?: string;
  consultationButtonLabel?: string;
  whatsappButtonLabel?: string;
  phoneButtonLabel?: string;
}

export interface BlogDetailContent {
  assistanceTitle?: string;
  assistanceSubtitle?: string;
  assistanceButtonLabel?: string;
  whatsappButtonLabel?: string;
}

export interface NavigationItem {
  id: string;
  route: 'home' | 'about' | 'services' | 'blog' | 'contact';
  englishLabel: string;
  burmeseLabel: string;
  isVisible: boolean;
  displayOrder: number;
}

export interface NavigationContent {
  items: NavigationItem[];
}

export interface ContactPageContent {
  // 1. Contact Page Header
  headerBadge?: string;
  headerTitle?: string;
  headerSubtitle?: string;

  // 2. Quick Contact Channel Cards
  telegramButtonTitle?: string;
  telegramButtonSubtext?: string;
  whatsappButtonTitle?: string;
  whatsappButtonSubtext?: string;
  messengerButtonTitle?: string;
  messengerButtonSubtext?: string;
  lineButtonTitle?: string;
  phoneButtonTitle?: string;
  emailButtonTitle?: string;
  emailButtonSubtext?: string;

  // 3. Contact Information & Business Hours
  infoSectionTitle?: string;
  addressLabel?: string;
  addressText?: string;
  phoneLabel?: string;
  emailLabel?: string;
  hoursHeading?: string;
  hoursWeekday?: string;
  hoursWeekendClosed?: string;
  hoursWeekendNote?: string;
  locationGuideHeading?: string;
  locationGuideText?: string;

  // 4. Contact Form Labels & Placeholders
  formHeading?: string;
  formDescription?: string;
  fullNameLabel?: string;
  fullNamePlaceholder?: string;
  formPhoneLabel?: string;
  formPhonePlaceholder?: string;
  serviceTypeLabel?: string;
  serviceOtherOptionLabel?: string;
  contactChannelLabel?: string;
  channelPhoneLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitButtonText?: string;
  submittingButtonText?: string;

  // 5. Feedback & Validation Messages
  successHeading?: string;
  successDescription?: string;
  sendAnotherButtonText?: string;
  rateLimitMessage?: string;
  invalidPhoneMessage?: string;
  errorMessage?: string;
}

export interface DbInquiry {
  id?: string;
  full_name: string;
  phone_number: string;
  contact_channel: string;
  service_type: string;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  author: string;
  status: 'published' | 'draft';
  publishedAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  isFeatured?: boolean;
  readTimeMinutes?: number;
}

export interface SiteSettings {
  agencyName: string;
  agencySubtext: string;
  logoUrl?: string;
  facebookCoverUrl?: string;
  facebookProfileUrl?: string;
  facebookPageUrl?: string;
  heroHeadline?: string;
  heroSupportingText?: string;
  heroTrustStatement?: string;
  emotionalQuote?: string;
  heroImageUrl?: string;
  heroBadgeTitle?: string;
  heroBadgeSubtitle?: string;
  servicesHeadline?: string;
  servicesSubtext?: string;
  address: string;
  phone: string;
  lineId: string;
  lineUrl: string;
  email: string;
  telegramUsername?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  whatsappNumber?: string;
  messengerUrl: string;
  businessHoursWeekday: string;
  businessHoursWeekend: string;
  disclaimer: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'resolved';

export interface ConsultationInquiry {
  id: string;
  fullName: string;
  phoneNumber: string;
  contactChannel: 'messenger' | 'phone' | 'line' | 'telegram' | 'email' | 'whatsapp';
  serviceType: string;
  message: string;
  createdAt: string;
  status: InquiryStatus;
}

export interface StaticPageContent {
  // A. Home Page - Knowledge Center section
  homeKnowledgeKicker?: string;
  homeKnowledgeTitle?: string;
  homeKnowledgeSubtitle?: string;

  // B. Home Page - Facebook Page Official Update
  homeFacebookTitle?: string;
  homeFacebookSubtitle?: string;

  // C. Home Page - Brand Profile area
  brandProfileName?: string;
  brandProfileSubtitle?: string;
  brandProfileSupportingText?: string;
  brandProfileMessengerHours?: string;

  // D. Home Page - Emotional CTA section
  homeCtaTitle?: string;
  homeCtaSubtitle?: string;

  // E. Footer description
  footerDescription?: string;

  // 3. Service Detail Page - Standard Support Section & Notice
  serviceDetailSupportHeading?: string;
  serviceDetailSupportBullet1?: string;
  serviceDetailSupportBullet2?: string;
  serviceDetailSupportBullet3?: string;
  serviceDetailSupportBullet4?: string;
  serviceDetailNoticeDisclaimer?: string;
  serviceDetailPrimaryBtn?: string;
  serviceDetailSecondaryBtn?: string;
  serviceDetailTertiaryBtn?: string;

  // 4. Services Page
  servicesHeaderKicker?: string;
  servicesHeaderTitle?: string;
  servicesHeaderSubtitle?: string;
  servicesTrustTitle?: string;
  servicesTrustSubtitle?: string;

  // 5. Content / Knowledge Center Page (BlogPage)
  blogPageKicker?: string;
  blogPageTitle?: string;
  blogPageSubtitle?: string;

  // 6. Article / Content Detail Page - Bottom CTA (BlogDetailPage)
  articleCtaBadge?: string;
  articleCtaTitle?: string;
  articleCtaSubtitle?: string;
  articleCtaHeading?: string;
  articleCtaDescription?: string;
  articleCtaPrimaryBtn?: string;
  articleCtaSecondaryBtn?: string;
}
