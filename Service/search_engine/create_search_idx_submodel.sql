create table web50.search_idx_common
    (
    owner        varchar(30) not null,
    table_name   varchar(30) not null,
    key_field    varchar(30) not null,
    key_value    varchar(20) not null,
    category_id  varchar(10) not null,
    title        text,
    content      text,
    "XMIN"         numeric,
    "YMIN"         numeric,
    "XMAX"       numeric,
    "YMAX"         numeric,
    topology_id  numeric);
    
create table web50.search_idx_gas
    (
    owner        varchar(30) not null,
    table_name   varchar(30) not null,
    key_field    varchar(30) not null,
    key_value    varchar(20) not null,
    category_id  varchar(10) not null,
    title        text,
    content      text,
    route_name   text,
    station_beg  numeric,
    station_end  numeric,
    "XMIN"         numeric,
    "YMIN"         numeric,
    "XMAX"       numeric,
    "YMAX"         numeric,
    topology_id  numeric);

SELECT AddGeometryColumn( 'web50','search_idx_gas', 'pg_geometry', -1, 'GEOMETRY', 2 );
SELECT AddGeometryColumn( 'web50','search_idx_common', 'pg_geometry', -1, 'GEOMETRY', 2 );

CREATE OR REPLACE FUNCTION web50.make_tsvector(title TEXT, content TEXT)
   RETURNS tsvector AS $$
BEGIN
  RETURN (setweight(to_tsvector('russian', title),'A') ||
    setweight(to_tsvector('russian', content), 'B'));
END
$$ LANGUAGE 'plpgsql' IMMUTABLE;

CREATE INDEX idx_search_gas_sp ON web50.search_idx_gas USING gist(pg_geometry);
CREATE INDEX IF NOT EXISTS idx_search_gas ON web50.search_idx_gas  USING gin(web50.make_tsvector(title, content));
CREATE INDEX idx_search_common_sp ON web50.search_idx_common USING gist(pg_geometry);
CREATE INDEX IF NOT EXISTS idx_search_common ON web50.search_idx_common  USING gin(web50.make_tsvector(title, content));