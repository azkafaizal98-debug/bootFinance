Kamu bikin bot finance pakai Node.js + MongoDB lokal dan sekarang butuh README biar orang lain nggak nyasar pas clone repo? Akhirnya ada yang mikir soal dokumentasi juga. Dunia sedikit lebih terang hari ini.

Di bawah ini README versi profesional, bersih, dan siap kamu taruh di GitHub. Tidak ada gaya nyeleneh. Ini murni dokumentasi teknis.


---

💰 Finance Bot – Telegram Personal Finance Tracker

Bot Telegram untuk mencatat pemasukan dan pengeluaran harian menggunakan Node.js, MongoDB (local database), dan Telegraf.js.

Bot ini memungkinkan user menyimpan transaksi keuangan dan menampilkan riwayat serta total saldo secara otomatis.


---

🚀 Features

✅ Tambah pemasukan

✅ Tambah pengeluaran

✅ Format angka otomatis (contoh: 12.000)

✅ Lihat semua transaksi

✅ Hitung total saldo

✅ Database lokal MongoDB

✅ Mudah dikembangkan



---

🛠 Tech Stack

Node.js

NPM

MongoDB (local)

Mongoose

Telegraf.js

dotenv

---

📦 Installation Guide

Ikuti langkah berikut agar bot bisa dijalankan di komputer kamu.

---

1️⃣ Clone Repository
,,,
git clone https://github.com/USERNAME/NAMA-REPO.git
cd NAMA-REPO

,,,
---

2️⃣ Install Dependencies
,,,
Pastikan Node.js sudah terinstall.

Cek versi:

node -v
npm -v

Install semua module:

npm install
,,,

---

3️⃣ Install MongoDB (Local Database)
,,,
Download MongoDB Community Server:

🔗 https://www.mongodb.com/try/download/community
,,,
,,,
Setelah install, jalankan MongoDB service:
,,,
,,,
Windows:

net start MongoDB
,,,
,,,
Mac/Linux:

mongod
,,,
,,,
Pastikan MongoDB berjalan di:

mongodb://127.0.0.1:27017
,,,

---

4️⃣ Setup Environment Variables

Buat file .env di root project:

BOT_TOKEN=ISI_TOKEN_BOT_KAMU
MONGO_URI=mongodb://127.0.0.1:27017/financebot

Untuk mendapatkan BOT_TOKEN:

1. Buka Telegram


2. Cari @BotFather


3. Buat bot baru


4. Copy token yang diberikan




---

5️⃣ Run Bot

npm start

Jika berhasil, console akan menampilkan:

Bot is running...
Database connected...

Bot siap digunakan di Telegram.


---

📖 Example Commands

/add 12000 makan
/add 50000 gaji
/list
/total


---

📂 Project Structure

├── config/
│   └── db.js
├── models/
│   └── transaction.js
├── bot.js
├── app.js
├── .env
├── package.json
└── README.md


---

🔄 Cara Kerja Sistem

1. User kirim command ke Telegram


2. Telegraf menangani request


3. Data diproses


4. Disimpan ke MongoDB


5. Saat /list, data diambil dari database


6. Format angka ditampilkan dengan pemisah ribuan




---

🧪 Development Mode (Optional)

Gunakan nodemon agar auto-restart saat ada perubahan:

npm install -g nodemon
nodemon bot.js


---

📌 Requirements

Node.js v16+

MongoDB Local

Telegram Account



---

🔒 Notes

Database masih lokal

Jika ingin production, gunakan MongoDB Atlas

Jangan upload file .env ke GitHub


Tambahkan ke .gitignore:

.env
node_modules


---

📈 Future Improvements

Dashboard Web

Grafik keuangan

Multi-user authentication

Deploy ke VPS / Railway / Render



---

🧑‍💻 Author

Faizal GM


---

Kalau kamu mau, saya bisa tambahkan:

Versi MongoDB Atlas (cloud)

Cara deploy ke VPS

Cara deploy ke Railway

Tambahkan badge GitHub (license, version, dll)

Tambahkan screenshot preview

Tambahkan diagram arsitektur sistem


Sekarang README kamu sudah cukup jelas untuk developer lain. Tinggal kamu konsisten kodingnya aja. Jangan README rapi tapi logic berantakan. Itu dosa kecil developer pemula.