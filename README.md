# 🛡️ DISASTER RELIEF | India Emergency Response Platform

A modern, responsive, and coordinated disaster management web application connecting citizens, volunteers, and emergency response administrators across India.

---

## 🚀 Live Access

The website is currently **LIVE** on your local machine:
- **Home & Public Portal**: [http://localhost:8080](http://localhost:8080)
- **About & Preparedness Guides**: [http://localhost:8080/about.html](http://localhost:8080/about.html)
- **Volunteer Dashboard**: [http://localhost:8080/volunteer.html](http://localhost:8080/volunteer.html)
- **Admin Control Center**: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

---

## 🔑 Demo Login Credentials

| Role | Username | Password | Destination |
| :--- | :--- | :--- | :--- |
| **Volunteer** | `volunteer` | `volunteer123` | [volunteer.html](http://localhost:8080/volunteer.html) |
| **Admin** | Any username (e.g. `admin`) | Any password | [admin.html](http://localhost:8080/admin.html) |
| **Citizen** | `citizen` | `citizen123` | Direct login modal welcome |

---

## 🛠️ How to Run Locally

### Option 1: Start with Node.js
```bash
node server.js
```
or
```cmd
npm.cmd start
```

### Option 2: VS Code Debug & Launch (F5)
Press **F5** in VS Code and select:
- `Launch Chrome against localhost`
- `Launch Chrome (Direct File)`
- `Launch Edge against localhost`

---

## 🌐 How to Deploy Live to the Internet (Free)

### 1. GitHub Pages (Recommended)
1. Initialize a git repository and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial disaster management platform"
   ```
2. Push to your GitHub repository.
3. In GitHub repo **Settings** > **Pages**, set Source to `main` branch root `/`.
4. Your website will be live at `https://<your-username>.github.io/<repo-name>/`.

### 2. Vercel / Netlify (Zero Configuration)
- **Vercel**: Run `npx vercel` or drag-and-drop the project folder to [vercel.com](https://vercel.com).
- **Netlify**: Drag-and-drop the project folder into [app.netlify.com/drop](https://app.netlify.com/drop).
