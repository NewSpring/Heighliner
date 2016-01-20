SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  d.field_id_131 as week,
  t.entry_date,
  d.field_id_6 as actual_date,
  d.field_id_671 as speakers,
  d.field_id_641 as tags,
  d.field_id_45 as description,
  d.field_id_157 as ooyala_id,
  d.field_id_674 as video_low_bitrate,
  d.field_id_673 as video_medium_bitrate,
  d.field_id_672 as video_high_bitrate,
  d.field_id_676 as downloads,
  d.field_id_675 as audio,
  d.field_id_678 as body,
  d.field_id_329 as subtitle,
  d.field_id_683 as positions,
  d.field_id_643 as scripture,
  c.channel_name,
  t.title,
  t.url_title,
  t.status,
  t.year,
  t.month,
  t.day
FROM
  exp_channel_data as d
LEFT JOIN
  exp_channels as c
    ON d.channel_id = c.channel_id
LEFT JOIN
  exp_channel_titles AS t
    ON d.entry_id = t.entry_id
LEFT JOIN
  exp_playa_relationships as p
    ON d.entry_id = p.parent_entry_id
