/* Tranh minh hoạ phần Nghe của đề thi thử N5: nét vẽ đen trắng kiểu đề thi (người hoạt hình, đồ vật, bối cảnh), dựng bằng SVG.
   rmMkScene(kịch bản, đề, dạng) → chuỗi SVG. Bối cảnh + đồ vật chọn theo từ khoá trong lời thoại; dạng l3 có mũi tên chỉ người nói. Không có chữ trên tranh. */
(function () {
    const K = '#222', st = 'fill="#fff" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
    /* ---- đồ vật: khung 40×40, tâm (0,0) ---- */
    const IC = {
        book: '<path d="M-19-13h17v27h-17zM2-13h17v27H2z"/><path d="M-15-6h9M-15 0h9M6-6h9M6 0h9" fill="none"/>',
        paper: '<path d="M-13-17h20l8 8v26h-28z"/><path d="M-8-4h16M-8 2h16M-8 8h10" fill="none"/>',
        phone: '<rect x="-9" y="-18" width="18" height="36" rx="4"/><rect x="-6" y="-13" width="12" height="21" fill="#ddd"/><circle cy="13" r="1.6" fill="' + K + '"/>',
        cup: '<path d="M-12-6h20v13a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8z"/><path d="M8-2h5a5 5 0 0 1 0 10h-5" fill="none"/><path d="M-6-11q3-4 0-8M2-11q3-4 0-8" fill="none"/>',
        bread: '<path d="M-19 10v-8a12 12 0 0 1 12-12h14a12 12 0 0 1 12 12v8z" fill="#ddd"/><path d="M-9-8l-3 9M0-8l-3 9M9-8l-3 9" fill="none"/>',
        rice: '<path d="M-17-3h34a17 17 0 0 1-34 0z"/><path d="M-12-3a12 10 0 0 1 24 0" fill="#fff"/><path d="M8-14l12 10M12-16l12 10" fill="none"/>',
        noodle: '<path d="M-18-2h36a18 18 0 0 1-36 0z"/><path d="M-12-2q3-6 6 0t6 0t6 0" fill="none"/><path d="M6-16l14 14M10-18l14 14" fill="none"/>',
        fish: '<path d="M-20 0q12-14 28 0q-16 14-28 0zM8 0l12-9v18z"/><circle cx="-11" cy="-2" r="1.6" fill="' + K + '"/>',
        apple: '<path d="M0-8q-14-8-17 4q-2 16 17 18q19-2 17-18q-3-12-17-4z" fill="#ddd"/><path d="M0-8q0-6 4-9" fill="none"/>',
        juice: '<rect x="-11" y="-12" width="22" height="30" rx="2"/><path d="M-11-4h22" fill="none"/><path d="M4-12l5-8h6" fill="none"/>',
        cake: '<path d="M-18 4h36v14h-36z"/><path d="M-18 4q4-9 9 0t9 0t9 0t9 0v-3h-36z" fill="#ddd"/><path d="M0-4v-8" fill="none"/><path d="M0-14q-3-3 0-6q3 3 0 6z" fill="' + K + '"/>',
        pill: '<rect x="-8" y="-17" width="16" height="34" rx="8" transform="rotate(40)"/><path d="M-6-3l12 12" transform="rotate(0)" fill="none"/>',
        thermo: '<rect x="-4" y="-18" width="8" height="28" rx="4"/><circle cy="13" r="7" fill="#ddd"/><path d="M0-10v14" fill="none"/>',
        umbrella: '<path d="M-20 2a20 20 0 0 1 40 0q-5-5-10 0q-5-5-10 0q-5-5-10 0q-5-5-10 0z" fill="#ccc"/><path d="M0 2v15a4 4 0 0 1-8 0M0-18v-2" fill="none"/>',
        rain: '<path d="M-14 2a8 8 0 0 1 2-15a11 11 0 0 1 21-1a9 9 0 0 1 3 16z" fill="#ddd"/><path d="M-10 8l-3 8M0 8l-3 8M10 8l-3 8" fill="none"/>',
        snow: '<path d="M0-18v36M-16-9l32 18M-16 9l32-18M-5-15l5 4l5-4M-5 15l5-4l5 4" fill="none"/>',
        sun: '<circle r="9" fill="#ddd"/><path d="M0-20v-4M0 20v4M-20 0h-4M20 0h4M-14-14l-3-3M14-14l3-3M-14 14l-3 3M14 14l3 3" fill="none"/>',
        camera: '<rect x="-19" y="-9" width="38" height="26" rx="4"/><path d="M-8-9l3-6h10l3 6" /><circle cy="4" r="8" fill="#ddd"/><circle cy="4" r="3" fill="' + K + '"/>',
        clap: '<rect x="-18" y="-4" width="36" height="20"/><path d="M-18-4l4-10l36 6l-4 10" fill="#ddd"/><path d="M-12-12l4 8M-2-10l4 8M8-8l4 8" fill="none"/>',
        note: '<path d="M-6 12V-14l16-4v28" fill="none"/><ellipse cx="-10" cy="12" rx="7" ry="5" fill="' + K + '"/><ellipse cx="6" cy="8" rx="7" ry="5" fill="' + K + '"/>',
        notebook: '<rect x="-14" y="-18" width="28" height="36" rx="2"/><path d="M-14-10h-4M-14-2h-4M-14 6h-4M-6-8h14M-6-1h14M-6 6h9" fill="none"/>',
        pen: '<path d="M-16 16l4-12l20-20l8 8l-20 20z"/><path d="M-12 4l8 8" fill="none"/>',
        bag: '<rect x="-17" y="-8" width="34" height="26" rx="4" fill="#ddd"/><path d="M-8-8v-6a8 8 0 0 1 16 0v6" fill="none"/>',
        shoes: '<path d="M-20 12v-14l10-2l4 8l14 2q10 2 12 6v4z"/><path d="M-20 8h32" fill="none"/>',
        hat: '<path d="M-14 4a14 14 0 0 1 28 0z" fill="#ddd"/><path d="M-20 4h40q-2 7-20 7t-20-7z"/>',
        shirt: '<path d="M-8-16l-13 8l5 8l5-3v22h22v-22l5 3l5-8l-13-8q-3 5-6 5t-6-5z" fill="#ddd"/>',
        envelope: '<rect x="-19" y="-12" width="38" height="26"/><path d="M-19-12l19 15l19-15" fill="none"/>',
        coin: '<circle r="16"/><circle r="11" fill="none"/><path d="M-5-7l5 7l5-7M0 0v9M-5 3h10" fill="none"/>',
        train: '<rect x="-18" y="-18" width="36" height="32" rx="9"/><rect x="-12" y="-12" width="24" height="12" fill="#ddd"/><circle cx="-8" cy="7" r="2.4" fill="' + K + '"/><circle cx="8" cy="7" r="2.4" fill="' + K + '"/><path d="M-14 14l-4 6M14 14l4 6" fill="none"/>',
        bus: '<rect x="-20" y="-14" width="40" height="27" rx="5"/><path d="M-20-1h40" fill="none"/><rect x="-16" y="-11" width="10" height="8" fill="#ddd"/><rect x="-3" y="-11" width="10" height="8" fill="#ddd"/><circle cx="-11" cy="13" r="4.5" fill="#666"/><circle cx="11" cy="13" r="4.5" fill="#666"/>',
        car: '<path d="M-21 8v-8l6-1l7-9h14l7 9l8 1v8z" fill="#ddd"/><circle cx="-10" cy="9" r="4.5" fill="#666"/><circle cx="10" cy="9" r="4.5" fill="#666"/>',
        bike: '<circle cx="-12" cy="6" r="9"/><circle cx="12" cy="6" r="9"/><path d="M-12 6l6-14h12l6 14M-6-8l8 14M-8-12h6M6-8l-2-5h5" fill="none"/>',
        plane: '<path d="M-21 4l38-9q6-1 6 3q0 3-6 3z" fill="#ddd"/><path d="M-6 0l-9-16h5l13 14zM-8 4l-7 14h5l11-12z" fill="#ddd"/>',
        ticket: '<path d="M-19-10h38v7a3 3 0 0 0 0 6v7h-38v-7a3 3 0 0 0 0-6z"/><path d="M-7-10v22" stroke-dasharray="2 3" fill="none"/>',
        clock: '<circle r="17"/><path d="M0-10v10l7 5M0-15v2M0 13v2M-15 0h2M13 0h2" fill="none"/>',
        dog: '<path d="M-14-4l-5 12l4 2l4-6M14-4l5 12l-4 2l-4-6"/><ellipse cy="0" rx="15" ry="14"/><path d="M-12-8q-6 0-6 8l6-3zM12-8q6 0 6 8l-6-3z" fill="#bbb"/><circle cx="-5" cy="-3" r="1.8" fill="' + K + '"/><circle cx="5" cy="-3" r="1.8" fill="' + K + '"/><ellipse cy="5" rx="4" ry="3" fill="' + K + '"/>',
        cat: '<path d="M-14-6l-2-14l10 8M14-6l2-14l-10 8"/><ellipse rx="15" ry="13"/><circle cx="-5" cy="-2" r="1.8" fill="' + K + '"/><circle cx="5" cy="-2" r="1.8" fill="' + K + '"/><path d="M-3 4l3 2l3-2M-18 2h-8M18 2h8" fill="none"/>',
        racket: '<ellipse cy="-6" rx="11" ry="14"/><path d="M-6-10h12M-8-4h16M0-20v28M0 8v14" fill="none"/>',
        ball: '<circle r="16"/><path d="M0-6l6 4l-2 7h-8l-2-7zM0-6v-10M6-2l10-3M4 5l6 9M-4 5l-6 9M-6-2l-10-3" fill="none"/>',
        laptop: '<rect x="-15" y="-15" width="30" height="20" rx="2" fill="#ddd"/><path d="M-20 8h40l-4 6h-32z"/>',
        tv: '<rect x="-19" y="-15" width="38" height="25" rx="3" fill="#ddd"/><path d="M-8 18h16M0 10v8" fill="none"/>',
        key: '<circle cx="-10" cy="-4" r="8"/><circle cx="-10" cy="-4" r="2.5" fill="' + K + '"/><path d="M-3-1l20 11M10 7l-3 5M15 10l-3 4" fill="none"/>',
        door: '<rect x="-12" y="-19" width="24" height="38"/><circle cx="6" cy="2" r="1.8" fill="' + K + '"/><path d="M-7-13h14M-7 0h14" fill="none"/>',
        gift: '<rect x="-16" y="-6" width="32" height="22"/><rect x="-18" y="-12" width="36" height="8" fill="#ddd"/><path d="M0-12v28M0-12q-10-10-12-2q-1 4 12 2q13 2 12-2q-2-8-12 2" fill="none"/>',
        bed: '<rect x="-20" y="-2" width="40" height="12"/><path d="M-20 10v8M20 10v8M-20-12v22" fill="none"/><rect x="-18" y="-8" width="14" height="6" rx="3" fill="#ddd"/>',
        broom: '<path d="M10-20l-16 28" fill="none"/><path d="M-10 6l-8 12h22l-2-14z" fill="#ddd"/>',
        flower: '<circle r="5"/><circle cx="0" cy="-10" r="5" fill="#ddd"/><circle cx="9" cy="-3" r="5" fill="#ddd"/><circle cx="6" cy="8" r="5" fill="#ddd"/><circle cx="-6" cy="8" r="5" fill="#ddd"/><circle cx="-9" cy="-3" r="5" fill="#ddd"/><circle r="4"/><path d="M0 13v8" fill="none"/>',
        map: '<path d="M-19-12l13 4l12-4l13 4v22l-13-4l-12 4l-13-4z"/><path d="M-6-8v22M6-12v22" fill="none"/>',
        glasses: '<circle cx="-9" cy="0" r="8"/><circle cx="9" cy="0" r="8"/><path d="M-1 0h2M-17 0l-4-3M17 0l4-3" fill="none"/>',
        box: '<path d="M-18-6l18-8l18 8v18l-18 8l-18-8z"/><path d="M-18-6l18 8l18-8M0 2v18" fill="none"/>'
    };
    const icon = (n, x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')" ' + st + '>' + (IC[n] || IC.box) + '</g>';

    /* ---- người: chân đứng tại (x,y), cao ≈ 108 ---- */
    function person(x, y, g, sc, arm, ix) {
        const hair = g === 'w' ? '<path d="M-17-86a17 17 0 0 1 34 0v20h-7v-18h-20v18h-7z" fill="' + K + '"/>' : '';
        const hair2 = g === 'w' ? '<path d="M-14-94q10-8 22-2q4 3 6 8q-12-6-28-6z" fill="' + K + '"/>' : '<path d="M-15-92a15 15 0 0 1 30-1q-6-7-15-5q-9-2-15 6z" fill="' + K + '"/>';
        const tube = (d, col, w) => '<path d="' + d + '" stroke="' + K + '" stroke-width="' + (w + 3.6) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>';
        let b = '<g class="mk-pp mk-pp' + (ix || 0) + '"><g transform="translate(' + x + ',' + y + ') scale(' + sc + ')">';
        b += tube('M-6-42V-3', g === 'w' ? '#fff' : '#777', 9) + tube('M6-42V-3', g === 'w' ? '#fff' : '#777', 9);
        b += '<path d="M-14 0h10l1 4h-13zM4 0h10l1 4h-13z" fill="' + K + '" stroke="' + K + '" stroke-width="2"/>';
        b += (g === 'w' ? '<path d="M-14-78h28l9 44h-46z" fill="#eee" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/>' : '<path d="M-15-78h30l2 40h-34z" fill="#ddd" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-5-78l5 9l5-9" fill="#fff" stroke="' + K + '" stroke-width="2"/>');
        b += tube('M-15-74l-8 26', '#fff', 7);
        b += arm ? tube('M15-74l14 4l8-16', '#fff', 7) : tube('M15-74l8 26', '#fff', 7);
        b += hair + '<path d="M-3-80h6v-5h-6z" fill="#fff" stroke="' + K + '" stroke-width="2"/><circle cy="-93" r="14" ' + st + '/>' + hair2 + '<circle cx="-5" cy="-92" r="1.7" fill="' + K + '"/><circle cx="5" cy="-92" r="1.7" fill="' + K + '"/><path d="M-4-85q4 4 8 0" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/>';
        return b + '</g></g>';
    }
    const arrow = (x, y, rot) => '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')"><path d="M0 0l22-14v9h26v10h-26v9z" fill="' + K + '"/></g>';
    const clock = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="16" ' + st + '/><path d="M' + x + ' ' + (y - 10) + 'V' + y + 'l7 5" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>';
    const win = (x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + st + '/><path d="M' + (x + w / 2) + ' ' + y + 'v' + h + 'M' + x + ' ' + (y + h / 2) + 'h' + w + '" fill="none" stroke="' + K + '" stroke-width="2"/>';
    const tree = (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><rect x="-5" y="-10" width="10" height="34" fill="#bbb" stroke="' + K + '" stroke-width="2.4"/><circle cy="-26" r="24" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/><circle cx="-14" cy="-14" r="14" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/><circle cx="14" cy="-14" r="14" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/></g>';
    const table = (x, y, w) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="8" ' + st + '/><path d="M' + (x + 8) + ' ' + (y + 8) + 'v30M' + (x + w - 8) + ' ' + (y + 8) + 'v30" fill="none" stroke="' + K + '" stroke-width="3"/>';
    const shelf = (x, y, w, rows) => { let s = ''; for (let r = 0; r < rows; r++) { const yy = y + r * 38; s += '<path d="M' + x + ' ' + (yy + 36) + 'h' + w + '" stroke="' + K + '" stroke-width="3"/>'; for (let i = 0, cx = x + 4; cx < x + w - 10; i++) { const bw = 7 + (i * 5) % 6, bh = 22 + (i * 7) % 12; s += '<rect x="' + cx + '" y="' + (yy + 36 - bh) + '" width="' + bw + '" height="' + bh + '" fill="' + (i % 3 ? '#fff' : '#bbb') + '" stroke="' + K + '" stroke-width="1.8"/>'; cx += bw + 2; } } return s; };
    /* ---- bối cảnh (khung 400×250, sàn từ y=196) ---- */
    const FIX = {
        home: () => win(50, 34, 76, 70) + clock(330, 48) + '<rect x="200" y="30" width="64" height="100" fill="#555" stroke="' + K + '" stroke-width="2.4"/><circle cx="252" cy="82" r="3" fill="#fff"/>',
        library: () => shelf(20, 20, 360, 3) + clock(200, 140),
        station: () => '<rect x="190" y="50" width="190" height="130" rx="22" ' + st + '/><rect x="204" y="68" width="76" height="46" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/><rect x="292" y="68" width="76" height="46" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/><path d="M190 140h190" stroke="' + K + '" stroke-width="2.4"/><circle cx="230" cy="160" r="6" fill="' + K + '"/><circle cx="340" cy="160" r="6" fill="' + K + '"/><path d="M40 190V70" stroke="' + K + '" stroke-width="4"/><rect x="14" y="40" width="52" height="30" ' + st + '/><path d="M0 204h400" stroke="' + K + '" stroke-width="5" stroke-dasharray="14 8"/>',
        hospital: () => '<rect x="206" y="128" width="170" height="30" ' + st + '/><rect x="212" y="112" width="46" height="16" rx="6" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/><path d="M206 158v36M376 158v36" stroke="' + K + '" stroke-width="4"/><path d="M62 40h18v18h18v18h-18v18h-18v-18h-18v-18h18z" fill="#ccc" stroke="' + K + '" stroke-width="2.4"/>' + clock(330, 60),
        cafe: () => win(40, 30, 90, 70) + '<path d="M30 30h110l-6 -14h-98z" fill="#bbb" stroke="' + K + '" stroke-width="2.4"/>' + table(150, 162, 100) + clock(330, 50),
        office: () => win(30, 34, 110, 64) + '<path d="M36 40v56M52 40v56M68 40v56M84 40v56M100 40v56M116 40v56" stroke="' + K + '" stroke-width="1.6"/>' + clock(330, 48) + table(240, 160, 120),
        school: () => '<rect x="60" y="26" width="280" height="86" fill="#555" stroke="' + K + '" stroke-width="3"/><path d="M80 52h90M80 72h140M240 52h60" stroke="#ddd" stroke-width="3" stroke-linecap="round"/>' + clock(360, 20).replace('r="16"', 'r="12"'),
        post: () => '<rect x="250" y="70" width="58" height="104" rx="10" fill="#ccc" stroke="' + K + '" stroke-width="2.6"/><path d="M262 92h34" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><path d="M279 174v24" stroke="' + K + '" stroke-width="5"/>' + win(50, 40, 90, 60) + clock(180, 40),
        bank: () => '<rect x="40" y="110" width="200" height="86" ' + st + '/><rect x="60" y="76" width="160" height="34" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/><rect x="290" y="60" width="70" height="116" rx="8" fill="#ccc" stroke="' + K + '" stroke-width="2.6"/><rect x="302" y="78" width="46" height="32" fill="#fff" stroke="' + K + '" stroke-width="2"/>' + clock(180, 34),
        hotel: () => '<rect x="40" y="120" width="220" height="76" ' + st + '/><path d="M70 40v50M100 40v50M130 40v50M160 40v50M190 40v50" stroke="' + K + '" stroke-width="3"/><circle cx="70" cy="94" r="5" fill="' + K + '"/><circle cx="100" cy="94" r="5" fill="' + K + '"/><circle cx="130" cy="94" r="5" fill="' + K + '"/>' + clock(330, 50),
        party: () => '<path d="M20 30q90 36 180 0q90 36 180 0" fill="none" stroke="' + K + '" stroke-width="2.4"/>' + [40, 90, 150, 220, 280, 340].map((x, i) => '<path d="M' + x + ' ' + (62 + (i % 2) * 12) + 'l-9 20h18z" fill="' + (i % 2 ? '#fff' : '#bbb') + '" stroke="' + K + '" stroke-width="2"/>').join('') + table(130, 162, 140),
        sports: () => '<path d="M0 150h400" stroke="' + K + '" stroke-width="2.4"/><path d="M270 150V80h100v70M270 80l-14 20M370 80l14 20M290 80v70M310 80v70M330 80v70M350 80v70M270 100h100M270 120h100" fill="none" stroke="' + K + '" stroke-width="2"/><circle cx="60" cy="44" r="18" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/>',
        cinema: () => '<rect x="60" y="24" width="280" height="110" fill="#ddd" stroke="' + K + '" stroke-width="3"/><path d="M60 24q20 50 0 110M340 24q-20 50 0 110" fill="#999" stroke="' + K + '" stroke-width="2.4"/>' + [40, 110, 180, 250, 320].map(x => '<rect x="' + x + '" y="158" width="40" height="34" rx="8" fill="#999" stroke="' + K + '" stroke-width="2.4"/>').join(''),
        park: () => tree(70, 110, 1.3) + tree(330, 120, 1.1) + '<path d="M130 166h120M140 150h100M140 150v16M240 150v16M136 166v26M244 166v26" fill="none" stroke="' + K + '" stroke-width="3.4"/><path d="M180 40q10-14 24-6q16-6 22 8q8 2 4 10h-56q-6-10 6-12z" fill="#fff" stroke="' + K + '" stroke-width="2.2"/>',
        shop: () => shelf(20, 40, 170, 2) + '<rect x="250" y="130" width="120" height="66" ' + st + '/><rect x="280" y="102" width="50" height="28" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/>' + clock(320, 50),
        weather: () => '<circle cx="320" cy="50" r="22" fill="#ddd" stroke="' + K + '" stroke-width="2.4"/><path d="M80 70q10-18 30-8q18-14 34 4q18 0 18 14h-86q-8-6 4-10z" fill="#fff" stroke="' + K + '" stroke-width="2.4"/><path d="M96 98l-6 14M116 98l-6 14M136 98l-6 14M156 98l-6 14" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>',
        phone: () => clock(330, 48) + win(50, 36, 70, 60),
        talk: () => clock(330, 48) + win(50, 36, 70, 60)
    };
    const THEMES = [
        [/としょかん|ほんや/, 'library', ['book']], [/えき|でんしゃ|バス|のりば|きっぷ|タクシー/, 'station', ['ticket']], [/びょういん|くすり|いしゃ|ねつ|かぜ|あたまが/, 'hospital', ['pill']],
        [/コーヒー|きっさてん|カフェ|こうちゃ|レストラン|ちゅうもん|メニュー|おいしい|たべ|ごはん|ラーメン|カレー|のみもの/, 'cafe', ['cup']], [/かいしゃ|しごと|かいぎ|コピー|しりょう|ぶちょう|パソコン/, 'office', ['paper']],
        [/がっこう|せんせい|きょうしつ|テスト|しゅくだい|クラス|だいがく|べんきょう/, 'school', ['notebook']], [/ゆうびんきょく|てがみ|はがき|にもつ|きって/, 'post', ['envelope']], [/ぎんこう|おかね/, 'bank', ['coin']],
        [/ホテル|りょこう|ひこうき|くうこう/, 'hotel', ['bag']], [/パーティー|たんじょうび|プレゼント|おいわい/, 'party', ['cake']], [/スポーツ|テニス|サッカー|やきゅう|およ|うんどう/, 'sports', ['ball']],
        [/えいが|コンサート|おんがく|うた/, 'cinema', ['clap']], [/こうえん|さんぽ|はな|さくら|いぬ/, 'park', ['flower']], [/かいもの|うりば|スーパー|デパート|みせ|いくら|レジ/, 'shop', ['bag']],
        [/てんき|あめ|ゆき|さむ|あつ|はれ|かぜが/, 'weather', ['umbrella']], [/でんわ|もしもし/, 'phone', ['phone']], [/うち|へや|いえ|おふろ|だいどころ|あさごはん|ねる|りょうり|そうじ/, 'home', ['clock']]
    ];
    const ITEMS = [
        [/(?<!に)ほん(?!とう)|じしょ|ざっし/, 'book'], [/コピー|しりょう/, 'paper'], [/でんわ|もしもし/, 'phone'], [/コーヒー|おちゃ|こうちゃ|みず|ミルク|ぎゅうにゅう/, 'cup'], [/パン(?!ツ)|サンドイッチ/, 'bread'], [/ごはん|おべんとう|おにぎり/, 'rice'],
        [/ラーメン|うどん|そば|カレー|スープ|りょうり/, 'noodle'], [/さかな/, 'fish'], [/りんご|くだもの|みかん|バナナ/, 'apple'], [/ジュース|ビール|さけ|ワイン/, 'juice'], [/ケーキ|アイス|おかし|たんじょうび/, 'cake'], [/くすり/, 'pill'],
        [/ねつ|かぜ/, 'thermo'], [/かさ/, 'umbrella'], [/あめ(?!りか)/, 'rain'], [/ゆき/, 'snow'], [/はれ|あつい|てんき/, 'sun'], [/しゃしん|カメラ/, 'camera'], [/えいが/, 'clap'], [/おんがく|うた|コンサート/, 'note'],
        [/テスト|しゅくだい|ノート/, 'notebook'], [/ペン|えんぴつ/, 'pen'], [/かばん/, 'bag'], [/くつ/, 'shoes'], [/ぼうし/, 'hat'], [/シャツ|ふく/, 'shirt'], [/てがみ|はがき|きって/, 'envelope'], [/おかね|えん(?!ぴつ)|いくら|さいふ/, 'coin'],
        [/でんしゃ/, 'train'], [/バス/, 'bus'], [/タクシー|くるま/, 'car'], [/じてんしゃ/, 'bike'], [/ひこうき|くうこう/, 'plane'], [/きっぷ/, 'ticket'], [/とけい|じかん/, 'clock'], [/いぬ/, 'dog'], [/ねこ/, 'cat'], [/テニス/, 'racket'],
        [/サッカー|やきゅう|ボール/, 'ball'], [/パソコン/, 'laptop'], [/テレビ|ラジオ/, 'tv'], [/かぎ/, 'key'], [/ドア/, 'door'], [/プレゼント|おみやげ/, 'gift'], [/ベッド|ねる/, 'bed'], [/そうじ/, 'broom'], [/はな|さくら/, 'flower'],
        [/ちず/, 'map'], [/めがね/, 'glasses'], [/にもつ|こづつみ/, 'box']
    ];
    window.rmMkScene = function (script, stem, type) {
        const txt = String(stem || '') + '\n' + String(script || ''), men = /男：/.test(txt), women = /女：/.test(txt);
        const th = THEMES.find(t => t[0].test(txt)) || [null, 'talk', ['book']];
        const items = []; ITEMS.forEach(([re, n]) => { if (re.test(txt) && !items.includes(n)) items.push(n); });
        const props = items.slice(0, 3); th[2].forEach(n => { if (props.length < 2 && !props.includes(n)) props.push(n); });
        const listener = /ともだち|せんせい|てんいん|おきゃく|かぞく|おかあさん|おとうさん|ぶちょう|かちょう|うんてんしゅ|おいしゃさん|かんごし/.test(txt);
        let s = '<svg class="mk-pic" viewBox="0 0 400 250" role="img" aria-label="Hình minh hoạ tình huống" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="396" height="246" rx="6" fill="#fff" stroke="' + K + '" stroke-width="3"/><rect x="2" y="196" width="396" height="52" fill="#eee"/><path d="M2 196h396" stroke="' + K + '" stroke-width="2"/>';
        s += (FIX[th[1]] || FIX.talk)();
        const two = type === 'l3' ? listener : (men && women);
        const first = (txt.match(/[男女]：/) || [''])[0], gA = type === 'l3' ? (women && !men ? 'w' : 'm') : (men && women ? (first === '女：' ? 'w' : 'm') : (men ? 'm' : 'w')), gB = gA === 'm' ? 'w' : 'm';
        const cx = two ? [95, 305] : [100];
        // đồ vật ở giữa/bên phải
        const pxs = two ? [165, 200, 235] : [200, 262, 324], py = two ? 150 : 160;
        props.forEach((n, i) => { if (i < (two ? 2 : 3)) s += icon(n, two ? (i ? 235 : 165) : pxs[i], py + (i % 2) * 8, 1.35); });
        s += person(cx[0], 238, gA, 1.05, type !== 'l3' && two, 0);
        if (two) s += person(cx[1], 238, gB, 1.05, false, 1);
        if (type === 'l3') s += arrow(cx[0] + 26, 120, -25);
        return s + '</svg>';
    };
})();
