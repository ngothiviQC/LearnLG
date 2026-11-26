/* ===================== Kanji N5 (route #kanji) =====================
   103 chữ Kanji N5, chia theo nhóm nghĩa. Thông tin từng chữ (Hán Việt, âm On / Kun, nghĩa, từ ví dụ, trạm)
   lấy từ data/roadmap-lessons.js (RM_LESSONS[n].kanji); nghe ví dụ dùng rmPlay (roadmap.js, file rm/aN.mp3).
   Có: bảng chữ (bấm xem chi tiết, đánh dấu đã thuộc), luyện nhanh 10 câu, tạo file luyện viết để in / lưu PDF.
   Lưu trên trình duyệt: hvn.kj = { ok: { chữ: true } }. Chỉ dành cho người Việt học tiếng Nhật (giao diện Nhật thì ẩn).
   Phải nạp TRƯỚC script.js (dùng hàm của script.js / roadmap.js lúc chạy, không phải lúc nạp). */

const KJ_GROUPS = [
    ['Số đếm & tiền', '一二三四五六七八九十百千万円'],
    ['Ngày & thời gian', '日月火水木金土年時分半今毎週間午前後'],
    ['Vị trí & phương hướng', '上下中外右左東西南北'],
    ['Con người & trường học', '人男女子父母友先生学校'],
    ['Tính chất', '大小高安長新古多少白'],
    ['Thiên nhiên', '山川天気雨花魚空'],
    ['Hành động', '行来食飲見聞読書話言休買入出立'],
    ['Nơi chốn & đồ vật', '名語国会社店駅道電車本何'],
    ['Cơ thể', '手足目口耳'],
];
const KJ_ALL = KJ_GROUPS.reduce((a, g) => a.concat([...g[1]]), []);
let kjInfoCache = null;
// { chữ: { k, hv, rd, m, ex, exv, n } }
function kjInfo() {
    if (!kjInfoCache) {
        kjInfoCache = {};
        if (typeof RM_LESSONS === 'object') for (let n = 1; n <= 25; n++) (RM_LESSONS[n] ? RM_LESSONS[n].kanji : []).forEach(([k, hv, rd, m, ex, exv]) => { kjInfoCache[k] = { k, hv, rd, m, ex, exv, n }; });
    }
    return kjInfoCache;
}
const kjLoad = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
let kj = Object.assign({ ok: {} }, kjLoad('hvn.kj', {}));
const kjSave = () => { try { localStorage.setItem('hvn.kj', JSON.stringify(kj)); } catch (e) { } };
const kjOkCount = () => KJ_ALL.filter(k => kj.ok[k]).length;

let kjSel = null;          // chữ đang xem chi tiết
let kjPick = null;         // chế độ chọn chữ để in: { chữ: true } hoặc null
let kjQuiz = null;         // { qs: [...], i, picks: [] }
let kjSheet = false;       // đang xem trước file luyện viết

/* Thẻ trên trang Khóa học */
function kjCourseCard() {
    const ok = kjOkCount();
    return '<div class="sec-h"><h2>Kanji N5</h2><span class="hint">103 chữ, có ví dụ, luyện nhanh và file luyện viết.</span></div>' +
        '<a class="topic rm-card" href="#kanji"><span class="tp-mark jp" lang="ja" aria-hidden="true">字</span>' +
        '<span class="tp-n">Đã thuộc ' + ok + '/' + KJ_ALL.length + ' chữ</span><b>Học Kanji N5</b>' +
        '<span class="tp-d">Xem Hán Việt, cách đọc, từ ví dụ có âm thanh; luyện trắc nghiệm và in giấy tập viết.</span>' +
        '<span class="tp-foot"><span class="num">' + Math.round(ok / KJ_ALL.length * 100) + '% đã thuộc</span><span class="tp-go">→</span></span>' +
        '<span class="bar"><i style="width:' + (ok / KJ_ALL.length * 100) + '%"></i></span></a>';
}

