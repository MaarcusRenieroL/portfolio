-- Every published state of a content item, so an earlier version can be brought back.
-- A row is written each time a publish changes what is live. The newest 30 per item are kept.
create table if not exists content_version (
  id bigserial primary key,
  kind text not null,
  key text not null,
  data jsonb not null,
  data_de jsonb,
  created_at timestamptz not null default now()
);
create index if not exists content_version_item on content_version (kind, key, id desc);

-- What is live right now becomes the first version of each item.
insert into content_version (kind, key, data, data_de, created_at)
select kind, key, published, published_de, coalesce(published_at, now())
from content_item
where published is not null
  and not exists (select 1 from content_version v where v.kind = content_item.kind and v.key = content_item.key);
