/* ===================== Lộ trình chinh phục N5 (route #lo-trinh) =====================
   Dựa trên "Suggested N5 Study Plan" của VNJPCLUB (Kana 3 tuần → Minna bài 1–25, 2 bài/tuần → luyện đề).
   Chỉ dành cho người Việt học tiếng Nhật (giao diện tiếng Nhật thì ẩn).
   Lưu trên trình duyệt:
     hvn.rm   = { start, exam, kana(bool: đã biết Kana), t: { mã việc: true }, tests: [{d, k, l}], sel }
     hvn.days = { 'YYYY-MM-DD': { n: số câu đã chấm, v, k, s (bool: ôn từ vựng / kanji / shadowing) } }
   Hàm dùng chung từ script.js: $, esc, load, save, crumbs, go. Phải nạp TRƯỚC script.js. */

const RM_SRC = 'https://www.vnjpclub.com/en/about/n5-textbooks.html';
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const parseYmd = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dayDiff = (a, b) => Math.round((parseYmd(ymd(b)) - parseYmd(ymd(a))) / 864e5);
const fmtD = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();

// load() của script.js chưa có lúc file này chạy, nên đọc localStorage trực tiếp
const rmLoad = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
let rm = Object.assign({ start: ymd(new Date()), exam: '2027-07-04', kana: false, t: {}, tests: [], sel: 1 }, rmLoad('hvn.rm', {}));
let rmDays = rmLoad('hvn.days', {});
let rmLv = 5;   // trang đang vẽ: 5 = Lộ trình N5, 4 = Lộ trình N4 (roadmap-n4.js)
const rmMin = t => rmLv === 4 ? t.replace('20 phút', '25 phút').replace('40 phút', '55 phút').replace('30 phút', '35 phút') : t;   // N4: 25 + 55 + 35 phút
// Bọc mỗi giai đoạn (đánh dấu bằng <!--stage-->) vào một khung riêng
/* Mỗi giai đoạn là một tab trên thanh cố định (rmStageTabs); trang chỉ hiện phần đầu (tổng quan, kế hoạch, hôm nay) và giai đoạn đang chọn. */
let rmStageTabs = { 5: [], 4: [] };
const RM_STAGE_SHORT = { '00': 'Khởi động', '01': '25 trạm', '02': 'Luyện đề' };
const rmWrapStages = (h, lv) => {
    lv = lv || rmLv;
    // Tab "Khởi động" = tổng quan lộ trình (mục tiêu, kế hoạch, bài hôm nay) + Giai đoạn 0 nếu có; các tab khác chỉ hiện khung của chúng
    const p = h.split('<!--stage-->'), tabs = [['00', 'Khởi động']], boxes = { '00': '' };
    p.slice(1).forEach(x => {
        const sn = x.match(/class="rm-sn">(\d+)</), ov = !sn && /Tổng quan ngữ pháp/.test(x), kj = !sn && /data-rmstage="kanji"/.test(x), id = sn ? sn[1] : kj ? 'kanji' : ov ? 'ov' : 'later';
        if (id === '00') { boxes['00'] = x; return; }
        tabs.push([id, kj ? 'Kanji N' + lv : ov ? 'Tổng quan ngữ pháp' : sn ? 'Giai đoạn ' + (+sn[1]) + ' · ' + (RM_STAGE_SHORT[sn[1]] || '') : 'Sau N' + lv]);
        boxes[id] = x;
    });
    rmStageTabs[lv] = tabs;
    let cur = rm['stab' + lv]; if (!tabs.some(t => t[0] === cur)) cur = '00';
    return (cur === '00' ? p[0] : '') + (boxes[cur] ? '<section class="rm-stagebox">' + boxes[cur] + '</section>' : '');
};
const rmStageTabsHtml = lv => { const arr = rmStageTabs[lv] || [], cur = rm['stab' + lv], on = arr.some(t => t[0] === cur) ? cur : '00';
    return arr.map(([id, label]) => '<button type="button" class="tab" data-rmstab="' + lv + ':' + id + '"' + (id === on ? ' aria-current="page"' : '') + '>' + label + '</button>').join(''); };
const rmK = id => rmLv === 4 ? 'n4' + id : id;   // mã việc ở Giai đoạn 2 tách riêng theo cấp
const rmTests = () => rmLv === 4 ? (rm.tests4 = rm.tests4 || []) : rm.tests;
const rmRender = () => route === 'lo-trinh-n4' && typeof renderRoadmapN4 === 'function' ? renderRoadmapN4() : renderRoadmap();
const rmSave = () => save('hvn.rm', rm);

/* Ghi nhận hôm nay có học: gọi khi chấm một câu (setGrade) hoặc tick việc trên lộ trình */
function rmMarkDay(field) {
    const k = ymd(new Date()), d = rmDays[k] = rmDays[k] || { n: 0 };
    if (field === 'n') d.n = (d.n || 0) + 1; else if (field) d[field] = true;
    d.a = true;   // có hoạt động trong ngày
    save('hvn.days', rmDays);
}
const rmActive = k => { const d = rmDays[k]; return !!(d && (d.a || d.n || d.v || d.k || d.s)); };
function rmStreak() {
    let d = new Date(), n = 0;
    if (!rmActive(ymd(d))) d = addDays(d, -1);   // hôm nay chưa học thì chuỗi vẫn giữ tới hết ngày
    while (rmActive(ymd(d))) { n++; d = addDays(d, -1); }
    return n;
}
function rmBest() {
    const ks = Object.keys(rmDays).filter(rmActive).sort();
    let best = 0, cur = 0, prev = null;
    ks.forEach(k => { cur = prev && dayDiff(parseYmd(prev), parseYmd(k)) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = k; });
    return best;
}

/* ----- Nội dung lộ trình ----- */
// Giai đoạn 0: hai bài, mỗi bài có một ô đánh dấu đã học xong
const RM_KANA = [['k-kana', 'Bảng Hiragana / Katakana'], ['k-greet', 'Chào hỏi cơ bản']];
// Mỗi trạm (bài Minna) có 3 ngày học
const RM_TASKS = [
    ['v', 'Ngày 1 · Từ vựng (vocabulary) + Kanji', 'Học từ mới của bài, ôn bằng flashcard SRS.'],
    ['g', 'Ngày 2 · Ngữ pháp (grammar) + luyện câu', 'Đọc các mẫu của bài trong mục Ngữ pháp N5, rồi luyện câu dịch.'],
    ['c', 'Ngày 3 · Hội thoại, nghe, bài kiểm tra cuối bài', 'Shadowing hội thoại, làm 聴解タスク và bài test. Đạt từ 80% là qua trạm.'],
];
// Boss lớn sau mỗi 5 trạm
const RM_BOSS = {
    5: ['Tự giới thiệu trong 1 phút', 'Bữa đồ Nhật'],
    10: ['Tả căn phòng của mình (あります・います)', 'Một cuốn truyện tranh / sách bạn thích'],
    15: ['Kể lại một ngày của mình (thể て — te-form)', 'Một buổi cà phê / trà sữa'],
    20: ['Viết nhật ký bằng thể thông thường (plain form)', 'Một món đồ nhỏ bạn muốn mua'],
    25: ['Ghi âm đoạn nói 2 phút về bản thân', 'Phần thưởng lớn: món đồ bạn thích nhất'],
};
const RM_TYPES = [
    ['Từ vựng · 20 phút', [['q-v1', '漢字読み', 'Đọc kanji'], ['q-v2', '表記', 'Cách viết kanji/katakana'], ['q-v3', '文脈規定', 'Chọn từ theo ngữ cảnh'], ['q-v4', '言い換え類義', 'Từ gần nghĩa']]],
    ['Ngữ pháp · Đọc · 40 phút', [['q-g1', '文法形式の判断', 'Chọn dạng ngữ pháp'], ['q-g2', '文の組み立て', 'Sắp xếp câu (★)'], ['q-g3', '文章の文法', 'Ngữ pháp trong đoạn văn'],
        ['q-r1', '内容理解（短文）', 'Đọc đoạn ngắn ~80 chữ'], ['q-r2', '内容理解（中文）', 'Đọc đoạn vừa ~250 chữ'], ['q-r3', '情報検索', 'Tìm thông tin']]],
    ['Nghe · 30 phút', [['q-l1', '課題理解', 'Hiểu việc cần làm'], ['q-l2', 'ポイント理解', 'Nghe ý chính'], ['q-l3', '発話表現', 'Chọn câu nói theo tranh'], ['q-l4', '即時応答', 'Đáp nhanh']]],
];
const RM_TYPE_N = RM_TYPES.reduce((n, g) => n + g[1].length, 0);
const RM_LATER = [
    ['N4', 'Khoảng 5 tháng sau N5', 'Minna no Nihongo bài 26–50, giữ nhịp 2 bài/tuần như giai đoạn 1. Có thể nhắm kỳ thi tháng 12/2027.'],
    ['N3', 'Khoảng 8–10 tháng sau N4', 'Bộ Shin Kanzen Master hoặc Soumatome; đọc NHK News Web Easy, xem anime có phụ đề tiếng Nhật.'],
];

