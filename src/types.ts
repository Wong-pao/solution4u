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
  address: string;
  phone: string;
  lineId: string;
  lineUrl: string;
  email: string;
  whatsappUrl: string;
  whatsappNumber: string;
  messengerUrl: string;
  businessHoursWeekday: string;
  businessHoursWeekend: string;
  disclaimer: string;
}

export interface ConsultationInquiry {
  id: string;
  fullName: string;
  phoneNumber: string;
  contactChannel: 'whatsapp' | 'line' | 'messenger' | 'phone';
  serviceType: string;
  message: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'resolved';
}
