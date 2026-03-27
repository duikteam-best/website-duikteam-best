import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {HomeIcon, StarIcon, StarFilledIcon, InfoOutlineIcon} from '@sanity/icons'

const singletonTypes = new Set(['homePage', 'aboutUs', 'certifications', 'certification'])

export default defineConfig({
  name: 'default',
  title: 'Website Duikteam Best',

  projectId: 'icc65hte',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Home Page')
              .id('homePage')
              .icon(HomeIcon)
              .child(
                S.document()
                  .schemaType('homePage')
                  .documentId('homePage')
                  .title('Home Page'),
              ),
            S.listItem()
              .title('Over Ons')
              .id('aboutUs')
              .icon(InfoOutlineIcon)
              .child(
                S.document()
                  .schemaType('aboutUs')
                  .documentId('about-us')
                  .title('Over Ons'),
              ),
            S.listItem()
              .title('Opleidingen')
              .id('certifications')
              .icon(StarIcon)
              .child(
                S.list()
                  .title('Opleidingen')
                  .items([
                    S.listItem()
                      .title('Overzichtspagina')
                      .id('certifications-overview')
                      .icon(StarIcon)
                      .child(
                        S.document()
                          .schemaType('certifications')
                          .documentId('certifications')
                          .title('Overzichtspagina'),
                      ),
                    S.divider(),
                    S.documentTypeListItem('certification').title('Opleidingen'),
                  ]),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !singletonTypes.has(item.getId() ?? ''),
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
