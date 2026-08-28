import { defineArrayMember, defineField, defineType } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Search title',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Aim for a concise search title; Google may rewrite long titles.'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(180).warning('Keep this concise enough to display well in search results.'),
    }),
    defineField({
      name: 'canonical',
      title: 'Canonical URL override',
      type: 'url',
      description: 'Usually leave blank. Use only when the canonical must differ from the page URL.',
    }),
    defineField({ name: 'noindex', title: 'Exclude from search engines', type: 'boolean', initialValue: false }),
    defineField({ name: 'socialImage', title: 'Social sharing image', type: 'image', options: { hotspot: true } }),
  ],
});

export const accessibleImage = defineType({
  name: 'accessibleImage',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'alt', title: 'Alternative text', type: 'string' }),
    defineField({
      name: 'decorative',
      title: 'Decorative image',
      type: 'boolean',
      initialValue: false,
      description: 'Enable only when the image conveys no information and should have an empty alt attribute.',
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      if (!value) return true;
      if (value.decorative === true) return true;
      const alt = typeof value.alt === 'string' ? value.alt.trim() : '';
      return alt ? true : 'Alternative text is required unless the image is explicitly decorative.';
    }),
});

export const portableText = defineType({
  name: 'portableText',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullets', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (rule) => rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
              },
              { name: 'newWindow', type: 'boolean', title: 'Open in a new window', initialValue: false },
            ],
          },
        ],
      },
    }),
    defineArrayMember({ type: 'accessibleImage' }),
  ],
});

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'lead', title: 'Lead', type: 'text', rows: 4 }),
    defineField({ name: 'media', title: 'Hero image', type: 'accessibleImage' }),
    defineField({ name: 'primaryCta', title: 'Primary CTA', type: 'ctaLink' }),
    defineField({ name: 'secondaryCta', title: 'Secondary CTA', type: 'ctaLink' }),
  ],
});

export const ctaLink = defineType({
  name: 'ctaLink',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'href', title: 'Destination', type: 'string', validation: (rule) => rule.required() }),
  ],
});

export const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Editorial content',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'portableText' }),
    defineField({ name: 'image', title: 'Optional image', type: 'accessibleImage' }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'text',
      options: {
        list: [
          { title: 'Text', value: 'text' },
          { title: 'Image left', value: 'imageLeft' },
          { title: 'Image right', value: 'imageRight' },
        ],
      },
    }),
  ],
});

export const serviceGridSection = defineType({
  name: 'serviceGridSection',
  title: 'Service grid',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      validation: (rule) => rule.min(2).max(8),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
            defineField({ name: 'link', title: 'Optional link', type: 'ctaLink' }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        }),
      ],
    }),
  ],
});

export const proofSection = defineType({
  name: 'proofSection',
  title: 'Proof / reviews',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
    defineField({
      name: 'source',
      title: 'Proof source',
      type: 'string',
      options: {
        list: [
          { title: 'Trustindex / Google', value: 'trustindex' },
          { title: 'Curated verified references', value: 'curated' },
        ],
      },
      initialValue: 'trustindex',
    }),
    defineField({
      name: 'reviewReferences',
      title: 'Curated review references',
      type: 'array',
      hidden: ({ parent }) => parent?.source !== 'curated',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'reviewReference' }] })],
    }),
  ],
});

export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQs',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'faqs',
      title: 'Questions',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faq' }] })],
      validation: (rule) => rule.min(1),
    }),
  ],
});

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'CTA panel',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
    defineField({ name: 'primaryCta', title: 'Primary CTA', type: 'ctaLink' }),
    defineField({ name: 'secondaryCta', title: 'Secondary CTA', type: 'ctaLink' }),
  ],
});

export const leadFormSection = defineType({
  name: 'leadFormSection',
  title: 'Lead form',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'formType',
      title: 'Form type',
      type: 'string',
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: 'Rental appraisal', value: 'rental_appraisal' },
          { title: 'Switch property managers', value: 'switch_manager' },
          { title: 'General enquiry', value: 'general' },
        ],
      },
    }),
  ],
});
