/* ===================== Thi thử N5 (tự soạn, theo cấu trúc trang thi thử của hinelearn) =====================
   Dữ liệu: data/n5-mock.js (N5_MOCK, N5_MOCK_TYPES). Thẻ “Bộ đề thi thử N5” ở Giai đoạn 2 chỉ liệt kê đề; mỗi lần bấm LÀM BÀI sẽ MỞ TRANG MỚI
   (tab mới, đường dẫn #thi-thu-<số đề>-<all|a|b>) và trang đó vẽ bài thi toàn màn hình (renderMockExam, gọi từ script.js).
   Kết quả lưu ở hvn.rm.mock = { số đề (0-based): [{ d, m: chế độ, c: số câu đúng, n: tổng câu, s: điểm ước tính /120 }] }. Phải nạp SAU roadmap.js. */
const MK_RE = /^thi-thu-(\d+)-(all)$/;   // chỉ làm cả đề (A rồi B), không làm từng phần
const MK_MODE = { all: 'Làm cả đề' };
let rmMk = null;
let rmMkTick = 0;
const rmMkHist = t => ((rm.mock = rm.mock || {})[t] = rm.mock[t] || []);
const rmMkFmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const rmMkOrder = (t, p, qi) => rmHashOrder('mk' + t + '-' + p + '-' + qi, 4);
const rmMkNo = (p, qi) => N5_MOCK[rmMk.t].parts.slice(0, p).reduce((n, P) => n + P.qs.length, 0) + qi + 1;   // số câu liên tục: A, B rồi Nghe
const rmMkNq = T => T.parts.reduce((n, p) => n + p.qs.length, 0);
const rmMkMin = T => T.parts.reduce((n, p) => n + p.min, 0);

/* ----- Thẻ trong Giai đoạn 2: danh sách đề, mỗi nút mở trang mới ----- */
function rmMockCard() {
    if (typeof N5_MOCK !== 'object') return '';
    const done = N5_MOCK.filter((x, t) => rmMkHist(t).length).length;
    let h = '<p class="hint">Mỗi đề <b>' + rmMkNq(N5_MOCK[0]) + ' câu · ' + rmMkMin(N5_MOCK[0]) + ' phút</b> theo cấu trúc JLPT N5 (chữ – từ vựng, ngữ pháp – đọc hiểu, nghe hiểu), làm liền một mạch với một đồng hồ. ' +
        'Bấm nút để mở bài thi ở <b>trang mới</b>; nộp bài rồi mới thấy điểm và lời giải. Đề do Claude tự soạn, không chép đề thật (JLPT không công bố đề các năm). Phần Nghe có file âm thanh giọng nam/nữ (cần loa hoặc tai nghe).</p><div class="mk-list">';
    N5_MOCK.forEach((T, t) => {
        const H = rmMkHist(t), last = H[H.length - 1];
        h += '<div class="mk-item"><div><b>' + esc(T.name) + '</b><span class="rm-vi">' + rmMkNq(T) + ' câu · ' + rmMkMin(T) + ' phút' +
            (last ? ' · gần nhất ' + fmtD(parseYmd(last.d)) + ' (' + MK_MODE[last.m] + '): ' + last.c + '/' + last.n + ' ≈ ' + last.s + '/' + (last.x || 120) : ' · chưa làm') + '</span></div>' +
            '<div class="mk-go"><a class="btn pri" href="thi-thu-n5.html?de=' + (t + 1) + '" target="_blank" rel="noopener">' + (H.length ? 'Làm lại' : 'Làm bài') + ' ↗</a></div></div>';
    });
    const cnt = k => N5_MOCK[0].parts.reduce((n, P) => n + P.qs.filter(q => q[0] === k).length, 0);
    h += '</div><span class="lbl rm-sub">Đề gồm những dạng câu nào</span><ul class="rm-tips"><li>' + Object.keys(N5_MOCK_TYPES).map(k => N5_MOCK_TYPES[k] + ' ' + cnt(k)).join(' · ') + '</li>' +
        '<li>Thang điểm 180: Kiến thức ngôn ngữ · Đọc 120 (sàn 38) + Nghe 60 (sàn 19); đậu khi tổng từ 80 và không dưới điểm sàn từng phần. Điểm ở đây là <b>ước tính theo tỉ lệ câu đúng</b>.</li></ul>';
    return '<details class="card rm-fold" data-rmsec="mock"' + (rmOpen.mock ? ' open' : '') + '><summary><span class="rm-ft"><b>Bộ đề thi thử N5</b> <span class="jp" lang="ja">模擬試験</span>' +
        '<span class="rm-fsub">' + N5_MOCK.length + ' đề · ' + rmMkNq(N5_MOCK[0]) + ' câu · mở ở trang mới</span></span><span class="rm-fprog num' + (done >= N5_MOCK.length ? ' ok-t' : '') + '">' + done + '/' + N5_MOCK.length + '</span></summary>' + h + '</details>';
}
function rmMockBind() { }   // (giữ để roadmap.js gọi nếu còn; trang làm bài tự gắn sự kiện)

