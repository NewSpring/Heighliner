SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  d.field_id_1069 as promotion_images,
  d.field_id_1070 as promotion_url,
  d.field_id_1071 as promotion_summary,
  d.field_id_1072 as promotion_label,
  c.channel_name,
  t.entry_date,
  t.title,
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
