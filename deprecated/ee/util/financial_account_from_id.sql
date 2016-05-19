SELECT
	d.entry_id,
	d.field_id_1512 as positions
FROM
	exp_channel_data as d
LEFT JOIN
  exp_channels as c
    ON d.channel_id = c.channel_id
WHERE
	d.field_id_1513 = ${AccountId} AND c.channel_id = 69
