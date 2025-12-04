
# **Perancangan Sistem & Spesifikasi Fungsional: Sistem Manajemen Aset TI (IT Asset Management System)**
## **1. Pendahuluan dan Tinjauan Strategis**
### **1.1 Latar Belakang dan Konteks Bisnis**
Dalam lanskap infrastruktur teknologi modern, pengelolaan aset Teknologi Informasi (TI) bukan lagi sekadar fungsi administratif pendukung, melainkan komponen kritis yang menjamin integritas operasional, efisiensi biaya, dan kepatuhan regulasi perusahaan.<sup>1</sup> Seiring dengan ekspansi organisasi, volume perangkat keras (hardware) seperti laptop, server, perangkat jaringan, dan perangkat lunak (software) cenderung tumbuh secara eksponensial. Tanpa sistem manajemen yang terpusat dan terotomatisasi, organisasi menghadapi risiko signifikan berupa "aset hantu" (ghost assets)—aset yang tercatat di buku besar namun tidak ada secara fisik—serta inefisiensi pengadaan akibat kurangnya visibilitas terhadap inventaris yang ada.<sup>3</sup>

Penggunaan metode manual seperti lembar kerja (*spreadsheet*) atau pencatatan berbasis kertas untuk melacak aset TI memiliki kelemahan fatal dalam hal integritas data, ketidakmampuan melacak riwayat kepemilikan (chain of custody), dan kerentanan terhadap *human error*.<sup>4</sup> Oleh karena itu, kebutuhan akan sebuah aplikasi IT Asset Management (ITAM) yang dirancang khusus (purpose-built) menjadi imperatif. Dokumen ini merinci cetak biru komprehensif untuk pengembangan sistem ITAM sederhana namun berskala *enterprise-grade* yang dibangun di atas tumpukan teknologi modern: Node.js untuk kinerja backend yang tinggi, React untuk antarmuka pengguna yang responsif, dan MySQL sebagai basis data relasional yang menjamin konsistensi data transaksional.<sup>5</sup>

Laporan ini berfungsi sebagai dokumen hibrida yang menggabungkan *Functional Specification Document* (FSD) dan *Technical Design Document* (TDD). Tujuannya adalah untuk menjembatani kesenjangan antara kebutuhan bisnis operasional dan implementasi teknis, memberikan panduan mendalam bagi tim pengembang, arsitek sistem, dan pemangku kepentingan manajemen.<sup>7</sup>
### **1.2 Tujuan dan Sasaran Sistem**
Tujuan utama dari pengembangan sistem ini adalah mendigitalkan seluruh siklus hidup aset (*asset lifecycle management*), mulai dari tahap akuisisi hingga penghapusan atau *disposal*.<sup>2</sup>

Secara spesifik, sistem ini dirancang untuk mencapai sasaran berikut:

1. **Sentralisasi Inventaris**: Menciptakan "single source of truth" bagi seluruh aset TI perusahaan, mengeliminasi silo data yang tersebar di berbagai departemen.
1. **Akuntabilitas Aset**: Menerapkan mekanisme Check-in/Check-out yang ketat untuk memastikan setiap aset yang keluar dari gudang memiliki penanggung jawab (custodian) yang jelas, sehingga mengurangi risiko kehilangan aset.<sup>1</sup>
1. **Optimalisasi Utilisasi**: Memberikan visibilitas terhadap aset yang menganggur (idle) agar dapat dialokasikan ulang sebelum memutuskan untuk melakukan pembelian baru, yang secara langsung berdampak pada efisiensi anggaran belanja modal (CAPEX).
1. **Kepatuhan Audit**: Menyediakan jejak audit (audit trail) digital yang tidak dapat diubah (immutable logs) untuk setiap perubahan status dan perpindahan lokasi aset, memfasilitasi proses audit internal maupun eksternal.<sup>3</sup>
### **1.3 Lingkup Pengembangan (Scope of Work)**
Lingkup proyek ini dibatasi pada pengelolaan aset fisik dan lisensi perangkat lunak dasar. Pengembangan akan mencakup modul-modul berikut:

- **Modul Manajemen Master Data**: Pengelolaan data referensi seperti Kategori Aset, Lokasi, Vendor, dan Departemen.
- **Modul Inventaris Aset**: Pencatatan detail spesifikasi teknis, nomor seri, tanggal pembelian, masa garansi, dan status depresiasi dasar.<sup>3</sup>
- **Modul Sirkulasi (Transaksi)**: Antarmuka untuk proses peminjaman (assignment) dan pengembalian aset, termasuk pencatatan kondisi fisik saat serah terima.
- **Modul Pelaporan**: Dashboard visualisasi metrik kunci dan laporan tabular yang dapat diekspor.
- **Modul Keamanan**: Autentikasi pengguna, otorisasi berbasis peran (Role-Based Access Control - RBAC), dan keamanan API.
### **1.4 Definisi Istilah dan Akronim**
Untuk memastikan kesamaan pemahaman teknis di seluruh dokumen ini, definisi berikut digunakan:

