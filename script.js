document.addEventListener('DOMContentLoaded', () => {
    const bigPaperWidth = 109; // cm
    const bigPaperHeight = 79; // cm

    // Input Dasar
    const smallWidthInput = document.getElementById('smallWidth');
    const smallHeightInput = document.getElementById('smallHeight');
    const calculateBtn = document.getElementById('calculateBtn');

    // Input dan Output Area Potong
    const potongWidthInput = document.getElementById('potongWidth');
    const potongHeightInput = document.getElementById('potongHeight');
    const resultPotong = document.getElementById('resultPotong');
    const visPotong = document.getElementById('visPotong');

    // Input dan Output Area Cetak
    const cetakWidthInput = document.getElementById('cetakWidth');
    const cetakHeightInput = document.getElementById('cetakHeight');
    const resultCetak = document.getElementById('resultCetak');
    const visCetak = document.getElementById('visCetak');
    const updateCetakBtn = document.querySelector('.update-btn[data-target="cetak"]');

    // Input dan Output Potong Kertas
    const kertasWidthInput = document.getElementById('kertasWidth');
    const kertasHeightInput = document.getElementById('kertasHeight');
    const resultKertas = document.getElementById('resultKertas');
    const visKertas = document.getElementById('visKertas');
    const updateKertasBtn = document.querySelector('.update-btn[data-target="kertas"]');

    // Event Listeners
    calculateBtn.addEventListener('click', calculateAll);
    updateCetakBtn.addEventListener('click', () => updateSection('cetak'));
    updateKertasBtn.addEventListener('click', () => updateSection('kertas'));


    // Initial calculation when page loads
    calculateAll();

    function calculateAll() {
        let smallWidth = parseFloat(smallWidthInput.value);
        let smallHeight = parseFloat(smallHeightInput.value);

        if (isNaN(smallWidth) || isNaN(smallHeight) || smallWidth <= 0 || smallHeight <= 0) {
            alert('Mohon masukkan lebar dan tinggi potongan yang valid (angka positif).');
            return;
        }

        // --- Mode 1: Area Potong (Bersih) ---
        // Ukuran potongan adalah input asli
        const { count: countPotong, layout: layoutPotong, finalWidth, finalHeight } = calculatePieces(bigPaperWidth, bigPaperHeight, smallWidth, smallHeight);
        resultPotong.innerHTML = `${countPotong} lembar`;
        potongWidthInput.value = smallWidth.toFixed(1);
        potongHeightInput.value = smallHeight.toFixed(1);
        visualizeLayout(visPotong, layoutPotong, bigPaperWidth, bigPaperHeight);

        // Set default values for Area Cetak and Potong Kertas
        // Default penambahan +1cm per sisi (total +2cm untuk lebar dan tinggi)
        cetakWidthInput.value = (smallWidth + 1).toFixed(1);
        cetakHeightInput.value = (smallHeight + 1).toFixed(1);

        kertasWidthInput.value = (parseFloat(cetakWidthInput.value) + 1).toFixed(1);
        kertasHeightInput.value = (parseFloat(cetakHeightInput.value) + 1).toFixed(1);

        // Automatically update Cetak and Kertas sections based on their default values
        updateSection('cetak');
        updateSection('kertas');
    }

    function updateSection(section) {
        let targetWidth, targetHeight;
        let resultElement, visElement;

        if (section === 'cetak') {
            targetWidth = parseFloat(cetakWidthInput.value);
            targetHeight = parseFloat(cetakHeightInput.value);
            resultElement = resultCetak;
            visElement = visCetak;
        } else if (section === 'kertas') {
            targetWidth = parseFloat(kertasWidthInput.value);
            targetHeight = parseFloat(kertasHeightInput.value);
            resultElement = resultKertas;
            visElement = visKertas;
        }

        if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
            alert(`Mohon masukkan lebar dan tinggi ${section} yang valid (angka positif).`);
            return;
        }

        const { count, layout } = calculatePieces(bigPaperWidth, bigPaperHeight, targetWidth, targetHeight);
        resultElement.innerHTML = `${count} lembar`;
        visualizeLayout(visElement, layout, bigPaperWidth, bigPaperHeight);

        // If 'cetak' is updated, update 'kertas' default based on new 'cetak' values
        if (section === 'cetak') {
            kertasWidthInput.value = (targetWidth + 1).toFixed(1); // +1cm per sisi dari cetak
            kertasHeightInput.value = (targetHeight + 1).toFixed(1);
            // Optionally, trigger update for kertas immediately after cetak
            // updateSection('kertas'); // Uncomment if you want automatic chained update
        }
    }


    /**
     * Menghitung jumlah potongan yang muat pada kertas besar,
     * mempertimbangkan rotasi 90 derajat untuk optimasi.
     * @param {number} bw Lebar kertas besar
     * @param {number} bh Tinggi kertas besar
     * @param {number} sw Lebar potongan kecil
     * @param {number} sh Tinggi potongan kecil
     * @returns {object} Objek berisi count (jumlah) dan layout (data posisi potongan)
     */
    function calculatePieces(bw, bh, sw, sh) {
        // Pastikan sw dan sh adalah angka positif
        if (sw <= 0 || sh <= 0) {
            return { count: 0, layout: [], finalWidth: sw, finalHeight: sh };
        }

        let count1 = Math.floor(bw / sw) * Math.floor(bh / sh); // Tanpa rotasi
        let count2 = Math.floor(bw / sh) * Math.floor(bh / sw); // Dengan rotasi

        let layout = [];
        let finalCount = 0;
        let actualSw = sw;
        let actualSh = sh;

        // Pilih orientasi yang memberikan jumlah terbanyak
        if (count1 >= count2) {
            finalCount = count1;
            layout = generateLayout(bw, bh, sw, sh, false); // false for no rotation
        } else {
            finalCount = count2;
            layout = generateLayout(bw, bh, sh, sw, true); // true for rotation (swapped dimensions)
            actualSw = sh; // The dimensions used for layout generation
            actualSh = sw;
        }

        return { count: finalCount, layout: layout, finalWidth: actualSw, finalHeight: actualSh };
    }

    /**
     * Menghasilkan data posisi untuk visualisasi.
     * @param {number} bw Lebar kertas besar
     * @param {number} bh Tinggi kertas besar
     * @param {number} currentSw Lebar potongan (sesuai orientasi terpilih)
     * @param {number} currentSh Tinggi potongan (sesuai orientasi terpilih)
     * @param {boolean} rotated True jika potongan dirotasi 90 derajat
     * @returns {Array<object>} Array objek {x, y, width, height, rotated}
     */
    function generateLayout(bw, bh, currentSw, currentSh, rotated) {
        const layout = [];
        const numCols = Math.floor(bw / currentSw);
        const numRows = Math.floor(bh / currentSh);

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                layout.push({
                    x: col * currentSw,
                    y: row * currentSh,
                    width: currentSw,
                    height: currentSh,
                    rotated: rotated
                });
            }
        }
        return layout;
    }

    /**
     * Membuat visualisasi dari layout potongan.
     * @param {HTMLElement} containerElement Elemen div untuk visualisasi
     * @param {Array<object>} layoutData Array objek {x, y, width, height, rotated}
     * @param {number} bigPaperWidth Lebar kertas besar asli
     * @param {number} bigPaperHeight Tinggi kertas besar asli
     */
    function visualizeLayout(containerElement, layoutData, bigPaperWidth, bigPaperHeight) {
        containerElement.innerHTML = ''; // Bersihkan visualisasi sebelumnya

        // Hitung rasio untuk scaling
        const maxVisHeight = 250; // Disesuaikan dengan CSS max-height
        const scaleFactor = maxVisHeight / bigPaperHeight; // Skala berdasarkan tinggi kertas besar

        const scaledBigPaperWidth = bigPaperWidth * scaleFactor;
        const scaledBigPaperHeight = bigPaperHeight * scaleFactor;

        // Atur ukuran kontainer visualisasi sesuai rasio kertas besar
        containerElement.style.width = `${scaledBigPaperWidth}px`;
        containerElement.style.height = `${scaledBigPaperHeight}px`;

        layoutData.forEach(piece => {
            const div = document.createElement('div');
            div.className = 'paper-block';
            div.style.left = `${piece.x * scaleFactor}px`;
            div.style.top = `${piece.y * scaleFactor}px`;
            div.style.width = `${piece.width * scaleFactor}px`;
            div.style.height = `${piece.height * scaleFactor}px`;
            containerElement.appendChild(div);
        });
    }
});