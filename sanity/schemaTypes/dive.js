import {ActivityIcon} from '@sanity/icons'

export default {
  name: 'dive',
  type: 'document',
  title: 'Dive',
  icon: ActivityIcon,
  fields: [
    { name: 'title', type: 'string', title: 'Dive Name / Title' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 200 } },
    { name: 'date', type: 'datetime', title: 'Dive Date' },
    { name: 'location', type: 'string', title: 'Location' },
    { name: 'description', type: 'array', title: 'Description', of: [
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
    { name: 'photos', type: 'array', title: 'Photos', of: [{ type: 'image' }] }
  ],
  preview: { select: { title: 'title', subtitle: 'location', media: 'photos.0' } }
}