- **ITAM**: IT Asset Management, praktik pengelolaan aset TI.
- **CRUD**: Create, Read, Update, Delete - operasi dasar manipulasi data.
- **JWT**: JSON Web Token, standar industri untuk transmisi informasi yang aman antar pihak sebagai objek JSON.
- **ORM**: Object-Relational Mapping, teknik pemrograman untuk mengonversi data antara sistem tipe yang tidak kompatibel dalam bahasa pemrograman berorientasi objek (Node.js) dan basis data relasional (MySQL).<sup>11</sup>
- **SPA**: Single Page Application, jenis aplikasi web yang dimuat satu kali dan memperbarui konten secara dinamis, dalam hal ini menggunakan React.<sup>12</sup>
## -----**2. Spesifikasi Kebutuhan Fungsional (Functional Requirements)**
Analisis kebutuhan fungsional ini didasarkan pada praktik terbaik industri dalam manajemen aset, memastikan bahwa solusi yang dibangun tidak hanya menyimpan data, tetapi juga memfasilitasi alur kerja operasional yang efisien.<sup>8</sup>
### **2.1 Aktor dan Peran Pengguna (User Roles)**
Sistem akan membedakan hak akses berdasarkan tanggung jawab operasional. Pendekatan *Least Privilege* akan diterapkan untuk meminimalkan risiko keamanan.

|**Peran (Role)**|**Deskripsi Tanggung Jawab**|**Hak Akses Sistem**|
| :- | :- | :- |
|**Super Administrator**|Penanggung jawab utama sistem (Head of IT). Memiliki otoritas penuh atas konfigurasi dan data.|Akses penuh (CRUD) ke seluruh modul. Manajemen pengguna (buat/hapus akun staf). Konfigurasi sistem global. Penghapusan data sensitif (hard delete).|
|**Asset Manager (Staff)**|Staf operasional yang bertugas sehari-hari di gudang atau helpdesk IT.|Membuat dan mengedit data aset. Memproses transaksi Check-in/Check-out. Melihat laporan. Tidak dapat menghapus riwayat audit atau mengelola akun Admin lain.|
|**Auditor / Viewer**|Pihak internal/eksternal yang membutuhkan akses data untuk verifikasi tanpa kemampuan mengubah data.|Akses *Read-Only* ke daftar aset dan riwayat transaksi. Tidak dapat melakukan perubahan data apa pun.|
|**Employee (End User)**|Karyawan pemilik/pengguna aset (direpresentasikan sebagai entitas data, bukan pengguna aktif sistem pada fase 1).|Tidak memiliki akses login pada fase 1. Hanya terdaftar sebagai penerima aset dalam database.|
### **2.2 User Stories dan Kriteria Penerimaan (Acceptance Criteria)**
User stories berikut disusun menggunakan format standar industri untuk menangkap kebutuhan dari perspektif pengguna akhir, dilengkapi dengan kriteria penerimaan yang terukur untuk memandu pengujian.<sup>14</sup>
#### **2.2.1 Manajemen Inventaris Inti**
User Story 1: Registrasi Aset Baru

Sebagai Asset Manager, saya ingin mendaftarkan aset baru yang baru dibeli ke dalam sistem agar inventaris perusahaan tercatat secara akurat sejak hari pertama kedatangan.

- **Analisis & Konteks**: Proses ini adalah titik masuk data (data entry point) yang paling kritis. Kualitas data di hilir sangat bergantung pada validasi di tahap ini.
- **Kriteria Penerimaan**:
  - Sistem menyediakan formulir input dengan validasi kolom wajib: Nama Aset, Kategori, Nomor Seri (Serial Number), Lokasi Awal, dan Tanggal Pembelian.
  - **Validasi Keunikan**: Sistem harus menolak penyimpanan jika Nomor Seri atau Asset Tag yang dimasukkan sudah ada di database untuk mencegah duplikasi.<sup>5</sup>
  - **Default State**: Status awal aset saat dibuat harus secara otomatis diset ke "In Stock" (Tersedia), kecuali ditentukan lain.
  - Sistem mendukung input data harga dalam format numerik yang presisi (Decimal) untuk akurasi akuntansi.

User Story 2: Pencarian dan Penyaringan Aset

Sebagai Staf IT, saya ingin mencari aset spesifik berdasarkan nomor seri, nama pengguna, atau kategori dengan cepat untuk merespons tiket layanan atau audit.

- **Analisis & Konteks**: Efisiensi operasional sangat bergantung pada seberapa cepat informasi aset dapat ditemukan. Pencarian harus bersifat *fuzzy* namun akurat.
- **Kriteria Penerimaan**:
  - Fitur pencarian global di dashboard yang dapat menerima input teks parsial (misal: mengetik "MacBook" menampilkan semua varian MacBook).
  - Filter *multi-faceted*: Pengguna dapat menyaring daftar berdasarkan kombinasi Kategori, Lokasi, dan Status (misal: Tampilkan semua "Laptop" di "Gudang Jakarta" yang statusnya "In Stock").
  - Hasil pencarian harus ditampilkan dalam waktu respons di bawah 2 detik untuk basis data hingga 10.000 aset.<sup>17</sup>
#### **2.2.2 Sirkulasi Aset (Check-in / Check-out)**
User Story 3: Peminjaman Aset (Check-out)

