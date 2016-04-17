SELECT
  -- all items should have these fields
  d.entry_id,
  d.site_id,
  d.channel_id,
  c.channel_name,
  t.title,
  t.entry_date,
  t.year,
  t.month,
  t.day,
  t.status,

  -- each data type has it's own positions field
  -- these are needed for getting associated images
  d.field_id_860 as collection_positions,
  d.field_id_683 as collection_entry_positions,
  d.field_id_664 as editorial_positions,

  -- series items are displayed with a color gradient
  d.field_id_486 as primary_accent_color,

  -- albums have their own special image field
  d.field_id_249 as album_image,

  -- editorials have inline images we display
  d.field_id_18 as markup
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
