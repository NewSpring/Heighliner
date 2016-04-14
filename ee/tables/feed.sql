SELECT
  d.entry_id,
  c.channel_name,
  t.title,
  t.entry_date
FROM
  exp_channel_data as d
LEFT JOIN
  exp_channels as c
    ON d.channel_id = c.channel_id
LEFT JOIN
  exp_channel_titles AS t
    ON d.entry_id = t.entry_id
WHERE
  -- series, sermons, stories, devotionals, articles, music
  d.channel_id IN (4,3,5,27,30,47)
ORDER BY
  t.entry_date DESC
LIMIT 50
