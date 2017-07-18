CREATE TABLE dinner_option(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE FUNCTION get_random_dinner() RETURNS dinner_option AS $$
  SELECT id, name FROM dinner_option ORDER BY random() LIMIT 1;
  $$ LANGUAGE SQL;