/* ----- Tiến độ ----- */
const rmTaskDone = (n, k) => !!rm.t['s' + n + k];
const rmBossDone = n => !!rm.t['b' + n];
const rmStationDone = n => RM_TASKS.every(([k]) => rmTaskDone(n, k)) && (!RM_BOSS[n] || rmBossDone(n));
const rmDoneCount = () => { let n = 0; for (let i = 1; i <= 25; i++) if (rmStationDone(i)) n++; return n; };
const rmCurrent = () => { for (let i = 1; i <= 25; i++) if (!rmStationDone(i)) return i; return 25; };
// Hạn dự kiến của trạm n: sau 3 tuần Kana (nếu chưa biết Kana), 2 bài mỗi tuần
const rmOffset = () => rm.kana ? 0 : 21;
const rmDue = n => addDays(parseYmd(rm.start), rmOffset() + Math.ceil(n / 2) * 7 - 1);
function rmExpected() {
    const today = new Date(); let n = 0;
    for (let i = 1; i <= 25; i++) if (dayDiff(rmDue(i), today) >= 0) n = i;
    return n;
}

/* Thẻ trên trang Khóa học */
function rmCourseCard() {
    const done = rmDoneCount(), st = rmStreak(), left = dayDiff(new Date(), parseYmd(rm.exam));
    return '<div class="sec-h"><h2>Lộ trình N5</h2><span class="hint">Bản đồ 25 trạm từ Kana tới ngày thi.</span></div>' +
        '<a class="topic rm-card" href="#lo-trinh"><span class="tp-mark jp" lang="ja" aria-hidden="true">道</span>' +
        '<span class="tp-n">Trạm ' + done + '/25 · 🔥 ' + st + ' ngày liên tiếp' + (left >= 0 ? ' · còn ' + left + ' ngày tới ngày thi' : '') + '</span>' +
        '<b>Lộ trình chinh phục N5</b><span class="tp-d">Kana → Minna bài 1–25 (2 bài/tuần) → luyện 14 dạng câu hỏi và đề thi thử.</span>' +
        '<span class="tp-foot"><span class="num">' + Math.round(done / 25 * 100) + '% đã qua</span><span class="tp-go">→</span></span>' +
        '<span class="bar"><i style="width:' + (done / 25 * 100) + '%"></i></span></a>';
}

/* ----- Trang lộ trình ----- */
const rmCheck = (id, on, title, desc, extra) => '<label class="rm-task' + (on ? ' on' : '') + '"><input type="checkbox" data-rmt="' + id + '"' + (on ? ' checked' : '') + '>' +
    '<span class="rm-box" aria-hidden="true">✓</span><span class="rm-tt"><b>' + title + '</b>' + (desc ? '<span>' + desc + '</span>' : '') + '</span></label>' + (extra || '');

