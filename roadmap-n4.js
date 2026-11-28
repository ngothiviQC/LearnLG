/* ===================== Lộ trình chinh phục N4 (route #lo-trinh-n4) =====================
   Cùng khung với Lộ trình N5 (roadmap.js): Giai đoạn 0 ôn nền N5 → Giai đoạn 1 Minna no Nihongo bài 26–50 (25 trạm,
   mỗi trạm 3 ngày + boss sau mỗi 5 trạm) → Giai đoạn 2 luyện 14 dạng đề và đề thi thử.
   Nội dung 25 trạm nằm ở data/roadmap-n4.js (RM_N4, RM_BOSS4, RM_N4_PREP). Tái dùng hàm của roadmap.js (rmStationPanel,
   rmPrepCard, rmTestsCard, rmBind…) qua biến rmLv = 4.
   Lưu trên trình duyệt (chung hvn.rm với Lộ trình N5): start4, exam4, sel4, tests4, và t[...] với mã trạm 's26v'…'b50', 'n4-w1'…, 'n4q-…'. */
const RM4_WARM = [
    ['n4-w1', 'Ôn từ vựng và Kanji N5', 'Làm lại flashcard trong Lộ trình N5: nhớ chắc phần lớn 800 từ và 103 Kanji.'],
    ['n4-w2', 'Ôn nền ngữ pháp: thể ます, thể て, thể ない, thể từ điển', 'Mọi mẫu N4 đều dựa trên các thể này; chia động từ nhóm 1 / 2 / 3 phải thật nhanh.'],
    ['n4-w3', 'Làm thử một đề N5', 'Đạt từ 80% thì qua Giai đoạn 1; chưa đạt thì ôn thêm ở Lộ trình N5 một tuần nữa.'],
];
const RM4_DESC = { v: 'Học từ mới và Kanji của bài, ôn bằng flashcard (mục Hôm nay).', g: 'Đọc kỹ các mẫu ngữ pháp ở trên, rồi tự đặt 3 câu cho mỗi mẫu.', c: 'Shadowing hội thoại, làm phần Tự kiểm tra nhanh. Đạt từ 80% là qua trạm.' };
const RM4_LBL = { 'q-r1': 'Đọc đoạn ngắn ~100 chữ', 'q-r2': 'Đọc đoạn vừa ~450 chữ', 'q-r3': 'Tìm thông tin ~500 chữ' };
const RM4_INTRO = { 2: '35 phút, mỗi đoạn chỉ phát một lần. Trang này chưa có âm thanh N4: hãy luyện bằng đề JLPT N4 thật (có file nghe), rồi đánh dấu từng dạng sau khi làm.' };
const rmDue4 = n => addDays(parseYmd(rm.start4), 7 + Math.ceil((n - 25) / 2) * 7 - 1);
const rm4DoneCount = () => { let n = 0; for (let i = 26; i <= 50; i++) if (rmStationDone(i)) n++; return n; };
const rm4Current = () => { for (let i = 26; i <= 50; i++) if (!rmStationDone(i)) return i; return 50; };
function rm4Expected() {
    const today = new Date(); let n = 0;
    for (let i = 26; i <= 50; i++) if (dayDiff(rmDue4(i), today) >= 0) n = i - 25;
    return n;
}
function rm4Defaults() {
    let dirty = false;
    if (!rm.start4) { rm.start4 = ymd(new Date()); dirty = true; }
    if (!rm.exam4) { rm.exam4 = '2027-12-05'; dirty = true; }
    if (rm.sel4 === undefined) { rm.sel4 = 26; dirty = true; }   // 0 = đã ẩn bảng trạm, không đặt lại
    if (dirty) rmSave();
}

/* Thẻ trên trang Khóa học */
function rmCourseCardN4() {
    rm4Defaults();
    const done = rm4DoneCount(), st = rmStreak(), left = dayDiff(new Date(), parseYmd(rm.exam4));
    return '<div class="sec-h"><h2>Lộ trình N4</h2><span class="hint">Tiếp nối N5: bản đồ 25 trạm tới ngày thi.</span></div>' +
        '<a class="topic rm-card" href="#lo-trinh-n4"><span class="tp-mark jp" lang="ja" aria-hidden="true">進</span>' +
        '<span class="tp-n">Trạm ' + done + '/25 · 🔥 ' + st + ' ngày liên tiếp' + (left >= 0 ? ' · còn ' + left + ' ngày tới ngày thi' : '') + '</span>' +
        '<b>Lộ trình chinh phục N4</b><span class="tp-d">Ôn nền N5 → Minna bài 26–50 (2 bài/tuần) → luyện 14 dạng câu hỏi và đề thi thử.</span>' +
        '<span class="tp-foot"><span class="num">' + Math.round(done / 25 * 100) + '% đã qua</span><span class="tp-go">→</span></span>' +
        '<span class="bar"><i style="width:' + (done / 25 * 100) + '%"></i></span></a>';
}