function renderKanji() {   // trang riêng (giờ #kanji chuyển về Lộ trình N5, hàm giữ lại để dùng khi cần)
    $('view').innerHTML = crumbs([['kanji', 'Kanji N5']]) + kjBody();
    if (kjSheet) kjShowSheet();
    kjBind();
}
// Vẽ lại đúng trang đang mở: Kanji nằm trong Lộ trình N5
const kjRe = () => { const y = window.scrollY; if (route === 'kanji') renderKanji(); else renderRoadmap(); renderNav(); window.scrollTo(0, y); };
// Phần thân Kanji: dùng trong thẻ “Kanji N5” của Lộ trình N5
function kjBody() {
    const I = kjInfo(), ok = kjOkCount();
    let h = '';
    h += '<div class="kj-hero"><div class="kj-hero-t"><p class="hint">Bấm vào một chữ để xem Hán Việt, cách đọc và từ ví dụ; bấm lại để đóng. Thuộc chữ nào thì đánh dấu “Đã thuộc”. Kanji của từng bài cũng nằm trong trạm tương ứng ở trên.</p>' +
        '<div class="prog"><span class="num">Đã thuộc ' + ok + '/' + KJ_ALL.length + '</span><div class="bar"><i style="width:' + (ok / KJ_ALL.length * 100) + '%;background:var(--ok)"></i></div></div></div>' +
        '<div class="kj-actions"><button type="button" class="btn pri" data-kj="quiz">⚡ Luyện nhanh 10 câu</button>' +
        '<button type="button" class="btn" data-kj="pick" aria-pressed="' + !!kjPick + '">✍ Tạo file luyện viết</button></div></div>';
    if (kjQuiz) h += kjQuizHtml();
    if (kjPick) {
        const n = Object.keys(kjPick).length;
        h += '<section class="kj-pickbar"><div><b>Chọn chữ để in giấy tập viết</b><p class="hint">Bấm vào chữ để chọn / bỏ chọn, hoặc chọn nhanh cả nhóm. Đã chọn ' + n + ' chữ.</p></div>' +
            '<div class="row"><button type="button" class="btn sm" data-kj="pick-all">Chọn tất cả</button><button type="button" class="btn sm" data-kj="pick-none">Bỏ chọn</button>' +
            '<button type="button" class="btn sm" data-kj="pick-todo">Chữ chưa thuộc</button>' +
            '<button type="button" class="btn pri" data-kj="sheet"' + (n ? '' : ' disabled') + '>Xem file (' + n + ' chữ) →</button>' +
            '<button type="button" class="btn sm" data-kj="pick">Hủy</button></div></section>';
    }
    KJ_GROUPS.forEach(([g, chars], gi) => {
        const arr = [...chars], gok = arr.filter(k => kj.ok[k]).length;
        h += '<section class="kj-group"><div class="kj-gh"><h3>' + esc(g) + '</h3><span class="num hint">' + gok + '/' + arr.length + '</span>' +
            (kjPick ? '<button type="button" class="btn sm" data-kjg="' + gi + '">Chọn cả nhóm</button>' : '') + '</div><div class="kj-grid">' +
            arr.map(k => {
                const x = I[k] || {}, on = kjPick ? !!kjPick[k] : false;
                return '<button type="button" class="kj-tile' + (kj.ok[k] ? ' ok' : '') + (on ? ' picked' : '') + (kjSel === k && !kjPick ? ' sel' : '') + '" data-kjc="' + k + '"' +
                    (kjPick ? ' aria-pressed="' + on + '"' : '') + ' title="' + esc((x.hv || '') + ' · ' + (x.m || '')) + '"><span class="kj-c jp" lang="ja">' + k + '</span><span class="kj-hv">' + esc(x.hv || '') + '</span></button>';
            }).join('') + '</div>' + (kjSel && arr.includes(kjSel) && !kjPick ? kjDetail(kjSel) : '') + '</section>';
    });
    h += '<p class="hint">Danh sách 103 chữ Kanji N5 thường gặp; thông tin chữ và từ ví dụ do Claude soạn. Mỗi chữ có ghi trạm tương ứng trong Lộ trình N5.</p>';
    return h;
}