function renderRoadmap() {
    rmLv = 5;
    const today = new Date(), tk = ymd(today), td = rmDays[tk] || {};
    const done = rmDoneCount(), cur = rmCurrent(), exp = rmExpected(), st = rmStreak(), best = rmBest();
    const left = dayDiff(today, parseYmd(rm.exam));
    const gap = done - exp;
    const pace = done >= 25 ? '<span class="ok-t">Đã qua đủ 25 trạm 🎉 Chuyển sang luyện đề.</span>'
        : dayDiff(today, parseYmd(rm.start)) > 0 ? 'Lộ trình bắt đầu ngày ' + fmtD(parseYmd(rm.start)) + '.'
        : gap >= 0 ? '<span class="ok-t">Đúng tiến độ' + (gap > 0 ? ' (vượt ' + gap + ' trạm)' : '') + '.</span>'
        : '<span class="mid-t">Chậm ' + (-gap) + ' trạm so với kế hoạch — học bù 1 trạm vào cuối tuần nhé.</span>';
    const nQ = td.n || 0;

    let h = crumbs([['lo-trinh', 'Lộ trình N5']]);
    // Tổng quan + kế hoạch
    const P = rmPlan();
    h += '<section class="card rm-top"><div class="rm-hero"><div class="rm-hero-t"><span class="lbl">Lộ trình chinh phục tiếng Nhật</span><h2>Từ con số 0 tới JLPT N5</h2>' +
        '<p class="rm-pace">' + pace + '</p></div>' +
        '<div class="tiles rm-tiles">' +
        '<div class="tile"><b>' + (left >= 0 ? left : 0) + '</b><span>ngày tới ngày thi (' + fmtD(parseYmd(rm.exam)) + ')</span></div>' +
        '<div class="tile"><b>🔥 ' + st + '</b><span>ngày liên tiếp · kỷ lục ' + best + '</span></div>' +
        '<div class="tile"><b>' + done + '<small>/25</small></b><span>trạm đã qua</span></div></div></div>' +
        '<div class="rm-plan"><span class="lbl">Kế hoạch của bạn</span><div class="settings">' +
        '<label class="set"><span class="lbl">Ngày bắt đầu</span><input class="rm-date" type="date" data-rmd="start" value="' + rm.start + '"></label>' +
        '<label class="set"><span class="lbl">Ngày thi dự kiến</span><input class="rm-date" type="date" data-rmd="exam" value="' + rm.exam + '"></label>' +
        sw('data-rmkana=""', rm.kana, 'Đã biết Kana (bỏ qua giai đoạn 0)') + '</div>' +
        '<p class="hint">' + P.days + ' ngày học · mỗi ngày ' + P.per.v + ' từ vựng (' + P.tot.v + ' từ), ' + P.per.k + ' Kanji (' + P.tot.k + ' chữ), ' + P.per.s + ' câu shadowing (' + P.tot.s + ' câu). ' +
        'JLPT thường thi vào Chủ nhật đầu tháng 7 và tháng 12; hạn đăng ký thì xem trên trang chính thức.</p></div></section>';

    // Hôm nay: 3 bài soạn sẵn theo ngày, hoàn thành khi làm hết
    const tile = (k, ico, title, unit) => {
        const it = rmTodayItems(k), dn = !!td[k];
        return '<button type="button" class="rm-dtask' + (dn ? ' on' : '') + (rmT.k === k ? ' sel' : '') + '" data-rmday="' + k + '" aria-expanded="' + (rmT.k === k) + '">' +
            '<span class="rm-box" aria-hidden="true">' + (dn ? '✓' : ico) + '</span><span class="rm-tt"><b>' + title + ' · ' + it.length + ' ' + unit + '</b>' +
            '<span>' + (dn ? 'Đã xong hôm nay' : 'Bấm để học') + (P.review ? ' · ôn lại' : '') + '</span></span></button>';
    };
    h += '<section class="card"><div class="wtop"><div style="flex:1;min-width:0"><h2 class="card-h">Hôm nay · ngày ' + (P.idx + 1) + '/' + P.days + '</h2>' +
        '<p class="hint">Bài hôm nay được chia sẵn từ nội dung 25 trạm theo số ngày trong kế hoạch. Làm hết từng phần thì phần đó tự đánh dấu xong.</p></div></div>' +
        '<div class="rm-today">' +
        '<a class="rm-goal' + (nQ >= 5 ? ' on' : '') + '" href="#bai-' + rmLessonNext() + '"><span class="rm-ring" style="--p:' + Math.min(nQ / 5, 1) * 100 + '"><b>' + nQ + '</b></span><span><b>' + (nQ >= 5 ? 'Đã đủ 5 câu ✓' : 'Luyện ' + Math.max(5 - nQ, 0) + ' câu nữa') + '</b><span>Mở bài luyện câu →</span></span></a>' +
        tile('v', '語', 'Từ vựng', 'từ') + tile('k', '字', 'Kanji', 'chữ') + tile('s', '🔊', 'Shadowing', 'câu') +
        '</div>' + rmTodayPanel() + '</section>';

    // Giai đoạn 0
    if (!rm.kana) {
        const kd = RM_KANA.filter(([id]) => rm.t[id]).length;
        h += rmStageHead('00', 'Giai đoạn 0 · 3 tuần đầu', 'Khởi động: Kana và chào hỏi', fmtD(parseYmd(rm.start)) + ' → ' + fmtD(addDays(parseYmd(rm.start), 20)), kd, RM_KANA.length) +
            '<section class="card rm-list">' +
            (typeof RM_KANA_ROWS === 'object' ? rmSec('kana', 'Bảng Hiragana / Katakana', '<p class="hint">Học Hiragana trước, rồi tới Katakana. Mỗi ngày đọc to và viết lại các hàng đã học; thuộc cả hai bảng thì đánh dấu xong.</p>' +
                '<div class="rm-kana-wrap"><table class="rm-kana"><thead><tr><th>Hiragana</th><th>Katakana</th><th>Cách đọc</th></tr></thead><tbody>' +
                RM_KANA_ROWS.map(([h1, k1, r]) => '<tr><td class="jp" lang="ja">' + h1 + '</td><td class="jp" lang="ja">' + k1 + '</td><td>' + r + '</td></tr>').join('') + '</tbody></table></div>' +
                '<ul class="rm-tips">' + RM_KANA_TIPS.map(x => '<li>' + rmKanaTip(x) + '</li>').join('') + '</ul>', 'k-kana') +
              rmSec('greet', 'Chào hỏi cơ bản (' + RM_GREET.length + ' câu)', '<p class="hint">Câu chào theo tình huống, bấm 🔊 để nghe và nói theo. Cuối bài có hội thoại ngắn để luyện.</p>' +
                RM_GREET_GROUPS.map(([g, items]) => '<span class="lbl rm-sub">' + esc(g) + '</span><ul class="rm-greet">' + items.map(([ja, vi, use]) =>
                    '<li>' + rmSay(ja) + '<div>' + rmJa(ja) + '<b class="rm-gvi">' + esc(vi) + '</b><span class="rm-vi">' + esc(use) + '</span></div></li>').join('') + '</ul>').join('') +
                '<span class="lbl rm-sub">Hội thoại ngắn</span>' + RM_GREET_TALK.map(([g, lines]) => '<p class="rm-gt">' + esc(g) + '</p><ol class="rm-lines rm-talk">' + lines.map(([who, ja, vi]) =>
                    '<li>' + rmSay(ja) + '<span class="rm-who jp" lang="ja">' + rubyHtml(who) + '</span><div>' + rmJa(ja) + '<span class="rm-vi">' + esc(vi) + '</span></div></li>').join('') + '</ol>').join(''), 'k-greet') : '') +
            '</section>';
    }

    // Giai đoạn 1: bản đồ
    h += rmStageHead('01', 'Giai đoạn 1 · khoảng 3 tháng', 'Minna no Nihongo bài 1–25: 25 trạm', fmtD(addDays(parseYmd(rm.start), rmOffset())) + ' → ' + fmtD(rmDue(25)), done, 25);
    h += '<section class="card rm-map-card"><div class="rm-map">';
    for (let c = 0; c < 5; c++) {
        h += '<div class="rm-leg"><span class="rm-leg-n">Trạm ' + (c * 5 + 1) + '–' + (c * 5 + 5) + '</span><div class="rm-path">';
        for (let i = c * 5 + 1; i <= c * 5 + 5; i++) {
            const dn = rmStationDone(i), part = RM_TASKS.filter(([k]) => rmTaskDone(i, k)).length;
            const cls = 'rm-st' + (dn ? ' done' : '') + (i === cur && !dn ? ' cur' : '') + (RM_BOSS[i] ? ' boss' : '') + (i === rm.sel ? ' sel' : '');
            h += '<button type="button" class="' + cls + '" data-rms="' + i + '" aria-pressed="' + (i === rm.sel) + '" aria-label="Trạm ' + i + (dn ? ', đã qua' : '') + '">' +
                '<span class="rm-dot">' + (dn ? '✓' : RM_BOSS[i] ? '👹' : i) + '</span><span class="rm-cap">Bài ' + i + '</span>' +
                (!dn && part ? '<span class="rm-part">' + part + '/3</span>' : '') + '</button>';
        }
        h += '</div></div>';
    }
    h += '</div>' + (rm.sel ? rmStationPanel(rm.sel) : '<p class="hint rm-pickhint">Bấm vào một trạm để xem nội dung bài học; bấm lần nữa để ẩn.</p>') + '</section>';
    // Kanji N5 (kanji.js): bảng 103 chữ, luyện nhanh, file luyện viết — một khung riêng, hiện thành tab "Kanji N5"
    if (typeof kjBody === 'function') {
        const ko = kjOkCount();
        h += '<!--stage--><div class="sec-h" data-rmstage="kanji"><h2>Kanji N5 <span class="jp" lang="ja">漢字</span></h2><span class="hint">' + KJ_ALL.length + ' chữ · đã thuộc ' + ko + '/' + KJ_ALL.length + '</span></div>' + kjBody();
    }

    // Tổng quan ngữ pháp N5 (roadmap-ov.js): trợ từ, chia động từ, 61 mẫu
    if (typeof rmOverview === 'function') h += rmOverview();

    // Giai đoạn 2
    const qd = RM_TYPES.reduce((n, g) => n + g[1].filter(([id]) => rm.t[rmK(id)]).length, 0);
    h += rmStageHead('02', 'Giai đoạn 2 · tới ngày thi', 'Luyện đề và sửa lỗi sai', fmtD(addDays(rmDue(25), 1)) + ' → ' + fmtD(parseYmd(rm.exam)), qd, RM_TYPE_N);
    h += '<p class="hint rm-s2hint">Mỗi nhóm có cách làm và câu luyện cho từng dạng; đúng từ 80% thì dạng đó tự được đánh dấu. Bấm vào tên nhóm để mở.</p>';
    h += RM_PREP_GROUPS.map(rmPrepCard).join('');
    if (typeof rmMockCard === 'function') h += rmMockCard();   // bộ đề thi thử tự soạn (roadmap-mock.js)

    // Sau N5
    h += '<!--stage--><div class="sec-h"><h2>Sau N5</h2><span class="hint">Thời gian là ước tính, tùy tốc độ của bạn.</span></div><div class="topics">' +
        RM_LATER.map(([lv, when, d]) => (lv === 'N4' ? '<a class="topic rm-later" href="#lo-trinh-n4">' : '<div class="topic rm-later">') + '<span class="tp-mark" aria-hidden="true">' + lv + '</span><span class="tp-n">' + when + '</span><b>Chinh phục ' + lv + '</b><span class="tp-d">' + d + (lv === 'N4' ? ' <b>Mở lộ trình N4 →</b>' : '') + '</span>' + (lv === 'N4' ? '</a>' : '</div>')).join('') + '</div>';
    h += '<p class="hint">Mẹo: học cùng một khung giờ mỗi ngày, bật chế độ Không làm phiền, và mỗi tháng ghi âm lại cùng một đoạn để nghe mình tiến bộ.</p>';
    $('view').innerHTML = rmWrapStages(h, 5);
    renderNav();
    rmBind();
}

