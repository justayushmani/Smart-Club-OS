const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const dummyMembers = [
  { username: 'Alice (Design)', email: 'alice@club.os', password: 'password123', role: 'member', department: 'design' },
  { username: 'Bob (Tech)', email: 'bob@club.os', password: 'password123', role: 'member', department: 'tech' },
  { username: 'Charlie (PR)', email: 'charlie@club.os', password: 'password123', role: 'member', department: 'pr' },
  { username: 'Diana (Tech)', email: 'diana@club.os', password: 'password123', role: 'member', department: 'tech' },
  { username: 'Eve (Common)', email: 'eve@club.os', password: 'password123', role: 'member', department: 'common' }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected for seeding');
  for (const member of dummyMembers) {
    const exists = await User.findOne({ email: member.email });
    if (!exists) {
      await User.create(member);
      console.log(`Created dummy member: ${member.username}`);
    } else {
      console.log(`Member already exists: ${member.username}`);
    }
  }
  console.log('Seeding finished');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
