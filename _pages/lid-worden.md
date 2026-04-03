---
permalink: /lid-worden/
title: "Lid worden"
author_profile: false
---

{% assign page_data = site.data.membership_page %}

{% if page_data.heroImageUrl %}
  <img src="{{ page_data.heroImageUrl }}" alt="{{ page_data.title | default: 'Lid worden' }}" style="width:100%;height:auto;margin-bottom:1.5rem;border-radius:6px;">
{% endif %}

{% if page_data.bodyHTML %}
  {{ page_data.bodyHTML }}
{% else %}
  Binnenkort hier meer informatie over hoe je lid kunt worden van Duikteam Best.
{% endif %}