/* Kanji của một trạm: cùng kiểu với tab Kanji (kanji.js) — bấm một chữ để xem Hán Việt, cách đọc, ví dụ, cách viết; bấm lại để đóng */
function rmStationKanji(list) {
    if (typeof kjDetail !== 'function') return '';
    try { kjSync(); } catch (e) { }
    const chars = list.map(x => x[0]), I = kjInfo();
    list.forEach(([k, hv, rd2, mm, ex, exv]) => { if (!I[k]) I[k] = { k, hv, rd: rd2, m: mm, ex, exv, n: 0 }; });
    return '<p class="hint">Bấm vào một chữ để xem Hán Việt, cách đọc, từ ví dụ và cách viết; bấm lại để đóng.</p><div class="kj-grid">' + chars.map(k => { const x = I[k] || {};
        return '<button type="button" class="kj-tile' + (kjOk()[k] ? ' ok' : '') + (kjSel === k ? ' sel' : '') + '" data-kjc="' + k + '" title="' + esc((x.hv || '') + ' · ' + (x.m || '')) + '"><span class="kj-c jp" lang="ja">' + k + '</span><span class="kj-hv">' + esc(x.hv || '') + '</span></button>'; }).join('') + '</div>' +
        (kjSel && chars.includes(kjSel) ? kjDetail(kjSel) : '');
}
/* Video hội thoại (Kaiwa) của từng trạm N5: tệp mp4 trong thư mục Google Drive đã chia sẻ (Minna_Shokyuu_Kaiwa_01…25), phát bằng trình xem của Drive, chỉ tải khi bấm. */
const RM_KAIWA = ["1JQ1goNMyYztv-NG6RcA4hKCeEYdU_XuU","14ZE_GTybnyPkvcpEeJNV3lhljCOZ8t7c","1AVtLGNMnSY9dD9hVOJSHHG_o4ZGIZGq8","1A2Sh33OtyNqX5KsJRsIPJwZ7T2r5M--L","1ghleB88oynjO-yCNXj8hf3hcqTg0r8re","13xCLhuJ5QSnfHcrEABxmXPMW7pPuQr92","1QAQDczMPJbjzVKsYFO9Vcs0KfVJiiRjA","1TEumP60p-D-mZ3gK0u2I_sgHvMwsSA1t","1dRZasKxxob8lAtFG7C9cCnrrN7_gnADb","1X5RxPrv2QKRtVjBBhn9L66QxcEDYfrf_","1sCjQ1wXKPraeromairCVZR-Iw5xNPBz9","1XWeftdFKhzuJCQUdlLbk4Mymqi3sS5Ah","1eZprkuVZLYxG1mPagafTTPyGNYLYCXPD","1N-OsRoNxqyApJDkNikfxsxtBA2meQOLe","1uTMt3Xj_BsENvf19q-LkOXNiRKSix9_m","1Yn49q9eXnWH7WSCwQGXcWLxfK8kcD8uU","1zrpPlM-nqKjKgUjzncER_69PUNdO6PeF","1ZHc1QaONKYh3pYF-qZgq2Jd0i6Sc_BJ_","18MFK7Oa9T81vus_-MuTedKqmU5E-trJK","1GZUA9EKd63IQ5XWRMHu1RCKVrHshDqKx","1ncshjYMsdSCqVVpGKaMPx6txi6gDk9FX","1QIUquQdmiR8XuEV1y7cU8-juiYw3D2WP","1FjBbCpVhoD1mWVD2bBRqysQkLu1cybQL","1bJczbK1kptNiVkYJdOOYyZJpVXjrHMtB","14uFvRa4a8CxihE5HGRL44CcjF6XDI1Zp"];
const rmKaiwaSec = n => {
    const id = n >= 1 && n <= 25 ? RM_KAIWA[n - 1] : null; if (!id) return '';
    return '<div class="rm-kaiwa"><div class="rm-kaiwa-h"><span class="rm-kaiwa-ico" aria-hidden="true">🎬</span><div><b>Video hội thoại (Kaiwa) · bài ' + n + '</b><span class="rm-vi">Xem, nghe rồi nói theo (shadowing).</span></div></div>' +
        '<div class="rm-kv" data-rmkvbox="' + id + '"><button type="button" class="btn pri" data-rmkv="' + id + '">▶ Xem video</button> ' +
        '<a class="btn sm" href="https://drive.google.com/file/d/' + id + '/view" target="_blank" rel="noopener">Mở trong Google Drive ↗</a></div></div>';
};
const rmLessonNext = () => LESSON_ORDER.find(no => okCount(keyOf(no)) < 30) || LESSON_ORDER[0];
const rmStageHead = (no, when, title, range, d, tot) => '<!--stage--><div class="rm-stage"><span class="rm-sn">' + no + '</span><div><span class="lbl">' + when + ' · ' + range + '</span><h2>' + title + '</h2></div>' +
    '<span class="rm-sp num' + (d >= tot ? ' ok-t' : '') + '">' + d + '/' + tot + (d >= tot ? ' ✓' : '') + '</span></div>';

/* ----- Nội dung bài học (data/roadmap-lessons.js) ----- */
const rmL = n => (typeof RM_LESSONS === 'object' && RM_LESSONS[n]) || (typeof RM_N4 === 'object' && RM_N4[n]) || null;
const rmJa = s => '<span class="jp" lang="ja">' + rubyHtml(s) + '</span>';
const rmSay = s => '<button type="button" class="rm-say" data-rmsay="' + esc(s) + '" aria-label="Nghe">🔊</button>';
let rmOpen = { 'L-goal': true, pic: true };   // các mục <details> đang mở (giữ khi vẽ lại trang)
let rmQuiz = {};                   // { 'trạm-câu': lựa chọn đã bấm }
// chk: mã việc → thêm ô đánh dấu “đã học xong” ngay trên tiêu đề (bấm ô không mở/đóng mục)
const rmSec = (id, title, body, chk) => '<details class="rm-sec' + (chk && rm.t[chk] ? ' done' : '') + '" data-rmsec="' + id + '"' + (rmOpen[id] ? ' open' : '') + '><summary>' +
    (chk ? '<button type="button" class="rm-secchk" data-rmtog="' + chk + '" role="checkbox" aria-checked="' + !!rm.t[chk] + '" aria-label="Đã học xong"><span class="rm-box" aria-hidden="true">✓</span></button>' : '') +
    '<span class="rm-st-t">' + title + '</span>' + (chk ? '<span class="rm-sec-s">' + (rm.t[chk] ? 'Đã học xong' : 'Chưa xong') + '</span>' : '') + '</summary>' + body + '</details>';
