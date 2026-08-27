import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({name: 'businessName', title: 'Business name', type: 'string', initialValue: 'Sana Patel Real Estate', validation: (rule) => rule.required()}),
    defineField({name: 'phone', title: 'Phone', type: 'string', initialValue: '0416 977 990'}),
    defineField({name: 'email', title: 'Email', type: 'string', initialValue: 'sana@sanapatel.com.au'}),
    defineField({name: 'serviceArea', title: 'Primary service area', type: 'string', initialValue: 'Melbourne, Victoria'}),
    defineField({name: 'logo', title: 'Logo', type: 'accessibleImage'}),
    defineField({name: 'defaultSocialImage', title: 'Default social image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'socials',
      title: 'Social profiles',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'platform', title: 'Platform', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({name: 'defaultSeo', title: 'Default SEO', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})

export const page = defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Internal title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'pageType',
      title: 'Page purpose',
      type: 'string',
      options: {
        list: [
          {title: 'General', value: 'general'},
          {title: 'Rental providers', value: 'rentalProviders'},
          {title: 'Rental appraisal', value: 'rentalAppraisal'},
          {title: 'Switch managers', value: 'switchManagers'},
          {title: 'Renters', value: 'renters'},
          {title: 'Sales', value: 'sales'},
          {title: 'About', value: 'about'},
          {title: 'Contact', value: 'contact'},
          {title: 'Resource hub', value: 'resources'},
        ],
      },
      initialValue: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'hero', title: 'Hero', type: 'heroSection'}),
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      of: [
        defineArrayMember({type: 'richTextSection'}),
        defineArrayMember({type: 'serviceGridSection'}),
        defineArrayMember({type: 'proofSection'}),
        defineArrayMember({type: 'faqSection'}),
        defineArrayMember({type: 'ctaSection'}),
        defineArrayMember({type: 'leadFormSection'}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
    prepare: ({title, subtitle}) => ({title, subtitle: subtitle ? `/${subtitle}/` : 'No slug'}),
  },
})

export const faq = defineType({
  name: 'faq',
  title: 'FAQs',
  type: 'document',
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'answer', title: 'Answer', type: 'portableText', validation: (rule) => rule.required()}),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'string',
      options: {list: [{title: 'Rental providers', value: 'rentalProviders'}, {title: 'Renters', value: 'renters'}, {title: 'Sellers', value: 'sellers'}, {title: 'General', value: 'general'}]},
      initialValue: 'general',
    }),
  ],
  preview: {select: {title: 'question', subtitle: 'audience'}},
})

export const reviewReference = defineType({
  name: 'reviewReference',
  title: 'Verified review references',
  type: 'document',
  description: 'Use only for attributable reviews that can be independently verified. Prefer the Trustindex feed when possible.',
  fields: [
    defineField({name: 'reviewerName', title: 'Reviewer name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'quote', title: 'Review excerpt', type: 'text', rows: 5, validation: (rule) => rule.required()}),
    defineField({name: 'source', title: 'Source', type: 'string', options: {list: ['Google', 'Trustindex', 'Other']}, validation: (rule) => rule.required()}),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
    defineField({name: 'verifiedAt', title: 'Verified on', type: 'date'}),
    defineField({name: 'permissionNotes', title: 'Permission / usage notes', type: 'text', rows: 3}),
  ],
  preview: {select: {title: 'reviewerName', subtitle: 'source'}},
})

export const resourceArticle = defineType({
  name: 'resourceArticle',
  title: 'Resources',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'excerpt', title: 'Summary', type: 'text', rows: 3}),
    defineField({name: 'heroImage', title: 'Hero image', type: 'accessibleImage'}),
    defineField({name: 'body', title: 'Article', type: 'portableText', validation: (rule) => rule.required()}),
    defineField({name: 'publishedAt', title: 'Published', type: 'datetime'}),
    defineField({name: 'reviewedAt', title: 'Last reviewed', type: 'datetime'}),
    defineField({
      name: 'sourceLinks',
      title: 'Primary sources',
      type: 'array',
      description: 'Use authoritative sources for legal, tenancy, safety and compliance content.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Source name', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'url', title: 'Source URL', type: 'url', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  orderings: [
    {title: 'Last reviewed, newest', name: 'reviewedAtDesc', by: [{field: 'reviewedAt', direction: 'desc'}]},
  ],
})

export const suburbPage = defineType({
  name: 'suburbPage',
  title: 'Suburb pages',
  type: 'document',
  description: 'Create only when the page has genuinely useful local evidence and content. Thin programmatic location pages are not permitted.',
  fields: [
    defineField({name: 'suburb', title: 'Suburb', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'suburb'}, validation: (rule) => rule.required()}),
    defineField({name: 'localContext', title: 'Local property-management context', type: 'portableText', validation: (rule) => rule.required()}),
    defineField({name: 'usefulFor', title: 'Why this page deserves to exist', type: 'text', rows: 4, validation: (rule) => rule.required().min(80)}),
    defineField({name: 'faqs', title: 'Local FAQs', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})]}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'suburb', subtitle: 'slug.current'}},
})
