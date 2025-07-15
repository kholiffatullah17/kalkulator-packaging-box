document.addEventListener('DOMContentLoaded', () => {
    const bigPaperWidth = 109; // cm (Default large paper size for other calculations)
    const bigPaperHeight = 79; // cm (Default large paper size for other calculations)
    const planoWidth = 48; // cm (Specific to paperbag calculation)
    const planoHeight = 32; // cm (Specific to paperbag calculation)
    const padding = 0.5; // 0.5cm per side for cetak and kertas

    // PERHATIAN: Atur faktor skala untuk visualisasi.
    // Semakin kecil angka 'visualizationScaleFactor', semakin besar visualisasi yang ditampilkan.
    // Misalnya:
    //   - 1.0: 1 cm dalam perhitungan = 1 piksel di layar (ukuran asli, mungkin terlalu besar)
    //   - 1.5: Visualisasi 2/3 dari ukuran asli (rekomendasi baru)
    //   - 1.9: Visualisasi sekitar 1/2 dari ukuran asli (nilai yang lebih seimbang)
    const visualizationScaleFactor = 1.9; // Diubah dari 0.5 menjadi 1.9

    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);

    // Set active link in sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === pageName) {
            link.classList.add('active');
        } else if (pageName === '' && link.getAttribute('href') === 'index.html') {
             // Handle case where index.html is loaded as root
            link.classList.add('active');
        }
    });

    // Universal elements for calculate button
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            if (pageName === 'index.html' || pageName === '') {
                calculatePaperCut();
            } else if (pageName === 'box_kotak_pisah.html') {
                calculateBoxKotakPisah();
            } else if (pageName === 'box_sambung.html') {
                calculateBoxSambung();
            } else if (pageName === 'lunchbox.html') {
                calculateLunchbox();
            } else if (pageName === 'paperbag.html') {
                calculatePaperbag();
            }
        });
    }

    // Fungsi untuk mengupdate hasil dan visualisasi
    function updateResultsSection(widthId, heightId, resultId, visId, calculatedWidth, calculatedHeight, count, layout, notesId = null, notesText = '') {
        document.getElementById(widthId).value = calculatedWidth.toFixed(1);
        document.getElementById(heightId).value = calculatedHeight.toFixed(1);
        document.getElementById(resultId).textContent = count;
        // Panggil visualizeLayout dengan parameter yang benar (lebar kertas dasar, tinggi kertas dasar)
        const isPaperbagPage = pageName === 'paperbag.html';
        const parentPaperWidth = isPaperbagPage ? planoWidth : bigPaperWidth;
        const parentPaperHeight = isPaperbagPage ? planoHeight : bigPaperHeight;

        visualizeLayout(visId, parentPaperWidth, parentPaperHeight, calculatedWidth, calculatedHeight, layout, count); // Parameter tambahan
        if (notesId && document.getElementById(notesId)) {
            document.getElementById(notesId).textContent = notesText;
        }
    }

    // Fungsi untuk menghitung potongan terbaik dari kertas besar
    function calculatePieces(bigPaperWidth, bigPaperHeight, itemWidth, itemHeight) {
        // Orientasi 1: itemWidth di sepanjang bigPaperWidth
        const cuts1P = Math.floor(bigPaperWidth / itemWidth);
        const cuts1L = Math.floor(bigPaperHeight / itemHeight);
        const totalCuts1 = cuts1P * cuts1L;

        // Orientasi 2: itemHeight di sepanjang bigPaperWidth (memutar item)
        const cuts2P = Math.floor(bigPaperWidth / itemHeight);
        const cuts2L = Math.floor(bigPaperHeight / itemWidth);
        const totalCuts2 = cuts2P * cuts2L;

        let bestCount = 0;
        let layout = [];
        let usedItemWidth = itemWidth;
        let usedItemHeight = itemHeight;

        if (totalCuts1 >= totalCuts2) {
            bestCount = totalCuts1;
            // Generate layout for orientation 1
            for (let i = 0; i < cuts1L; i++) {
                for (let j = 0; j < cuts1P; j++) {
                    layout.push({
                        x: j * itemWidth,
                        y: i * itemHeight,
                        width: itemWidth,
                        height: itemHeight
                    });
                }
            }
        } else {
            bestCount = totalCuts2;
            usedItemWidth = itemHeight; // Item diputar
            usedItemHeight = itemWidth; // Item diputar
            // Generate layout for orientation 2
            for (let i = 0; i < cuts2L; i++) {
                for (let j = 0; j < cuts2P; j++) {
                    layout.push({
                        x: j * itemHeight, // Menggunakan itemHeight sebagai lebar karena diputar
                        y: i * itemWidth,  // Menggunakan itemWidth sebagai tinggi karena diputar
                        width: itemHeight,
                        height: itemWidth
                    });
                }
            }
        }
        return { count: bestCount, layout: layout, usedItemP: usedItemWidth, usedItemL: usedItemHeight };
    }


    // Fungsi untuk membuat visualisasi potongan - Disesuaikan untuk menerima dimensi kertas dasar
    function visualizeLayout(containerId, paperToVisualizeWidth, paperToVisualizeHeight, itemWidth, itemHeight, layout, count) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID ${containerId} not found.`);
            return;
        }
        container.innerHTML = ''; // Clear previous visualization

        // Calculate actual dimensions for visualization based on scale factor
        const scaledPaperWidth = paperToVisualizeWidth / visualizationScaleFactor;
        const scaledPaperHeight = paperToVisualizeHeight / visualizationScaleFactor;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", scaledPaperWidth);
        svg.setAttribute("height", scaledPaperHeight);
        svg.setAttribute("viewBox", `0 0 ${paperToVisualizeWidth} ${paperToVisualizeHeight}`); // Set viewBox to original cm values
        svg.style.border = "1px solid #ccc";
        svg.style.backgroundColor = "#f9f9f9";

        // Draw big paper outline (optional, can be part of container style)
        const bigRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bigRect.setAttribute("x", 0);
        bigRect.setAttribute("y", 0);
        bigRect.setAttribute("width", paperToVisualizeWidth);
        bigRect.setAttribute("height", paperToVisualizeHeight);
        bigRect.setAttribute("fill", "none");
        bigRect.setAttribute("stroke", "#333");
        bigRect.setAttribute("stroke-width", "0.5"); // Thin stroke
        svg.appendChild(bigRect);

        layout.forEach((piece, index) => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", piece.x);
            rect.setAttribute("y", piece.y);
            rect.setAttribute("width", piece.width);
            rect.setAttribute("height", piece.height);
            rect.setAttribute("fill", "#a0d9e7"); // Light blue
            rect.setAttribute("stroke", "#2196f3"); // Blue stroke
            rect.setAttribute("stroke-width", "0.2"); // Thin stroke

            // Add text for dimensions
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", piece.x + piece.width / 2);
            text.setAttribute("y", piece.y + piece.height / 2);
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "3"); // Adjust font size as needed (in cm units)
            text.setAttribute("fill", "#333");
            text.textContent = `${piece.width.toFixed(1)}x${piece.height.toFixed(1)}`;

            svg.appendChild(rect);
            svg.appendChild(text);
        });

        container.appendChild(svg);
    }

    // ======================================================================================================
    // Page specific calculations
    // ======================================================================================================

    // --- index.html (Kertas Potongan) ---
    function calculatePaperCut() {
        const smallWidth = parseFloat(document.getElementById('smallWidth').value);
        const smallHeight = parseFloat(document.getElementById('smallHeight').value);

        if (isNaN(smallWidth) || isNaN(smallHeight) || smallWidth <= 0 || smallHeight <= 0) {
            alert("Mohon masukkan lebar dan tinggi potongan yang valid (angka positif).");
            updateResultsSection('smallWidth', 'smallHeight', 'resultPotong', 'visPotong', 0, 0, 0, []);
            return;
        }

        const { count: potongCount, layout: potongLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, smallWidth, smallHeight);
        updateResultsSection('potongWidth', 'potongHeight', 'resultPotong', 'visPotong', smallWidth, smallHeight, potongCount, potongLayout);

        // Update default values for Cetak and Kertas based on Potong
        document.getElementById('cetakWidth').value = (smallWidth + (2 * padding)).toFixed(1);
        document.getElementById('cetakHeight').value = (smallHeight + (2 * padding)).toFixed(1);
        document.getElementById('kertasWidth').value = (smallWidth + (4 * padding)).toFixed(1); // 2*padding for cetak + 2*padding for kertas
        document.getElementById('kertasHeight').value = (smallHeight + (4 * padding)).toFixed(1); // 2*padding for cetak + 2*padding for kertas

        // Also trigger calculations for Cetak and Kertas immediately
        const cetakWidthVal = parseFloat(document.getElementById('cetakWidth').value);
        const cetakHeightVal = parseFloat(document.getElementById('cetakHeight').value);
        const { count: cetakCount, layout: cetakLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, cetakWidthVal, cetakHeightVal);
        updateResultsSection('cetakWidth', 'cetakHeight', 'resultCetak', 'visCetak', cetakWidthVal, cetakHeightVal, cetakCount, cetakLayout);

        const kertasWidthVal = parseFloat(document.getElementById('kertasWidth').value);
        const kertasHeightVal = parseFloat(document.getElementById('kertasHeight').value);
        const { count: kertasCount, layout: kertasLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, kertasWidthVal, kertasHeightVal);
        updateResultsSection('kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas', kertasWidthVal, kertasHeightVal, kertasCount, kertasLayout);
    }

    // Add event listeners for update buttons on index.html (if applicable)
    if (pageName === 'index.html' || pageName === '') {
        const updateButtons = document.querySelectorAll('.update-btn');
        updateButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetType = this.dataset.target; // 'cetak' or 'kertas'
                let targetWidth, targetHeight;
                let targetWidthInputId, targetHeightInputId, resultElementId, visElementId;

                if (targetType === 'cetak') {
                    targetWidthInputId = 'cetakWidth';
                    targetHeightInputId = 'cetakHeight';
                    resultElementId = 'resultCetak';
                    visElementId = 'visCetak';
                } else if (targetType === 'kertas') {
                    targetWidthInputId = 'kertasWidth';
                    targetHeightInputId = 'kertasHeight';
                    resultElementId = 'resultKertas';
                    visElementId = 'visKertas';
                }

                targetWidth = parseFloat(document.getElementById(targetWidthInputId).value);
                targetHeight = parseFloat(document.getElementById(targetHeightInputId).value);

                if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
                    alert(`Mohon masukkan lebar dan tinggi ${targetType} yang valid (angka positif).`);
                    updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, 0, 0, 0, []);
                    return;
                }

                const { count, layout } = calculatePieces(bigPaperWidth, bigPaperHeight, targetWidth, targetHeight);
                updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, targetWidth, targetHeight, count, layout);

                // If 'cetak' is updated, update 'kertas' default
                if (targetType === 'cetak') {
                    document.getElementById('kertasWidth').value = (targetWidth + (2 * padding)).toFixed(1);
                    document.getElementById('kertasHeight').value = (targetHeight + (2 * padding)).toFixed(1);
                    // Optionally, recalculate kertas after cetak update
                    const kertasWidthVal = parseFloat(document.getElementById('kertasWidth').value);
                    const kertasHeightVal = parseFloat(document.getElementById('kertasHeight').value);
                    const { count: kertasCount, layout: kertasLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, kertasWidthVal, kertasHeightVal);
                    updateResultsSection('kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas', kertasWidthVal, kertasHeightVal, kertasCount, kertasLayout);
                }
            });
        });
    }

    // --- box_kotak_pisah.html ---
    function calculateBoxKotakPisah() {
        const boxP = parseFloat(document.getElementById('boxP').value);
        const boxL = parseFloat(document.getElementById('boxL').value);
        const boxT = parseFloat(document.getElementById('boxT').value);

        // Optional lid dimensions
        let panjangTutupDasar = parseFloat(document.getElementById('panjangTutupDasar').value);
        let lebarTutupDasar = parseFloat(document.getElementById('lebarTutupDasar').value);
        let tinggiFlapTutup = parseFloat(document.getElementById('tinggiFlapTutup').value);

        // If optional lid dimensions are not provided, calculate based on box body
        if (isNaN(panjangTutupDasar) || panjangTutupDasar <= 0) {
            panjangTutupDasar = boxP + 0.2; // Slightly larger for lid fit
        }
        if (isNaN(lebarTutupDasar) || lebarTutupDasar <= 0) {
            lebarTutupDasar = boxL + 0.2; // Slightly larger for lid fit
        }
        if (isNaN(tinggiFlapTutup) || tinggiFlapTutup <= 0) {
            tinggiFlapTutup = boxT / 2; // Half the height of the box
        }


        if (isNaN(boxP) || isNaN(boxL) || isNaN(boxT) || boxP <= 0 || boxL <= 0 || boxT <= 0) {
            alert("Mohon masukkan dimensi box utama (panjang, lebar, tinggi) yang valid (angka positif).");
            // Clear all relevant fields and visualizations
            const fieldsToClear = [
                'potongWidthBadan', 'potongHeightBadan', 'resultPotongBadan', 'visPotongBadan',
                'cetakWidthBadan', 'cetakHeightBadan', 'resultCetakBadan', 'visCetakBadan',
                'kertasWidthBadan', 'kertasHeightBadan', 'resultKertasBadan', 'visKertasBadan',
                'potongWidthTutup', 'potongHeightTutup', 'resultPotongTutup', 'visPotongTutup',
                'cetakWidthTutup', 'cetakHeightTutup', 'resultCetakTutup', 'visCetakTutup',
                'kertasWidthTutup', 'kertasHeightTutup', 'resultKertasTutup', 'visKertasTutup',
                'countBadanDariKertasBesar', 'detailsBadanBox', 'visKertasBesarBadan',
                'countTutupDariKertasBesar', 'detailsTutupBox', 'visKertasBesarTutup',
                'finalBoxCount'
            ];
            fieldsToClear.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'INPUT') {
                        el.value = '0';
                    } else if (el.tagName === 'STRONG' || el.tagName === 'P') {
                        el.textContent = '0'; // For count and text elements
                    } else if (el.classList.contains('visualization-container')) {
                        el.innerHTML = ''; // Clear SVG
                    }
                }
            });
            return;
        }

        // Perhitungan Dimensi Box Badan
        const P_potongan_badan = boxP + boxL + boxT; // keliling
        const L_potongan_badan = boxL + (2 * boxT); // lebar + 2x tinggi

        const P_cetak_badan = P_potongan_badan + (2 * padding);
        const L_cetak_badan = L_potongan_badan + (2 * padding);

        const P_kertas_badan = P_cetak_badan + (2 * padding);
        const L_kertas_badan = L_cetak_badan + (2 * padding);

        // Update for Badan Box
        let { count: potongBadanCount, layout: potongBadanLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, P_potongan_badan, L_potongan_badan);
        updateResultsSection('potongWidthBadan', 'potongHeightBadan', 'resultPotongBadan', 'visPotongBadan', P_potongan_badan, L_potongan_badan, potongBadanCount, potongBadanLayout);

        let { count: cetakBadanCount, layout: cetakBadanLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, P_cetak_badan, L_cetak_badan);
        updateResultsSection('cetakWidthBadan', 'cetakHeightBadan', 'resultCetakBadan', 'visCetakBadan', P_cetak_badan, L_cetak_badan, cetakBadanCount, cetakBadanLayout);

        let { count: kertasBadanCount, layout: kertasBadanLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, P_kertas_badan, L_kertas_badan);
        updateResultsSection('kertasWidthBadan', 'kertasHeightBadan', 'resultKertasBadan', 'visKertasBadan', P_kertas_badan, L_kertas_badan, kertasBadanCount, kertasBadanLayout);


        // Perhitungan Dimensi Tutup Box
        const P_potongan_tutup = panjangTutupDasar + (2 * tinggiFlapTutup);
        const L_potongan_tutup = lebarTutupDasar + (2 * tinggiFlapTutup);

        const P_cetak_tutup = P_potongan_tutup + (2 * padding);
        const L_cetak_tutup = L_potongan_tutup + (2 * padding);

        const P_kertas_tutup = P_cetak_tutup + (2 * padding);
        const L_kertas_tutup = L_cetak_tutup + (2 * padding);

        // Update for Tutup Box
        let { count: potongTutupCount, layout: potongTutupLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, P_potongan_tutup, L_potongan_tutup);
        updateResultsSection('potongWidthTutup', 'potongHeightTutup', 'resultPotongTutup', 'visPotongTutup', P_potongan_tutup, L_potongan_tutup, potongTutupCount, potongTutupLayout);

        let { count: cetakTutupCount, layout: cetakTutupLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, P_cetak_tutup, L_cetak_tutup);
        updateResultsSection('cetakWidthTutup', 'cetakHeightTutup', 'resultCetakTutup', 'visCetakTutup', P_cetak_tutup, L_cetak_tutup, cetakTutupCount, cetakTutupLayout);

        let { count: kertasTutupCount, layout: kertasTutupLayout, usedItemP: usedPKertasTutup, usedItemL: usedLKertasTutup } = calculatePieces(bigPaperWidth, bigPaperHeight, P_kertas_tutup, L_kertas_tutup);
        updateResultsSection('kertasWidthTutup', 'kertasHeightTutup', 'resultKertasTutup', 'visKertasTutup', P_kertas_tutup, L_kertas_tutup, kertasTutupCount, kertasTutupLayout);


        // Final Calculation for Kertas Besar
        const { count: countBadanDariKertasBesar, layout: layoutBadanKertasBesar, usedItemP: usedPKertasBadan, usedItemL: usedLKertasBadan } = calculatePieces(bigPaperWidth, bigPaperHeight, P_kertas_badan, L_kertas_badan);
        document.getElementById('countBadanDariKertasBesar').textContent = countBadanDariKertasBesar;
        document.getElementById('detailsBadanBox').textContent = `Ukuran potongan di kertas besar: ${usedPKertasBadan.toFixed(1)}cm x ${usedLKertasBadan.toFixed(1)}cm.`;
        visualizeLayout('visKertasBesarBadan', bigPaperWidth, bigPaperHeight, usedPKertasBadan, usedLKertasBadan, layoutBadanKertasBesar, countBadanDariKertasBesar); // Perbaikan parameter

        const { count: countTutupDariKertasBesar, layout: layoutTutupKertasBesar, usedItemP: usedPKertasTutupFinal, usedItemL: usedLKertasTutupFinal } = calculatePieces(bigPaperWidth, bigPaperHeight, P_kertas_tutup, L_kertas_tutup);
        document.getElementById('countTutupDariKertasBesar').textContent = countTutupDariKertasBesar;
        document.getElementById('detailsTutupBox').textContent = `Ukuran potongan di kertas besar: ${usedPKertasTutupFinal.toFixed(1)}cm x ${usedLKertasTutupFinal.toFixed(1)}cm.`;
        visualizeLayout('visKertasBesarTutup', bigPaperWidth, bigPaperHeight, usedPKertasTutupFinal, usedLKertasTutupFinal, layoutTutupKertasBesar, countTutupDariKertasBesar); // Perbaikan parameter

        const finalBoxCount = Math.min(countBadanDariKertasBesar, countTutupDariKertasBesar);
        document.getElementById('finalBoxCount').textContent = finalBoxCount;

    }

    // Add event listeners for update buttons on box_kotak_pisah.html
    if (pageName === 'box_kotak_pisah.html') {
        const updateButtons = document.querySelectorAll('.update-btn');
        updateButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetType = this.dataset.target; // 'cetak' or 'kertas'
                const part = this.dataset.part; // 'Badan' or 'Tutup'

                let targetWidthInputId, targetHeightInputId, resultElementId, visElementId;
                let originalP, originalL; // The 'bersih' dimensions for reference

                // Determine the original (potong) dimensions for padding calculation
                if (part === 'Badan') {
                    originalP = parseFloat(document.getElementById('potongWidthBadan').value);
                    originalL = parseFloat(document.getElementById('potongHeightBadan').value);
                } else { // Tutup
                    originalP = parseFloat(document.getElementById('potongWidthTutup').value);
                    originalL = parseFloat(document.getElementById('potongHeightTutup').value);
                }


                if (targetType === 'cetak') {
                    targetWidthInputId = `cetakWidth${part}`;
                    targetHeightInputId = `cetakHeight${part}`;
                    resultElementId = `resultCetak${part}`;
                    visElementId = `visCetak${part}`;
                } else if (targetType === 'kertas') {
                    targetWidthInputId = `kertasWidth${part}`;
                    targetHeightInputId = `kertasHeight${part}`;
                    resultElementId = `resultKertas${part}`;
                    visElementId = `visKertas${part}`;
                }

                let targetWidth = parseFloat(document.getElementById(targetWidthInputId).value);
                let targetHeight = parseFloat(document.getElementById(targetHeightInputId).value);

                if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
                    alert(`Mohon masukkan lebar dan tinggi ${targetType} yang valid (angka positif).`);
                    updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, 0, 0, 0, []);
                    return;
                }

                const { count, layout } = calculatePieces(bigPaperWidth, bigPaperHeight, targetWidth, targetHeight);
                updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, targetWidth, targetHeight, count, layout);

                // If 'cetak' is updated, update 'kertas' default for the same part (Badan/Tutup)
                if (targetType === 'cetak') {
                    const kertasWidthEl = document.getElementById(`kertasWidth${part}`);
                    const kertasHeightEl = document.getElementById(`kertasHeight${part}`);

                    // Calculate default kertas based on current cetak + padding
                    const defaultKertasWidth = targetWidth + (2 * padding);
                    const defaultKertasHeight = targetHeight + (2 * padding);

                    kertasWidthEl.value = defaultKertasWidth.toFixed(1);
                    kertasHeightEl.value = defaultKertasHeight.toFixed(1);

                    // Re-calculate and visualize for Kertas section immediately
                    const { count: kertasCount, layout: kertasLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, defaultKertasWidth, defaultKertasHeight);
                    updateResultsSection(`kertasWidth${part}`, `kertasHeight${part}`, `resultKertas${part}`, `visKertas${part}`, defaultKertasWidth, defaultKertasHeight, kertasCount, kertasLayout);
                }
            });
        });
    }

    // --- box_sambung.html ---
    function calculateBoxSambung() {
        const boxP = parseFloat(document.getElementById('boxP').value);
        const boxL = parseFloat(document.getElementById('boxL').value);
        const boxT = parseFloat(document.getElementById('boxT').value);

        if (isNaN(boxP) || isNaN(boxL) || isNaN(boxT) || boxP <= 0 || boxL <= 0 || boxT <= 0) {
            alert("Mohon masukkan dimensi box (panjang, lebar, tinggi) yang valid (angka positif).");
            // Clear all relevant fields and visualizations
            const fieldsToClear = [
                'potongWidth', 'potongHeight', 'resultPotong', 'visPotong',
                'cetakWidth', 'cetakHeight', 'resultCetak', 'visCetak',
                'kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas'
            ];
            fieldsToClear.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'INPUT') {
                        el.value = '0';
                    } else if (el.tagName === 'STRONG') {
                        el.textContent = '0';
                    } else if (el.classList.contains('visualization-container')) {
                        el.innerHTML = '';
                    }
                }
            });
            return;
        }

        // Perhitungan dimensi Potongan Bersih
        const P_potong = (2 * boxL) + (2 * boxT) + boxP;
        const L_potong = boxL + (2 * boxT);

        // Perhitungan dimensi Area Cetak
        const P_cetak = P_potong + (2 * padding);
        const L_cetak = L_potong + (2 * padding);

        // Perhitungan dimensi Potong Kertas
        const P_kertas = P_cetak + (2 * padding);
        const L_kertas = L_cetak + (2 * padding);


        // Update Potongan Bersih
        let { count: potongCount, layout: potongLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, P_potong, L_potong);
        updateResultsSection('potongWidth', 'potongHeight', 'resultPotong', 'visPotong', P_potong, L_potong, potongCount, potongLayout);

        // Update default values for Cetak and Kertas based on Potong
        document.getElementById('cetakWidth').value = P_cetak.toFixed(1);
        document.getElementById('cetakHeight').value = L_cetak.toFixed(1);
        document.getElementById('kertasWidth').value = P_kertas.toFixed(1);
        document.getElementById('kertasHeight').value = L_kertas.toFixed(1);

        // Also trigger calculations for Cetak and Kertas immediately
        const cetakWidthVal = parseFloat(document.getElementById('cetakWidth').value);
        const cetakHeightVal = parseFloat(document.getElementById('cetakHeight').value);
        let { count: cetakCount, layout: cetakLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, cetakWidthVal, cetakHeightVal);
        updateResultsSection('cetakWidth', 'cetakHeight', 'resultCetak', 'visCetak', cetakWidthVal, cetakHeightVal, cetakCount, cetakLayout);

        const kertasWidthVal = parseFloat(document.getElementById('kertasWidth').value);
        const kertasHeightVal = parseFloat(document.getElementById('kertasHeight').value);
        let { count: kertasCount, layout: kertasLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, kertasWidthVal, kertasHeightVal);
        updateResultsSection('kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas', kertasWidthVal, kertasHeightVal, kertasCount, kertasLayout);
    }

    // Add event listeners for update buttons on box_sambung.html
    if (pageName === 'box_sambung.html') {
        const updateButtons = document.querySelectorAll('.update-btn');
        updateButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetType = this.dataset.target; // 'cetak' or 'kertas'
                let targetWidth, targetHeight;
                let targetWidthInputId, targetHeightInputId, resultElementId, visElementId;

                if (targetType === 'cetak') {
                    targetWidthInputId = 'cetakWidth';
                    targetHeightInputId = 'cetakHeight';
                    resultElementId = 'resultCetak';
                    visElementId = 'visCetak';
                } else if (targetType === 'kertas') {
                    targetWidthInputId = 'kertasWidth';
                    targetHeightInputId = 'kertasHeight';
                    resultElementId = 'resultKertas';
                    visElementId = 'visKertas';
                }

                targetWidth = parseFloat(document.getElementById(targetWidthInputId).value);
                targetHeight = parseFloat(document.getElementById(targetHeightInputId).value);

                if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
                    alert(`Mohon masukkan lebar dan tinggi ${targetType} yang valid (angka positif).`);
                    updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, 0, 0, 0, []);
                    return;
                }

                const { count, layout } = calculatePieces(bigPaperWidth, bigPaperHeight, targetWidth, targetHeight);
                updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, targetWidth, targetHeight, count, layout);

                // If 'cetak' is updated, update 'kertas' default
                if (targetType === 'cetak') {
                    document.getElementById('kertasWidth').value = (targetWidth + (2 * padding)).toFixed(1);
                    document.getElementById('kertasHeight').value = (targetHeight + (2 * padding)).toFixed(1);
                    // Optionally, recalculate kertas after cetak update
                    const kertasWidthVal = parseFloat(document.getElementById('kertasWidth').value);
                    const kertasHeightVal = parseFloat(document.getElementById('kertasHeight').value);
                    const { count: kertasCount, layout: kertasLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, kertasWidthVal, kertasHeightVal);
                    updateResultsSection('kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas', kertasWidthVal, kertasHeightVal, kertasCount, kertasLayout);
                }
            });
        });
    }

    // --- lunchbox.html ---
    function calculateLunchbox() {
        const boxP = parseFloat(document.getElementById('boxP').value);
        const boxL = parseFloat(document.getElementById('boxL').value);
        const boxT = parseFloat(document.getElementById('boxT').value);

        if (isNaN(boxP) || isNaN(boxL) || isNaN(boxT) || boxP <= 0 || boxL <= 0 || boxT <= 0) {
            alert("Mohon masukkan dimensi lunchbox (panjang, lebar, tinggi) yang valid (angka positif).");
            const fieldsToClear = [
                'potongWidth', 'potongHeight', 'resultPotong', 'visPotong',
                'cetakWidth', 'cetakHeight', 'resultCetak', 'visCetak',
                'kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas'
            ];
            fieldsToClear.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'INPUT') {
                        el.value = '0';
                    } else if (el.tagName === 'STRONG') {
                        el.textContent = '0';
                    } else if (el.classList.contains('visualization-container')) {
                        el.innerHTML = '';
                    }
                }
            });
            return;
        }

        // Perhitungan dimensi Potongan Bersih Lunchbox
        const P_potong = boxP + boxT + boxL;
        const L_potong = boxT + boxL;

        // Perhitungan dimensi Area Cetak
        const P_cetak = P_potong + (2 * padding);
        const L_cetak = L_potong + (2 * padding);

        // Perhitungan dimensi Potong Kertas
        const P_kertas = P_cetak + (2 * padding);
        const L_kertas = L_cetak + (2 * padding);

        // Update Potongan Bersih
        let { count: potongCount, layout: potongLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, P_potong, L_potong);
        updateResultsSection('potongWidth', 'potongHeight', 'resultPotong', 'visPotong', P_potong, L_potong, potongCount, potongLayout);

        // Update default values for Cetak and Kertas based on Potong
        document.getElementById('cetakWidth').value = P_cetak.toFixed(1);
        document.getElementById('cetakHeight').value = L_cetak.toFixed(1);
        document.getElementById('kertasWidth').value = P_kertas.toFixed(1);
        document.getElementById('kertasHeight').value = L_kertas.toFixed(1);

        // Also trigger calculations for Cetak and Kertas immediately
        const cetakWidthVal = parseFloat(document.getElementById('cetakWidth').value);
        const cetakHeightVal = parseFloat(document.getElementById('cetakHeight').value);
        let { count: cetakCount, layout: cetakLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, cetakWidthVal, cetakHeightVal);
        updateResultsSection('cetakWidth', 'cetakHeight', 'resultCetak', 'visCetak', cetakWidthVal, cetakHeightVal, cetakCount, cetakLayout);

        const kertasWidthVal = parseFloat(document.getElementById('kertasWidth').value);
        const kertasHeightVal = parseFloat(document.getElementById('kertasHeight').value);
        let { count: kertasCount, layout: kertasLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, kertasWidthVal, kertasHeightVal);
        updateResultsSection('kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas', kertasWidthVal, kertasHeightVal, kertasCount, kertasLayout);
    }

    // Add event listeners for update buttons on lunchbox.html
    if (pageName === 'lunchbox.html') {
        const updateButtons = document.querySelectorAll('.update-btn');
        updateButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetType = this.dataset.target; // 'cetak' or 'kertas'
                let targetWidth, targetHeight;
                let targetWidthInputId, targetHeightInputId, resultElementId, visElementId;

                if (targetType === 'cetak') {
                    targetWidthInputId = 'cetakWidth';
                    targetHeightInputId = 'cetakHeight';
                    resultElementId = 'resultCetak';
                    visElementId = 'visCetak';
                } else if (targetType === 'kertas') {
                    targetWidthInputId = 'kertasWidth';
                    targetHeightInputId = 'kertasHeight';
                    resultElementId = 'resultKertas';
                    visElementId = 'visKertas';
                }

                targetWidth = parseFloat(document.getElementById(targetWidthInputId).value);
                targetHeight = parseFloat(document.getElementById(targetHeightInputId).value);

                if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
                    alert(`Mohon masukkan lebar dan tinggi ${targetType} yang valid (angka positif).`);
                    updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, 0, 0, 0, []);
                    return;
                }

                const { count, layout } = calculatePieces(bigPaperWidth, bigPaperHeight, targetWidth, targetHeight);
                updateResultsSection(targetWidthInputId, targetHeightInputId, resultElementId, visElementId, targetWidth, targetHeight, count, layout);

                // If 'cetak' is updated, update 'kertas' default
                if (targetType === 'cetak') {
                    document.getElementById('kertasWidth').value = (targetWidth + (2 * padding)).toFixed(1);
                    document.getElementById('kertasHeight').value = (targetHeight + (2 * padding)).toFixed(1);
                    // Optionally, recalculate kertas after cetak update
                    const kertasWidthVal = parseFloat(document.getElementById('kertasWidth').value);
                    const kertasHeightVal = parseFloat(document.getElementById('kertasHeight').value);
                    const { count: kertasCount, layout: kertasLayout } = calculatePieces(bigPaperWidth, bigPaperHeight, kertasWidthVal, kertasHeightVal);
                    updateResultsSection('kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas', kertasWidthVal, kertasHeightVal, kertasCount, kertasLayout);
                }
            });
        });
    }

    // --- paperbag.html ---
    function calculatePaperbag() {
        const paperP = parseFloat(document.getElementById('paperP').value);
        const paperL = parseFloat(document.getElementById('paperL').value);
        const paperT = parseFloat(document.getElementById('paperT').value);
        const handleType = document.getElementById('handleType').value;

        if (isNaN(paperP) || isNaN(paperL) || isNaN(paperT) || paperP <= 0 || paperL <= 0 || paperT <= 0) {
            alert("Mohon masukkan dimensi paperbag (panjang, lebar, tinggi) yang valid (angka positif).");
            // Clear relevant fields
            const fieldsToClear = [
                'resultPotong', 'visPotong',
                'resultCetak', 'visCetak',
                'resultKertas', 'visKertas',
                'finalPaperbagCount', 'finalPaperbagNotes'
            ];
            fieldsToClear.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'INPUT') {
                        el.value = '0';
                    } else if (el.tagName === 'STRONG' || el.tagName === 'P') {
                        el.textContent = '0';
                    } else if (el.classList.contains('visualization-container')) {
                        el.innerHTML = '';
                    }
                }
            });
            // Reset input values to 0 for error case if needed
            document.getElementById('potongWidth').value = '0';
            document.getElementById('potongHeight').value = '0';
            document.getElementById('cetakWidth').value = '0';
            document.getElementById('cetakHeight').value = '0';
            document.getElementById('kertasWidth').value = '0';
            document.getElementById('kertasHeight').value = '0';
            return;
        }

        let P_potong, L_potong, finalPaperbagCount, finalNotes = '';

        // Calculate Potongan Bersih based on handle type
        // Catatan: Ini adalah perhitungan yang sangat disederhanakan untuk persegi panjang.
        // Pola paperbag sebenarnya jauh lebih kompleks dengan banyak flap dan lipatan.
        // Hasil "Bisa dibuat" adalah placeholder karena perhitungan detail tidak diimplementasikan.
        if (handleType === 'tali') {
            P_potong = (2 * paperP) + (2 * paperL) + (4 * padding);
            L_potong = paperT + (4 * padding);
            finalPaperbagCount = "Bisa dibuat";
            finalNotes = "Untuk jenis tali, perhitungan tergantung pada desain detail lipatan dan penempatan lubang tali. Perhitungan di atas adalah untuk dimensi dasar persegi panjang.";
        } else if (handleType === 'handle_pond') {
            P_potong = (2 * paperP) + (2 * paperL) + (4 * padding);
            L_potong = paperT + (4 * padding);
            finalPaperbagCount = "Bisa dibuat";
            finalNotes = "Untuk handle pond, pertimbangkan kekuatan bahan dan desain handle. Perhitungan di atas adalah untuk dimensi dasar persegi panjang.";
        } else { // 'tanpa_handle'
            P_potong = (2 * paperP) + (2 * paperL) + (2 * padding);
            L_potong = paperT + (2 * padding);
            finalPaperbagCount = "Bisa dibuat";
            finalNotes = "Desain sederhana tanpa handle. Perhitungan di atas adalah untuk dimensi dasar persegi panjang.";
        }

        // Perhitungan dimensi Area Cetak (asumsi 0.5cm di setiap sisi dari Potongan Bersih)
        const P_cetak = P_potong + (2 * padding);
        const L_cetak = L_potong + (2 * padding);

        // Perhitungan dimensi Potong Kertas (asumsi 0.5cm di setiap sisi dari Area Cetak)
        const P_kertas = P_cetak + (2 * padding);
        const L_kertas = L_cetak + (2 * padding);


        // Update Potongan Bersih
        const { count: potongCount, layout: potongLayout } = calculatePieces(planoWidth, planoHeight, P_potong, L_potong);
        updateResultsSection('potongWidth', 'potongHeight', 'resultPotong', 'visPotong', P_potong, L_potong, potongCount, potongLayout, 'potongNotes', `Jumlah potongan bersih dari satu lembar Plano (${planoWidth}x${planoHeight}cm).`);

        // Set default for Cetak and Kertas, then calculate their pieces
        document.getElementById('cetakWidth').value = P_cetak.toFixed(1);
        document.getElementById('cetakHeight').value = L_cetak.toFixed(1);
        document.getElementById('kertasWidth').value = P_kertas.toFixed(1);
        document.getElementById('kertasHeight').value = L_kertas.toFixed(1);

        // Recalculate and visualize Cetak and Kertas
        const cetakWidthVal = parseFloat(document.getElementById('cetakWidth').value);
        const cetakHeightVal = parseFloat(document.getElementById('cetakHeight').value);
        const { count: currentCetakCount, layout: currentCetakLayout } = calculatePieces(planoWidth, planoHeight, cetakWidthVal, cetakHeightVal);
        updateResultsSection('cetakWidth', 'cetakHeight', 'resultCetak', 'visCetak', cetakWidthVal, cetakHeightVal, currentCetakCount, currentCetakLayout, 'cetakNotes', `Perhitungan cetak berdasarkan ukuran potongan terbesar. Jika split, mungkin perlu dicetak terpisah.`);

        const kertasWidthVal = cetakWidthVal + (2 * padding);
        const kertasHeightVal = cetakHeightVal + (2 * padding);
        const { count: currentKertasCount, layout: currentKertasLayout } = calculatePieces(planoWidth, planoHeight, kertasWidthVal, kertasHeightVal);
        updateResultsSection('kertasWidth', 'kertasHeight', 'resultKertas', 'visKertas', kertasWidthVal, kertasHeightVal, currentKertasCount, currentKertasLayout, 'kertasNotes', `Perhitungan potong kertas berdasarkan ukuran potongan terbesar. Jika split, mungkin perlu dipotong terpisah.`);

        document.getElementById('finalPaperbagCount').textContent = finalPaperbagCount;
        document.getElementById('finalPaperbagNotes').textContent = finalNotes;
    }

}); // End DOMContentLoaded