// Đoạn giải thích tiếng Việt có chữ Nhật xen kẽ: chữ Nhật dùng font Nhật, furigana hiện như ruby
const kjTxt = s => '<span>' + rubyHtml(s).replace(/([぀-ヿ㐀-鿿々〆ヶ一-鿿]+)/g, '<span class="jp" lang="ja">$1</span>') + '</span>';
function kjDetail(k) {
    const x = kjInfo()[k]; if (!x) return '';
    const i = KJ_ALL.indexOf(k);
    return '<div class="kj-detail"><div class="kj-big jp" lang="ja">' + k + '</div><div class="kj-dt">' +
        '<span class="lbl">Chữ ' + (i + 1) + '/' + KJ_ALL.length + ' · Trạm ' + x.n + ' Lộ trình N5</span>' +
        '<h3>' + esc(x.hv) + ' <span class="kj-m">· ' + esc(x.m) + '</span></h3>' +
        '<p class="kj-rd"><span class="lbl">Âm On / âm Kun</span><span class="jp" lang="ja">' + esc(x.rd) + '</span></p>' +
        '<p class="kj-ex">' + rmSay(x.ex) + '<span>' + rmJa(x.ex) + '<span class="rm-vi">' + esc(x.exv) + '</span></span></p>' +
        (typeof KJ_STORY === 'object' && KJ_STORY[k] ? '<div class="kj-story"><p><b>📜 Ý nghĩa & nguồn gốc</b>' + kjTxt(KJ_STORY[k][0]) + '</p><p><b>💡 Mẹo nhớ</b>' + kjTxt(KJ_STORY[k][1]) + '</p>' +
            (KJ_STORY[k][2] ? '<p class="kj-cul"><b>🎎 Văn hóa</b>' + kjTxt(KJ_STORY[k][2]) + '</p>' : '') + '</div>' : '') +
        '<div class="row"><button type="button" class="btn' + (kj.ok[k] ? ' kj-okbtn' : ' pri') + '" data-kj="toggle-ok">' + (kj.ok[k] ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc') + '</button>' +
        '<button type="button" class="btn sm" data-kj="prev"' + (i ? '' : ' disabled') + '>← Chữ trước</button><button type="button" class="btn sm" data-kj="next"' + (i < KJ_ALL.length - 1 ? '' : ' disabled') + '>Chữ sau →</button>' +
        '<button type="button" class="btn sm" data-kj="close">Đóng</button></div></div></div>';
}

/* ----- Luyện nhanh: 10 câu, ưu tiên chữ chưa thuộc. Câu chẵn hỏi nghĩa, câu lẻ hỏi cách đọc từ ví dụ ----- */
function kjNewQuiz() {
    const I = kjInfo(), all = KJ_ALL.filter(k => I[k]);
    const todo = shuffle(all.filter(k => !kj.ok[k])), rest = shuffle(all.filter(k => kj.ok[k]));
    const pickK = todo.concat(rest).slice(0, 10);
    const qs = pickK.map((k, qi) => {
        const x = I[k], others = shuffle(all.filter(o => o !== k));
        if (qi % 2 === 0) {
            const opts = [x.hv + ' · ' + x.m]; for (const o of others) { const s = I[o].hv + ' · ' + I[o].m; if (!opts.includes(s)) opts.push(s); if (opts.length === 4) break; }
            return { k, type: 'm', prompt: k, opts: shuffle(opts), ans: opts[0] };
        }
        const read = kanaJa(x.ex), opts = [read];
        for (const o of others) { const s = kanaJa(I[o].ex); if (!opts.includes(s)) opts.push(s); if (opts.length === 4) break; }
        return { k, type: 'r', prompt: plainJa(x.ex), opts: shuffle(opts), ans: read, exv: x.exv };
    });
    kjQuiz = { qs, i: 0, picks: [] };
}
function kjQuizHtml() {
    const Q = kjQuiz, I = kjInfo();
    if (Q.i >= Q.qs.length) {
        const ok = Q.picks.filter((p, i) => p === Q.qs[i].ans).length;
        const wrong = Q.qs.filter((q, i) => Q.picks[i] !== q.ans).map(q => q.k);
        return '<section class="card kj-quiz"><h3>Kết quả: đúng ' + ok + '/' + Q.qs.length + '</h3>' +
            (wrong.length ? '<p class="hint">Chữ cần ôn lại: </p><div class="kj-wrong">' + wrong.map(k => '<button type="button" class="kj-tile" data-kjc="' + k + '"><span class="kj-c jp" lang="ja">' + k + '</span><span class="kj-hv">' + esc(I[k].hv) + '</span></button>').join('') + '</div>' : '<p class="ok-t">Tuyệt vời, đúng hết!</p>') +
            '<div class="row"><button type="button" class="btn pri" data-kj="quiz">Luyện 10 câu khác</button><button type="button" class="btn sm" data-kj="quiz-close">Đóng</button></div></section>';
    }
    const q = Q.qs[Q.i], pick = Q.picks[Q.i];
    let h = '<section class="card kj-quiz"><div class="row"><span class="lbl">Luyện nhanh · câu ' + (Q.i + 1) + '/' + Q.qs.length + '</span><button type="button" class="btn sm r" data-kj="quiz-close">Đóng</button></div>' +
        '<div class="kj-qbox"><span class="kj-qc jp" lang="ja">' + esc(q.prompt) + '</span><p>' + (q.type === 'm' ? 'Chữ này có âm Hán Việt và nghĩa là gì?' : 'Từ này đọc là gì?') + '</p></div><div class="rm-opts">' +
        q.opts.map((o, oi) => {
            const cls = pick == null ? '' : o === q.ans ? ' right' : o === pick ? ' wrong' : '';
            return '<button type="button" class="rm-opt' + cls + '" data-kjq="' + oi + '"' + (pick != null ? ' disabled' : '') + '>' + (q.type === 'r' ? '<span class="jp" lang="ja">' + esc(o) + '</span>' : esc(o)) + '</button>';
        }).join('') + '</div>';
    if (pick != null) {
        const x = I[q.k];
        h += '<p class="rm-why ' + (pick === q.ans ? 'ok-t' : 'ng-t') + '">' + (pick === q.ans ? '✓ Đúng. ' : '✗ Chưa đúng. ') + '<span><b class="jp" lang="ja">' + q.k + '</b> ' + esc(x.hv) + ' · ' + esc(x.m) + ' — ' + rmJa(x.ex) + ' ' + esc(x.exv) + '</span></p>' +
            '<div class="row"><button type="button" class="btn pri" data-kj="quiz-next">' + (Q.i + 1 < Q.qs.length ? 'Câu tiếp →' : 'Xem kết quả') + '</button></div>';
    }
    return h + '</section>';
}

/* ----- File luyện viết: mỗi chữ một hàng, 1 ô mẫu + 4 ô tô mờ + 7 ô trống; in hoặc lưu PDF ----- */
function kjSheetHtml() {
    const I = kjInfo(), ks = KJ_ALL.filter(k => kjPick && kjPick[k]);
    const rows = ks.map(k => {
        const x = I[k] || {};
        let cells = '';
        for (let c = 0; c < 12; c++) cells += '<span class="kjs-cell' + (c === 0 ? ' solid' : c < 5 ? ' trace' : '') + '">' + (c < 5 ? '<span class="jp" lang="ja">' + k + '</span>' : '') + '</span>';
        return '<div class="kjs-row"><div class="kjs-info"><b class="jp" lang="ja">' + k + '</b><span>' + esc(x.hv || '') + '</span><small>' + esc(x.m || '') + '</small><small class="jp" lang="ja">' + esc(x.rd || '') + '</small></div><div class="kjs-cells">' + cells + '</div></div>';
    });
    const pages = []; for (let i = 0; i < rows.length; i += 10) pages.push(rows.slice(i, i + 10).join(''));
    return pages.map((p, i) => '<div class="kjs-page"><div class="kjs-head"><b>Luyện viết Kanji N5</b><span>Họ tên: ……………………… · Ngày: …… / …… / ……</span><span>Trang ' + (i + 1) + '/' + pages.length + '</span></div>' + p + '</div>').join('');
}
function kjShowSheet() {
    let ov = $('kjSheet');
    if (!ov) { ov = document.createElement('div'); ov.id = 'kjSheet'; document.body.appendChild(ov); }
    const n = KJ_ALL.filter(k => kjPick && kjPick[k]).length;
    ov.innerHTML = '<div class="kjs-bar"><b>File luyện viết · ' + n + ' chữ · ' + Math.ceil(n / 10) + ' trang A4</b><span class="hint">Ô đầu là chữ mẫu, 4 ô tiếp theo tô theo nét mờ, các ô còn lại tự viết.</span>' +
        '<div class="row"><button type="button" class="btn pri" data-kj="print">🖨 In / Lưu PDF</button><button type="button" class="btn" data-kj="sheet-close">Đóng</button></div><span class="hint kjs-msg" role="status"></span></div>' +
        '<div class="kjs-sheets">' + kjSheetHtml() + '</div>';
    ov.querySelectorAll('[data-kj]').forEach(b => b.onclick = () => kjAct(b.dataset.kj));
    document.body.classList.add('kjs-open');
}
function kjHideSheet() { const ov = $('kjSheet'); if (ov) ov.remove(); document.body.classList.remove('kjs-open'); }

function kjAct(a) {
    const I = kjInfo(), y = window.scrollY;
    if (a === 'quiz') { kjNewQuiz(); kjPick = null; }
    else if (a === 'quiz-close') kjQuiz = null;
    else if (a === 'quiz-next') kjQuiz.i++;
    else if (a === 'pick') { kjPick = kjPick ? null : {}; kjQuiz = null; }
    else if (a === 'pick-all') KJ_ALL.forEach(k => { kjPick[k] = true; });
    else if (a === 'pick-none') kjPick = {};
    else if (a === 'pick-todo') { kjPick = {}; KJ_ALL.forEach(k => { if (!kj.ok[k]) kjPick[k] = true; }); }
    else if (a === 'sheet') { kjSheet = true; }
    else if (a === 'sheet-close') { kjSheet = false; kjHideSheet(); return; }
    else if (a === 'print') {
        try { window.print(); } catch (e) { }
        const m = document.querySelector('.kjs-msg'); if (m) m.textContent = 'Nếu hộp thoại in không hiện, bấm Ctrl + P (trên máy Mac: ⌘ + P).';
        return;
    }
    else if (a === 'toggle-ok') { if (kj.ok[kjSel]) delete kj.ok[kjSel]; else { kj.ok[kjSel] = true; try { rmMarkDay(); } catch (e) { } } kjSave(); }
    else if (a === 'prev' || a === 'next') { const i = KJ_ALL.indexOf(kjSel) + (a === 'next' ? 1 : -1); if (KJ_ALL[i]) kjSel = KJ_ALL[i]; }
    else if (a === 'close') kjSel = null;
    kjRe(); if (kjSheet) kjShowSheet();
    if (a === 'quiz' || a === 'pick') { const el = document.querySelector('.kj-quiz, .kj-pickbar'); if (el) el.scrollIntoView({ block: 'nearest' }); else window.scrollTo(0, y); }
    else if (a === 'prev' || a === 'next') { const el = document.querySelector('.kj-detail'); if (el) el.scrollIntoView({ block: 'nearest' }); }
    else window.scrollTo(0, y);
}
function kjBind() {
    const v = $('view');
    v.querySelectorAll('[data-kj]').forEach(b => b.onclick = () => kjAct(b.dataset.kj));
    v.querySelectorAll('[data-kjc]').forEach(b => b.onclick = () => {
        const k = b.dataset.kjc, y = window.scrollY;
        if (kjPick) { if (kjPick[k]) delete kjPick[k]; else kjPick[k] = true; }
        else { kjSel = kjSel === k ? null : k; }   // bấm lại chữ đang mở thì đóng
        kjRe();
        const el = document.querySelector('.kj-detail'); if (el && !kjPick) el.scrollIntoView({ block: 'nearest' });
    });
    v.querySelectorAll('[data-kjg]').forEach(b => b.onclick = () => { const y = window.scrollY; [...KJ_GROUPS[+b.dataset.kjg][1]].forEach(k => { kjPick[k] = true; }); kjRe(); });
    v.querySelectorAll('[data-kjq]').forEach(b => b.onclick = () => { const y = window.scrollY; kjQuiz.picks[kjQuiz.i] = kjQuiz.qs[kjQuiz.i].opts[+b.dataset.kjq]; try { rmMarkDay(); } catch (e) { } kjRe(); });
    v.querySelectorAll('[data-rmsay]').forEach(b => b.onclick = () => rmPlay(b.dataset.rmsay, b));
}
