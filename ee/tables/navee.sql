SELECT
  s.parent,
  s.text,
  s.link,
  s.sort,
  s.navee_id as id,
  s.rel as image,
  s.type,
  s.entry_id,
  t.site_id,
  p.site_pages
FROM
  exp_navee_navs as d
LEFT JOIN
  exp_navee as s
    ON d.navigation_id = s.navigation_id
LEFT JOIN
	exp_channel_titles as t
		ON s.entry_id = t.entry_id
LEFT JOIN
	exp_sites as p
		ON t.site_id = p.site_id
WHERE
  d.nav_title=${nav_title}
ORDER BY s.parent
