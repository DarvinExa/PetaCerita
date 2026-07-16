# PetaCerita - Prioritas Perbaikan

## P0 - Security dan consistency hardening

- [x] Perketat redirect auth dan origin OAuth.
- [x] Tambahkan rate limit login, pembuatan bill, dan perubahan settlement.
- [x] Validasi ulang transfer dan nominal settlement di server.
- [x] Validasi tanggal bill dan kurs mata uang dasar.
- [x] Tambahkan security headers dasar.
- [x] Jadikan link undangan tanpa kedaluwarsa dan tetap bisa dibuat ulang.
- [x] Perbaiki persistensi drag and drop serta normalisasi urutan sumber.
- [x] Isolasi z-index peta agar tidak menimpa dialog atau elemen lain.
- [ ] Verifikasi konfigurasi Google Provider dan redirect allowlist di Supabase.
- [ ] Audit seluruh migrasi dan constraint database pada environment staging.

## P1 - Targeted UI refresh

- [x] Ubah rencana harian menjadi fixed hour grid yang responsif.
- [x] Tambahkan palet pendukung selain teal tanpa mengubah warna semantik.
- [x] Perkaya hierarchy, surface, empty state, dan density halaman utama.
- [x] Pertahankan Bahasa Indonesia, tanpa emoji, dan tanpa em dash.

## P2 - Konfirmasi transfer dua arah

- [x] Debitur menandai transfer sebagai pending.
- [x] Kreditur mengonfirmasi atau menolak transfer.
- [x] Tampilkan histori status dan waktu perubahan.

## P3 - Peta harian, distance, dan warning haversine

- [x] Ganti satu peta besar dengan peta per hari.
- [x] Tambahkan peta bucket untuk membandingkan kandidat tempat.
- [x] Hitung jarak haversine antar tujuan dan kandidat.
- [x] Beri warning tujuan tidak searah atau perpindahan terlalu jauh.
- [x] Hubungkan marker dengan item pada fixed hour grid.

## P4 - Kartu Perjalanan

- [x] Buat kartu perjalanan statis yang bisa diunduh dan dibagikan.

## P5 - Full product polish dan accessibility audit

- [x] Audit keyboard, focus, label, contrast, reduced motion, dan screen reader.
- [x] Audit mobile, loading, error, empty state, dan optimistic reconciliation.
- [x] Selesaikan visual polish seluruh alur dan konsistensi design system.
