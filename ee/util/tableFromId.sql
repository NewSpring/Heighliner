SELECT
  f.group_name
FROM
  exp_channel_titles as d
LEFT JOIN
  exp_channels as c
    ON d.channel_id = c.channel_id
LEFT JOIN
	exp_field_groups as f
		ON c.field_group = f.group_id