Sebagai Asset Manager, saya ingin mencatat penugasan aset kepada karyawan tertentu agar sistem mengetahui siapa yang bertanggung jawab atas aset tersebut.

- **Analisis & Konteks**: Ini adalah fungsi inti yang mengubah status aset dan kepemilikan. Integritas referensial antara aset dan karyawan sangat krusial di sini.<sup>1</sup>
- **Kriteria Penerimaan**:
  - Sistem hanya mengizinkan aset dengan status "In Stock" untuk diproses Check-out. Aset yang "In Use" atau "Retired" harus diblokir dari aksi ini.
  - Pengguna harus memilih karyawan penerima dari daftar *dropdown* yang valid (data karyawan terintegrasi/tersedia).
  - Sistem mewajibkan pengisian "Tanggal Serah Terima" dan opsional "Catatan Kondisi Awal".
  - Setelah konfirmasi, status aset otomatis berubah menjadi "Assigned" dan log transaksi baru dibuat di tabel riwayat.

User Story 4: Pengembalian Aset (Check-in)

Sebagai Asset Manager, saya ingin memproses pengembalian aset dari karyawan yang resign atau melakukan penggantian perangkat, serta mencatat kondisi terkini aset tersebut.

- **Analisis & Konteks**: Titik krusial untuk penilaian kondisi aset. Keputusan apakah aset akan kembali ke stok, masuk perbaikan, atau dihapuskan terjadi di sini.
- **Kriteria Penerimaan**:
  - Saat memilih aset yang sedang dipinjam, sistem menyediakan opsi "Check-in".
  - Pengguna wajib memilih status kondisi akhir: "Good" (Layak Pakai), "Damaged" (Rusak), atau "Lost" (Hilang).
  - Jika kondisi "Good", status aset berubah menjadi "In Stock". Jika "Damaged", status berubah menjadi "In Repair".
  - Sistem mencatat tanggal pengembalian dan menghapus asosiasi aset dengan karyawan tersebut.
#### **2.2.3 Riwayat dan Audit**
User Story 5: Jejak Audit Aset (Asset History)

Sebagai Auditor, saya ingin melihat kronologi lengkap siapa saja yang pernah menggunakan sebuah laptop tertentu dari sejak pembelian hingga sekarang.

- **Analisis & Konteks**: Transparansi historis diperlukan untuk investigasi kerusakan atau kehilangan.
- **Kriteria Penerimaan**:
  - Halaman detail aset harus memiliki tab "Riwayat Transaksi".
  - Tabel riwayat menampilkan: Tanggal, Jenis Aksi (Check-in/Out), Aktor (Admin yang memproses), Pihak Terkait (Karyawan), dan Catatan.
  - Data ini harus bersifat *read-only* permanen (immutable) bagi semua level pengguna untuk menjamin validitas audit.
### **2.3 Analisis Alur Kerja dan Diagram Status (State Machine)**
Manajemen status aset adalah logika bisnis paling kompleks dalam sistem ini. Perubahan status tidak boleh terjadi secara acak, melainkan harus mengikuti aturan transisi yang ketat (*Valid State Transitions*) untuk menjaga konsistensi data.<sup>18</sup>
#### **Definisi Status (States)**
1. **Available (In Stock)**: Aset berada dalam penyimpanan IT, kondisi baik, dan siap didistribusikan.
1. **Assigned (In Use)**: Aset sedang berada di tangan karyawan atau digunakan di lokasi operasional.
1. **In Repair (Maintenance)**: Aset sedang dalam perbaikan internal atau dikirim ke vendor pihak ketiga. Tidak dapat dipinjamkan.
1. **Retired (Disposed)**: Aset telah mencapai akhir masa pakai, dijual, didaur ulang, atau dihapusbukukan. Status ini bersifat terminal (umumnya tidak bisa kembali aktif).
1. **Missing / Lost**: Aset dilaporkan hilang atau dicuri. Perlu investigasi sebelum dihapusbukukan.
#### **Matriks Transisi Status**
Logika transisi berikut akan diimplementasikan di level Backend Controller:

|**Status Awal**|**Aksi Pemicu (Trigger Action)**|**Status Akhir**|**Kondisi Logika (Guard)**|
| :- | :- | :- | :- |
|**Draft / New**|Create Asset|**Available**|Data wajib lengkap.|
|**Available**|Check-out (Assign)|**Assigned**|Penerima valid dipilih.|
|**Available**|Send to Repair|**In Repair**|Alasan kerusakan dicatat.|
|**Available**|Dispose / Write-off|**Retired**|Otorisasi Admin diperlukan.|
|**Assigned**|Check-in (Good Condition)|**Available**|-|
|**Assigned**|Check-in (Damaged)|**In Repair**|Catatan kerusakan wajib.|
|**Assigned**|Report Lost|**Missing**|Laporan kejadian wajib.|
|**In Repair**|Repair Completed|**Available**|Tes fungsi lulus.|
|**In Repair**|Repair Failed (BER\*)|**Retired**|*Beyond Economic Repair*.|
|**Missing**|Found / Recovered|**Available**|Verifikasi fisik dilakukan.|
|**Missing**|Write-off|**Retired**|Batas waktu pencarian lewat.|

