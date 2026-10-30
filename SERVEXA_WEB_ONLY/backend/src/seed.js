require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Service = require('./models/Service');
const User = require('./models/User');
const categories = [
 ['Plumbing','Tap, pipe, drainage and bathroom repairs','🚰'],
 ['Electrical','Wiring, switches, lights and electrical repairs','💡'],
 ['Cleaning','Home, kitchen and bathroom cleaning','🧹'],
 ['Carpentry','Furniture repair, fittings and woodwork','🪚'],
 ['AC Repair','Air conditioner servicing and repair','❄️'],
 ['Appliance Repair','Washing machine, refrigerator and appliance repair','🔧'],
 ['Painting','Interior and exterior painting','🎨'],
 ['Pest Control','Household pest inspection and treatment','🪲'],
 ['General Maintenance','Small household repair and maintenance jobs','🏠']
];
(async () => {
 await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/servexa');
 for (const [name, description, icon] of categories) await Service.updateOne({ name }, { $setOnInsert: { name, description, icon } }, { upsert: true });
 const email = 'admin@servexa.local';
 const existing = await User.findOne({ email });
 if (!existing) await User.create({ name: 'SERVEXA Admin', email, passwordHash: await bcrypt.hash('Admin@12345', 12), role: 'admin', verificationStatus: 'verified' });
 console.log('Seed complete. Demo admin: admin@servexa.local / Admin@12345');
 await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
