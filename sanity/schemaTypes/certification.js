import {StarFilledIcon} from '@sanity/icons'

export default {
  name: 'certification',
  type: 'document',
  title: 'Opleiding',
  icon: StarFilledIcon,
  fields: [
    { name: 'title', type: 'string', title: 'Titel' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 200 } },
    { name: 'level', type: 'string', title: 'Niveau' },
    { name: 'description', type: 'array', title: 'Beschrijving', of: [
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
    { name: 'image', type: 'image', title: 'Afbeelding', options: { hotspot: true } },
  ],
  preview: { select: { title: 'title', subtitle: 'level', media: 'image' } },
}
