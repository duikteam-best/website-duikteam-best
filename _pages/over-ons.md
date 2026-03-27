---
permalink: /over-ons/
title: "Over ons"
author_profile: false
header:
  image: /assets/images/cropped-Rif-10.jpg
---

{% assign page_data = site.data.about_us %}

{% if page_data.heroImageUrl %}
  <img src="{{ page_data.heroImageUrl }}" alt="{{ page_data.title | default: 'Over ons' }}" style="width:100%;height:auto;margin-bottom:1.5rem;border-radius:6px;">
{% endif %}

{% if page_data.bodyHTML %}
  {{ page_data.bodyHTML }}
{% else %}
  Binnenkort hier meer over ons.
{% endif %}