*Implementasi state machine ini mencegah skenario tidak logis, seperti melakukan "Check-out" pada aset yang sedang "In Repair" atau "Retired".* <sup>21</sup>
## -----**3. Perancangan Basis Data (Database Design)**
Desain basis data adalah fondasi dari integritas sistem. Mengingat sifat data yang sangat terstruktur dan saling berelasi, **MySQL** dipilih sebagai sistem manajemen basis data (RDBMS). Desain skema mengikuti prinsip normalisasi hingga Tingkat Normal Ketiga (3NF) untuk menghilangkan redundansi data dan anomali pembaruan.<sup>23</sup>
### **3.1 Diagram Hubungan Entitas (Conceptual ERD)**
Struktur data berpusat pada entitas Assets, yang memiliki relasi *Many-to-One* dengan Categories dan Locations, serta relasi dinamis dengan Users melalui tabel transaksi.

- **Users (1)** <---- **(N) Assets** (User memegang banyak aset, Aset dipegang 1 user saat ini).
- **Categories (1)** <---- **(N) Assets** (Kategori memiliki banyak aset).
- **Locations (1)** <---- **(N) Assets** (Lokasi menyimpan banyak aset).
- **Assets (1)** <---- **(N) Transactions** (Aset memiliki riwayat transaksi).
- **Users (1)** <---- **(N) Transactions** (User terlibat dalam banyak transaksi).
### **3.2 Spesifikasi Skema Tabel**
#### **3.2.1 Tabel users**
Tabel ini menyimpan data semua pengguna sistem, baik staf IT (yang login) maupun karyawan biasa (peminjam aset).

- **Normalisasi**: Memisahkan peran dan departemen untuk menghindari redundansi, namun untuk kesederhanaan di fase 1, role menggunakan ENUM.
- **Keamanan**: Password disimpan dalam bentuk hash (menggunakan Argon2 atau Bcrypt), tidak pernah *plain text*.

|**Kolom**|**Tipe Data**|**Kendala (Constraints)**|**Deskripsi Fungsional**|
| :- | :- | :- | :- |
|id|INT|PK, Auto Increment|Identifikasi internal basis data.|
|uuid|VARCHAR(36)|Unique, Not Null, Index|ID publik untuk referensi API (UUIDv4) guna mencegah enumerasi ID.|
|name|VARCHAR(100)|Not Null|Nama lengkap pengguna.|
|email|VARCHAR(100)|Unique, Not Null, Index|Email korporat, digunakan sebagai ID login.|
|password|VARCHAR(255)|Nullable|Hash password. Null jika user hanya karyawan peminjam tanpa akses sistem.|
|role|ENUM|'admin', 'staff', 'employee'|Tingkat akses. 'employee' tidak bisa login (default).|
|department|VARCHAR(100)|Nullable|Divisi kerja (misal: Finance, Engineering).|
|created\_at|DATETIME|Default CURRENT\_TIMESTAMP|Timestamp pembuatan akun.|
|updated\_at|DATETIME|Default CURRENT\_TIMESTAMP|Timestamp pembaruan terakhir.|
#### **3.2.2 Tabel assets**
Tabel inti yang menyimpan atribut inventaris.

- **Indeks**: Indeks ditambahkan pada serial\_number, asset\_tag, dan name untuk mempercepat pencarian.<sup>5</sup>
- **Foreign Keys**: category\_id, location\_id, current\_holder\_id.

|**Kolom**|**Tipe Data**|**Kendala (Constraints)**|**Deskripsi Fungsional**|
| :- | :- | :- | :- |
|id|INT|PK, Auto Increment|Identifikasi internal.|
|uuid|VARCHAR(36)|Unique, Not Null, Index|ID publik aset.|
|name|VARCHAR(150)|Not Null, Fulltext Index|Nama model atau deskripsi singkat aset.|
|asset\_tag|VARCHAR(50)|Unique, Not Null|Kode barcode/QR internal perusahaan.|
|serial\_number|VARCHAR(100)|Unique, Not Null|Nomor seri unik dari pabrikan.|
|category\_id|INT|FK -> categories(id)|Referensi ke jenis aset.|
|location\_id|INT|FK -> locations(id)|Referensi ke lokasi penyimpanan fisik.|
|current\_holder\_id|INT|FK -> users(id), Nullable|User yang sedang memegang aset (jika status assigned).|
|status|ENUM|'available', 'assigned',...|Status terkini aset (sesuai State Machine).|
|purchase\_date|DATE|Not Null|Tanggal pembelian untuk kalkulasi umur aset.|
|price|DECIMAL(15,2)|Default 0.00|Nilai perolehan aset.|
|specifications|JSON|Nullable|Data fleksibel untuk spek teknis (RAM, Processor).<sup>25</sup>|

*Catatan: Penggunaan tipe data JSON pada kolom specifications memungkinkan fleksibilitas menyimpan atribut unik per kategori (misal: "Ukuran Layar" untuk Monitor, "Kapasitas RAM" untuk Laptop) tanpa perlu membuat tabel terpisah untuk setiap tipe aset (EAV pattern)*.<sup>25</sup>
#### **3.2.3 Tabel transactions (Audit Trail)**
Mencatat setiap mutasi aset. Tabel ini didesain sebagai *Immutable Ledger*, artinya data di sini tidak boleh di-update atau dihapus melalui aplikasi front-end standar.

