CREATE POLICY "Public read access for battle images" ON storage.objects FOR SELECT USING (bucket_id = 'battle-images');
CREATE POLICY "Service role insert for battle images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'battle-images');
CREATE POLICY "Service role update for battle images" ON storage.objects FOR UPDATE USING (bucket_id = 'battle-images');