SELECT
  t.title AS channel_title,
  d.field_id_1128 AS data_matrix,
  t.status,
  t.entry_date,
  t.expiration_date,
  t.entry_id
FROM
  exp_channel_data d
  JOIN exp_channel_titles t
    ON t.channel_id = d.channel_id AND t.entry_id = d.entry_id
WHERE
  d.channel_id = 175
  AND t.entry_date <= UNIX_TIMESTAMP()
  AND (
  	t.expiration_date = 0
  	OR t.expiration_date >= UNIX_TIMESTAMP()
  );
