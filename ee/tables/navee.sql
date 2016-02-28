SELECT
  s.parent,
  s.text,
  s.link,
  s.sort,
  s.navee_id as id,
  s.rel as image
FROM
  exp_navee_navs as d
LEFT JOIN
  exp_navee as s
    ON d.navigation_id = s.navigation_id
WHERE
  d.nav_title=${nav_title}
ORDER BY s.parent