/* ----- Trang làm bài ----- */
function rmMkStart(t, mode) {
    const T = N5_MOCK[t];
    rmMk = { t, mode, steps: T.parts.map((P, i) => i), si: 0, ans: T.parts.map(() => ({})), end: Date.now() + rmMkMin(T) * 60000, done: false, wrong: false, retry: null };
}
function renderMockExam(num, mode) {
    clearInterval(rmMkTick);
    const t = num - 1, T = typeof N5_MOCK === 'object' ? N5_MOCK[t] : null;
    if (!T) { go('lo-trinh'); return; }
    if (!rmMk || rmMk.t !== t || rmMk.mode !== mode) rmMkStart(t, mode);
    rmMkDraw();
}
const rmMkHead = () => '<nav class="crumbs"><a href="index.html#lo-trinh">Lộ trình N5</a><span class="sep" aria-hidden="true">›</span><span aria-current="page">Thi thử · ' + esc(N5_MOCK[rmMk.t].name) + ' · ' + MK_MODE[rmMk.mode] + '</span></nav>';
/* ----- Phần Nghe: đọc kịch bản bằng giọng đọc của trình duyệt (speechSynthesis) ----- */
const rmMkIsL = type => String(type).charAt(0) === 'l';
const rmMkMax = type => (type === 'l1' || type === 'l2') ? 2 : 1;   // đề thật: dạng 1–2 nghe 2 lần, dạng 3–4 nghe 1 lần
let rmMkSpk = 0;
const rmMkAu = new Audio();   // file mp3 audio/mock/t<đề>-<câu>.mp3 (tạo bằng edge-tts); giọng đọc trình duyệt chỉ là dự phòng
function rmMkPlay(p, qi, script, onEnd, onFail) {
    rmMkStop();
    const id = rmMkSpk, fallback = () => { if (id !== rmMkSpk) return; if (!rmMkSpeak(script, onEnd)) onFail(); };
    rmMkAu.onended = () => { if (id === rmMkSpk) onEnd(); };
    rmMkAu.onerror = fallback;
    rmMkAu.src = 'audio/mock/t' + (rmMk.t + 1) + '-' + String(qi).padStart(2, '0') + '.mp3';
    const pr = rmMkAu.play(); if (pr && pr.catch) pr.catch(fallback);
}
function rmMkStop() { rmMkSpk++; try { rmMkAu.onended = null; rmMkAu.onerror = null; rmMkAu.pause(); } catch (e) { } try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { } document.querySelectorAll('.mk-play.on').forEach(b => b.classList.remove('on')); }
function rmMkSpeak(script, onEnd) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
    rmMkStop(); const id = rmMkSpk, lines = String(script).split('\n').filter(Boolean);
    let vs = []; try { vs = speechSynthesis.getVoices().filter(v => /^ja/i.test(v.lang)); } catch (e) { }
    let i = 0;
    const next = () => {
        if (id !== rmMkSpk) return;
        if (i >= lines.length) { if (onEnd) onEnd(); return; }
        const line = lines[i++], m = line.match(/^(男|女|問)[：:]\s*(.*)$/), who = m ? m[1] : '問', u = new SpeechSynthesisUtterance(m ? m[2] : line);
        u.lang = 'ja-JP'; u.rate = 0.85; u.pitch = who === '男' ? 0.7 : who === '女' ? 1.25 : 1;
        if (vs.length) u.voice = (who === '男' && vs.length > 1) ? vs[vs.length - 1] : vs[0];
        u.onend = () => setTimeout(next, who === '問' ? 600 : 400); u.onerror = () => { if (id === rmMkSpk) setTimeout(next, 200); };
        speechSynthesis.speak(u);
    };
    next(); return true;
}
function rmMkScriptHtml(sc) {
    const LB = { '男': 'Nam', '女': 'Nữ', '問': 'Câu hỏi' };
    return '<div class="mk-script"><b>Lời nghe</b>' + String(sc).split('\n').filter(Boolean).map(l => { const m = l.match(/^(男|女|問)[：:]\s*(.*)$/); return '<p><i>' + (m ? LB[m[1]] : '') + '</i> ' + rmJa(m ? m[2] : l) + '</p>'; }).join('') + '</div>';
}

