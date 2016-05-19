SELECT
  m.col_id_365 AS serviceType,
  m.col_id_367 AS startTime,
  m.col_id_368 AS endTime,
  m.col_id_366 AS dayOfWeek
FROM
  exp_sites s
  JOIN exp_channel_data d ON d.site_id = s.site_id
  JOIN exp_channel_titles t ON t.channel_id = d.channel_id AND t.entry_id = d.entry_id AND t.site_id = s.site_id
  JOIN exp_matrix_data m ON m.entry_id = d.entry_id AND m.site_id = s.site_id
WHERE
  s.site_name = '${site_name}'
  AND m.col_id_365 = s.site_name
  AND d.channel_id = 175
  AND d.entry_id = 128506
  AND t.entry_date <= UNIX_TIMESTAMP()
  AND (
    t.expiration_date = 0
    OR t.expiration_date >= UNIX_TIMESTAMP()
  )
  AND m.col_id_366 IS NOT NULL;