|**Kolom**|**Tipe Data**|**Kendala (Constraints)**|**Deskripsi Fungsional**|
| :- | :- | :- | :- |
|id|INT|PK, Auto Increment|ID Transaksi.|
|uuid|VARCHAR(36)|Unique, Not Null|ID Publik Transaksi.|
|asset\_id|INT|FK -> assets(id)|Aset yang terlibat.|
|user\_id|INT|FK -> users(id)|Karyawan yang terlibat (peminjam/pengembali).|
|admin\_id|INT|FK -> users(id)|Staf IT yang memproses transaksi (auditor).|
|action\_type|ENUM|'checkout', 'checkin',...|Jenis aktivitas yang dilakukan.|
|transaction\_date|DATETIME|Not Null|Waktu tepat terjadinya transaksi.|
|condition\_status|VARCHAR(50)|Nullable|Kondisi fisik aset saat transaksi (New, Good, Damaged).|
|notes|TEXT|Nullable|Catatan tambahan (misal: kelengkapan aksesoris).|
#### **3.2.4 Tabel Referensi (categories & locations)**
Tabel-tabel kecil untuk standarisasi data (Lookup Tables).

- **categories**: id, name (Laptop, Server, License), description.
- **locations**: id, name (HQ Server Room, Warehouse A), address.
### **3.3 Strategi Integritas Data dengan Sequelize ORM**
Penggunaan Sequelize sebagai ORM (Object-Relational Mapper) di lapisan aplikasi Node.js memberikan keuntungan abstraksi dan keamanan.<sup>11</sup>

Definisi Asosiasi (Associations):

Relasi antar tabel didefinisikan secara eksplisit di level kode untuk memudahkan Eager Loading (mengambil data terkait dalam satu query).

JavaScript


// models/index.js - Definisi Relasi Sequelize\
\
// 1. Relasi Aset ke Kategori dan Lokasi\
Category.hasMany(Asset, { foreignKey: 'category\_id' });\
Asset.belongsTo(Category, { foreignKey: 'category\_id' });\
\
Location.hasMany(Asset, { foreignKey: 'location\_id' });\
Asset.belongsTo(Location, { foreignKey: 'location\_id' });\
\
// 2. Relasi Kepemilikan Aset (Current Holder)\
// User (sebagai Employee) bisa memegang banyak aset\
User.hasMany(Asset, { as: 'heldAssets', foreignKey: 'current\_holder\_id' });\
Asset.belongsTo(User, { as: 'holder', foreignKey: 'current\_holder\_id' });\
\
// 3. Relasi Riwayat Transaksi (Kompleks)\
// Satu Aset memiliki banyak entri sejarah\
Asset.hasMany(Transaction, { foreignKey: 'asset\_id' });\
Transaction.belongsTo(Asset, { foreignKey: 'asset\_id' });\
\
// Transaksi melibatkan Employee (Peminjam)\
User.hasMany(Transaction, { as: 'employeeTransactions', foreignKey: 'user\_id' });\
Transaction.belongsTo(User, { as: 'employee', foreignKey: 'user\_id' });\
\
// Transaksi diproses oleh Admin (Executor)\
User.hasMany(Transaction, { as: 'adminTransactions', foreignKey: 'admin\_id' });\
Transaction.belongsTo(User, { as: 'admin', foreignKey: 'admin\_id' });

Penerapan *Constraint* foreignKey pada level database (bukan hanya level ORM) akan diaktifkan saat migrasi untuk mencegah data yatim piatu (*orphaned records*).<sup>27</sup>
## -----**4. Arsitektur Teknis dan Desain Sistem**
Sistem ini mengadopsi pola arsitektur **Three-Tier Monolithic** yang modern. Meskipun arsitektur Microservices populer, pendekatan Monolithic dipilih karena kompleksitas domain yang tergolong rendah hingga menengah, kemudahan *deployment*, dan konsistensi transaksional yang lebih mudah dikelola dalam satu database.
### **4.1 Diagram Arsitektur (High-Level)**
Sistem terdiri dari tiga lapisan logis utama:

1. **Presentation Layer (Client-Side)**: Aplikasi React.js yang berjalan di browser pengguna. Bertanggung jawab atas rendering UI, validasi input awal, dan konsumsi API.
1. **Application Layer (Server-Side)**: Server Node.js dengan framework Express. Bertanggung jawab atas logika bisnis, autentikasi, otorisasi, dan orkestrasi data.
1. **Data Layer (Persistence)**: Server Database MySQL untuk penyimpanan data persisten yang terstruktur.

Code snippet


