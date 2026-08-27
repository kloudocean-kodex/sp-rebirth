import type {StructureBuilder} from 'sanity/structure'

const singletonTypes = new Set(['siteSettings'])

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('SP_REBIRTH')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('resourceArticle').title('Resources'),
      S.documentTypeListItem('faq').title('FAQs'),
      S.documentTypeListItem('reviewReference').title('Verified review references'),
      S.documentTypeListItem('suburbPage').title('Suburb pages'),
    ])

export const singletonActions = (prev: any[], context: {schemaType: string}) =>
  singletonTypes.has(context.schemaType)
    ? prev.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
    : prev
