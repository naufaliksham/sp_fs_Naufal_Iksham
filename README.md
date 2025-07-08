# Manajer Tugas Proyek (Collaborative Task Manager)

Sebuah aplikasi web full-stack yang dibangun dengan Next.js untuk manajemen tugas dan proyek secara kolaboratif, dilengkapi dengan fitur realtime, autentikasi, dan analitik.

---

## Fitur Utama

-   **Autentikasi Pengguna**: Sistem registrasi dan login yang aman menggunakan NextAuth.js.
-   **Manajemen Proyek**: Setiap pengguna dapat membuat proyek, menjadi pemilik, dan mengelola tugas di dalamnya.
-   **Undangan Anggota**: Pemilik proyek dapat mengundang pengguna lain melalui email (dengan fitur *autocomplete*) untuk berkolaborasi.
-   **Akses Terproteksi**: Pengguna hanya dapat melihat dan mengakses proyek di mana mereka menjadi pemilik atau anggota.
-   **Manajemen Tugas**: Fitur CRUD (Create, Read, Update, Delete) penuh untuk tugas di dalam setiap proyek.
-   **Papan Kanban**: Visualisasikan alur kerja dengan papan tugas bergaya Kanban (To Do, In Progress, Done).
-   **Drag & Drop**: Pindahkan tugas antar status dengan mudah menggunakan fungsionalitas geser dan letakkan.
-   **Chart Analitik**: Lihat ringkasan visual jumlah tugas berdasarkan statusnya untuk setiap proyek.
-   **Update Realtime**: Perubahan pada papan tugas (seperti pembaruan status) akan langsung terlihat oleh semua anggota tim secara realtime menggunakan **Pusher**.
-   **Ekspor ke JSON**: Unduh semua data proyek (detail, anggota, dan tugas) dalam format file JSON.

---

## Teknologi yang Digunakan

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS & Shadcn/ui
-   **Backend**: Next.js API Routes
-   **Autentikasi**: NextAuth.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Realtime**: Pusher
-   **Charting**: Chart.js

---

## Memulai

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut.

### Prasyarat

-   Node.js (v18 atau lebih baru)
-   pnpm (atau npm/yarn)
-   PostgreSQL server yang sedang berjalan

### Instalasi

1.  **Kloning Repository**
    ```bash
    git clone https://github.com/naufaliksham/sp_fs_Naufal_Iksham.git
    ```
    ```
    cd sp_fs_Naufal_Iksham
    ```

2.  **Instal Dependensi**
    ```bash
    pnpm install
    ```

3.  **Setup Variabel Lingkungan**
    Salin file `.env.example` kemudian ganti namanya menjadi `.env` dan isi semua data yang diperlukan.
    ```
    cp .env.example .env
    ```

4.  **Migrasi Database**
    Jalankan perintah ini untuk membuat tabel-tabel di database PostgreSQL Anda sesuai dengan skema Prisma.
    ```bash
    npx prisma migrate dev
    ```

5.  **Jalankan Aplikasi**
    ```bash
    pnpm dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---