graph TD\
`    `User -->|HTTPS Request| ReactApp\
`    `ReactApp -->|REST API Call (JSON)| ExpressServer\
\
`    `subgraph "Backend Server"\
`        `ExpressServer -->|Auth Middleware| JWT\
`        `ExpressServer -->|Business Logic| Controllers[Controllers]\
`        `Controllers -->|ORM Queries| Sequelize\
`    `end\
\
`    `Sequelize -->|SQL Query| MySQL\
\
`    `style User fill:#f9f,stroke:#333,stroke-width:2px\
`    `style MySQL fill:#ffe,stroke:#f66,stroke-width:2px
### **4.2 Pemilihan Teknologi (Technology Stack Rationale)**
#### **4.2.1 Backend: Node.js & Express**
- **Alasan Pemilihan**: Node.js dipilih karena arsitekturnya yang *event-driven* dan *non-blocking I/O*. Ini sangat ideal untuk aplikasi manajemen aset yang banyak menangani operasi I/O (pembacaan database, penulisan log transaksi) secara konkuren.<sup>6</sup>
- **Ekosistem**: NPM (Node Package Manager) menyediakan ribuan pustaka siap pakai seperti joi untuk validasi, cors untuk keamanan lintas domain, dan multer untuk upload file gambar aset.
- **Express.js**: Framework minimalis ini memberikan struktur dasar untuk routing dan middleware tanpa memaksakan opini arsitektur yang terlalu kaku, memberikan fleksibilitas bagi tim pengembang.<sup>31</sup>
#### **4.2.2 Frontend: React.js**
- **Alasan Pemilihan**: React menawarkan model pemrograman deklaratif berbasis komponen. Ini sangat menguntungkan untuk membangun antarmuka yang kompleks seperti tabel inventaris dengan fitur sorting/filtering interaktif tanpa perlu memuat ulang halaman (SPA).<sup>12</sup>
- **Ekosistem UI**: Penggunaan **Tailwind CSS** direkomendasikan untuk styling yang cepat dan konsisten. Untuk komponen tabel yang kompleks, library seperti react-data-table-component atau @tanstack/react-table akan digunakan untuk menangani dataset besar dengan performa tinggi.<sup>32</sup>
- **State Management**: Mengingat skala aplikasi yang "sederhana", penggunaan **React Context API** sudah cukup untuk manajemen state global (seperti status autentikasi user dan tema aplikasi), menghindari kompleksitas berlebih dari Redux.<sup>33</sup>
#### **4.2.3 Autentikasi: JWT (JSON Web Tokens)**
Mekanisme keamanan menggunakan strategi *token-based authentication* stateless <sup>34</sup>:

1. **Access Token**: Token JWT berumur pendek (misal: 15-20 detik) yang disimpan di memori (state React) aplikasi klien. Digunakan untuk otorisasi setiap request API.
1. **Refresh Token**: Token berumur panjang (misal: 1 hari) yang disimpan di **HttpOnly Cookie**. Cookie ini tidak dapat diakses oleh JavaScript di browser, sehingga aman dari serangan XSS (Cross-Site Scripting). Endpoint khusus /token akan digunakan untuk menukar Refresh Token dengan Access Token baru saat yang lama kadaluarsa.
### **4.3 Desain API RESTful (Application Programming Interface)**
Komunikasi antara frontend dan backend dilakukan melalui REST API standar. Desain API mengikuti konvensi penamaan sumber daya (resource naming) yang intuitif dan penggunaan kata kerja HTTP (GET, POST, PUT, DELETE) yang semestinya.<sup>31</sup>
#### **Standarisasi Respons JSON**
Untuk memudahkan penanganan di frontend, seluruh respons API akan mengikuti format amplop standar ini <sup>37</sup>:

- **Respons Sukses (200 OK / 201 Created):**\
  JSON\
  {\
  `  `"success": true,\
  `  `"message": "Asset created successfully",\
  `  `"data": {\
  `    `"id": "uuid-v4-string",\
  `    `"name": "MacBook Pro M2",\
  `    `"status": "available"\
  `  `},\
  `  `"meta": {  // Opsional, untuk pagination\
  `    `"page": 1,\
  `    `"total\_pages": 5,\
  `    `"total\_records": 50\
  `  `}\
  }
- **Respons Error (400 Bad Request / 401 Unauthorized / 500 Server Error):**\
  JSON\
  {\
  `  `"success": false,\
  `  `"message": "Validation failed",\
  `  `"error\_code": "VAL\_ERR\_001",\
  `  `"errors":\
  }
#### **Endpoint Kunci**

|**Method**|**Endpoint URI**|**Deskripsi Fungsi**|**Level Akses**|
| :- | :- | :- | :- |
|**POST**|/api/auth/login|Autentikasi user, set refresh token cookie.|Public|
|**GET**|/api/auth/token|Mendapatkan access token baru via refresh token.|Public (w/ Cookie)|
|**GET**|/api/assets|Mengambil daftar aset (supports query params: search, filter).|Staff, Admin|
|**POST**|/api/assets|Membuat aset baru.|Staff, Admin|
|**GET**|/api/assets/:id|Mengambil detail aset & riwayat.|Staff, Admin|
|**PUT**|/api/assets/:id|Update data aset (non-status).|Staff, Admin|
|**POST**|/api/transactions/checkout|Memproses peminjaman aset (Logika Transaksi).|Staff, Admin|
|**POST**|/api/transactions/checkin|Memproses pengembalian aset (Logika Transaksi).|Staff, Admin|
|**GET**|/api/users|Daftar pengguna/karyawan.|Admin Only|
## -----**5. Strategi Implementasi dan Koding**
Bagian ini memberikan panduan langkah demi langkah yang mendetail bagi pengembang untuk membangun sistem dari nol, mencakup konfigurasi lingkungan, struktur folder, dan implementasi fitur kunci.
### **5.1 Struktur Proyek (Project Structure)**
Untuk menjaga kerapian kode, kita akan memisahkan kode frontend dan backend dalam satu repositori (Monorepo style) atau dua folder terpisah. Struktur yang disarankan:

