const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = [
    { name: 'Admin User', email: 'admin@example.com', password: hashedPassword },
    { name: 'Test User', email: 'test@example.com', password: hashedPassword },
  ];

  for (const user of users) {
    await pool.query(
      'INSERT IGNORE INTO users (name, email, password) VALUES (?, ?, ?)',
      [user.name, user.email, user.password]
    );
  }

  console.log('Users seeded successfully');
  process.exit(0);
};

seedUsers().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
