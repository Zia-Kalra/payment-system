## Cloud concepts: SaaS vs PaaS vs IaaS (with our project)

### SaaS (Software as a Service)

- **Definition**: You use a complete software product delivered over the internet.
- **In our project**: We are **building** a SaaS-like app (a payment system dashboard), but **Vercel/Render are not SaaS for our app**—they are platforms.
- **Examples**:
  - Gmail, Slack, Notion
  - If we offered our payment dashboard to other businesses as a product, that would be our **SaaS**.

### PaaS (Platform as a Service)

- **Definition**: You deploy your code to a platform; the platform manages servers, runtime, scaling knobs, HTTPS, deploy pipelines.
- **In our project**:
  - **Render** is PaaS for the FastAPI backend and (optionally) Postgres.
  - **Vercel** is PaaS for the React/Vite frontend.
- **What we don’t manage**:
  - OS patches
  - load balancers at the edge
  - TLS certificates

### IaaS (Infrastructure as a Service)

- **Definition**: You rent raw compute/network/storage (VMs, disks, VPCs). You manage OS + runtime + deployments.
- **What IaaS would look like here**:
  - Run FastAPI on an EC2 VM (AWS) or Compute Engine VM (GCP)
  - Install Python, Nginx, systemd, certbot, Postgres, etc.
  - You handle scaling, patching, and security updates yourself
- **Examples**:
  - AWS EC2, GCP Compute Engine, Azure Virtual Machines, DigitalOcean Droplets

### Summary table

- **SaaS**: you use software
- **PaaS**: you deploy code; provider manages platform
- **IaaS**: you manage servers + platform yourself

