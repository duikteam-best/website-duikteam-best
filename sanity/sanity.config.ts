import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {googleMapsInput} from '@sanity/google-maps-input'
import {schemaTypes} from './schemaTypes'
import {HomeIcon, StarIcon, StarFilledIcon, InfoOutlineIcon, ActivityIcon, CalendarIcon, UsersIcon} from '@sanity/icons'

const singletonTypes = new Set(['homePage', 'aboutUs', 'membershipPage', 'certifications', 'certification', 'divelogsOverview'])

export default defineConfig({
  name: 'default',
  title: 'Website Duikteam Best',

  projectId: 'icc65hte',
  dataset: 'production',

  plugins: [
    googleMapsInput({
      apiKey: process.env.SANITY_STUDIO_GOOGLE_MAPS_API_KEY!,
      defaultLocation: {lat: 51.4965, lng: 5.4698}, // Best, Nederland
      defaultZoom: 12,
    }),
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
            S.listItem()
              .title('Duiklogs')
              .id('divelogs')
              .icon(ActivityIcon)
              .child(
                S.list()
                  .title('Duiklogs')
                  .items([
                    S.listItem()
                      .title('Overzichtspagina')
                      .id('divelogsOverview')
                      .icon(ActivityIcon)
                      .child(
                        S.document()
                          .schemaType('divelogsOverview')
                          .documentId('divelogsOverview')
                          .title('Overzichtspagina'),
                      ),
                    S.divider(),
                    S.documentTypeListItem('dive').title('Duiklogs'),
                  ]),
              ),
            S.listItem()
              .title('Lid Worden')
              .id('membershipPage')
              .icon(UsersIcon)
              .child(
                S.document()
                  .schemaType('membershipPage')
                  .documentId('membership-page')
                  .title('Lid Worden'),
              ),
            S.listItem()
              .title('Activiteiten')
              .id('activities')
              .icon(CalendarIcon)
              .child(
                S.documentTypeList('activity').title('Activiteiten'),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !singletonTypes.has(item.getId() ?? '') && item.getId() !== 'activity',
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
