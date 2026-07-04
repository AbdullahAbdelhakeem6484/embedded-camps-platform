# Low-Cost Deployment Guide (VPS)

Since you want the lowest cost possible to test the waters with Camp 1 and 2, and you don't have a domain name yet, deploying to a **Virtual Private Server (VPS)** using Docker is the best solution.

You will access the platform directly using the server's IP address (e.g., `http://123.45.67.89:3000`).

## Recommended Low-Cost Providers

1. **Hetzner (Recommended for Video Hosting):**
   - Pricing: ~€4.50/month (CX22 instance)
   - Specs: 2 vCPU, 4GB RAM, 40GB NVMe Disk
   - Pros: Cheapest bandwidth, excellent performance in Europe/Middle East.
2. **DigitalOcean / Linode:**
   - Pricing: ~$6.00/month
   - Specs: 1 vCPU, 1GB RAM, 25GB Disk
   - Pros: Very easy to use.

---

## Deployment Steps

### 1. Provision a Server
Create an Ubuntu 22.04 or 24.04 server on your chosen provider. Note the **Public IP Address** and **root password**.

### 2. Connect via SSH
Open your terminal and connect to the server:
```bash
ssh root@<YOUR_SERVER_IP>
```

### 3. Install Docker and Git
Once logged into the server, run these commands to install Docker:
```bash
apt update && apt upgrade -y
apt install docker.io docker-compose git -y
systemctl enable docker
systemctl start docker
```

### 4. Clone Your Code
Upload your project to a private GitHub repository, then clone it on the server:
```bash
git clone <your-repo-url>
cd embedded-camps-platform
```

### 5. Setup Environment Variables
Copy the example production environment file:
```bash
cp .env.production.example .env
```
Edit the file using `nano .env`:
- Change `DB_PASSWORD` to a strong password.
- Change `JWT_SECRET` to a random string.
- Change `NEXT_PUBLIC_API_URL` to point to your server IP: `http://<YOUR_SERVER_IP>:5000/api`

### 6. Start the Platform
Run Docker Compose to build and start everything:
```bash
docker-compose up -d --build
```
*Note: The first build will take a few minutes as it compiles Next.js and TypeScript.*

### 7. Access Your Site
Once the containers are running:
- **Frontend (Students):** Open your browser to `http://<YOUR_SERVER_IP>:3000`
- **Backend API:** Running on `http://<YOUR_SERVER_IP>:5000`

### 8. Initial Database Setup
To create your first admin account, you need to run the database seed script inside the backend container:
```bash
# Find the backend container ID
docker ps

# Run the seed script inside the backend container
docker exec -it <backend_container_id> npx prisma db seed
```
You can now log in at `http://<YOUR_SERVER_IP>:3000/login` with `admin@embeddedcamps.com` / `admin123`.

---

## How to Upload Videos
Since we are using local storage on the server to keep costs low, you will transfer your `.mp4` files directly to the server using `scp` (Secure Copy).

From your local machine:
```bash
scp D:\path\to\your\video.mp4 root@<YOUR_SERVER_IP>:/root/embedded-camps-platform/uploads/
```
Then, in the Admin Dashboard, simply type `video.mp4` when creating a new material.

---

## Future Upgrade Path
When you are ready to add a domain name (e.g., `embeddedcamps.com`) and enable HTTPS (SSL certificates):
1. Buy a domain from Namecheap or Cloudflare.
2. Point the domain's A-Record to your server's IP address.
3. Add **Nginx Proxy Manager** or **Caddy** to your `docker-compose.yml` to automatically handle SSL certificates.