// Trộn thứ tự đáp án cố định theo trạm + câu (đáp án đúng trong dữ liệu luôn ở vị trí 0)
const rmOrder = (n, qi) => rmHashOrder('st' + n + '-' + qi, 4);
function rmLessonContent(n) {
    const L = rmL(n); if (!L) return '';
    const gi = typeof GRAMMAR === 'object' ? GRAMMAR.find(G => G.no === n) : null;
    let h = '<div class="rm-goalline"><span class="lbl">Học xong trạm này bạn có thể</span><p>' + esc(L.goal) + '</p>' +
        (gi ? '<p class="hint">Chủ đề ngữ pháp: <b>' + esc(gi.vi) + '</b> — ' + gi.items.map(it => rmJa(it.p)).join('、') + '</p>' : '') + '</div>' + (rmLv !== 4 ? rmKaiwaSec(n) : '');
    if (L.gram) h += rmSec('gm', 'Ngữ pháp chính (' + L.gram.length + ' mẫu)', '<ul class="rm-gram">' + L.gram.map(([p, e, ja, vi]) =>
        '<li><b class="jp" lang="ja">' + rubyHtml(p) + '</b><span class="rm-gx">' + esc(plainJa(e)) + '</span><span class="rm-ex">' + rmJa(ja) + ' — ' + esc(vi) + '</span></li>').join('') + '</ul>');
    if (typeof rmPicSec === 'function') h += rmPicSec(n);   // tranh từ vựng (roadmap-pic.js)
    h += rmSec('v', 'Từ vựng chính (' + L.vocab.length + ' từ)', '<ul class="rm-vocab">' + L.vocab.map(([ja, vi]) =>
        '<li>' + rmSay(ja) + rmJa(ja) + '<span class="rm-vi">' + esc(vi) + '</span></li>').join('') + '</ul>');
    h += rmSec('k', 'Kanji (' + L.kanji.length + ' chữ)', rmStationKanji(L.kanji));
    h += rmSec('t', 'Hội thoại mẫu', '<ol class="rm-lines rm-talk">' + L.talk.map(([who, ja, vi]) =>
        '<li>' + rmSay(ja) + '<span class="rm-who jp" lang="ja">' + rubyHtml(who) + '</span><div>' + rmJa(ja) + '<span class="rm-vi">' + esc(vi) + '</span></div></li>').join('') + '</ol>' +
        '<p class="hint">Shadowing: bấm 🔊, nghe rồi nói đuổi theo từng câu. Nút nghe dùng giọng đọc của máy.</p>');
    const ok = L.quiz.filter((q, qi) => rmQuiz[n + '-' + qi] === 0).length, done = L.quiz.filter((q, qi) => rmQuiz[n + '-' + qi] != null).length;
    h += rmSec('q', 'Tự kiểm tra nhanh' + (done ? ' · đúng ' + ok + '/' + L.quiz.length : ''), L.quiz.map(([q, opts, , why], qi) => {
        const pick = rmQuiz[n + '-' + qi];
        return '<div class="rm-q"><p class="rm-qq">' + (qi + 1) + '. ' + rmJa(q) + '</p><div class="rm-opts">' + rmOrder(n, qi).map(oi => {
            const cls = pick == null ? '' : oi === 0 ? ' right' : oi === pick ? ' wrong' : '';
            return '<button type="button" class="rm-opt' + cls + '" data-rmq="' + n + '-' + qi + '-' + oi + '"' + (pick != null ? ' disabled' : '') + '>' + rmJa(opts[oi]) + '</button>';
        }).join('') + '</div>' + (pick != null ? '<p class="rm-why ' + (pick === 0 ? 'ok-t' : 'ng-t') + '">' + (pick === 0 ? '✓ Đúng. ' : '✗ Chưa đúng. ') + '<span>' + esc(why) + '</span></p>' : '') + '</div>';
    }).join('') + (done === L.quiz.length ? '<button type="button" class="btn sm" data-rmqreset="' + n + '">Làm lại</button>' : ''));
    return '<div class="rm-lesson">' + h + '</div>';
}

/* ----- Bài hôm nay: chia nội dung 25 trạm theo số ngày của kế hoạch ----- */
let rmPools = {};
function rmPool(k) {
    if (!rmPools[rmLv]) {
        const P = rmPools[rmLv] = { v: [], k: [], s: [] }, lo = rmLv === 4 ? 26 : 1;
        for (let n = lo; n < lo + 25; n++) {
            const L = rmL(n); if (!L) continue;
            L.vocab.forEach(x => P.v.push(x.concat(n)));
            L.kanji.forEach(x => P.k.push(x.concat(n)));
            L.talk.forEach(x => P.s.push(x.concat(n)));
        }
    }
    return rmPools[rmLv][k];
}
function rmPlan() {
    const st = rmLv === 4 ? rm.start4 : rm.start, ex = rmLv === 4 ? rm.exam4 : rm.exam;
    const days = Math.max(1, dayDiff(parseYmd(st), parseYmd(ex)) + 1);
    const idx = Math.min(days - 1, Math.max(0, dayDiff(parseYmd(st), new Date())));
    const tot = {}, per = {};
    ['v', 'k', 's'].forEach(k => { tot[k] = rmPool(k).length; per[k] = Math.max(1, Math.ceil(tot[k] / days)); });
    return { days, idx, tot, per, review: idx * per.v >= tot.v };
}
// Phần của hôm nay; khi đã đi hết nội dung thì quay vòng để ôn lại
function rmTodayItems(k) {
    const P = rmPlan(), pool = rmPool(k), per = P.per[k]; if (!pool.length) return [];
    const out = []; for (let j = 0; j < per; j++) out.push(pool[(P.idx * per + j) % pool.length]);
    return out;
}
let rmT = { k: null };   // phần đang mở: { k, q: thứ tự thẻ, i, flip, said }
function rmTodayPanel() {
    const k = rmT.k; if (!k) return '';
    const items = rmTodayItems(k), name = { v: 'Từ vựng', k: 'Kanji', s: 'Shadowing' }[k];
    let h = '<div class="rm-dpanel"><div class="rm-ph"><h3>' + name + ' hôm nay</h3><button type="button" class="btn sm" data-rmtc="close">Đóng</button></div>';
    if (k === 's') {
        h += '<p class="hint">Bấm 🔊 nghe, rồi nói đuổi theo 2–3 lần. Nói xong câu nào thì bấm “Đã nói theo”.</p><ol class="rm-lines rm-talk">' + items.map((x, i) => {
            const [who, ja, vi, n] = x, ok = !!rmT.said[i];
            return '<li>' + rmSay(ja) + '<span class="rm-who jp" lang="ja">' + rubyHtml(who) + '</span><div>' + rmJa(ja) + '<span class="rm-vi">' + esc(vi) + ' · Bài ' + n + '</span>' +
                '<button type="button" class="btn sm rm-said' + (ok ? ' on' : '') + '" data-rmtc="said-' + i + '" aria-pressed="' + ok + '">' + (ok ? '✓ Đã nói theo' : 'Đã nói theo') + '</button></div></li>';
        }).join('') + '</ol>';
        if (items.every((_, i) => rmT.said[i])) h += '<p class="rm-clear ok-t">✓ Xong phần shadowing hôm nay!</p>';
        return h + '</div>';
    }
    const q = rmT.q;
    if (rmT.i >= q.length) return h + '<p class="rm-clear ok-t">✓ Xong ' + name.toLowerCase() + ' hôm nay (' + items.length + ' ' + (k === 'v' ? 'từ' : 'chữ') + ').</p>' +
        '<button type="button" class="btn sm" data-rmtc="again">Ôn lại từ đầu</button></div>';
    const x = items[q[rmT.i]];
    h += '<p class="hint">Thẻ ' + (rmT.i + 1) + '/' + q.length + '. Nhìn mặt trước, tự nhớ nghĩa rồi lật thẻ. “Chưa nhớ” sẽ đưa thẻ xuống cuối để gặp lại.</p><div class="rm-flash">';
    if (k === 'v') h += '<div class="rm-front">' + rmJa(x[0]) + rmSay(x[0]) + '</div>' + (rmT.flip ? '<div class="rm-back"><b>' + esc(x[1]) + '</b><span>Bài ' + x[2] + '</span></div>' : '');
    else h += '<div class="rm-front"><span class="rm-kc jp" lang="ja">' + x[0] + '</span></div>' + (rmT.flip ? '<div class="rm-back"><b>' + esc(x[1]) + ' · ' + esc(x[3]) + '</b>' +
        '<span class="jp" lang="ja">' + esc(x[2]) + '</span><span>' + rmJa(x[4]) + ' — ' + esc(x[5]) + '</span><span>Bài ' + x[6] + '</span></div>' : '');
    h += '</div><div class="row">' + (rmT.flip ? '<button type="button" class="btn" data-rmtc="miss">Chưa nhớ</button><button type="button" class="btn pri" data-rmtc="ok">Nhớ rồi →</button>'
        : '<button type="button" class="btn pri" data-rmtc="flip">Lật thẻ</button>') + '</div>';
    return h + '</div>';
}
function rmTodayAct(a) {
    const k = rmT.k, items = rmTodayItems(k);
    if (a === 'close') rmT = { k: null };
    else if (a === 'flip') rmT.flip = true;
    else if (a === 'ok' || a === 'miss') { if (a === 'miss') rmT.q.push(rmT.q[rmT.i]); rmT.i++; rmT.flip = false; if (rmT.i >= rmT.q.length) rmMarkDay(k); }
    else if (a === 'again') { rmT.q = items.map((_, i) => i); rmT.i = 0; rmT.flip = false; }
    else if (/^said-/.test(a)) { const i = +a.slice(5); rmT.said[i] = !rmT.said[i]; if (items.every((_, j) => rmT.said[j])) rmMarkDay('s'); }
    rmRe();
}

