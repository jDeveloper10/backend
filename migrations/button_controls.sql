CREATE TABLE IF NOT EXISTS button_controls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  can_mark_entry BOOLEAN DEFAULT true,
  can_mark_exit BOOLEAN DEFAULT true,
  can_mark_lunch_start BOOLEAN DEFAULT true,
  can_mark_lunch_end BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_date (user_id, date)
);
