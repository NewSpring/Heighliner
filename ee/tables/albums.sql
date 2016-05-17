SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  d.field_id_249 as album_image,
  d.field_id_1124 as album_blurred_image,
  d.field_id_250 as album_description,
  d.field_id_251 as album_itunes,
  d.field_id_689 as album_tracks,
  d.field_id_687 as album_links,
  d.field_id_646 as album_downloads,
  d.field_id_1196 as album_study,
  d.field_id_1546 as album_color,
  d.field_id_1547 as album_is_light,
  c.channel_name,
  t.entry_date,
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
