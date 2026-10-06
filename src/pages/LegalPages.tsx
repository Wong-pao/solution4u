import React, { useMemo } from 'react';
import { useApp, AppRoute } from '../context/AppContext';
import { LegalPagesContent } from '../types';
import { ArrowLeft, FileText, Shield, Scale, Loader2 } from 'lucide-react';

export interface LegalSection {
  heading: string;
  blocks: Array<
    | { type: 'p'; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'ol'; items: string[] }
  >;
}

export function serializeLegalDocToMarkdown(
  introParagraphs: string[],
  sections: LegalSection[]
): string {
  const parts: string[] = [];

  for (const intro of introParagraphs) {
    if (intro.trim()) {
      parts.push(intro.trim());
    }
  }

  for (const section of sections) {
    parts.push(`## ${section.heading.trim()}`);
    for (const block of section.blocks) {
      if (block.type === 'p') {
        parts.push(block.text.trim());
      } else if (block.type === 'ul') {
        parts.push(block.items.map((item) => `* ${item.trim()}`).join('\n'));
      } else if (block.type === 'ol') {
        parts.push(block.items.map((item, idx) => `${idx + 1}. ${item.trim()}`).join('\n'));
      }
    }
  }

  return parts.join('\n\n');
}

export function parseMarkdownToLegalDoc(markdown: string): {
  introParagraphs: string[];
  sections: LegalSection[];
} {
  const introParagraphs: string[] = [];
  const sections: LegalSection[] = [];
  if (!markdown || !markdown.trim()) {
    return { introParagraphs, sections };
  }

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let currentSection: LegalSection | null = null;
  let currentUl: string[] | null = null;
  let currentOl: string[] | null = null;
  let currentParaLines: string[] = [];

  const flushListsAndParagraphs = () => {
    if (currentParaLines.length > 0) {
      const text = currentParaLines.join(' ').trim();
      if (text) {
        if (currentSection) {
          currentSection.blocks.push({ type: 'p', text });
        } else {
          introParagraphs.push(text);
        }
      }
      currentParaLines = [];
    }
    if (currentUl && currentUl.length > 0) {
      if (!currentSection) {
        currentSection = { heading: '', blocks: [] };
        sections.push(currentSection);
      }
      currentSection.blocks.push({ type: 'ul', items: [...currentUl] });
      currentUl = null;
    }
    if (currentOl && currentOl.length > 0) {
      if (!currentSection) {
        currentSection = { heading: '', blocks: [] };
        sections.push(currentSection);
      }
      currentSection.blocks.push({ type: 'ol', items: [...currentOl] });
      currentOl = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushListsAndParagraphs();
      continue;
    }

    // Section heading: ## Heading or ### Heading
    if (/^#{1,3}\s+/.test(line)) {
      flushListsAndParagraphs();
      const headingText = line.replace(/^#{1,3}\s+/, '').trim();
      currentSection = {
        heading: headingText,
        blocks: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Bullet item: * item or - item or • item
    if (/^([*\-•])\s+/.test(line)) {
      if (currentParaLines.length > 0 || currentOl) {
        flushListsAndParagraphs();
      }
      if (!currentUl) currentUl = [];
      currentUl.push(line.replace(/^([*\-•])\s+/, '').trim());
      continue;
    }

    // Numbered list item: 1. item
    if (/^\d+\.\s+/.test(line)) {
      if (currentParaLines.length > 0 || currentUl) {
        flushListsAndParagraphs();
      }
      if (!currentOl) currentOl = [];
      currentOl.push(line.replace(/^\d+\.\s+/, '').trim());
      continue;
    }

    // Normal paragraph line
    if (currentUl || currentOl) {
      flushListsAndParagraphs();
    }
    currentParaLines.push(line);
  }

  flushListsAndParagraphs();
  return { introParagraphs, sections };
}

interface LegalDocumentProps {
  title: string;
  activeRoute: 'privacy-policy' | 'terms-of-service' | 'disclaimer';
  introParagraphs: string[];
  sections: LegalSection[];
}

const LegalDocumentLayout: React.FC<LegalDocumentProps> = ({
  title,
  activeRoute,
  introParagraphs,
  sections,
}) => {
  const { navigateTo } = useApp();

  const legalTabs: { label: string; route: AppRoute; icon: React.ReactNode }[] = [
    { label: 'Privacy Policy', route: 'privacy-policy', icon: <Shield className="w-4 h-4" /> },
    { label: 'Terms of Service', route: 'terms-of-service', icon: <FileText className="w-4 h-4" /> },
    { label: 'Disclaimer', route: 'disclaimer', icon: <Scale className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-slate-50/60 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Back button + Legal navigation pills */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700 transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {legalTabs.map((tab) => {
              const isCurrent = activeRoute === tab.route;
              return (
                <button
                  key={tab.route}
                  type="button"
                  onClick={() => navigateTo(tab.route)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Document Card */}
        <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-10 lg:p-12">
          <header className="pb-6 sm:pb-8 mb-8 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {introParagraphs.length > 0 && (
              <div className="mt-5 space-y-4 text-[15px] sm:text-base text-slate-700 leading-relaxed">
                {introParagraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}
          </header>

          <div className="space-y-8 sm:space-y-10">
            {sections.map((section, idx) => (
              <section key={idx} className="space-y-3.5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {section.heading}
                </h2>
                <div className="space-y-3.5 text-[15px] sm:text-base text-slate-700 leading-relaxed">
                  {section.blocks.map((block, bIdx) => {
                    if (block.type === 'p') {
                      return <p key={bIdx}>{block.text}</p>;
                    }
                    if (block.type === 'ul') {
                      return (
                        <ul
                          key={bIdx}
                          className="list-disc pl-6 space-y-2 text-slate-700 marker:text-sky-600"
                        >
                          {block.items.map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === 'ol') {
                      return (
                        <ol
                          key={bIdx}
                          className="list-decimal pl-6 space-y-2 text-slate-700 marker:text-sky-700 marker:font-semibold"
                        >
                          {block.items.map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ol>
                      );
                    }
                    return null;
                  })}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};

// ============================================================================
// 1. PRIVACY POLICY PAGE
// ============================================================================

const PRIVACY_POLICY_INTRO: string[] = [
  'Solution for You – အဖြေက ဒီမှာပါ (“Solution for You”, “we”, “our”, or “us”) respects your privacy and is committed to handling personal information responsibly.',
  'This Privacy Policy explains how we collect, use, disclose, retain, and protect personal information when you visit our website, submit an inquiry, communicate with us, or request and use our services.',
  'By using our website or submitting an inquiry, you acknowledge that you have read and understood this Privacy Policy.',
];

const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    heading: '1. Who We Are',
    blocks: [
      {
        type: 'p',
        text: 'Solution for You is a private service provider offering assistance and coordination services for Myanmar customers in Thailand.',
      },
      {
        type: 'p',
        text: 'Our services include immigration and administrative assistance, document-related services, employment-related assistance, interpretation, accommodation assistance, travel arrangements, transportation, and other services described on our website.',
      },
      {
        type: 'p',
        text: 'Solution for You is not a government authority, embassy, consulate, immigration office, bank, airline, hotel, employer, landlord, or other official decision-making authority.',
      },
    ],
  },
  {
    heading: '2. Personal Information We Collect',
    blocks: [
      {
        type: 'p',
        text: 'Depending on the service you request, we may collect personal information including:',
      },
      {
        type: 'ul',
        items: [
          'Full name',
          'Telephone number',
          'Email address',
          'Preferred contact method',
          'Nationality',
          'Passport or identification information',
          'Immigration or stay-related information',
          'Employment and employer information',
          'Documents and supporting records',
          'Information required for document preparation or document review',
          'Travel information',
          'Accommodation information',
          'Information provided through consultation or inquiry forms',
          'Communications between you and Solution for You',
          'Payment-related information where necessary',
          'Other information that you voluntarily provide for a requested service',
        ],
      },
      {
        type: 'p',
        text: 'We seek to collect information that is reasonably necessary for the relevant service or purpose.',
      },
    ],
  },
  {
    heading: '3. Information Contained in Customer Documents',
    blocks: [
      {
        type: 'p',
        text: 'Some services may require customers to provide copies, photographs, or other forms of passports, identification documents, immigration documents, employment documents, resignation letters, certificates, contracts, photographs, or other supporting documents.',
      },
      {
        type: 'p',
        text: 'These documents may contain personal or sensitive information.',
      },
      {
        type: 'p',
        text: 'We will handle such information only for legitimate and relevant purposes connected with the requested service, subject to applicable law.',
      },
      {
        type: 'p',
        text: 'Customers should provide only information and documents that are relevant to the requested service.',
      },
    ],
  },
  {
    heading: '4. Sensitive Personal Data',
    blocks: [
      {
        type: 'p',
        text: 'Certain categories of personal information may constitute sensitive personal data under applicable law.',
      },
      {
        type: 'p',
        text: 'For example, information relating to health or medical conditions may constitute sensitive personal data.',
      },
      {
        type: 'p',
        text: 'This may be relevant to our Medical Interpreter service or another service where such information is voluntarily provided or reasonably required.',
      },
      {
        type: 'p',
        text: 'Where processing of sensitive personal data requires a specific legal basis, consent, or other protection under applicable law, we will handle such information accordingly.',
      },
    ],
  },
  {
    heading: '5. How We Collect Information',
    blocks: [
      {
        type: 'p',
        text: 'We may collect personal information when you:',
      },
      {
        type: 'ul',
        items: [
          'Submit an inquiry or consultation form',
          'Contact us directly',
          'Communicate with us through available communication channels',
          'Request a service',
          'Provide documents for review or processing',
          'Make or arrange a payment',
          'Communicate with us regarding an existing service',
          'Use our website',
        ],
      },
      {
        type: 'p',
        text: 'Where information is collected directly from you, we aim to explain why the information is needed and how it will be used.',
      },
    ],
  },
  {
    heading: '6. Purposes for Processing Personal Information',
    blocks: [
      {
        type: 'p',
        text: 'We may process personal information for purposes including:',
      },
      {
        type: 'ul',
        items: [
          'Responding to inquiries',
          'Providing consultations',
          'Understanding your service requirements',
          'Preparing, checking, organizing, or translating documents',
          'Providing requested services',
          'Coordinating appointments and procedures',
          'Communicating with relevant government authorities where necessary',
          'Coordinating with banks, employers, landlords, airlines, hotels, transportation providers, interpreters, or other relevant third parties',
          'Processing service-related payments',
          'Maintaining service and transaction records',
          'Responding to customer requests and complaints',
          'Preventing fraud, misuse, or unlawful activity',
          'Protecting our systems, customers, staff, and business',
          'Complying with applicable legal, regulatory, accounting, or record-keeping requirements',
          'Improving our website and services',
        ],
      },
      {
        type: 'p',
        text: 'We will generally process personal information only for the purposes communicated to you or for other purposes permitted by applicable law.',
      },
    ],
  },
  {
    heading: '7. Legal Bases for Processing',
    blocks: [
      {
        type: 'p',
        text: 'Depending on the circumstances, Solution for You may process personal information on one or more legal bases available under applicable data protection law.',
      },
      {
        type: 'p',
        text: 'These may include:',
      },
      {
        type: 'ul',
        items: [
          'Where processing is necessary to take steps at your request before entering into a service arrangement',
          'Where processing is necessary to perform a service or agreement',
          'Where processing is necessary to comply with a legal obligation',
          'Where processing is necessary for a legitimate interest, provided that such interest does not override applicable rights and protections',
          'Where you have provided consent',
          'Where another lawful basis permitted by applicable law applies',
        ],
      },
      {
        type: 'p',
        text: 'Where processing is based on consent, you may have the right to withdraw that consent, subject to applicable law and circumstances where another lawful basis permits continued processing.',
      },
    ],
  },
  {
    heading: '8. Government and Immigration Services',
    blocks: [
      {
        type: 'p',
        text: 'Some of our services involve government or immigration-related procedures, including:',
      },
      {
        type: 'ul',
        items: [
          '90-Day Report',
          'TM.30',
          'Employer Change',
          'Document Audit',
          'Other administrative or immigration-related assistance',
        ],
      },
      {
        type: 'p',
        text: 'Where necessary to provide the requested service, relevant personal information or documents may need to be submitted to the appropriate authority.',
      },
      {
        type: 'p',
        text: 'Government authorities may independently collect, verify, process, retain, or disclose information according to their own legal requirements and procedures.',
      },
      {
        type: 'p',
        text: 'Solution for You does not control how an independent government authority processes information after it has been submitted to that authority.',
      },
    ],
  },
  {
    heading: '9. When We May Share Personal Information',
    blocks: [
      {
        type: 'p',
        text: 'We do not sell or rent customer personal information for commercial purposes.',
      },
      {
        type: 'p',
        text: 'We may disclose or share relevant information where reasonably necessary:',
      },
      {
        type: 'ul',
        items: [
          'To provide a service requested by you',
          'With government authorities where required or necessary for the requested service',
          'With banks or financial service providers where necessary for a requested banking service',
          'With employers or employment-related providers where necessary for job placement services',
          'With landlords, property owners, agents, or accommodation providers where necessary for accommodation services',
          'With airlines, hotels, transportation providers, booking providers, or other travel-related service providers',
          'With interpreters or other professional service providers involved in your requested service',
          'With technology, hosting, storage, communication, or other service providers supporting our business operations',
          'To comply with applicable laws, regulations, court orders, or lawful government requests',
          'To protect our rights, property, customers, staff, or systems',
          'To investigate fraud, abuse, security incidents, or unlawful activity',
          'Where you have otherwise authorized or requested the disclosure',
        ],
      },
      {
        type: 'p',
        text: 'We aim to limit disclosure to information reasonably necessary for the relevant purpose.',
      },
    ],
  },
  {
    heading: '10. Third-Party Service Providers',
    blocks: [
      {
        type: 'p',
        text: 'Some Solution for You services involve independent third parties.',
      },
      {
        type: 'p',
        text: 'Examples include banks, employers, property providers, airlines, hotels, transportation providers, booking platforms, healthcare providers, interpreters, and government authorities.',
      },
      {
        type: 'p',
        text: 'These third parties may have their own privacy policies, terms, security practices, eligibility requirements, and legal obligations.',
      },
      {
        type: 'p',
        text: 'Solution for You does not control the privacy practices of independent third parties.',
      },
    ],
  },
  {
    heading: '11. Technology, Hosting, and Data Processing Providers',
    blocks: [
      {
        type: 'p',
        text: 'We may use third-party technology providers to operate our website, store information, communicate with customers, manage service records, or provide other business functions.',
      },
      {
        type: 'p',
        text: 'Such providers may process personal information on our behalf or as independent service providers depending on the nature of the service.',
      },
      {
        type: 'p',
        text: 'We take reasonable steps to use appropriate providers and to protect personal information processed through our business systems.',
      },
    ],
  },
  {
    heading: '12. International or Cross-Border Processing',
    blocks: [
      {
        type: 'p',
        text: 'Depending on the technology, service provider, or third-party organization involved, personal information may be processed or stored in Thailand or another jurisdiction.',
      },
      {
        type: 'p',
        text: 'Where applicable, we will take reasonable steps to handle cross-border transfers in accordance with applicable data protection requirements.',
      },
    ],
  },
  {
    heading: '13. Data Security',
    blocks: [
      {
        type: 'p',
        text: 'We maintain reasonable technical, organizational, and administrative measures designed to protect personal information against unauthorized access, loss, misuse, alteration, destruction, or disclosure.',
      },
      {
        type: 'p',
        text: 'However, no website, electronic communication, storage system, or Internet transmission can be guaranteed to be completely secure.',
      },
      {
        type: 'p',
        text: 'If a personal data breach occurs, we will take reasonable steps to investigate, contain, mitigate, and respond to the incident and make any notifications required by applicable law.',
      },
    ],
  },
  {
    heading: '14. Data Retention',
    blocks: [
      {
        type: 'p',
        text: 'We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including:',
      },
      {
        type: 'ul',
        items: [
          'Providing and completing requested services',
          'Maintaining appropriate business records',
          'Handling customer inquiries and disputes',
          'Meeting legal, accounting, tax, regulatory, or other obligations',
          'Establishing, exercising, or defending legal claims',
          'Protecting our legitimate business interests',
        ],
      },
      {
        type: 'p',
        text: 'When information is no longer reasonably necessary, we may delete, securely dispose of, or anonymize it, subject to applicable legal requirements.',
      },
      {
        type: 'p',
        text: 'The actual retention period may vary depending on the type of information and the nature of the service.',
      },
    ],
  },
  {
    heading: '15. Your Data Protection Rights',
    blocks: [
      {
        type: 'p',
        text: 'Subject to applicable law and relevant exceptions, you may have rights regarding your personal information, including:',
      },
      {
        type: 'ul',
        items: [
          'The right to request access to your personal information',
          'The right to request correction of inaccurate or incomplete information',
          'The right to request deletion or destruction of personal information in applicable circumstances',
          'The right to request restriction of processing in applicable circumstances',
          'The right to object to certain processing',
          'The right to withdraw consent where processing is based on consent',
          'The right to request data portability where applicable',
          'The right to lodge a complaint with the competent data protection authority where permitted by law',
        ],
      },
      {
        type: 'p',
        text: 'These rights are subject to applicable legal conditions and exceptions.',
      },
      {
        type: 'p',
        text: 'For example, we may need to retain certain information where retention is required by law or reasonably necessary to establish, exercise, or defend a legal claim.',
      },
    ],
  },
  {
    heading: '16. How to Exercise Your Rights',
    blocks: [
      {
        type: 'p',
        text: 'If you wish to exercise an applicable data protection right or ask a question about how we handle your personal information, please contact Solution for You through the contact information provided on our website.',
      },
      {
        type: 'p',
        text: 'We may need to verify your identity before processing a request in order to protect personal information from unauthorized disclosure.',
      },
      {
        type: 'p',
        text: 'We will handle valid requests in accordance with applicable law.',
      },
    ],
  },
  {
    heading: '17. Cookies and Similar Technologies',
    blocks: [
      {
        type: 'p',
        text: 'Our website may use cookies or similar technologies necessary for website functionality, security, preferences, or basic operation.',
      },
      {
        type: 'p',
        text: 'If optional analytics, advertising, or other tracking technologies are introduced, we may provide additional information or choices as required by applicable law.',
      },
    ],
  },
  {
    heading: '18. Third-Party Websites',
    blocks: [
      {
        type: 'p',
        text: 'Our website may contain links to third-party websites, including government authorities, banks, travel providers, accommodation providers, or other organizations.',
      },
      {
        type: 'p',
        text: 'We do not control those websites and are not responsible for their content, security, privacy practices, or policies.',
      },
      {
        type: 'p',
        text: 'We recommend reviewing the privacy policy of any third-party website before submitting personal information.',
      },
    ],
  },
  {
    heading: '19. Children\'s Personal Data',
    blocks: [
      {
        type: 'p',
        text: 'Our services are primarily intended for adults and persons legally capable of requesting services.',
      },
      {
        type: 'p',
        text: 'Where information concerning a minor is required for a legitimate service, we may request that the information be provided by or with the involvement of an appropriate parent, guardian, or authorized person where required by law.',
      },
    ],
  },
  {
    heading: '20. Changes to This Privacy Policy',
    blocks: [
      {
        type: 'p',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our services, website, technology, business operations, or applicable legal requirements.',
      },
      {
        type: 'p',
        text: 'The latest version will be published on this page with an updated effective date where appropriate.',
      },
    ],
  },
  {
    heading: '21. Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have questions about this Privacy Policy, wish to exercise an applicable privacy right, or have concerns about our handling of personal information, please contact us through the contact information provided on our website.',
      },
      {
        type: 'p',
        text: 'Solution for You – အဖြေက ဒီမှာပါ',
      },
    ],
  },
];

// ============================================================================
// 2. TERMS OF SERVICE PAGE
// ============================================================================

const TERMS_OF_SERVICE_INTRO: string[] = [
  'These Terms of Service (“Terms”) govern your use of the Solution for You – အဖြေက ဒီမှာပါ website and the services provided by Solution for You (“Solution for You”, “we”, “our”, or “us”).',
  'By submitting an inquiry, requesting a service, confirming a service arrangement, making a payment for a service, or otherwise engaging our services, you agree to these Terms.',
];

const TERMS_OF_SERVICE_SECTIONS: LegalSection[] = [
  {
    heading: '1. About Solution for You',
    blocks: [
      {
        type: 'p',
        text: 'Solution for You is a private service provider supporting Myanmar customers in Thailand.',
      },
      {
        type: 'p',
        text: 'We provide assistance, preparation, coordination, interpretation, and other services according to the scope agreed with each customer.',
      },
      {
        type: 'p',
        text: 'We are not a government agency, immigration authority, embassy, consulate, bank, airline, hotel, employer, landlord, or other official decision-making authority.',
      },
    ],
  },
  {
    heading: '2. Our Services',
    blocks: [
      {
        type: 'p',
        text: 'Our services may include:',
      },
      {
        type: 'ol',
        items: [
          '90-Day Report',
          'Bank Account',
          'Resignation Letter',
          'Document Audit',
          'Employer Change',
          'TM.30',
          'Medical Interpreter',
          'Condo Rental',
          'Flight & Hotel',
          'Airport Transfer',
          'Job Placement',
          'Tour Guide',
        ],
      },
      {
        type: 'p',
        text: 'The exact scope, requirements, fees, documents, timing, and conditions may differ between services.',
      },
      {
        type: 'p',
        text: 'Information displayed on the website is general service information and does not necessarily mean that every possible activity associated with a service is included.',
      },
    ],
  },
  {
    heading: '3. Service Inquiry and Confirmation',
    blocks: [
      {
        type: 'p',
        text: 'Submitting an inquiry through our website does not automatically create a confirmed service engagement.',
      },
      {
        type: 'p',
        text: 'An inquiry allows us to understand your request and determine whether and how we can assist.',
      },
      {
        type: 'p',
        text: 'Before work begins, we may communicate with you regarding:',
      },
      {
        type: 'ul',
        items: [
          'The requested service',
          'Service scope',
          'Required documents',
          'Service fees',
          'Government or third-party charges',
          'Payment arrangements',
          'Expected timeframe',
          'Service-specific conditions',
        ],
      },
      {
        type: 'p',
        text: 'A service is considered accepted only after the relevant service arrangement has been confirmed.',
      },
    ],
  },
  {
    heading: '4. Customer Responsibilities',
    blocks: [
      {
        type: 'p',
        text: 'Customers are responsible for:',
      },
      {
        type: 'ul',
        items: [
          'Providing accurate, complete, current, and truthful information',
          'Providing genuine and valid documents',
          'Reviewing information supplied to Solution for You',
          'Informing us of material changes affecting the requested service',
          'Providing requested documents within the required timeframe',
          'Attending appointments or interviews when required',
          'Following instructions from relevant authorities or third-party providers',
          'Paying applicable service, government, and third-party fees',
          'Reviewing final documents before submission or use',
        ],
      },
      {
        type: 'p',
        text: 'We are not responsible for consequences caused by information or documents that are inaccurate, incomplete, misleading, fraudulent, outdated, or supplied too late.',
      },
    ],
  },
  {
    heading: '5. Genuine and Lawful Documents',
    blocks: [
      {
        type: 'p',
        text: 'Customers must not provide forged, altered, fraudulent, misleading, or unlawfully obtained documents.',
      },
      {
        type: 'p',
        text: 'Solution for You does not assist with:',
      },
      {
        type: 'ul',
        items: [
          'Creating false documents',
          'Altering documents dishonestly',
          'Making false statements',
          'Concealing material information',
          'Misrepresenting identity or eligibility',
          'Circumventing lawful government requirements',
          'Obtaining services through unlawful methods',
        ],
      },
      {
        type: 'p',
        text: 'We may refuse or stop a service where we reasonably believe that the requested activity or supplied information may involve unlawful conduct.',
      },
    ],
  },
  {
    heading: '6. Government and Immigration-Related Services',
    blocks: [
      {
        type: 'p',
        text: 'Certain services involve government or immigration procedures, including 90-Day Report, TM.30, Employer Change, and Document Audit.',
      },
      {
        type: 'p',
        text: 'For these services:',
      },
      {
        type: 'ul',
        items: [
          'The relevant government authority remains responsible for the official decision.',
          'Government requirements may change.',
          'Additional documents may be requested.',
          'Processing times may vary.',
          'The relevant authority may approve, reject, delay, or otherwise determine the outcome.',
          'Solution for You cannot override or control a government decision.',
        ],
      },
      {
        type: 'p',
        text: 'Our service fee relates to the assistance we provide and does not represent a payment for guaranteed government approval.',
      },
    ],
  },
  {
    heading: '7. No Guarantee of Outcome',
    blocks: [
      {
        type: 'p',
        text: 'Unless expressly agreed otherwise in writing, Solution for You does not guarantee:',
      },
      {
        type: 'ul',
        items: [
          'Government approval',
          'Immigration approval',
          'Visa or stay permission',
          '90-Day Report acceptance',
          'TM.30 processing or acceptance',
          'Employer Change approval',
          'Bank account approval',
          'Employment or job placement',
          'Salary or employment conditions',
          'Condo rental approval',
          'Property availability',
          'Flight availability',
          'Hotel availability',
          'Airport transfer availability',
          'Appointment availability',
          'A particular processing time',
          'Entry into Thailand or another country',
          'Any result controlled by an independent authority or third party',
        ],
      },
    ],
  },
  {
    heading: '8. Bank Account Assistance',
    blocks: [
      {
        type: 'p',
        text: 'For bank account assistance, the relevant bank decides whether an applicant qualifies for an account and what documents or conditions are required.',
      },
      {
        type: 'p',
        text: 'Bank policies, eligibility requirements, fees, account types, and approval decisions may differ and may change.',
      },
      {
        type: 'p',
        text: 'Solution for You does not guarantee bank approval.',
      },
    ],
  },
  {
    heading: '9. Employment and Job Placement',
    blocks: [
      {
        type: 'p',
        text: 'For job placement assistance, Solution for You may provide information, communication, coordination, or introductions within the agreed service scope.',
      },
      {
        type: 'p',
        text: 'The employer makes the final employment decision.',
      },
      {
        type: 'p',
        text: 'We do not guarantee:',
      },
      {
        type: 'ul',
        items: [
          'A job offer',
          'Hiring',
          'Salary',
          'Working conditions',
          'Work authorization',
          'Continued employment',
          'Any particular employment outcome',
        ],
      },
      {
        type: 'p',
        text: 'Customers should review employment contracts and conditions carefully before accepting employment.',
      },
    ],
  },
  {
    heading: '10. Condo Rental and Accommodation',
    blocks: [
      {
        type: 'p',
        text: 'For condo rental or accommodation assistance, the property owner, landlord, agent, hotel, or accommodation provider controls availability, pricing, eligibility, deposits, contracts, cancellation conditions, and acceptance.',
      },
      {
        type: 'p',
        text: 'Solution for You does not own or control third-party properties unless expressly stated.',
      },
      {
        type: 'p',
        text: 'Customers should review and understand the final rental or accommodation agreement before signing.',
      },
    ],
  },
  {
    heading: '11. Flight, Hotel, and Travel Services',
    blocks: [
      {
        type: 'p',
        text: 'Flight and hotel services may involve airlines, hotels, booking platforms, or other third-party providers.',
      },
      {
        type: 'p',
        text: 'Prices, availability, schedules, cancellation conditions, baggage rules, accommodation conditions, and other requirements may be determined by those providers.',
      },
      {
        type: 'p',
        text: "Once a third-party booking has been made, the provider's terms may apply.",
      },
    ],
  },
  {
    heading: '12. Airport Transfer',
    blocks: [
      {
        type: 'p',
        text: 'Airport transfer services may depend on drivers, transportation providers, traffic conditions, airport rules, weather, vehicle availability, or other circumstances outside our control.',
      },
      {
        type: 'p',
        text: 'We will make reasonable efforts to coordinate the agreed transfer service but cannot guarantee circumstances controlled by third parties or events beyond our reasonable control.',
      },
    ],
  },
  {
    heading: '13. Tour Guide Service',
    blocks: [
      {
        type: 'p',
        text: 'Tour Guide services are subject to the agreed itinerary, availability, local conditions, venue requirements, transportation, weather, and other circumstances that may affect the service.',
      },
      {
        type: 'p',
        text: 'Schedules or activities may need to change when reasonably necessary for safety, availability, legal requirements, or circumstances outside our control.',
      },
    ],
  },
  {
    heading: '14. Medical Interpreter Service',
    blocks: [
      {
        type: 'p',
        text: 'Medical interpretation is intended to assist communication between the customer and healthcare professionals.',
      },
      {
        type: 'p',
        text: 'An interpreter does not replace a doctor, nurse, or other qualified healthcare professional.',
      },
      {
        type: 'p',
        text: 'Solution for You does not provide independent medical diagnosis, treatment, prescription, or medical decision-making.',
      },
      {
        type: 'p',
        text: 'Medical decisions remain with qualified healthcare professionals and the customer.',
      },
    ],
  },
  {
    heading: '15. Resignation Letter Service',
    blocks: [
      {
        type: 'p',
        text: 'Where we assist with resignation letters or similar documents, our role is to assist with preparation according to the information provided by the customer.',
      },
      {
        type: 'p',
        text: 'The customer is responsible for reviewing the final document before using or submitting it.',
      },
      {
        type: 'p',
        text: 'We do not guarantee that an employer or other recipient will accept a particular document unless expressly included within the agreed service scope.',
      },
    ],
  },
  {
    heading: '16. Document Audit',
    blocks: [
      {
        type: 'p',
        text: 'A Document Audit means reviewing documents against the requirements or information available to us at the time of review.',
      },
      {
        type: 'p',
        text: 'A Document Audit does not guarantee that a government authority, bank, employer, landlord, airline, hotel, or other third party will accept the documents.',
      },
      {
        type: 'p',
        text: 'Additional documents or changes may be requested by the relevant authority or provider.',
      },
    ],
  },
  {
    heading: '17. Fees and Charges',
    blocks: [
      {
        type: 'p',
        text: 'Applicable Solution for You service fees will be communicated before work begins where reasonably practicable.',
      },
      {
        type: 'p',
        text: 'Depending on the service, additional amounts may include:',
      },
      {
        type: 'ul',
        items: [
          'Government fees',
          'Official application charges',
          'Bank charges',
          'Payment processing charges',
          'Airline charges',
          'Hotel charges',
          'Transportation charges',
          'Property-related charges',
          'Other third-party charges',
        ],
      },
      {
        type: 'p',
        text: 'Unless expressly stated otherwise, third-party and government charges are separate from Solution for You service fees.',
      },
      {
        type: 'p',
        text: 'Payment timing and payment methods may vary by service.',
      },
    ],
  },
  {
    heading: '18. Cancellation and Refunds',
    blocks: [
      {
        type: 'p',
        text: 'Cancellation and refund conditions may depend on:',
      },
      {
        type: 'ul',
        items: [
          'The service requested',
          'The stage at which cancellation occurs',
          'Work already completed',
          'Payments already made to third parties',
          'Government or official charges already paid',
          'The applicable service quotation or agreement',
        ],
      },
      {
        type: 'p',
        text: 'Where applicable, cancellation and refund conditions will be communicated as part of the relevant service arrangement.',
      },
      {
        type: 'p',
        text: 'Payments made directly to government authorities or third-party providers may be subject to their own refund policies and may not be recoverable.',
      },
      {
        type: 'p',
        text: 'Nothing in this section is intended to exclude or restrict any refund or consumer protection right that cannot lawfully be excluded under applicable law.',
      },
    ],
  },
  {
    heading: '19. Processing Times',
    blocks: [
      {
        type: 'p',
        text: 'Any timeframe communicated by Solution for You is an estimate unless expressly confirmed in writing as a guaranteed deadline.',
      },
      {
        type: 'p',
        text: 'Processing may be affected by:',
      },
      {
        type: 'ul',
        items: [
          'Government authorities',
          'Banks',
          'Employers',
          'Landlords',
          'Airlines',
          'Hotels',
          'Transportation providers',
          'Public holidays',
          'Policy changes',
          'Additional document requests',
          'Missing or incorrect information',
          'Technical issues',
          'Events beyond our reasonable control',
        ],
      },
      {
        type: 'p',
        text: 'We will make reasonable efforts to communicate significant delays when we become aware of them.',
      },
    ],
  },
  {
    heading: '20. Changes in Rules and Requirements',
    blocks: [
      {
        type: 'p',
        text: 'Government rules, immigration requirements, administrative procedures, fees, eligibility requirements, and third-party policies may change without notice.',
      },
      {
        type: 'p',
        text: 'Information previously provided may therefore become outdated.',
      },
      {
        type: 'p',
        text: 'Where a change materially affects an ongoing service, we will make reasonable efforts to inform the customer.',
      },
    ],
  },
  {
    heading: '21. Customer Communications',
    blocks: [
      {
        type: 'p',
        text: 'Customers are responsible for providing a reliable contact method and responding to reasonable requests for information or documents.',
      },
      {
        type: 'p',
        text: 'If we cannot proceed because the customer cannot be contacted or required information is not provided within a reasonable timeframe, the service may be delayed, suspended, or closed.',
      },
    ],
  },
  {
    heading: '22. Prohibited Use',
    blocks: [
      {
        type: 'p',
        text: 'Customers must not use our website or services to:',
      },
      {
        type: 'ul',
        items: [
          'Commit or facilitate unlawful activity',
          'Submit false information',
          'Use forged documents',
          'Defraud a government authority, bank, employer, landlord, or other party',
          'Misrepresent identity or eligibility',
          'Circumvent lawful requirements',
          'Attempt unauthorized access to our systems',
          'Interfere with the operation of our website',
          'Harass, threaten, or abuse our staff or service providers',
        ],
      },
      {
        type: 'p',
        text: 'We reserve the right to refuse or discontinue services where reasonably necessary.',
      },
    ],
  },
  {
    heading: '23. Website Information',
    blocks: [
      {
        type: 'p',
        text: 'Information on our website is provided for general information and service guidance.',
      },
      {
        type: 'p',
        text: 'We make reasonable efforts to keep website information useful and current, but we do not guarantee that every page will always be complete, accurate, or current for every individual circumstance.',
      },
      {
        type: 'p',
        text: 'For important or time-sensitive matters, customers should confirm current requirements with the relevant official authority or service provider.',
      },
    ],
  },
  {
    heading: '24. Intellectual Property',
    blocks: [
      {
        type: 'p',
        text: 'Unless otherwise stated, the Solution for You website, branding, design, text, graphics, images, original content, and other materials are owned by or licensed to Solution for You.',
      },
      {
        type: 'p',
        text: 'You may not reproduce, modify, distribute, publish, sell, or commercially exploit our protected materials without appropriate permission.',
      },
    ],
  },
  {
    heading: '25. Third-Party Websites and Services',
    blocks: [
      {
        type: 'p',
        text: 'Our website or services may involve third-party websites, platforms, authorities, banks, employers, landlords, airlines, hotels, transportation providers, or other organizations.',
      },
      {
        type: 'p',
        text: 'We do not control independent third parties and cannot guarantee their availability, pricing, policies, performance, security, or decisions.',
      },
      {
        type: 'p',
        text: 'Third-party services may be subject to separate terms and conditions.',
      },
    ],
  },
  {
    heading: '26. Limitation of Liability',
    blocks: [
      {
        type: 'p',
        text: 'To the maximum extent permitted by applicable law, Solution for You is not responsible for losses, delays, refusals, additional costs, or other consequences caused by circumstances outside our reasonable control.',
      },
      {
        type: 'p',
        text: 'This may include:',
      },
      {
        type: 'ul',
        items: [
          'Government decisions',
          'Bank decisions',
          'Employer decisions',
          'Property provider decisions',
          'Airline or hotel decisions',
          'Third-party provider failures',
          'Government policy changes',
          'Customer-supplied information',
          'Delayed customer cooperation',
          'Technical failures',
          'Traffic, weather, or transportation conditions',
          'Other events beyond our reasonable control',
        ],
      },
      {
        type: 'p',
        text: 'Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.',
      },
    ],
  },
  {
    heading: '27. Suspension or Refusal of Service',
    blocks: [
      {
        type: 'p',
        text: 'We may refuse, suspend, or discontinue a service where:',
      },
      {
        type: 'ul',
        items: [
          'The requested activity appears unlawful',
          'False or fraudulent information is provided',
          'Required documents are not provided',
          'The customer does not reasonably cooperate',
          'Continuing the service creates an unreasonable legal, security, or operational risk',
          'A relevant authority or third party prevents the service from proceeding',
          'The service becomes unavailable',
        ],
      },
      {
        type: 'p',
        text: 'Where appropriate, we will explain the reason for suspension or refusal.',
      },
    ],
  },
  {
    heading: '28. Changes to These Terms',
    blocks: [
      {
        type: 'p',
        text: 'We may update these Terms from time to time to reflect changes in our services, website, business operations, or applicable legal requirements.',
      },
      {
        type: 'p',
        text: 'The latest version will be published on this page with the applicable effective date.',
      },
      {
        type: 'p',
        text: 'For an existing service engagement, specific written terms agreed for that service may continue to apply where appropriate.',
      },
    ],
  },
  {
    heading: '29. Applicable Law',
    blocks: [
      {
        type: 'p',
        text: 'These Terms are intended to operate in accordance with applicable laws and regulations.',
      },
      {
        type: 'p',
        text: 'Nothing in these Terms is intended to remove or restrict any mandatory rights or protections available to customers under applicable law.',
      },
    ],
  },
  {
    heading: '30. Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have questions about these Terms, a service, fees, cancellation conditions, or your service engagement, please contact Solution for You through the contact information provided on our website.',
      },
      {
        type: 'p',
        text: 'Solution for You – အဖြေက ဒီမှာပါ',
      },
    ],
  },
];

// ============================================================================
// 3. DISCLAIMER PAGE
// ============================================================================

const DISCLAIMER_INTRO: string[] = [
  'The information and services provided by Solution for You – အဖြေက ဒီမှာပါ (“Solution for You”, “we”, “our”, or “us”) are provided subject to this Disclaimer.',
];

const DISCLAIMER_SECTIONS: LegalSection[] = [
  {
    heading: '1. Independent Private Service Provider',
    blocks: [
      {
        type: 'p',
        text: 'Solution for You is an independent private service provider.',
      },
      {
        type: 'p',
        text: 'We are not a government agency, immigration authority, embassy, consulate, bank, airline, hotel, employer, landlord, or other official government organization.',
      },
      {
        type: 'p',
        text: 'Unless expressly stated otherwise, Solution for You is not affiliated with, endorsed by, or acting as an official representative of any government authority.',
      },
    ],
  },
  {
    heading: '2. Government and Immigration Decisions',
    blocks: [
      {
        type: 'p',
        text: 'For services involving immigration, government procedures, or official applications, the relevant government authority has the sole responsibility for the official decision.',
      },
      {
        type: 'p',
        text: 'Solution for You cannot guarantee:',
      },
      {
        type: 'ul',
        items: [
          'Government approval',
          'Immigration approval',
          'Visa or stay permission',
          '90-Day Report acceptance',
          'TM.30 processing or acceptance',
          'Employer Change approval',
          'Entry into Thailand',
          'Processing time',
          'Any other government-controlled outcome',
        ],
      },
      {
        type: 'p',
        text: 'Our assistance does not give us authority to influence, override, or guarantee a government decision.',
      },
    ],
  },
  {
    heading: '3. Website Information',
    blocks: [
      {
        type: 'p',
        text: 'Information on this website is provided for general informational and service-guidance purposes.',
      },
      {
        type: 'p',
        text: 'Government requirements, immigration rules, fees, procedures, eligibility requirements, and processing times may change.',
      },
      {
        type: 'p',
        text: "Although we make reasonable efforts to maintain useful and current information, we do not guarantee that every piece of information is complete, current, or applicable to every person's individual circumstances.",
      },
      {
        type: 'p',
        text: 'For important or time-sensitive matters, customers should confirm current requirements with the relevant official authority.',
      },
    ],
  },
  {
    heading: '4. Service Outcomes',
    blocks: [
      {
        type: 'p',
        text: 'Different Solution for You services depend on different authorities and third parties.',
      },
      {
        type: 'p',
        text: 'For example:',
      },
      {
        type: 'ul',
        items: [
          'Banks decide whether to approve bank accounts.',
          'Employers decide whether to hire applicants.',
          'Landlords or property providers decide whether to approve rentals.',
          'Airlines and hotels control their own availability and booking conditions.',
          'Transportation providers control their own services.',
          'Healthcare professionals remain responsible for medical diagnosis and treatment.',
          'Government authorities control immigration and official procedures.',
        ],
      },
      {
        type: 'p',
        text: 'Solution for You may assist with communication, preparation, coordination, or other agreed activities, but we do not control decisions made by independent third parties.',
      },
    ],
  },
  {
    heading: '5. Customer Responsibility',
    blocks: [
      {
        type: 'p',
        text: 'Customers are responsible for providing accurate, complete, current, and truthful information and genuine documents.',
      },
      {
        type: 'p',
        text: 'Customers should review documents prepared or organized for them and promptly notify us of any incorrect or changed information.',
      },
      {
        type: 'p',
        text: 'We are not responsible for consequences caused by false, incomplete, inaccurate, misleading, or late information supplied by the customer.',
      },
    ],
  },
  {
    heading: '6. Lawful Services Only',
    blocks: [
      {
        type: 'p',
        text: 'Solution for You does not support or encourage:',
      },
      {
        type: 'ul',
        items: [
          'Forged documents',
          'Altered documents used dishonestly',
          'False statements',
          'Fraudulent applications',
          'Identity misrepresentation',
          'Unlawful immigration practices',
          'Circumvention of government requirements through illegal methods',
          'Any other unlawful activity',
        ],
      },
      {
        type: 'p',
        text: 'Our services are intended to support lawful and legitimate processes.',
      },
    ],
  },
  {
    heading: '7. Not Legal, Financial, or Medical Advice',
    blocks: [
      {
        type: 'p',
        text: 'Information provided through this website, consultations, communications, documents, or services should not automatically be considered formal legal, financial, tax, or medical advice.',
      },
      {
        type: 'p',
        text: 'Where a matter requires specialized professional advice, customers should consult an appropriately qualified professional.',
      },
      {
        type: 'p',
        text: 'For Medical Interpreter services, our role is to assist communication and does not replace professional medical diagnosis, treatment, or judgment.',
      },
    ],
  },
  {
    heading: '8. Third-Party Services',
    blocks: [
      {
        type: 'p',
        text: 'Some services may involve independent third parties.',
      },
      {
        type: 'p',
        text: 'Solution for You is not responsible for third-party policies, decisions, availability, performance, delays, cancellations, pricing, or actions except to the extent responsibility cannot legally be excluded.',
      },
      {
        type: 'p',
        text: 'Third-party services may be subject to separate terms and conditions.',
      },
    ],
  },
  {
    heading: '9. No Guaranteed Results',
    blocks: [
      {
        type: 'p',
        text: 'Payment for a Solution for You service is payment for the agreed assistance or service provided.',
      },
      {
        type: 'p',
        text: 'It is not payment for a guaranteed government decision, bank approval, employment offer, rental approval, travel availability, or other outcome controlled by another party.',
      },
    ],
  },
  {
    heading: '10. Website Links',
    blocks: [
      {
        type: 'p',
        text: 'Our website may contain links to official government websites and other third-party websites.',
      },
      {
        type: 'p',
        text: 'Links are provided for convenience or reference.',
      },
      {
        type: 'p',
        text: 'We do not control third-party websites and are not responsible for their content, security, availability, or privacy practices.',
      },
    ],
  },
  {
    heading: '11. Limitation of Responsibility',
    blocks: [
      {
        type: 'p',
        text: 'To the maximum extent permitted by applicable law, Solution for You is not responsible for losses, delays, refusals, additional costs, or other consequences arising from circumstances outside our reasonable control.',
      },
      {
        type: 'p',
        text: 'This includes government decisions, third-party actions, policy changes, provider failures, customer-supplied information, technical problems, traffic, weather, and other external circumstances.',
      },
      {
        type: 'p',
        text: 'Nothing in this Disclaimer excludes or limits any responsibility that cannot legally be excluded or limited.',
      },
    ],
  },
  {
    heading: '12. Changes to This Disclaimer',
    blocks: [
      {
        type: 'p',
        text: 'We may update this Disclaimer when our services, website, business operations, or applicable legal requirements change.',
      },
      {
        type: 'p',
        text: 'The latest version will be published on this page together with the applicable effective date.',
      },
    ],
  },
  {
    heading: '13. Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have questions about this Disclaimer or the scope of a particular service, please contact Solution for You through the contact information provided on our website.',
      },
      {
        type: 'p',
        text: 'Solution for You – အဖြေက ဒီမှာပါ',
      },
    ],
  },
];

export const INITIAL_LEGAL_PAGES_CONTENT: LegalPagesContent = {
  privacyPolicy: {
    title: 'Privacy Policy',
    content: serializeLegalDocToMarkdown(PRIVACY_POLICY_INTRO, PRIVACY_POLICY_SECTIONS),
  },
  termsOfService: {
    title: 'Terms of Service',
    content: serializeLegalDocToMarkdown(TERMS_OF_SERVICE_INTRO, TERMS_OF_SERVICE_SECTIONS),
  },
  disclaimer: {
    title: 'Disclaimer',
    content: serializeLegalDocToMarkdown(DISCLAIMER_INTRO, DISCLAIMER_SECTIONS),
  },
};

export const PrivacyPolicyPage: React.FC = () => {
  const { legalPagesContent, isLoading } = useApp();
  const doc = legalPagesContent?.privacyPolicy || INITIAL_LEGAL_PAGES_CONTENT.privacyPolicy;

  const parsed = useMemo(() => {
    const raw = doc.content?.trim()
      ? doc.content
      : INITIAL_LEGAL_PAGES_CONTENT.privacyPolicy.content;
    return parseMarkdownToLegalDoc(raw);
  }, [doc.content]);

  if (isLoading && !legalPagesContent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        <span className="text-sm">Loading Privacy Policy...</span>
      </div>
    );
  }

  return (
    <LegalDocumentLayout
      title={doc.title?.trim() || 'Privacy Policy'}
      activeRoute="privacy-policy"
      introParagraphs={parsed.introParagraphs}
      sections={parsed.sections}
    />
  );
};

export const TermsOfServicePage: React.FC = () => {
  const { legalPagesContent, isLoading } = useApp();
  const doc = legalPagesContent?.termsOfService || INITIAL_LEGAL_PAGES_CONTENT.termsOfService;

  const parsed = useMemo(() => {
    const raw = doc.content?.trim()
      ? doc.content
      : INITIAL_LEGAL_PAGES_CONTENT.termsOfService.content;
    return parseMarkdownToLegalDoc(raw);
  }, [doc.content]);

  if (isLoading && !legalPagesContent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        <span className="text-sm">Loading Terms of Service...</span>
      </div>
    );
  }

  return (
    <LegalDocumentLayout
      title={doc.title?.trim() || 'Terms of Service'}
      activeRoute="terms-of-service"
      introParagraphs={parsed.introParagraphs}
      sections={parsed.sections}
    />
  );
};

export const DisclaimerPage: React.FC = () => {
  const { legalPagesContent, isLoading } = useApp();
  const doc = legalPagesContent?.disclaimer || INITIAL_LEGAL_PAGES_CONTENT.disclaimer;

  const parsed = useMemo(() => {
    const raw = doc.content?.trim()
      ? doc.content
      : INITIAL_LEGAL_PAGES_CONTENT.disclaimer.content;
    return parseMarkdownToLegalDoc(raw);
  }, [doc.content]);

  if (isLoading && !legalPagesContent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        <span className="text-sm">Loading Disclaimer...</span>
      </div>
    );
  }

  return (
    <LegalDocumentLayout
      title={doc.title?.trim() || 'Disclaimer'}
      activeRoute="disclaimer"
      introParagraphs={parsed.introParagraphs}
      sections={parsed.sections}
    />
  );
};
