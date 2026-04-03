import {UsersIcon} from '@sanity/icons'

export default {
  name: 'membershipPage',
  type: 'document',
  title: 'Lid Worden',
  icon: UsersIcon,
  fields: [
    { name: 'title', type: 'string', title: 'Titel' },
    { name: 'heroImage', type: 'image', title: 'Hero afbeelding', options: { hotspot: true } },
    { name: 'body', type: 'array', title: 'Inhoud', of: [
      { type: 'block' },
      { type: 'image', options: { hotspot: true }, fields: [
        { name: 'caption', type: 'string', title: 'Bijschrift' },
        { name: 'alt', type: 'string', title: 'Alternatieve tekst' },
        { name: 'alignment', type: 'string', title: 'Uitlijning', options: { list: [
          { title: 'Volledig breed', value: 'center' },
          { title: 'Rechts uitgelijnd', value: 'right' },
          { title: 'Links uitgelijnd', value: 'left' },
        ], layout: 'radio' }, initialValue: 'center' },
      ]},
    ]},
  ],
  preview: { select: { title: 'title' } },
}
