SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  t.entry_date,
  d.field_id_14 as start_date,
  d.field_id_665 as end_date,
  d.field_id_13 as description,
  d.field_id_547 as hashtag,
  d.field_id_15 as ooyala_id,
  d.field_id_860 as positions,
  d.field_id_486 as collection_background_color,
  d.field_id_666 as tags,
  d.field_id_667 as downloads,
  c.channel_name,
  t.title,
  t.url_title,
  t.status,
  t.year,
  t.month,
  t.day,
  p.child_entry_id as series_id
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
