import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321'

if (!projectId) {
  throw new Error('SANITY_STUDIO_PROJECT_ID is required to run SP_REBIRTH Studio')
}

export default defineConfig({
  name: 'spRebirth',
  title: 'Sana Patel Real Estate · SP_REBIRTH',
  projectId,
  dataset,
  basePath: '/',
  plugins: [
    structureTool({structure}),
    presentationTool({
      previewUrl: {
        initial: previewUrl,
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      allowOrigins: [
        'http://localhost:*',
        previewUrl,
      ],
    }),
    visionTool({defaultApiVersion: '2026-08-27'}),
  ],
  schema: {
    types: schemaTypes,
  },
})
