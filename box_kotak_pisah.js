document.addEventListener('DOMContentLoaded', function() {
    // Input untuk Dimensi Badan Box
    const panjangBadanInput = document.getElementById('panjangBadan');
    const lebarBadanInput = document.getElementById('lebarBadan');
    const tinggiBadanInput = document.getElementById('tinggiBadan');

    // Input untuk Dimensi Tutup Box (Opsional)
    const panjangTutupDasarInput = document.getElementById('panjangTutupDasar');
    const lebarTutupDasarInput = document.getElementById('lebarTutupDasar');
    const tinggiFlapTutupInput = document.getElementById('tinggiFlapTutup');

    const calculateBoxBtn = document.getElementById('calculateBoxBtn');

    const badanPanjangOutput = document.getElementById('badanPanjang');
    const badanLebarOutput = document.getElementById('badanLebar');
    const tutupPanjangOutput = document.getElementById('tutupPanjang');
    const tutupLebarOutput = document.getElementById('tutupLebar');

    const countBadanDariKertasBesar = document.getElementById('countBadanDariKertasBesar');
    const countTutupDariKertasBesar = document.getElementById('countTutupDariKertasBesar');

    const detailsBadanBox = document.getElementById('detailsBadanBox');
    const detailsTutupBox = document.getElementById('detailsTutupBox');

    const visBadanBox = document.getElementById('visBadanBox');
    const visTutupBox = document.getElementById('visTutupBox');
    const visKertasBesarBadan = document.getElementById('visKertasBesarBadan');
    const visKertasBesarTutup = document.getElementById('visKertasBesarTutup');

    const KERTAS_BESAR_PANJANG = 109; // cm
    const KERTAS_BESAR_LEBAR = 79; // cm

    // Konstanta untuk perhitungan tutup box otomatis (jika input tutup kosong)
    const TUTUP_OVERHANG_DEFAULT = 0.2; // Tambahan di setiap sisi untuk tutup (cm)
    const TINGGI_FLAP_TUTUP_DEFAULT = 3; // Tinggi sisi tutup (cm)
    const FLAP_LEM_DEFAULT = 2; // cm untuk flap lem badan dan tutup

    calculateBoxBtn.addEventListener('click', calculateBoxDimensions);

    // Fungsi untuk membuat visualisasi sederhana (untuk item tunggal: Badan/Tutup Box)
    function createVisualization(containerId, itemWidth, itemHeight, label) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Bersihkan konten sebelumnya
        if (itemWidth <= 0 || itemHeight <= 0 || isNaN(itemWidth) || isNaN(itemHeight)) {
            container.textContent = 'Dimensi tidak valid untuk visualisasi.';
            return;
        }

        // Tinggi container tetap 150px dari CSS, lebarnya 100%
        const containerWidth = container.offsetWidth;
        const containerHeight = 150; // Dapatkan dari CSS atau set tetap

        // Hitung rasio aspek item
        const itemAspectRatio = itemWidth / itemHeight;

        // Tentukan ukuran SVG yang akan menyesuaikan container tapi menjaga rasio aspek item
        let svgWidth, svgHeight;
        if (containerWidth / containerHeight > itemAspectRatio) {
            // Container lebih lebar dari item, batasnya adalah tinggi container
            svgHeight = containerHeight;
            svgWidth = containerHeight * itemAspectRatio;
        } else {
            // Container lebih tinggi atau sama rasionya, batasnya adalah lebar container
            svgWidth = containerWidth;
            svgHeight = containerWidth / itemAspectRatio;
        }
        
        // Pastikan ukuran SVG tidak melebihi container
        svgWidth = Math.min(svgWidth, containerWidth);
        svgHeight = Math.min(svgHeight, containerHeight);


        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // Gunakan viewBox untuk menggambar dengan unit "asli" (cm)
        svg.setAttribute("viewBox", `0 0 ${itemWidth} ${itemHeight}`);
        // Atur width dan height SVG di DOM agar proporsional di dalam container
        svg.setAttribute("width", svgWidth);
        svg.setAttribute("height", svgHeight);
        svg.style.border = '1px solid #ccc';
        svg.style.backgroundColor = '#f0f0f0'; // Tambahkan background agar lebih jelas

        // Tengah item dalam SVG jika SVG lebih besar
        const rectX = 0; // Karena viewBox sudah disesuaikan dengan item, item dimulai dari 0,0
        const rectY = 0; 

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", rectX);
        rect.setAttribute("y", rectY);
        rect.setAttribute("width", itemWidth);
        rect.setAttribute("height", itemHeight);
        rect.setAttribute("fill", "#ADD8E6"); // Light blue
        rect.setAttribute("stroke", "#333");
        rect.setAttribute("stroke-width", "0.5");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", itemWidth / 2);
        text.setAttribute("y", itemHeight / 2 + (itemHeight * 0.05)); // sedikit di bawah tengah, relatif terhadap tinggi item
        text.setAttribute("font-family", "Arial");
        text.setAttribute("font-size", "10"); // Ukuran font relatif terhadap viewBox
        text.setAttribute("fill", "#333");
        text.setAttribute("text-anchor", "middle");
        text.textContent = `${label}: ${itemWidth.toFixed(1)}x${itemHeight.toFixed(1)} cm`;

        svg.appendChild(rect);
        svg.appendChild(text);
        container.appendChild(svg);
    }

    // Fungsi untuk membuat visualisasi pemotongan kertas besar
    function createCuttingVisualization(containerId, itemWidth, itemHeight, bigPaperWidth, bigPaperHeight, orientation, count) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if (itemWidth <= 0 || itemHeight <= 0 || isNaN(itemWidth) || isNaN(itemHeight)) {
            container.textContent = 'Dimensi item tidak valid untuk visualisasi.';
            return;
        }

        const containerWidth = container.offsetWidth;
        const containerHeight = 200; // Tinggi tetap untuk visualisasi pemotongan dari CSS atau default

        // Hitung rasio aspek kertas besar
        const bigPaperAspectRatio = bigPaperWidth / bigPaperHeight;

        // Tentukan ukuran SVG yang akan menyesuaikan container tapi menjaga rasio aspek kertas besar
        let svgWidth, svgHeight;
        if (containerWidth / containerHeight > bigPaperAspectRatio) {
            svgHeight = containerHeight;
            svgWidth = containerHeight * bigPaperAspectRatio;
        } else {
            svgWidth = containerWidth;
            svgHeight = containerWidth / bigPaperAspectRatio;
        }

        svgWidth = Math.min(svgWidth, containerWidth);
        svgHeight = Math.min(svgHeight, containerHeight);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", svgWidth);
        svg.setAttribute("height", svgHeight);
        svg.setAttribute("viewBox", `0 0 ${bigPaperWidth} ${bigPaperHeight}`); // Gambar dengan unit cm
        svg.style.border = '1px solid #ccc';
        svg.style.backgroundColor = '#f0f0f0';

        // Gambar kertas besar
        const bigRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bigRect.setAttribute("x", "0");
        bigRect.setAttribute("y", "0");
        bigRect.setAttribute("width", bigPaperWidth);
        bigRect.setAttribute("height", bigPaperHeight);
        bigRect.setAttribute("fill", "#fff");
        bigRect.setAttribute("stroke", "#333");
        bigRect.setAttribute("stroke-width", "1");
        svg.appendChild(bigRect);

        // Gambar potongan-potongan item
        // Menggunakan dimensi item yang sudah diorientasikan dari calculateCuts
        const cutsAcrossWidth = Math.floor(bigPaperWidth / itemWidth);
        const cutsDownHeight = Math.floor(bigPaperHeight / itemHeight);

        let itemsDrawn = 0;
        for (let row = 0; row < cutsDownHeight; row++) {
            for (let col = 0; col < cutsAcrossWidth; col++) {
                if (itemsDrawn >= count) break; // Berhenti jika sudah menggambar sesuai jumlah count

                const itemRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                itemRect.setAttribute("x", col * itemWidth);
                itemRect.setAttribute("y", row * itemHeight);
                itemRect.setAttribute("width", itemWidth);
                itemRect.setAttribute("height", itemHeight);
                itemRect.setAttribute("fill", "#90EE90"); // Light green
                itemRect.setAttribute("stroke", "#006400");
                itemRect.setAttribute("stroke-width", "0.5");
                svg.appendChild(itemRect);
                itemsDrawn++;
            }
            if (itemsDrawn >= count) break;
        }
        
        // Tambahkan label dimensi kertas besar
        const textBigPaperDim = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textBigPaperDim.setAttribute("x", bigPaperWidth / 2);
        textBigPaperDim.setAttribute("y", bigPaperHeight / 2);
        textBigPaperDim.setAttribute("font-family", "Arial");
        textBigPaperDim.setAttribute("font-size", "8"); // Ukuran font relatif terhadap viewBox
        textBigPaperDim.setAttribute("fill", "#555");
        textBigPaperDim.setAttribute("text-anchor", "middle");
        textBigPaperDim.textContent = `${bigPaperWidth.toFixed(0)}x${bigPaperHeight.toFixed(0)} cm`;
        svg.appendChild(textBigPaperDim);

        container.appendChild(svg);
    }


    function calculateBoxDimensions() {
        const P_badan = parseFloat(panjangBadanInput.value);
        const L_badan = parseFloat(lebarBadanInput.value);
        const T_badan = parseFloat(tinggiBadanInput.value);

        if (isNaN(P_badan) || isNaN(L_badan) || isNaN(T_badan) || P_badan <= 0 || L_badan <= 0 || T_badan <= 0) {
            alert("Mohon masukkan dimensi Badan Box yang valid (angka positif).");
            return;
        }

        // --- Perhitungan Badan Box ---
        const P_kertas_badan = P_badan + (2 * T_badan) + FLAP_LEM_DEFAULT;
        const L_kertas_badan = L_badan + (2 * T_badan);
                                            
        badanPanjangOutput.textContent = P_kertas_badan.toFixed(1);
        badanLebarOutput.textContent = L_kertas_badan.toFixed(1);
        createVisualization('visBadanBox', P_kertas_badan, L_kertas_badan, 'Badan');

        // --- Perhitungan Tutup Box ---
        let P_dasar_tutup, L_dasar_tutup, T_flap_tutup;

        const inputPtd = parseFloat(panjangTutupDasarInput.value);
        const inputLtd = parseFloat(lebarTutupDasarInput.value);
        const inputTft = parseFloat(tinggiFlapTutupInput.value);

        if (!isNaN(inputPtd) && inputPtd > 0 &&
            !isNaN(inputLtd) && inputLtd > 0 &&
            !isNaN(inputTft) && inputTft > 0) {
            P_dasar_tutup = inputPtd;
            L_dasar_tutup = inputLtd;
            T_flap_tutup = inputTft;
        } else {
            P_dasar_tutup = P_badan + (2 * TUTUP_OVERHANG_DEFAULT);
            L_dasar_tutup = L_badan + (2 * TUTUP_OVERHANG_DEFAULT);
            T_flap_tutup = TINGGI_FLAP_TUTUP_DEFAULT;
            
            if (panjangTutupDasarInput.value === "" || isNaN(inputPtd)) panjangTutupDasarInput.value = P_dasar_tutup.toFixed(1);
            if (lebarTutupDasarInput.value === "" || isNaN(inputLtd)) lebarTutupDasarInput.value = L_dasar_tutup.toFixed(1);
            if (tinggiFlapTutupInput.value === "" || isNaN(inputTft)) tinggiFlapTutupInput.value = T_flap_tutup.toFixed(1);
        }

        const P_kertas_tutup = P_dasar_tutup + (2 * T_flap_tutup) + FLAP_LEM_DEFAULT;
        const L_kertas_tutup = L_dasar_tutup + (2 * T_flap_tutup);

        tutupPanjangOutput.textContent = P_kertas_tutup.toFixed(1);
        tutupLebarOutput.textContent = L_kertas_tutup.toFixed(1);
        createVisualization('visTutupBox', P_kertas_tutup, L_kertas_tutup, 'Tutup');


        // --- Perhitungan Potongan dari Kertas Besar (79 x 109 cm) ---

        function calculateCuts(itemP, itemL, bigP, bigL) {
            const cutsP1 = Math.floor(bigP / itemP);
            const cutsL1 = Math.floor(bigL / itemL);
            const totalCuts1 = cutsP1 * cutsL1;

            const cutsP2 = Math.floor(bigP / itemL);
            const cutsL2 = Math.floor(bigL / itemP);
            const totalCuts2 = cutsP2 * cutsL2;

            if (totalCuts1 >= totalCuts2) {
                return { count: totalCuts1, orientation: 'P:P, L:L', details: `${cutsP1}x memanjang, ${cutsL1}x melebar`, usedItemP: itemP, usedItemL: itemL };
            } else {
                return { count: totalCuts2, orientation: 'P:L, L:P (diputar)', details: `${cutsP2}x memanjang, ${cutsL2}x melebar (diputar)`, usedItemP: itemL, usedItemL: itemP };
            }
        }

        const badanCuts = calculateCuts(P_kertas_badan, L_kertas_badan, KERTAS_BESAR_PANJANG, KERTAS_BESAR_LEBAR);
        const tutupCuts = calculateCuts(P_kertas_tutup, L_kertas_tutup, KERTAS_BESAR_PANJANG, KERTAS_BESAR_LEBAR);

        countBadanDariKertasBesar.textContent = badanCuts.count;
        detailsBadanBox.textContent = `Orientasi: ${badanCuts.orientation}. Potongan: ${badanCuts.details}.`;
        createCuttingVisualization(
            'visKertasBesarBadan',
            badanCuts.usedItemP,
            badanCuts.usedItemL,
            KERTAS_BESAR_PANJANG,
            KERTAS_BESAR_LEBAR,
            badanCuts.orientation,
            badanCuts.count
        );

        countTutupDariKertasBesar.textContent = tutupCuts.count;
        detailsTutupBox.textContent = `Orientasi: ${tutupCuts.orientation}. Potongan: ${tutupCuts.details}.`;
        createCuttingVisualization(
            'visKertasBesarTutup',
            tutupCuts.usedItemP,
            tutupCuts.usedItemL,
            KERTAS_BESAR_PANJANG,
            KERTAS_BESAR_LEBAR,
            tutupCuts.orientation,
            tutupCuts.count
        );
    }

    // Hitung saat halaman pertama kali dimuat
    calculateBoxDimensions();
});