/* ===================== Bộ đề thi thử N5 (tự soạn) — Giai đoạn 2 của Lộ trình N5 =====================
   Dữ liệu: data/n5-mock.js (N5_MOCK). Mỗi đề có 2 phần tính giờ: Chữ・từ vựng và Ngữ pháp・đọc hiểu (chưa có phần nghe).
   Lưu kết quả trong hvn.rm.mock = { số đề: [{ d, v:[đúng, tổng], g:[đúng, tổng] }] }. Phải nạp SAU roadmap.js. */
let rmMk = null;   // phiên đang làm: { t, p, ans: [{}, {}], end, done, wrong }
let rmMkTick = 0;
const rmMkHist = t => ((rm.mock = rm.mock || {})[t] = rm.mock[t] || []);
const rmMkFmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const rmMkOrder = (t, p, qi) => rmHashOrder('mk' + t + '-' + p + '-' + qi, 4);

function rmMockCard() {
    if (typeof N5_MOCK !== 'object') return '';
    const tried = N5_MOCK.filter((x, t) => rmMkHist(t).length).length;
    const body = rmMk ? (rmMk.done ? rmMkResult() : rmMkExam()) : rmMkHome();
    return '<details class="card rm-fold" data-rmsec="mock"' + (rmOpen.mock || rmMk ? ' open' : '') + '><summary><span class="rm-ft"><b>Bộ đề thi thử N5</b> <span class="jp" lang="ja">模擬試験</span>' +
        '<span class="rm-fsub">' + N5_MOCK.length + ' đề tự soạn theo cấu trúc JLPT · tính giờ · chấm điểm</span></span><span class="rm-fprog num' + (tried >= N5_MOCK.length ? ' ok-t' : '') + '">' + tried + '/' + N5_MOCK.length + '</span></summary>' + body + '</details>';
}
function rmMkHome() {
    let h = '<p class="hint">Mỗi đề gồm 2 phần có đồng hồ đếm ngược: <b>文字・語彙</b> (20 câu, 15 phút) và <b>文法・読解</b> (20 câu, 25 phút). Đề do Claude tự soạn bám cấu trúc JLPT N5; JLPT không công bố đề thật các năm nên trang không chép đề thi thật. Phần nghe (聴解) chưa có.</p><div class="mk-list">';
    N5_MOCK.forEach((T, t) => {
        const H = rmMkHist(t), last = H[H.length - 1], best = H.reduce((m, x) => Math.max(m, x.v[0] + x.g[0]), -1), tot = T.parts.reduce((n, p) => n + p.qs.length, 0);
        h += '<div class="mk-item"><div><b>' + esc(T.name) + '</b><span class="rm-vi">' + tot + ' câu · ' + T.parts.reduce((n, p) => n + p.min, 0) + ' phút' +
            (last ? ' · lần gần nhất ' + fmtD(parseYmd(last.d)) + ': ' + (last.v[0] + last.g[0]) + '/' + tot + ' · cao nhất ' + best + '/' + tot : ' · chưa làm') + '</span></div>' +
            '<button type="button" class="btn pri" data-mkstart="' + t + '">' + (H.length ? 'Làm lại' : 'Bắt đầu') + '</button></div>';
    });
    return h + '</div>';
}
function rmMkQuestion(qs, qi, p, t, prev) {
    const [type, stem, opts, , psg] = qs[qi], pick = rmMk.ans[p][qi];
    let h = '';
    if (psg && (!prev || prev[4] !== psg)) h += rmPassage(psg);
    return h + '<div class="rm-q"><p class="rm-qq">' + (qi + 1) + '. ' + rmJaU(stem).replace(/★/g, '<b class="rm-star">★</b>') + '</p><div class="rm-opts">' +
        rmMkOrder(t, p, qi).map(oi => '<button type="button" class="rm-opt' + (pick === oi ? ' mk-sel' : '') + '" data-mkans="' + qi + ':' + oi + '">' + rmJa(opts[oi]) + '</button>').join('') + '</div></div>';
}
function rmMkExam() {
    const T = N5_MOCK[rmMk.t], P = T.parts[rmMk.p], ans = rmMk.ans[rmMk.p], done = Object.keys(ans).length;
    const left = Math.max(0, Math.round((rmMk.end - Date.now()) / 1000));
    return '<div class="mk-bar"><div><b>' + esc(T.name) + '</b> · Phần ' + (rmMk.p + 1) + '/' + T.parts.length + ': <span class="jp" lang="ja">' + esc(P.title.split('（')[0]) + '</span></div>' +
        '<div class="mk-clock" id="mkClock" role="timer">' + rmMkFmt(left) + '</div></div><p class="hint">Đã trả lời ' + done + '/' + P.qs.length + '. Hết giờ, bài sẽ tự nộp.</p>' +
        P.qs.map((q, qi) => rmMkQuestion(P.qs, qi, rmMk.p, rmMk.t, P.qs[qi - 1])).join('') +
        '<div class="row"><button type="button" class="btn pri" data-mksubmit="1">' + (rmMk.p + 1 < T.parts.length ? 'Nộp phần này, sang phần tiếp' : 'Nộp bài và xem kết quả') + '</button><button type="button" class="btn sm" data-mkquit="1">Thoát</button></div>';
}
function rmMkScore() {
    const T = N5_MOCK[rmMk.t];
    return T.parts.map((P, p) => ({ P, c: P.qs.filter((q, qi) => rmMk.ans[p][qi] === 0).length, n: P.qs.length }));
}
function rmMkResult() {
    const T = N5_MOCK[rmMk.t], S = rmMkScore(), c = S.reduce((n, x) => n + x.c, 0), n = S.reduce((m, x) => m + x.n, 0), pc = Math.round(c / n * 100);
    const msg = pc >= 80 ? ['ok-t', 'Rất tốt: bạn đang vững ở mức có thể đậu N5.'] : pc >= 60 ? ['mid-t', 'Khá: ôn lại các câu sai rồi làm đề tiếp theo.'] : ['ng-t', 'Cần ôn thêm: xem lại giải thích ở các câu sai.'];
    let h = '<div class="mk-score"><b class="num">' + c + '/' + n + '</b><span>' + pc + '% · <span class="' + msg[0] + '">' + msg[1] + '</span></span></div><ul class="mk-parts">' +
        S.map(x => '<li><span class="jp" lang="ja">' + esc(x.P.title.split('（')[0]) + '</span><b class="num">' + x.c + '/' + x.n + '</b></li>').join('') + '</ul>' +
        '<div class="row"><button type="button" class="btn sm" data-mkwrong="1" aria-pressed="' + !!rmMk.wrong + '">' + (rmMk.wrong ? 'Xem tất cả câu' : 'Chỉ xem câu sai') + '</button>' +
        '<button type="button" class="btn" data-mkstart="' + rmMk.t + '">Làm lại đề này</button><button type="button" class="btn sm" data-mkquit="1">Về danh sách</button></div>';
    T.parts.forEach((P, p) => {
        h += '<span class="lbl rm-sub">' + esc(P.title) + '</span>';
        P.qs.forEach(([type, stem, opts, why, psg], qi) => {
            const pick = rmMk.ans[p][qi], ok = pick === 0;
            if (rmMk.wrong && ok) return;
            const prev = P.qs[qi - 1];
            h += (psg && (!prev || prev[4] !== psg) ? rmPassage(psg) : '') + '<div class="rm-q"><p class="rm-qq">' + (qi + 1) + '. ' + rmJaU(stem) + '</p><div class="rm-opts">' +
                rmMkOrder(rmMk.t, p, qi).map(oi => '<button type="button" class="rm-opt' + (oi === 0 ? ' right' : oi === pick ? ' wrong' : '') + '" disabled>' + rmJa(opts[oi]) + '</button>').join('') + '</div>' +
                '<p class="rm-why ' + (ok ? 'ok-t' : 'ng-t') + '">' + (ok ? '✓ Đúng. ' : pick == null ? '✗ Chưa trả lời. ' : '✗ Chưa đúng. ') + '<span>' + rmKanaTip(why) + '</span></p></div>';
        });
    });
    return h;
}
function rmMkSubmit() {
    const T = N5_MOCK[rmMk.t];
    if (rmMk.p + 1 < T.parts.length) { rmMk.p++; rmMk.end = Date.now() + T.parts[rmMk.p].min * 60000; rmRe(); window.scrollTo(0, document.querySelector('details[data-rmsec="mock"]').getBoundingClientRect().top + window.scrollY - 80); return; }
    rmMk.done = true; clearInterval(rmMkTick);
    const S = rmMkScore(); rmMkHist(rmMk.t).push({ d: ymd(new Date()), v: [S[0].c, S[0].n], g: [S[1].c, S[1].n] }); rmSave(); rmMarkDay();
    rmRe();
}
function rmMockBind(v) {
    clearInterval(rmMkTick);
    if (rmMk && !rmMk.done) rmMkTick = setInterval(() => {
        const el = document.getElementById('mkClock'); if (!el) { clearInterval(rmMkTick); return; }
        const left = Math.max(0, Math.round((rmMk.end - Date.now()) / 1000)); el.textContent = rmMkFmt(left); el.classList.toggle('low', left <= 60);
        if (left <= 0) rmMkSubmit();
    }, 500);
    v.querySelectorAll('[data-mkstart]').forEach(b => b.onclick = () => {
        const t = +b.dataset.mkstart; rmOpen.mock = true;
        rmMk = { t, p: 0, ans: N5_MOCK[t].parts.map(() => ({})), end: Date.now() + N5_MOCK[t].parts[0].min * 60000, done: false, wrong: false }; rmRe();
        window.scrollTo(0, document.querySelector('details[data-rmsec="mock"]').getBoundingClientRect().top + window.scrollY - 80);
    });
    v.querySelectorAll('[data-mkans]').forEach(b => b.onclick = () => { const [qi, oi] = b.dataset.mkans.split(':').map(Number); rmMk.ans[rmMk.p][qi] = oi; rmRe(); });
    v.querySelectorAll('[data-mksubmit]').forEach(b => b.onclick = () => rmMkSubmit());
    v.querySelectorAll('[data-mkquit]').forEach(b => b.onclick = () => { if (rmMk && !rmMk.done && !confirm('Thoát và bỏ bài đang làm?')) return; rmMk = null; clearInterval(rmMkTick); rmRe(); });
    v.querySelectorAll('[data-mkwrong]').forEach(b => b.onclick = () => { rmMk.wrong = !rmMk.wrong; rmRe(); });
}