function renderRoadmapN4() {
    rmLv = 4; rm4Defaults();
    const today = new Date(), tk = ymd(today), td = rmDays[tk] || {};
    const done = rm4DoneCount(), cur = rm4Current(), exp = rm4Expected(), st = rmStreak(), best = rmBest();
    const left = dayDiff(today, parseYmd(rm.exam4));
    const gap = done - exp;
    const pace = done >= 25 ? '<span class="ok-t">Đã qua đủ 25 trạm 🎉 Chuyển sang luyện đề.</span>'
        : dayDiff(today, parseYmd(rm.start4)) > 0 ? 'Lộ trình bắt đầu ngày ' + fmtD(parseYmd(rm.start4)) + '.'
        : gap >= 0 ? '<span class="ok-t">Đúng tiến độ' + (gap > 0 ? ' (vượt ' + gap + ' trạm)' : '') + '.</span>'
        : '<span class="mid-t">Chậm ' + (-gap) + ' trạm so với kế hoạch — học bù 1 trạm vào cuối tuần nhé.</span>';
    let h = crumbs([['lo-trinh-n4', 'Lộ trình N4']]);
    const P = rmPlan();
    h += '<section class="card rm-top"><div class="rm-hero"><div class="rm-hero-t"><span class="lbl">Lộ trình chinh phục tiếng Nhật</span><h2>Từ N5 lên JLPT N4</h2>' +
        '<p class="rm-pace">' + pace + '</p><p class="hint">Chưa vững N5? <a href="#lo-trinh">Mở Lộ trình N5 →</a></p></div>' +
        '<div class="tiles rm-tiles">' +
        '<div class="tile"><b>' + (left >= 0 ? left : 0) + '</b><span>ngày tới ngày thi (' + fmtD(parseYmd(rm.exam4)) + ')</span></div>' +
        '<div class="tile"><b>🔥 ' + st + '</b><span>ngày liên tiếp · kỷ lục ' + best + '</span></div>' +
        '<div class="tile"><b>' + done + '<small>/25</small></b><span>trạm đã qua</span></div></div></div>' +
        '<div class="rm-plan"><span class="lbl">Kế hoạch của bạn</span><div class="settings">' +
        '<label class="set"><span class="lbl">Ngày bắt đầu</span><input class="rm-date" type="date" data-rmd="start4" value="' + rm.start4 + '"></label>' +
        '<label class="set"><span class="lbl">Ngày thi dự kiến</span><input class="rm-date" type="date" data-rmd="exam4" value="' + rm.exam4 + '"></label></div>' +
        '<p class="hint">' + P.days + ' ngày học · mỗi ngày ' + P.per.v + ' từ vựng (' + P.tot.v + ' từ), ' + P.per.k + ' Kanji (' + P.tot.k + ' chữ), ' + P.per.s + ' câu shadowing (' + P.tot.s + ' câu). ' +
        'JLPT thường thi vào Chủ nhật đầu tháng 7 và tháng 12; hạn đăng ký thì xem trên trang chính thức.</p></div></section>';

    // Hôm nay
    const tile = (k, ico, title, unit) => {
        const it = rmTodayItems(k), dn = !!td[k];
        return '<button type="button" class="rm-dtask' + (dn ? ' on' : '') + (rmT.k === k ? ' sel' : '') + '" data-rmday="' + k + '" aria-expanded="' + (rmT.k === k) + '">' +
            '<span class="rm-box" aria-hidden="true">' + (dn ? '✓' : ico) + '</span><span class="rm-tt"><b>' + title + ' · ' + it.length + ' ' + unit + '</b>' +
            '<span>' + (dn ? 'Đã xong hôm nay' : 'Bấm để học') + (P.review ? ' · ôn lại' : '') + '</span></span></button>';
    };
    h += '<section class="card"><div class="wtop"><div style="flex:1;min-width:0"><h2 class="card-h">Hôm nay · ngày ' + (P.idx + 1) + '/' + P.days + '</h2>' +
        '<p class="hint">Bài hôm nay được chia sẵn từ nội dung 25 trạm N4 theo số ngày trong kế hoạch. Làm hết từng phần thì phần đó tự đánh dấu xong.</p></div></div>' +
        '<div class="rm-today three">' + tile('v', '語', 'Từ vựng', 'từ') + tile('k', '字', 'Kanji', 'chữ') + tile('s', '🔊', 'Shadowing', 'câu') + '</div>' + rmTodayPanel() + '</section>';

    // Giai đoạn 0
    const wd = RM4_WARM.filter(([id]) => rm.t[id]).length;
    h += rmStageHead('00', 'Giai đoạn 0 · tuần đầu', 'Ôn nền tảng N5', fmtD(parseYmd(rm.start4)) + ' → ' + fmtD(addDays(parseYmd(rm.start4), 6)), wd, RM4_WARM.length) +
        '<section class="card rm-list">' + RM4_WARM.map(([id, a, b]) => rmCheck(id, !!rm.t[id], a, b)).join('') + '</section>';

    // Giai đoạn 1
    h += rmStageHead('01', 'Giai đoạn 1 · khoảng 3 tháng', 'Minna no Nihongo bài 26–50: 25 trạm', fmtD(addDays(parseYmd(rm.start4), 7)) + ' → ' + fmtD(rmDue4(50)), done, 25);
    h += '<section class="card rm-map-card"><div class="rm-map">';
    for (let c = 0; c < 5; c++) {
        if (c !== rmLegNow(4)) continue;   // các nhóm trạm còn lại nằm ở tab khác
        h += '<div class="rm-leg"><span class="rm-leg-n">Trạm ' + (26 + c * 5) + '–' + (30 + c * 5) + '</span><div class="rm-path">';
        for (let i = 26 + c * 5; i <= 30 + c * 5; i++) {
            const dn = rmStationDone(i), part = RM_TASKS.filter(([k]) => rmTaskDone(i, k)).length;
            const cls = 'rm-st' + (dn ? ' done' : '') + (i === cur && !dn ? ' cur' : '') + (RM_BOSS[i] ? ' boss' : '') + (i === rm.sel4 ? ' sel' : '');
            h += '<button type="button" class="' + cls + '" data-rms="' + i + '" aria-pressed="' + (i === rm.sel4) + '" aria-label="Trạm ' + i + (dn ? ', đã qua' : '') + '">' +
                '<span class="rm-dot">' + (dn ? '✓' : RM_BOSS[i] ? '👹' : i) + '</span><span class="rm-cap">Bài ' + i + '</span>' +
                (!dn && part ? '<span class="rm-part">' + part + '/3</span>' : '') + '</button>';
        }
        h += '</div></div>';
    }
    h += '</div>' + (rm.sel4 ? rmStationPanel(rm.sel4) : '<p class="hint rm-pickhint">Bấm vào một trạm để xem nội dung bài học; bấm lần nữa để ẩn.</p>') + '</section>';

    // Kanji N4 (kanji.js): bảng chữ, luyện nhanh, file luyện viết — thẻ thu gọn trong Giai đoạn 1
    if (typeof kjBody === 'function') {
        const ko = kjOkCount(), kn = kjAll().length;
        h += '<details class="card rm-fold kj-fold' + (ko === kn ? ' done' : '') + '" data-rmsec="kanji4"' + (rmOpen.kanji4 ? ' open' : '') + '><summary><span class="rm-ft"><b>Kanji N4</b> <span class="jp" lang="ja">漢字</span><span class="rm-fsub">' + kn + ' chữ · bảng chữ, luyện nhanh, file luyện viết</span></span>' +
            '<span class="rm-fprog num' + (ko === kn ? ' ok-t' : '') + '">' + ko + '/' + kn + '</span></summary>' + kjBody() + '</details>';
    }

    // Giai đoạn 2
    const qd = RM_TYPES.reduce((n, g) => n + g[1].filter(([id]) => rm.t[rmK(id)]).length, 0);
    h += rmStageHead('02', 'Giai đoạn 2 · tới ngày thi', 'Luyện đề và sửa lỗi sai', fmtD(addDays(rmDue4(50), 1)) + ' → ' + fmtD(parseYmd(rm.exam4)), qd, RM_TYPE_N);
    h += '<p class="hint rm-s2hint">Đề N4 có 3 phần: Từ vựng 25 phút, Ngữ pháp · Đọc 55 phút, Nghe 35 phút. Mỗi nhóm có cách làm cho từng dạng; dạng nào có câu luyện thì đúng từ 80% sẽ tự được đánh dấu, dạng chưa có thì bạn tự đánh dấu sau khi luyện đề thật.</p>';
    h += RM_PREP_GROUPS.map(rmPrepCard).join('');

    // Sau N4
    h += '<!--stage--><div class="sec-h"><h2>Sau N4</h2><span class="hint">Thời gian là ước tính, tùy tốc độ của bạn.</span></div><div class="topics">' +
        '<div class="topic rm-later"><span class="tp-mark" aria-hidden="true">N3</span><span class="tp-n">Khoảng 8–10 tháng sau N4</span><b>Chinh phục N3</b><span class="tp-d">' +
        'Bộ Shin Kanzen Master hoặc Soumatome N3; đọc NHK News Web Easy, xem anime có phụ đề tiếng Nhật.</span></div></div>';
    h += '<p class="hint">Mẹo: ở N4, kính ngữ (bài 49–50) và các thể bị động / sai khiến (bài 37, 48) là phần dễ mất điểm nhất; hãy đọc to ví dụ mỗi ngày.</p>';
    $('view').innerHTML = rmWrapStages(h);
    rmBind();
}
