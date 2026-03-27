export default {
  name: 'page',
  type: 'document',
  title: 'Page',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 200 } },
    { name: 'body', type: 'array', title: 'Body', of: [
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
    { name: 'mainImage', type: 'image', title: 'Main Image' }
  ],
  preview: { select: { title: 'title', media: 'mainImage' } }
}