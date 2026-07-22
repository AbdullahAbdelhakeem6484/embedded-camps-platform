import app from './app';
import { PORT } from './config';
import { seedAdminUsers } from './services/adminSeeder';

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await seedAdminUsers();
});
