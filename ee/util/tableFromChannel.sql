SELECT
  f.group_name,
  d.channel_id
FROM
  exp_channels as d
LEFT JOIN
	exp_field_groups as f
		ON d.field_group = f.group_id
WHERE
  d.channel_name = ${channel_name}