function rmMkAud(p, qi, type) {
    const free = !!rmMk.retry, used = (rmMk.plays || {})[p + ':' + qi] || 0, left = rmMkMax(type) - used;
    return '<div class="mk-aud"><button type="button" class="btn pri mk-play" data-mkplay="' + p + ':' + qi + '"' + (!free && left <= 0 ? ' disabled' : '') + '>▶ Nghe</button><span class="hint mk-left">' + (free ? 'Nghe không giới hạn' : 'Còn ' + Math.max(0, left) + ' lần nghe') + '</span></div>';
}
function rmMkQuestion(p, qi, shown, qs) {
    const [type, stem, opts, , psg0] = qs[qi], pick = rmMk.ans[p][qi], prev = shown, L = rmMkIsL(type), psg = L ? null : psg0;
    return (psg && (!prev || prev[4] !== psg) ? rmPassage(psg) : '') + '<div class="rm-q" id="mkq-' + p + '-' + qi + '"><p class="rm-qq">' + rmMkNo(p, qi) + '. ' + (L ? (stem ? rmJaU(stem) : '<span class="rm-vi">Nghe rồi chọn đáp án đúng.</span>') : rmJaU(stem).replace(/★/g, '<b class="rm-star">★</b>')) + '</p>' + (L ? rmMkScene(psg0, stem, type) + rmMkAud(p, qi, type) : '') + '<div class="rm-opts">' +
        rmMkOrder(rmMk.t, p, qi).map(oi => '<button type="button" class="rm-opt' + (pick === oi ? ' mk-sel' : '') + '" data-mkans="' + p + ':' + qi + ':' + oi + '">' + rmJa(opts[oi]) + '</button>').join('') + '</div></div>';
}
const rmMkCirc = ['①', '②', '③', '④'];
function rmMkSheet(list, answered) {
    const T = N5_MOCK[rmMk.t], SEC = ['言語知識（文字・語彙）', '言語知識（文法）・読解', '聴解'];
    let h = '<aside class="mk-sheet" id="mkSheet"><button type="button" class="mk-sheet-t" data-mksheet="1" aria-expanded="false"><b>Phiếu trả lời <span class="jp" lang="ja">解答用紙</span></b><span><span id="mkCnt2">' + answered + '</span>/' + list.length + ' câu đã chọn ▾</span></button><div class="mk-sheet-b">' +
        '<div class="mk-sh-head"><b class="jp" lang="ja">N5 ' + esc(T.name.replace(/\D+/g, '') ? '第' + T.name.replace(/\D+/g, '') + '回' : T.name) + '</b><span class="mk-sh-name"><span class="jp" lang="ja">なまえ</span> Name</span></div>';
    let curP = -1, curT = null, bn = 0, open = false;
    const closeBlock = () => { if (open) h += '</div></div>'; open = false; };
    list.forEach(([p, qi]) => {
        const type = T.parts[p].qs[qi][0], pick = rmMk.ans[p][qi];
        if (p !== curP) { closeBlock(); if (curP >= 0) h += '</div>'; h += '<div class="mk-sec"><div class="mk-sec-t jp" lang="ja">' + SEC[p] + '</div><div class="mk-blocks">'; curP = p; curT = null; bn = 0; }
        if (type !== curT) { closeBlock(); bn++; curT = type; h += '<div class="mk-blk"><div class="mk-blk-t jp" lang="ja">もんだい' + bn + '</div><div class="mk-blk-b">'; open = true; }
        h += '<div class="mk-row" id="mkr-' + p + '-' + qi + '"><a class="mk-no" href="#mkq-' + p + '-' + qi + '" data-mkgo="mkq-' + p + '-' + qi + '">' + rmMkNo(p, qi) + '</a>' +
            rmMkOrder(rmMk.t, p, qi).map((oi, k) => '<button type="button" class="mk-bub' + (pick === oi ? ' mk-sel' : '') + '" data-mkans="' + p + ':' + qi + ':' + oi + '" aria-label="Câu ' + rmMkNo(p, qi) + ' chọn ' + (k + 1) + '">' + rmMkCirc[k] + '</button>').join('') + '</div>';
    });
    closeBlock(); if (curP >= 0) h += '</div></div>';
    return h + '</div></aside>';
}
function rmMkPick(p, qi, oi) {
    rmMk.ans[p][qi] = oi;
    document.querySelectorAll('[data-mkans^="' + p + ':' + qi + ':"]').forEach(b => b.classList.toggle('mk-sel', +b.dataset.mkans.split(':')[2] === oi));
    const n = document.querySelectorAll('.mk-row').length ? [...document.querySelectorAll('.mk-row')].filter(r => r.querySelector('.mk-sel')).length : 0;
    ['mkCnt', 'mkCnt2'].forEach(id => { const el = $(id); if (el) el.textContent = n; });
}
function rmMkDraw() {
    const T = N5_MOCK[rmMk.t], v = $('view');
    if (rmMk.done) { v.innerHTML = rmMkHead() + rmMkResult(); rmMkBindPage(); return; }
    const retry = rmMk.retry;
    const list = retry ? retry.map(([pp, qi]) => [pp, qi]) : [].concat(...T.parts.map((P, pp) => P.qs.map((q, qi) => [pp, qi])));
    const answered = list.filter(([pp, qi]) => rmMk.ans[pp][qi] != null).length;
    let h = rmMkHead() + '<section class="card mk-page"><div class="mk-bar"><div><b>' + esc(T.name) + '</b>' + (retry ? ' · Làm lại câu sai' : '') + '</div>' +
        (retry ? '' : '<div class="mk-clock" id="mkClock" role="timer">' + rmMkFmt(Math.max(0, Math.round((rmMk.end - Date.now()) / 1000))) + '</div>') + '</div>' +
        '<p class="hint">Đã trả lời <b id="mkCnt">' + answered + '</b>/' + list.length + '.' + (retry ? '' : ' Hết giờ, bài tự nộp.') + ' Không có đáp án cho tới khi nộp bài.</p>';
    let prevQ = null;
    h += '<div class="mk-wrap"><div class="mk-qs">';
    list.forEach(([pp, qi]) => { const qs = T.parts[pp].qs; h += rmMkQuestion(pp, qi, prevQ && prevQ.p === pp && prevQ.qi === qi - 1 ? qs[qi - 1] : null, qs); prevQ = { p: pp, qi }; });
    h += '<div class="row"><button type="button" class="btn pri" data-mksubmit="1">Nộp bài và xem kết quả</button><a class="btn sm" href="index.html#lo-trinh" data-mkquit="1">Thoát</a></div></div>' + rmMkSheet(list, answered) + '</div></section>';
    v.innerHTML = h; rmMkBindPage();
    window.scrollTo(0, 0);
}
function rmMkScoreOf(parts) {
    const T = N5_MOCK[rmMk.t], byType = {}; let c = 0, n = 0;
    parts.forEach(p => T.parts[p].qs.forEach(([type], qi) => { const ok = rmMk.ans[p][qi] === 0; n++; if (ok) c++; (byType[type] = byType[type] || [0, 0])[1]++; if (ok) byType[type][0]++; }));
    return { c, n, byType };
}
function rmMkEst() {
    const T = N5_MOCK[rmMk.t], lp = rmMk.steps.filter(p => !T.parts[p].qs.some(q => rmMkIsL(q[0]))), hp = rmMk.steps.filter(p => T.parts[p].qs.some(q => rmMkIsL(q[0])));
    const A = rmMkScoreOf(lp), B = hp.length ? rmMkScoreOf(hp) : null, la = Math.round(A.c / A.n * 120), li = B ? Math.round(B.c / B.n * 60) : 0;
    return { A, B, la, li, tot: la + li, max: B ? 180 : 120, pass: B ? (la + li >= 80 && la >= 38 && li >= 19) : la >= 38 };
}
function rmMkResult() {
    const T = N5_MOCK[rmMk.t];
    if (rmMk.retry) {
        const items = rmMk.retry, c = items.filter(([p, qi]) => rmMk.ans[p][qi] === 0).length;
        return '<section class="card mk-page"><div class="mk-score"><b class="num">' + c + '/' + items.length + '</b><span>Làm lại các câu sai: đúng ' + c + ' / ' + items.length + ' câu.</span></div>' + rmMkReview(items) +
            '<div class="row"><button type="button" class="btn pri" data-mkagain="1">Làm lại cả đề này</button><a class="btn sm" href="index.html#lo-trinh">Về Lộ trình N5</a></div></section>';
    }
    const S = rmMkScoreOf(rmMk.steps), E = rmMkEst(), pc = S.c / S.n;
    const items = [];
    rmMk.steps.forEach(p => T.parts[p].qs.forEach((q, qi) => items.push([p, qi])));
    const wrong = items.filter(([p, qi]) => rmMk.ans[p][qi] !== 0);
    const sub = (name, got, max, floor, n) => '<li><span>' + name + '</span><span class="mk-bar2"><i style="width:' + (got / max * 100) + '%"></i></span><b class="num ' + (got >= floor ? 'ok-t' : 'ng-t') + '">' + got + '/' + max + '</b></li>';
    let h = '<section class="card mk-page"><div class="mk-score"><b class="num">' + E.tot + '/' + E.max + '</b><span>điểm ước tính · đúng ' + S.c + '/' + S.n + ' câu (' + Math.round(pc * 100) + '%)<br><span class="' + (E.pass ? 'ok-t' : 'ng-t') + '">' + (E.pass ? (E.B ? 'Đạt mức đậu N5 (từ 80/180 và đủ điểm sàn từng phần).' : 'Vượt điểm sàn 38/120.') : (E.B ? 'Chưa đạt: cần tổng từ 80/180, Kiến thức · Đọc từ 38, Nghe từ 19.' : 'Dưới điểm sàn 38/120.')) + '</span></span></div>' +
        '<ul class="mk-parts">' + sub('Kiến thức ngôn ngữ · Đọc (sàn 38)', E.la, 120, 38) + (E.B ? sub('Nghe hiểu (sàn 19)', E.li, 60, 19) : '') + '</ul>' +
        '<p class="hint">Điểm quy theo tỉ lệ câu đúng; JLPT thật quy điểm theo độ khó từng câu nên có thể lệch.</p>' +
        '<span class="lbl rm-sub">Kết quả theo dạng câu</span><ul class="mk-parts">' + Object.keys(S.byType).map(k => '<li><span>' + esc(N5_MOCK_TYPES[k]) + '</span><span class="mk-bar2"><i style="width:' + (S.byType[k][0] / S.byType[k][1] * 100) + '%"></i></span><b class="num">' + S.byType[k][0] + '/' + S.byType[k][1] + '</b></li>').join('') + '</ul>';
    const bad = [...new Set(wrong.map(([p, qi]) => T.parts[p].qs[qi][0]))];
    if (bad.length) h += '<span class="lbl rm-sub">Ôn lại ở đâu</span><ul class="rm-tips">' +
        (bad.some(k => 'kwcs'.includes(k)) ? '<li><a href="index.html#lo-trinh">Lộ trình N5 › Giai đoạn 2 › Từ vựng</a> và mục Kanji N5 (từ vựng, chữ Hán, cách viết).</li>' : '') +
        (bad.some(k => 'go'.includes(k)) ? '<li><a href="index.html#lo-trinh">Lộ trình N5 › Tổng quan ngữ pháp N5</a> (trợ từ, chia động từ, 61 mẫu).</li>' : '') +
        (bad.some(k => 'frmi'.includes(k)) ? '<li><a href="index.html#lo-trinh">Lộ trình N5 › Giai đoạn 2 › Ngữ pháp · Đọc</a> (cách làm các dạng đọc hiểu).</li>' : '') +
        (bad.some(rmMkIsL) ? '<li>Phần Nghe: xem lời nghe ở các câu sai bên dưới và bấm ▶ Nghe lại nhiều lần; luyện nghe hội thoại ở các trạm trong Lộ trình N5.</li>' : '') + '</ul>';
    h += '<div class="row">' + (wrong.length ? '<button type="button" class="btn pri" data-mkretry="1">Làm lại ' + wrong.length + ' câu sai</button><button type="button" class="btn" data-mkcopy="1">Chép câu sai để hỏi AI</button>' : '') +
        '<button type="button" class="btn" data-mkagain="1">Làm lại cả đề</button><button type="button" class="btn sm" data-mkwrong="1" aria-pressed="' + !!rmMk.wrong + '">' + (rmMk.wrong ? 'Xem tất cả câu' : 'Chỉ xem câu sai') + '</button><a class="btn sm" href="index.html#lo-trinh">Về Lộ trình N5</a></div><span class="hint mk-msg" role="status"></span>' +
        rmMkReview(rmMk.wrong ? wrong : items) + '</section>';
    return h;
}
function rmMkReview(items) {
    const T = N5_MOCK[rmMk.t]; let h = '', prev = null;
    items.forEach(([p, qi]) => {
        const [type, stem, opts, why, psg0] = T.parts[p].qs[qi], pick = rmMk.ans[p][qi], ok = pick === 0, L = rmMkIsL(type), psg = L ? null : psg0;
        h += (psg && !(prev && prev.p === p && prev.qi === qi - 1 && T.parts[p].qs[qi - 1][4] === psg) ? rmPassage(psg) : '') + '<div class="rm-q"><p class="rm-qq">' + rmMkNo(p, qi) + '. ' + (L ? (stem ? rmJaU(stem) : '<span class="rm-vi">Nghe rồi chọn đáp án đúng.</span>') : rmJaU(stem).replace(/★/g, '<b class="rm-star">★</b>')) + '</p>' +
            (L ? rmMkScene(psg0, stem, type) + '<div class="mk-aud"><button type="button" class="btn sm mk-play" data-mkplay="' + p + ':' + qi + '">▶ Nghe lại</button></div>' : '') + '<div class="rm-opts">' +
            rmMkOrder(rmMk.t, p, qi).map(oi => '<button type="button" class="rm-opt' + (oi === 0 ? ' right' : oi === pick ? ' wrong' : '') + '" disabled>' + rmJa(opts[oi]) + '</button>').join('') + '</div>' + (L ? rmMkScriptHtml(psg0) : '') +
            '<p class="rm-why ' + (ok ? 'ok-t' : 'ng-t') + '">' + (ok ? '✓ Đúng. ' : pick == null ? '✗ Chưa trả lời. ' : '✗ Chưa đúng. ') + '<span>' + rmKanaTip(why) + '</span></p></div>';
        prev = { p, qi };
    });
    return h;
}
function rmMkSubmit(auto) {
    const T = N5_MOCK[rmMk.t];
    clearInterval(rmMkTick); rmMk.done = true; rmMkStop();
    if (!rmMk.retry) { const S = rmMkScoreOf(rmMk.steps), E = rmMkEst(); rmMkHist(rmMk.t).push({ d: ymd(new Date()), m: rmMk.mode, c: S.c, n: S.n, s: E.tot, x: E.max }); rmSave(); try { rmMarkDay(); } catch (e) { } }
    rmMkDraw(); window.scrollTo(0, 0);
}
function rmMkBindPage() {
    const v = $('view'); clearInterval(rmMkTick);
    if (!rmMk.done && !rmMk.retry) rmMkTick = setInterval(() => {
        const el = $('mkClock'); if (!el) { clearInterval(rmMkTick); return; }
        const left = Math.max(0, Math.round((rmMk.end - Date.now()) / 1000)); el.textContent = rmMkFmt(left); el.classList.toggle('low', left <= 60);
        if (left <= 0) rmMkSubmit(true);
    }, 500);
    v.querySelectorAll('[data-mkans]').forEach(b => b.onclick = () => {
        const [p, qi, oi] = b.dataset.mkans.split(':').map(Number); rmMkPick(p, qi, oi);
    });
    v.querySelectorAll('[data-mkgo]').forEach(a => a.onclick = e => { e.preventDefault(); e.stopPropagation(); const el = $(a.dataset.mkgo); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    v.querySelectorAll('[data-mksheet]').forEach(b => b.onclick = () => { const sh = $('mkSheet'), o = sh.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
    v.querySelectorAll('[data-mkplay]').forEach(b => b.onclick = () => {
        if (b.classList.contains('on')) return;
        const [p, qi] = b.dataset.mkplay.split(':').map(Number), q = N5_MOCK[rmMk.t].parts[p].qs[qi], free = rmMk.done || !!rmMk.retry, key = p + ':' + qi;
        rmMk.plays = rmMk.plays || {};
        if (!free) { if (rmMkMax(q[0]) - (rmMk.plays[key] || 0) <= 0) return; rmMk.plays[key] = (rmMk.plays[key] || 0) + 1; const l = b.parentNode.querySelector('.mk-left'), left = rmMkMax(q[0]) - rmMk.plays[key]; if (l) l.textContent = 'Còn ' + left + ' lần nghe'; }
        rmMkPlay(p, qi, q[4], () => { b.classList.remove('on'); if (!free && rmMkMax(q[0]) - rmMk.plays[key] <= 0) b.disabled = true; },
            () => { b.classList.remove('on'); const m = b.parentNode; if (!m.querySelector('.mk-nov')) m.insertAdjacentHTML('beforeend', '<span class="hint mk-nov">Không phát được âm thanh; kiểm tra loa, mạng và thử tải lại trang.</span>'); });
        b.classList.add('on');
    });
    v.querySelectorAll('[data-mksubmit]').forEach(b => b.onclick = () => rmMkSubmit(false));
    v.querySelectorAll('[data-mkagain]').forEach(b => b.onclick = () => { rmMkStart(rmMk.t, rmMk.mode); rmMkDraw(); });
    v.querySelectorAll('[data-mkwrong]').forEach(b => b.onclick = () => { rmMk.wrong = !rmMk.wrong; rmMkDraw(); });
    v.querySelectorAll('[data-mkretry]').forEach(b => b.onclick = () => {
        const T = N5_MOCK[rmMk.t], items = [];
        rmMk.steps.forEach(p => T.parts[p].qs.forEach((q, qi) => { if (rmMk.ans[p][qi] !== 0) items.push([p, qi]); }));
        const keep = rmMk; rmMk = { t: keep.t, mode: keep.mode, steps: keep.steps, si: 0, ans: T.parts.map(() => ({})), end: 0, done: false, wrong: false, retry: items }; rmMkDraw();
    });
    v.querySelectorAll('[data-mkcopy]').forEach(b => b.onclick = () => {
        const T = N5_MOCK[rmMk.t]; let out = 'Mình vừa làm thi thử JLPT N5 và làm sai các câu sau. Hãy giải thích bằng tiếng Việt vì sao đáp án đúng là đáp án đó:\n\n', n = 0;
        rmMk.steps.forEach(p => T.parts[p].qs.forEach(([type, stem, opts, why, psg], qi) => {
            if (rmMk.ans[p][qi] === 0) return; n++;
            out += n + '. ' + (psg ? (rmMkIsL(type) ? '[Lời nghe] ' : '[Đoạn văn] ') + plainJa(psg).replace(/\n/g, ' ') + '\n   ' : '') + plainJa(stem) + '\n   Lựa chọn: ' + opts.map(o => plainJa(o)).join(' / ') + '\n   Đáp án đúng: ' + plainJa(opts[0]) + '\n';
        }));
        const msg = v.querySelector('.mk-msg'), ok = () => { if (msg) msg.textContent = 'Đã chép ' + n + ' câu sai. Dán vào ChatGPT, Gemini hoặc Claude để được giải thích.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).then(ok, () => { if (msg) msg.textContent = 'Không chép được; hãy thử trên trình duyệt khác.'; });
        else if (msg) msg.textContent = 'Trình duyệt này không cho chép tự động.';
    });
}
function rmMkDrawKeep(y) { rmMkDraw(); window.scrollTo(0, y); }
