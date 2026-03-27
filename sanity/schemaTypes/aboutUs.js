import {InfoOutlineIcon} from '@sanity/icons'

export default {
  name: 'aboutUs',
  type: 'document',
  title: 'Over Ons',
  icon: InfoOutlineIcon,
  fields: [
    { name: 'title', type: 'string', title: 'Titel' },
    { name: 'heroImage', type: 'image', title: 'Hero afbeelding', options: { hotspot: true } },
    { name: 'body', type: 'array', title: 'Inhoud', of: [{ type: 'block' }] },
  ],
  preview: { select: { title: 'title' } },
}
