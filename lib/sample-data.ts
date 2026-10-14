export interface SampleCase {
  id: string;
  title: string;
  category: 'in_scope' | 'out_of_scope' | 'unclear';
  description: string;
  client_request: string;
}

export const SAMPLE_CONTRACT = `WEBSITE DESIGN & DEVELOPMENT AGREEMENT

1. Scope of Work:
   - Design and develop a 3-page responsive business website consisting exclusively of:
     (a) Home Page (hero banner, features overview, customer testimonials)
     (b) About Us Page (company mission, team profiles, history)
     (c) Contact Us Page (inquiry contact form, Google Maps embed, business hours)
   - Mobile-responsive layout and cross-browser testing for modern evergreen browsers.

2. Revision Policy:
   - Includes up to two (2) consolidated rounds of textual edits, copy tweaks, and minor layout adjustments prior to final site handover.
   - Any revision requests submitted after the second round or post-handover shall be billed as extra scope.

3. Excluded Services & Add-Ons:
   - Search Engine Optimization (SEO) audits, backlink building, meta schema markup, and Google search ranking guarantees are strictly excluded.
   - Domain registration, web hosting configuration, cPanel/server management, and DNS migrations are not included.
   - E-commerce features, shopping cart, product catalog creation, and payment gateway integrations (e.g. Razorpay, Stripe) are strictly excluded.
   - Raw design file handoffs (editable Figma boards, Photoshop PSDs, Illustrator vectors) are excluded unless negotiated under a separate design license.

4. Timeline & Deliverables:
   - Total project timeline: 2 calendar weeks from receipt of milestone deposit.

5. Additional Work & Out-of-Scope Rates:
   - Any feature, service, or revision exceeding the defined scope shall be billed at the standard rate of ₹1,000 per hour (or standard currency equivalent).`;

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'sample-in-scope',
    title: 'In-Scope: Text & Photo Revision (Round 1)',
    category: 'in_scope',
    description: 'Minor copy correction and team photo update during active revision round.',
    client_request: 'Hey! On the About Us page, could you please replace our team photo with the new high-res picture attached, and fix a quick typo in our mission statement? This is our 1st round of revisions before we wrap up.',
  },
  {
    id: 'sample-out-of-scope',
    title: 'Out-of-Scope: Payment Gateway & SEO (Hinglish)',
    category: 'out_of_scope',
    description: 'Client asking for Razorpay integration, 25 products, and #1 Google ranking.',
    client_request: 'Bhai ek chhota sa quick change tha — please site pe Razorpay payment gateway integrate kar do na for our store aur 25 products add kar dena. Aur Google pe #1 rank karane ke liye pura SEO bhi set kar dena jaldi se!',
  },
  {
    id: 'sample-unclear',
    title: 'Unclear: Raw Figma Files & Component Assets',
    category: 'unclear',
    description: 'Contract mentions exclusion of raw design files unless negotiated separately.',
    client_request: 'Can you please send over the raw editable Figma design files, component library, and vector assets so our marketing intern can tweak the branding banners directly next week?',
  },
];