it-asset-management/

├── backend/

│ ├── config/ # Konfigurasi DB & Env

│ │ └── Database.js

│ ├── controllers/ # Logika Bisnis (Functions)

│ │ ├── AssetController.js

│ │ ├── AuthController.js

│ │ └── TransactionController.js

│ ├── middleware/ # Auth & Validation

│ │ ├── VerifyToken.js

│ │ └── Validation.js

│ ├── models/ # Schema Sequelize

│ │ ├── AssetModel.js

│ │ ├── UserModel.js

│ │ └── index.js # Relasi didefinisikan di sini

│ ├── routes/ # Definisi Endpoint API

│ │ └── AssetRoute.js

│ ├──.env # Variabel Environment (Sensitif)

│ └── index.js # Entry Point Server

├── frontend/

│ ├── src/

│ │ ├── components/ # UI Components (Reusable)

│ │ │ ├── Sidebar.jsx

│ │ │ └── Navbar.jsx

│ │ ├── pages/ # Halaman Utama

│ │ │ ├── Dashboard.jsx

│ │ │ ├── AssetList.jsx

│ │ │ └── AddAsset.jsx

│ │ ├── features/ # Redux Slices / Context

│ │ │ └── authSlice.js

│ │ ├── api/ # Konfigurasi Axios

│ │ └── App.jsx

│ └── package.json

└── README.md
### **5.2 Implementasi Backend (Node.js)**
#### **Langkah 1: Inisialisasi dan Konfigurasi Database**
Gunakan mysql2 sebagai driver dan sequelize sebagai ORM. Konfigurasi koneksi harus fleksibel menggunakan variabel lingkungan.

JavaScript


// backend/config/Database.js\
import { Sequelize } from "sequelize";\
import dotenv from "dotenv";\
dotenv.config();\
\
const db = new Sequelize(process.env.DB\_NAME, process.env.DB\_USER, process.env.DB\_PASS, {\
`    `host: process.env.DB\_HOST,\
`    `dialect: "mysql",\
`    `logging: false, // Nonaktifkan log SQL di production untuk kebersihan console\
`    `pool: {\
`        `max: 5,\
`        `min: 0,\
`        `acquire: 30000,\
`        `idle: 10000\
`    `}\
});\
\
export default db;
#### **Langkah 2: Definisi Model dan Sinkronisasi**
Definisikan model Asset dengan tipe data yang ketat. Gunakan fitur UUID default dari Sequelize untuk ID.<sup>26</sup>

JavaScript


// backend/models/AssetModel.js\
import { Sequelize } from "sequelize";\
import db from "../config/Database.js";\
import Users from "./UserModel.js"; // Import untuk relasi\
\
const { DataTypes } = Sequelize;\
\
const Assets = db.define('assets', {\
`    `uuid: {\
`        `type: DataTypes.STRING,\
`        `defaultValue: DataTypes.UUIDV4,\
`        `allowNull: false,\
`        `validate: { notEmpty: true }\
`    `},\
`    `name: {\
`        `type: DataTypes.STRING,\
`        `allowNull: false,\
`        `validate: { len:  }\
`    `},\
`    `status: {\
`        `type: DataTypes.ENUM,\
`        `values: ['available', 'assigned', 'repair', 'retired'],\
`        `defaultValue: 'available'\
`    `},\
`    `//... field lainnya\
}, {\
`    `freezeTableName: true\
});\
\
export default Assets;
#### **Langkah 3: Logika Transaksi Check-out (Kritis)**
Implementasi Check-out harus menggunakan **Database Transaction** (Sequelize Transaction) untuk menjamin atomisitas. Artinya, pencatatan log transaksi dan update status aset harus berhasil keduanya, atau gagal keduanya.<sup>41</sup>

JavaScript


