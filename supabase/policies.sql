-- Enable RLS
alter table players enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;

-- Simple public read policies
create policy "public read players" on players
for select using (true);

create policy "public read matches" on matches
for select using (true);

create policy "public read predictions" on predictions
for select using (true);

-- Temporary admin write access (until auth is wired)
create policy "admin write players" on players
for insert with check (true);

create policy "admin update players" on players
for update using (true) with check (true);

create policy "admin write matches" on matches
for insert with check (true);

create policy "admin write predictions" on predictions
for insert with check (true);

-- Allow updating prediction outcomes
create policy "admin update predictions" on predictions
for update using (true) with check (true);
