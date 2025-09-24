-- Create a view to automatically get species caught at each spot
-- This view groups catches by spot location (within 100m radius)

CREATE OR REPLACE VIEW spot_species AS
SELECT 
  s.id as spot_id,
  s.name as spot_name,
  array_agg(
    DISTINCT jsonb_build_object(
      'species_id', p.species_id,
      'species_name', sp.common_name,
      'species_name_tr', sp.common_names_tr[1],
      'catch_count', species_counts.count,
      'last_caught', species_counts.last_caught
    ) ORDER BY species_counts.count DESC
  ) as species_list,
  count(DISTINCT p.species_id) as species_count,
  count(p.id) as total_catches
FROM spots s
LEFT JOIN LATERAL (
  SELECT 
    posts.id,
    posts.species_id,
    posts.created_at
  FROM posts
  WHERE 
    posts.location IS NOT NULL
    AND posts.species_id IS NOT NULL
    AND ST_DWithin(
      s.location::geography, 
      posts.location::geography, 
      50  -- 50 meters radius (daha hassas konum eşleştirme)
    )
) p ON true
LEFT JOIN species sp ON sp.id = p.species_id
LEFT JOIN LATERAL (
  SELECT 
    p2.species_id,
    count(*) as count,
    max(p2.created_at) as last_caught
  FROM posts p2
  WHERE 
    p2.location IS NOT NULL
    AND p2.species_id IS NOT NULL
    AND p2.species_id = p.species_id
    AND ST_DWithin(
      s.location::geography, 
      p2.location::geography, 
      50
    )
  GROUP BY p2.species_id
) species_counts ON species_counts.species_id = p.species_id
GROUP BY s.id, s.name;

-- Create an index to improve performance
CREATE INDEX IF NOT EXISTS idx_posts_location_species 
ON posts USING gist(location) 
WHERE location IS NOT NULL AND species_id IS NOT NULL;

-- Grant permissions
GRANT SELECT ON spot_species TO authenticated;
GRANT SELECT ON spot_species TO anon;

-- Create a function to get spot species for API
CREATE OR REPLACE FUNCTION get_spot_species(spot_uuid UUID)
RETURNS TABLE (
  species_id UUID,
  species_name TEXT,
  species_name_tr TEXT,
  catch_count BIGINT,
  last_caught TIMESTAMPTZ,
  image_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as species_id,
    sp.common_name as species_name,
    sp.common_names_tr[1] as species_name_tr,
    count(p.id) as catch_count,
    max(p.created_at) as last_caught,
    sp.image_url
  FROM spots s
  INNER JOIN posts p ON ST_DWithin(
    s.location::geography, 
    p.location::geography, 
    50
  )
  INNER JOIN species sp ON sp.id = p.species_id
  WHERE 
    s.id = spot_uuid
    AND p.species_id IS NOT NULL
  GROUP BY sp.id, sp.common_name, sp.common_names_tr[1], sp.image_url
  ORDER BY catch_count DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_spot_species(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_spot_species(UUID) TO anon;