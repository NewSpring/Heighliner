SELECT
  s.set_id,
  s.site_id,
  s.set_label,
  s.set_name,
  s.set_notes,
  s.channels,
  s.parameters,
  o.sort_order
FROM
  exp_low_reorder_sets as s
LEFT JOIN
  exp_low_reorder_orders as o
    ON s.set_id = o.set_id
WHERE
  s.set_name=${set_name}
