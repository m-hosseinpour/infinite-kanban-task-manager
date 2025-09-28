-- Make user_id unique in user_boards
ALTER TABLE user_boards
  ADD CONSTRAINT user_boards_user_id_key UNIQUE (user_id);