// backend/controllers/TransactionController.js\
import Asset from "../models/AssetModel.js";\
import Transaction from "../models/TransactionModel.js";\
import db from "../config/Database.js";\
\
export const checkoutAsset = async (req, res) => {\
`    `const t = await db.transaction(); // Mulai transaksi DB\
`    `try {\
`        `const { assetUuid, userUuid, notes, date } = req.body;\
\
`        `// 1. Validasi Status Aset\
`        `const asset = await Asset.findOne({ where: { uuid: assetUuid } });\
`        `if (!asset |\
\
| asset.status!== 'available') {\
`            `throw new Error("Aset tidak tersedia untuk dipinjam.");\
`        `}\
\
`        `// 2. Update Status Aset\
`        `await Asset.update({ \
`            `status: 'assigned', \
`            `current\_holder\_id: req.body.userId // ID User internal hasil lookup UUID\
`        `}, { \
`            `where: { id: asset.id },\
`            `transaction: t \
`        `});\
\
`        `// 3. Catat Riwayat Transaksi\
`        `await Transaction.create({\
`            `asset\_id: asset.id,\
`            `user\_id: req.body.userId,\
`            `admin\_id: req.userId, // Dari Middleware Auth\
`            `action\_type: 'checkout',\
`            `transaction\_date: date,\
`            `notes: notes\
`        `}, { transaction: t });\
\
`        `await t.commit(); // Komit perubahan permanen\
`        `res.status(201).json({msg: "Check-out berhasil"});\
`    `} catch (error) {\
`        `await t.rollback(); // Batalkan semua perubahan jika ada error\
`        `res.status(400).json({msg: error.message});\
`    `}\
}
### **5.3 Implementasi Frontend (React)**
#### **Langkah 1: Setup dan Routing**
Gunakan react-router-dom untuk navigasi. Bungkus route privat (seperti Dashboard) dengan komponen RequireAuth yang mengecek keberadaan token valid.
#### **Langkah 2: Axios Interceptor untuk Refresh Token**
Fitur ini penting untuk UX yang mulus, di mana user tidak perlu login ulang setiap 15 menit.<sup>34</sup>

JavaScript


// frontend/src/api/axios.js\
import axios from 'axios';\
\
const axiosJWT = axios.create({\
`    `baseURL: 'http://localhost:5000',\
`    `withCredentials: true // Wajib agar cookie refresh token terkirim\
});\
\
axiosJWT.interceptors.response.use(\
`    `response => response,\
`    `async (error) => {\
`        `const originalRequest = error.config;\
`        `// Jika error 401 (Unauthorized) dan belum pernah retry\
`        `if (error.response.status === 401 &&!originalRequest.\_retry) {\
`            `originalRequest.\_retry = true;\
`            `try {\
`                `// Minta token baru\
`                `const response = await axios.get('http://localhost:5000/token', { withCredentials: true });\
`                `const token = response.data.accessToken;\
\
`                `// Update header request asli\
`                `originalRequest.headers.Authorization = `Bearer ${token}`;\
`                `return axiosJWT(originalRequest); // Ulangi request\
`            `} catch (err) {\
`                `// Jika refresh token juga expired, redirect ke login\
`                `window.location.href = "/login";\
`            `}\
`        `}\
`        `return Promise.reject(error);\
`    `}\
);\
\
export default axiosJWT;
#### **Langkah 3: Komponen Tabel Aset**
Gunakan desain komponen yang memisahkan *Container* (logika fetch data) dan *Presentational* (tampilan tabel). Tampilkan status aset menggunakan badge berwarna (Hijau: Available, Biru: Assigned, Merah: Broken) untuk pemindaian visual yang cepat.
## -----**6. Pengujian dan Validasi (Testing Strategy)**
Sebelum sistem dirilis ke produksi, serangkaian pengujian harus dilakukan untuk memastikan fungsionalitas dan keamanan.

1. **Unit Testing**: Menguji fungsi-fungsi isolasi di backend, terutama logika transisi status aset (State Machine), untuk memastikan aset yang rusak tidak bisa dipinjamkan.
1. **Integration Testing**: Menguji API endpoint checkout dan checkin untuk memastikan data tersimpan dengan benar di tabel assets dan transactions secara bersamaan.
1. **User Acceptance Testing (UAT)**: Meminta staf IT menggunakan sistem untuk skenario nyata selama 1 minggu. Fokus pada kemudahan pencarian aset dan kecepatan proses input data.
1. **Security Testing**:
   1. Mencoba mengakses API endpoint /api/users tanpa token login.
   1. Mencoba login dengan SQL Injection pada kolom email.
   1. Verifikasi bahwa Refresh Token Cookie memiliki flag HttpOnly dan Secure.
## **7. Kesimpulan dan Roadmap Fase Selanjutnya**
Dokumen ini telah merinci spesifikasi lengkap untuk membangun Sistem Manajemen Aset TI yang modern, aman, dan skalabel. Arsitektur yang dipilih (Node.js, React, MySQL) memberikan fondasi yang kuat untuk pertumbuhan data jangka panjang. Fitur kunci seperti validasi status aset yang ketat dan pencatatan riwayat transaksi yang tidak dapat diubah (immutable history) secara langsung menjawab tantangan integritas data yang sering dihadapi perusahaan.<sup>2</sup>

**Rekomendasi Pengembangan Tahap 2 (Future Roadmap):**

1. **Integrasi Barcode/QR Scanner**: Menambahkan fitur pemindaian kamera pada aplikasi React untuk mempercepat proses fisik audit aset.
1. **Notifikasi Email**: Mengintegrasikan nodemailer untuk mengirim pengingat otomatis kepada karyawan saat masa peminjaman aset akan berakhir.
1. **Kalkulasi Depresiasi**: Menambahkan modul keuangan untuk menghitung penyusutan nilai aset secara otomatis (metode garis lurus) untuk keperluan akuntansi.
1. **Self-Service Portal**: Memberikan akses login terbatas kepada karyawan biasa untuk melihat aset yang mereka pegang dan melaporkan kerusakan secara mandiri.

