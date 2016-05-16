SELECT
  d.field_id_13 AS body,
  d.field_id_547 AS title,
  d.field_id_14 AS startDate,
  d.field_id_665 AS endDate,
  m.col_id_270 AS wideImage,
  m.col_id_271 AS squareImage,
  m.col_id_272 AS tallImage,
  n.snippet_contents AS embedCode
FROM
  exp_sites s
  JOIN exp_channel_data d ON d.site_id = s.site_id
  JOIN exp_channel_titles t ON t.channel_id = d.channel_id AND t.entry_id = d.entry_id AND t.site_id = s.site_id
  JOIN exp_matrix_data m ON m.entry_id = d.entry_id AND m.site_id = s.site_id
  LEFT JOIN exp_snippets n ON n.snippet_name = 'PUBLIC_EMBED_CODE'
WHERE
  s.site_name = '${site_name}'
  AND d.channel_id = 4
  AND d.field_id_14 <= UNIX_TIMESTAMP()
ORDER BY
  d.field_id_14 DESC
LIMIT 1;
