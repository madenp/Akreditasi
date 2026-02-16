# Panduan Implementasi Fitur Tabel 23a

Dokumen ini menjelaskan cara membuat dan mengimplementasikan seluruh fitur canggih yang ada pada halaman `tabel23a.js`. Gunakan panduan ini sebagai referensi untuk membuat tabel serupa di masa depan.

## 1. Persiapan Data & State Management

Gunakan `useState` untuk mengelola data dan status interaksi antarmuka.

```javascript
// State dasar
const [penelitianData, setPenelitianData] = useState([]); // Data tabel
const [loading, setLoading] = useState(true); // Indikator loading
const [isTableModalOpen, setIsTableModalOpen] = useState(false); // Visibility modal tabel

// State untuk fitur-fitur spesifik
const [colWidths, setColWidths] = useState({ ... }); // Lebar kolom dinamis
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Konfigurasi sorting
const [isJudulWrapped, setIsJudulWrapped] = useState(true); // Toggle wrap text
const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, title: '', content: '' }); // State tooltip hover
```

---

## 2. Struktur Tabel & Sticky Columns (Kolom Beku)

Fitur ini membuat kolom tertentu (seperti "No" dan "Judul") tetap terlihat saat digeser (scroll) ke samping.

**Kunci Implementasi:**
1.  Gunakan `position: sticky`.
2.  Hitung `left` offset berdasarkan lebar kolom sebelumnya.
3.  Gunakan `z-index` agar berada di atas kolom lain.

```javascript
// Helper function untuk style sticky
const stickyStyle = (left, zIndex = 10, extraStyle = {}) => ({
    position: 'sticky',
    left: left,
    background: '#fff',
    zIndex: zIndex,
    borderRight: '1px solid #ddd',
    ...extraStyle
});

// Penggunaan di Column Header & Cell
// Kolom 1 (No) - left 0
<td style={{ ...stickyStyle(0, 40), ... }}>...</td>

// Kolom 2 (Judul) - left selebar kolom 1
<td style={{ ...stickyStyle(`${colWidths.no}px`, 40), ... }}>...</td>
```

---

## 3. Fitur Resize Kolom (Ubah Lebar Manual)

Memungkinkan pengguna menarik garis batas kolom untuk mengubah lebarnya.

**Logika:**
1.  **State `colWidths`**: Menyimpan lebar setiap kolom dalam pixel.
2.  **Handler `startResize`**: Menangkap event `mouseDown` pada elemen *resizer*.
3.  **Global Event Listener**: Menambahkan `mousemove` dan `mouseup` ke `document` saat drag dimulai.

```javascript
const startResize = (e, key) => {
    // 1. Simpan posisi awal mouse & lebar awal
    const startX = e.clientX;
    const startWidth = colWidths[key];

    // 2. Fungsi saat mouse bergerak
    const onMouseMove = (moveEvent) => {
        const diff = moveEvent.clientX - startX;
        setColWidths(prev => ({
            ...prev,
            [key]: Math.max(50, startWidth + diff) // Mencegah terlalu kecil (min 50px)
        }));
    };

    // 3. Fungsi saat mouse dilepas (cleanup)
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

// Elemen Resizer di Header
const renderResizer = (key) => (
    <div
        style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '5px',
            cursor: 'col-resize', zIndex: 100
        }}
        onMouseDown={(e) => startResize(e, key)}
    />
);
```

---

## 4. Fitur Sorting (Pengurutan Data) Canggih

Mengurutkan data tidak hanya berdasarkan angka/teks mentah, tapi juga logika khusus (seperti prioritas dana).

```javascript
const sortedData = useMemo(() => {
    let data = [...penelitianData];
    if (sortConfig.key) {
        data.sort((a, b) => {
            // Logika Sort Custom
            
            // 1. Sort Angka (No)
            if (sortConfig.key === 'no') {
               // parseInt logika...
            }

            // 2. Sort Sumber Dana (Logika Prioritas Label)
            if (sortConfig.key === 'sumberDana') {
                const getDanaLabel = (item) => {
                    if (item.mandiri > 0) return 'Mandiri';
                    // ... cek prioritas lain
                    return '';
                };
                // bandingkan label
            }

            // ... standar string comparator
        });
    }
    return data;
}, [penelitianData, sortConfig]);
```

---

## 5. Toggle Wrap Text (Judul Panjang)

Tombol kecil di header judul untuk beralih antara tampilan satu baris (`nowrap`) atau teks penuh ke bawah (`normal`).

```javascript
// State
const [isJudulWrapped, setIsJudulWrapped] = useState(true);

// Di Header (Ikon Toggle)
<i 
    className={`fas fa-${isJudulWrapped ? 'align-justify' : 'align-left'}`}
    onClick={() => setIsJudulWrapped(!isJudulWrapped)} 
/>

// Di Cell Data
<td style={{ whiteSpace: isJudulWrapped ? 'normal' : 'nowrap' }}>
    {item.judul}
</td>
```

---

## 6. Penggabungan Kolom (Computed Columns)

Menggabungkan banyak kolom boolean (0/1) menjadi satu kolom status dengan badge warna-warni.

**Contoh: Kolom Jenis Publikasi**
Alih-alih menampilkan 13 kolom angka, kita logika-kan menjadi satu:

```javascript
<td style={{ textAlign: 'center' }}>
    {item.jurnalInternasional > 0 ? 
        <span className="badge primary">J. Intl</span> :
     item.seminarNasional > 0 ? 
        <span className="badge warning">Sem. Nas</span> :
     // ... cek kondisi lain
     '-'}
</td>
```
*(Teknik ini disebut Conditional Rendering bertingkat)*

---

## 7. Tooltip Hover Keren (Portal & Positioning)

Menampilkan detail saat kursor menyentuh badge, dengan posisi yang cerdas (tidak terpotong layar).

**Langkah-langkah:**
1.  **React Portal**: Gunakan `createPortal` untuk merender tooltip di luar struktur tabel (di body langsung) agar tidak tertutup `overflow: hidden` tabel.
2.  **Kalkulasi Posisi (`getBoundingClientRect`)**:

```javascript
const handleBadgeHover = (e, label) => {
    const rect = e.target.getBoundingClientRect(); // Dapat posisi elemen badge
    
    let x = rect.right + 10; // Posisi di kanan badge
    let y = rect.top + (rect.height / 2); // Tengah vertikal
    
    // Cek jika mentok kanan layar
    if (x + 250 > window.innerWidth) {
        x = rect.left - 260; // Pindah ke kiri badge
    }

    setTooltip({ show: true, x, y, title: label, content: '...' });
};
```

3.  **Render Portal**:
```javascript
<ModalPortal>
    <div style={{ 
        position: 'fixed', left: tooltip.x, top: tooltip.y, 
        opacity: tooltip.show ? 1 : 0 
    }}>
        {/* Isi Tooltip */}
    </div>
</ModalPortal>
```

---

## 8. Modal Portal Pattern

Menggunakan React Portal untuk membuat Modal yang selalu berada di paling atas (top-layer), terlepas dari struktur CSS parent-nya.

```javascript
const ModalPortal = ({ children }) => {
    return ReactDOM.createPortal(
        children,
        document.body // Render langsung ke <body>
    );
};
```

---

**Tips Tambahan:**
*   **Styling**: Gunakan Inline Styles atau CSS Class untuk performa dan kemudahan. Di contoh ini banyak menggunakan inline styles dengan variabel JS untuk nilai dinamis (seperti lebar kolom).
*   **Performance**: Gunakan `useMemo` untuk operasi berat seperti sorting dan filtering agar tidak dijalankan ulang setiap render kecil.