function rmStationPanel(n) {
    const lo = n > 25 ? 26 : 1, hi = n > 25 ? 50 : 25;
    const due = n > 25 ? rmDue4(n) : rmDue(n), late = !rmStationDone(n) && dayDiff(due, new Date()) > 0;
    let h = '<div class="rm-panel"><div class="rm-ph"><div><span class="lbl">Trạm ' + n + ' · hạn dự kiến ' + fmtD(due) + (late ? ' · <span class="mid-t">quá hạn</span>' : '') + '</span>' +
        '<h3>Minna no Nihongo · Bài ' + n + '</h3></div>' +
        '<div class="rm-nav"><button type="button" class="btn sm" data-rms="' + Math.max(lo, n - 1) + '"' + (n <= lo ? ' disabled' : '') + '>← Trạm trước</button>' +
        '<button type="button" class="btn sm" data-rms="' + Math.min(hi, n + 1) + '"' + (n >= hi ? ' disabled' : '') + '>Trạm sau →</button></div></div>';
    h += rmLessonContent(n);
    h += '<span class="lbl rm-sub">Việc cần làm ở trạm này</span><div class="rm-list">' + RM_TASKS.map(([k, a, b]) => rmCheck('s' + n + k, rmTaskDone(n, k), a, n > 25 && typeof RM4_DESC === 'object' ? RM4_DESC[k] : b,
        k === 'g' && n <= GRAMMAR.length ? '<a class="rm-link" href="#ngu-phap" data-gto="' + n + '">Mở ngữ pháp bài ' + n + ' →</a>' : '')).join('') + '</div>';
    if (RM_BOSS[n]) {
        const [task, prize] = RM_BOSS[n];
        const L = rmL(n);
        h += '<div class="rm-bossbox"><span class="lbl">👹 Boss lớn sau trạm ' + n + '</span>' + rmCheck('b' + n, rmBossDone(n), task, 'Ghi âm hoặc viết ra, tự chấm. Qua boss thì nhận thưởng.') +
            (L && L.boss ? rmSec('boss', 'Bài mẫu để tham khảo (' + L.boss.length + ' câu)', '<p class="hint">Thay tên, nghề, giờ giấc… bằng thông tin của bạn. Đạt khi nói trôi chảy mà không nhìn giấy.</p>' +
                '<ol class="rm-lines">' + L.boss.map(([ja, vi]) => '<li>' + rmSay(ja) + '<div>' + rmJa(ja) + '<span class="rm-vi">' + esc(vi) + '</span></div></li>').join('') + '</ol>') : '') +
            '<p class="rm-prize">🎁 Phần thưởng gợi ý: <b>' + prize + '</b></p></div>';
    }
    if (rmStationDone(n)) h += '<p class="rm-clear ok-t">✓ Đã qua trạm ' + n + (n < hi ? '. Tiếp tục trạm ' + (n + 1) + '!' : '. Hoàn thành cả 25 trạm!') + '</p>';
    return h + '</div>';
}

