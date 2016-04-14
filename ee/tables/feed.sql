SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  c.channel_name,
  t.title,
  t.entry_date,
  t.status,
  d.field_id_486 as primary_accent_color,
  p.child_entry_id as series_id,
  d.field_id_249 as album_image
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
WHERE
  -- series, sermons, stories, devotionals, articles, music
  d.channel_id IN (4,3,5,27,30,47)
ORDER BY
  t.entry_date DESC
LIMIT 50