/* Giai đoạn 2 · Tài liệu theo nhóm (data/roadmap-lessons.js: RM_VOCAB_PREP, RM_GR_PREP) */
const RM_PREP_GROUPS = [
    { gi: 0, data: () => rmLv === 4 ? (typeof RM_N4_PREP === 'object' ? RM_N4_PREP : null) : typeof RM_VOCAB_PREP === 'object' ? RM_VOCAB_PREP : null, title: 'Từ vựng', ja: '文字・語彙',
      intro: 'Phần thi đầu tiên, gồm 4 dạng câu hỏi và chỉ có 20 phút, nên mỗi câu chỉ nên mất khoảng nửa phút đến một phút.' },
    { gi: 1, data: () => rmLv === 4 ? (typeof RM_N4_PREP === 'object' ? RM_N4_PREP : null) : typeof RM_GR_PREP === 'object' ? RM_GR_PREP : null, title: 'Ngữ pháp · Đọc', ja: '文法・読解',
      intro: '40 phút cho cả ngữ pháp và đọc hiểu. Làm nhanh 3 dạng ngữ pháp trước, dành phần lớn thời gian cho 3 dạng đọc.' },
    { gi: 2, data: () => rmLv === 4 ? (typeof RM_N4_PREP === 'object' ? RM_N4_PREP : null) : typeof RM_LISTEN_PREP === 'object' ? RM_LISTEN_PREP : null, title: 'Nghe', ja: '聴解',
      intro: '30 phút, mỗi đoạn chỉ phát một lần. Bấm ▶ để nghe như lúc thi (nên nghe một lần rồi chọn), sau khi chọn sẽ xem được lời thoại.' },
];
let rmVTs = { 0: 'q-v1', 1: 'q-g1', 2: 'q-l1' };   // dạng đang mở của từng nhóm
let rmPrep = {};                         // { 'mã dạng-câu': lựa chọn đã bấm }
const rmPrepData = id => { for (const G of RM_PREP_GROUPS) { const d = G.data(); if (d && d[id]) return d[id]; } return null; };
const rmJaU = s => rmJa(s).replace(/［(\d)］/g, '<b class="rm-blank">$1</b>').replace(/［/g, '<u class="rm-ul">').replace(/］/g, '</u>');
// Trộn thứ tự lựa chọn cố định theo khóa (FNV-1a), để đáp án đúng không luôn ở đầu
const rmHashOrder = (key, n) => [...Array(n).keys()].map(i => { let x = 2166136261; for (const c of key + '#' + i) x = Math.imul(x ^ c.charCodeAt(0), 16777619) >>> 0; return [i, x]; }).sort((a, b) => a[1] - b[1]).map(p => p[0]);
// Đoạn đọc: dòng có “|” thành bảng, dòng khác thành đoạn văn; ［n］ hiện thành ô trống
function rmPassage(t) {
    let h = '', rows = [];
    const flush = () => { if (rows.length) { h += '<table class="rm-ptable">' + rows.map((r, i) => '<tr>' + r.map(c => (i ? '<td>' : '<th>') + rmJa(c.trim()) + (i ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</table>'; rows = []; } };
    t.split('\n').forEach(line => { if (line.includes('|')) rows.push(line.split('|')); else { flush(); h += '<p>' + rmJa(line).replace(/［(\d)］/g, '<b class="rm-blank">$1</b>') + '</p>'; } });
    flush();
    return '<div class="rm-passage jp" lang="ja">' + h + '</div>';
}
function rmPrepCard(G) {
    const D = G.data(); if (!D) return '';
    const grp = RM_TYPES[G.gi][1], cur = rmVTs[G.gi];
    const P = D[cur], it = grp.find(x => x[0] === cur);
    const ans = P.qs.map((q, i) => rmPrep[rmK(cur) + '-' + i]), done = ans.filter(a => a != null).length, ok = ans.filter((a, i) => a === P.qs[i][2]).length;
    const gd = grp.filter(([id]) => rm.t[rmK(id)]).length, sec = 'prep' + G.gi, manual = !P.qs.length;
    let h = '<details class="card rm-prep rm-fold' + (gd === grp.length ? ' done' : '') + '" data-rmsec="' + sec + '"' + (rmOpen[sec] ? ' open' : '') + '><summary>' +
        '<span class="rm-ft"><b>' + esc(G.title) + '</b> <span class="jp" lang="ja">' + G.ja + '</span><span class="rm-fsub">' + esc(rmMin(RM_TYPES[G.gi][0].split('·').pop().trim())) + ' · ' + grp.length + ' dạng</span></span>' +
        '<span class="rm-fprog num' + (gd === grp.length ? ' ok-t' : '') + '">' + gd + '/' + grp.length + (gd === grp.length ? ' ✓' : '') + '</span></summary>' +
        '<p class="hint">' + esc((rmLv === 4 && typeof RM4_INTRO === 'object' && RM4_INTRO[G.gi]) || rmMin(G.intro)) + '</p>' +
        '<div class="seg rm-vtabs" role="tablist">' + grp.map(([id, ja], k) => '<button type="button" role="tab" data-rmvt="' + G.gi + ':' + id + '" aria-pressed="' + (id === cur) + '"><span class="num">問題' + (k + 1) + '</span> <span class="jp" lang="ja">' + ja + '</span>' + (rm.t[rmK(id)] ? ' ✓' : '') + '</button>').join('') + '</div>';
    h += '<div class="rm-pbody"><h3><span class="jp" lang="ja">' + it[1] + '</span> · ' + esc((rmLv === 4 && typeof RM4_LBL === 'object' && RM4_LBL[cur]) || it[2]) + '</h3><p>' + esc(P.what) + '</p>' +
        '<span class="lbl rm-sub">Cách làm</span><ul class="rm-tips">' + P.how.map(x => '<li>' + rmKanaTip(x) + '</li>').join('') + '</ul>' +
        (manual ? '<p class="hint">' + esc((typeof RM_N4_TYPE_TIPS === 'object' && RM_N4_TYPE_TIPS[cur]) || '') + '</p><p class="hint">Dạng này chưa có câu luyện trong trang: hãy làm đề JLPT N4 thật hoặc sách luyện đề, rồi đánh dấu khi đạt từ 80%.</p>' +
            rmCheck(rmK(cur), !!rm.t[rmK(cur)], 'Đã luyện dạng này (đúng từ 80%)', '')
        : '<span class="lbl rm-sub">Luyện tập · ' + P.qs.length + ' câu' + (done ? ' · đúng ' + ok + '/' + P.qs.length : '') + '</span>') +
        (P.text && !manual ? rmPassage(P.text) : '') +
        P.qs.map(([q, opts, right, why, txt, script], i) => {
            const pick = rmPrep[rmK(cur) + '-' + i], key = cur + '-' + i;
            const order = P.fixed ? opts.map((_, k) => k) : rmHashOrder(cur + i, opts.length);
            const play = script ? '<button type="button" class="btn sm rm-lplay" data-rmlp="' + key + '">▶ Nghe</button>' : '';
            return '<div class="rm-q">' + (txt ? rmPassage(txt) : '') + '<div class="rm-qhead">' + play + '<p class="rm-qq">' + (i + 1) + '. ' + (/^[A-Za-zÀ-ỹ]/.test(q) ? esc(q) : rmJaU(q).replace(/★/g, '<b class="rm-star">★</b>')) + '</p></div>' +
                '<div class="rm-opts' + (P.fixed ? ' rm-opts3' : '') + '">' + order.map(oi => {
                const cls = pick == null ? '' : oi === right ? ' right' : oi === pick ? ' wrong' : '';
                // Dạng đọc lựa chọn bằng âm thanh: chỉ hiện số 1–3 cho tới khi đã chọn
                const label = P.fixed ? '<b class="rm-onum">' + (oi + 1) + '</b>' + (pick != null ? rmJa(opts[oi]) : '') : rmJa(opts[oi]);
                return '<button type="button" class="rm-opt' + cls + '" data-rmpq="' + cur + ':' + i + ':' + oi + '"' + (pick != null ? ' disabled' : '') + '>' + label + '</button>';
            }).join('') + '</div>' + (pick != null ? '<p class="rm-why ' + (pick === right ? 'ok-t' : 'ng-t') + '">' + (pick === right ? '✓ Đúng. ' : '✗ Chưa đúng. ') + '<span>' + rmKanaTip(why) + '</span></p>' +
                (script ? '<details class="rm-script"><summary>Xem lời thoại</summary><ol class="rm-lines">' + script.map(([w, t2]) => '<li><span class="rm-who">' + ({ N: 'Dẫn', F: 'Nữ', M: 'Nam' })[w] + '</span><div>' + rmJa(t2) + '</div></li>').join('') + '</ol></details>' : '') : '') + '</div>';
        }).join('') +
        (!manual && done === P.qs.length ? '<p class="rm-clear ' + (ok / P.qs.length >= 0.8 ? 'ok-t">✓ Đạt ' + ok + '/' + P.qs.length + '. Dạng này đã được đánh dấu xong.' : 'mid-t">Đúng ' + ok + '/' + P.qs.length + '. Đọc lại phần giải thích rồi làm lại nhé.') + '</p>' +
            '<button type="button" class="btn sm" data-rmpreset="' + cur + '">Làm lại</button>' : '') + '</div></details>';
    return h;
}

/* Âm thanh: file rm/aN.mp3 tạo sẵn (data/roadmap-audio.js); câu nào không có file thì dùng giọng của máy */
const RM_AUD = new Audio(); RM_AUD.preload = 'none';
const rmBlob = {};
let rmAudTimer = 0, rmAudBtn = null;
function rmStop() { clearInterval(rmAudTimer); RM_AUD.pause(); if (rmAudBtn) rmAudBtn.classList.remove('on'); rmAudBtn = null; }
function rmPlay(text, btn) {
    const c = typeof RM_AUDIO === 'object' ? RM_AUDIO[plainJa(text)] : null;
    if (!c) { rmStop(); try { stopAudio(); } catch (e) { } speak(kanaJa(text), 'ja', null); return; }
    rmPlaySeg('rm/a' + c[0] + '.mp3', c[1], c[2], btn, () => speak(kanaJa(text), 'ja', null));
}
// Phát đoạn [st, en] (1/100 giây) của một file; tải cả file một lần rồi tua
function rmPlaySeg(file, st, en, btn, fallback) {
    rmStop(); try { stopAudio(); } catch (e) { }
    rmAudBtn = btn; btn.classList.add('on');
    if (!rmBlob[file]) rmBlob[file] = fetch(file).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(b => URL.createObjectURL(b)).catch(e => { delete rmBlob[file]; throw e; });
    rmBlob[file].then(url => {
        if (rmAudBtn !== btn) return;
        const go = () => {
            try { RM_AUD.currentTime = st / 100; } catch (e) { }
            RM_AUD.playbackRate = 1;
            RM_AUD.play().then(() => {
                rmAudTimer = setInterval(() => { if (RM_AUD.currentTime >= en / 100) rmStop(); }, 30);
            }).catch(() => rmStop());
        };
        if (RM_AUD.src !== url) { RM_AUD.src = url; RM_AUD.addEventListener('loadedmetadata', go, { once: true }); RM_AUD.load(); } else go();
    }).catch(() => { rmStop(); fallback(); });
}

// Mẹo Kana: phần chữ Nhật trong mẹo hiện bằng font tiếng Nhật
const rmKanaTip = s => esc(s).replace(/([぀-ヿー゛゜]+)/g, '<span class="jp" lang="ja">$1</span>');
const rmRe = () => { const y = window.scrollY; rmRender(); window.scrollTo(0, y); };

function rmBind() {
    const v = $('view');
    if (typeof kjBind === 'function') kjBind();
    v.querySelectorAll('[data-rmtog]').forEach(b => b.onclick = e => {
        e.preventDefault(); e.stopPropagation();
        const id = b.dataset.rmtog; if (rm.t[id]) delete rm.t[id]; else { rm.t[id] = true; rmMarkDay(); } rmSave(); rmRe();
    });
    v.querySelectorAll('[data-rmvt]').forEach(b => b.onclick = () => { const [g, id] = b.dataset.rmvt.split(':'); rmVTs[g] = id; rmRe(); });
    v.querySelectorAll('[data-rmpq]').forEach(b => b.onclick = () => {
        const [id, i, oi] = b.dataset.rmpq.split(':'); rmPrep[rmK(id) + '-' + i] = +oi; rmMarkDay();
        const qs = rmPrepData(id).qs, ans = qs.map((q, j) => rmPrep[rmK(id) + '-' + j]);
        if (ans.every(a => a != null) && ans.filter((a, j) => a === qs[j][2]).length / qs.length >= 0.8) { rm.t[rmK(id)] = true; rmSave(); }
        rmRe();
    });
    v.querySelectorAll('[data-rmlp]').forEach(b => b.onclick = () => {
        const c = typeof RM_LAUDIO === 'object' ? RM_LAUDIO[b.dataset.rmlp] : null;
        if (rmAudBtn === b) { rmStop(); return; }
        if (c) rmPlaySeg('rm/l.mp3', c[0], c[1], b, () => { });
    });
    v.querySelectorAll('[data-rmpreset]').forEach(b => b.onclick = () => { const id = rmK(b.dataset.rmpreset); Object.keys(rmPrep).forEach(k => { if (k.startsWith(id + '-')) delete rmPrep[k]; }); rmRe(); });
    v.querySelectorAll('[data-pic]').forEach(b => b.onclick = () => rmPicPick(b.dataset.pic));
    if (typeof rmMockBind === 'function') rmMockBind(v);
    v.querySelectorAll('[data-picsc]').forEach(b => b.onclick = () => rmPicScene(b.dataset.picsc));
    v.querySelectorAll('[data-rmkv]').forEach(b => b.onclick = () => { const box = b.closest('.rm-kv'); box.innerHTML = '<div class="rm-kv-frame"><iframe src="https://drive.google.com/file/d/' + b.dataset.rmkv + '/preview" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="Video hội thoại"></iframe></div><a class="btn sm" href="https://drive.google.com/file/d/' + b.dataset.rmkv + '/view" target="_blank" rel="noopener">Mở trong Google Drive ↗</a>'; });
    v.querySelectorAll('[data-ovq]').forEach(b => b.onclick = () => { const k = b.dataset.ovq.split(':'); rmOv[k[0]] = +k[1]; rmMarkDay(); rmRe(); });
    v.querySelectorAll('[data-ovreset]').forEach(b => b.onclick = () => { const w = b.dataset.ovreset; Object.keys(rmOv).forEach(k => { if (w === '1' ? !/^g/.test(k) : k.startsWith(w + '_')) delete rmOv[k]; }); rmRe(); });
    v.querySelectorAll('[data-rmday]').forEach(b => b.onclick = () => {
        const k = b.dataset.rmday;
        rmT = rmT.k === k ? { k: null } : { k, q: rmTodayItems(k).map((_, i) => i), i: 0, flip: false, said: {} };
        rmRe();
    });
    v.querySelectorAll('[data-rmtc]').forEach(b => b.onclick = () => rmTodayAct(b.dataset.rmtc));
    v.querySelectorAll('details[data-rmsec]').forEach(d => d.addEventListener('toggle', () => { rmOpen[d.dataset.rmsec] = d.open; }));
    v.querySelectorAll('[data-rmsay]').forEach(b => b.onclick = () => rmPlay(b.dataset.rmsay, b));
    v.querySelectorAll('[data-rmq]').forEach(b => b.onclick = () => { const [n, qi, oi] = b.dataset.rmq.split('-').map(Number); rmQuiz[n + '-' + qi] = oi; rmMarkDay(); rmRe(); });
    v.querySelectorAll('[data-rmqreset]').forEach(b => b.onclick = () => { const n = b.dataset.rmqreset; Object.keys(rmQuiz).forEach(k => { if (k.split('-')[0] === n) delete rmQuiz[k]; }); rmRe(); });
    v.querySelectorAll('[data-rmt]').forEach(c => c.onchange = () => {
        const id = c.dataset.rmt;
        if (/^d-/.test(id)) { rmMarkDay(id.slice(2)); }
        else { if (c.checked) rm.t[id] = true; else delete rm.t[id]; rmSave(); if (c.checked) rmMarkDay(); }
        const y = window.scrollY; rmRender(); window.scrollTo(0, y);
    });
    v.querySelectorAll('[data-rms]').forEach(b => b.onclick = () => {
        const n = +b.dataset.rms;
        const sk = rmLv === 4 ? 'sel4' : 'sel'; rm[sk] = b.closest('.rm-path') && rm[sk] === n ? 0 : n; rmSave();   // bấm lại trạm đang mở trên bản đồ → ẩn
        const y = window.scrollY; rmRender(); window.scrollTo(0, y);
        const p = v.querySelector('.rm-panel'); if (p && p.getBoundingClientRect().top > innerHeight - 120) p.scrollIntoView({ block: 'nearest' });
    });
    v.querySelectorAll('[data-rmd]').forEach(i => i.onchange = () => { if (i.value) { rm[i.dataset.rmd] = i.value; rmSave(); const y = window.scrollY; rmRender(); window.scrollTo(0, y); } });
    const k = v.querySelector('[data-rmkana]'); if (k) k.onclick = () => { rm.kana = !rm.kana; rmSave(); const y = window.scrollY; rmRender(); window.scrollTo(0, y); };
    v.querySelectorAll('[data-gto]').forEach(a => a.addEventListener('click', () => { window.hvnGramJump = +a.dataset.gto; }, true));
}
