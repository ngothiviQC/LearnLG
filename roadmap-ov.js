/* ===================== Tổng quan ngữ pháp N5: Trợ từ · Chia động từ · 61 mẫu =====================
   Hiện trong Lộ trình N5 (roadmap.js) giữa Giai đoạn 1 và Giai đoạn 2, để xem lại trước khi luyện đề.
   Dữ liệu: data/n5-overview.js. Ô “Nhớ rồi” lưu trong hvn.rm.t với mã ov-p-*, ov-v-*, ov-g-*. Phải nạp SAU roadmap.js. */
let rmOv = {};   // đáp án 10 câu điền trợ từ (không lưu)

const OV_E = {   // đuôi động từ nhóm 1: [thân ます, thể て, thân ない, thể た]
    'く': ['き', 'いて', 'か', 'いた'], 'ぐ': ['ぎ', 'いで', 'が', 'いだ'], 'す': ['し', 'して', 'さ', 'した'], 'つ': ['ち', 'って', 'た', 'った'],
    'ぶ': ['び', 'んで', 'ば', 'んだ'], 'む': ['み', 'んで', 'ま', 'んだ'], 'る': ['り', 'って', 'ら', 'った'], 'う': ['い', 'って', 'わ', 'った'],
};
// Chia một động từ [gốc, đuôi, nghĩa, nhóm] → { masu, te, nai, dict, ta }
function ovConj([stem, end, , g]) {
    if (g === 2) return { masu: stem + 'ます', te: stem + 'て', nai: stem + 'ない', dict: stem + 'る', ta: stem + 'た' };
    if (g === 3) {
        if (stem.startsWith('来')) { const r = '来（'; return { masu: r + 'き）ます', te: r + 'き）て', nai: r + 'こ）ない', dict: r + 'く）る', ta: r + 'き）た' }; }
        return { masu: stem + 'します', te: stem + 'して', nai: stem + 'しない', dict: stem + 'する', ta: stem + 'した' };
    }
    const e = OV_E[end]; let te = stem + e[1], ta = stem + e[3], nai = stem + e[2] + 'ない';
    if (stem === '行（い）') { te = stem + 'って'; ta = stem + 'った'; }          // 行きます → 行って, 行った
    if (stem === 'あ' && end === 'る') nai = 'ない';                              // あります → ない
    return { masu: stem + e[0] + 'ます', te, nai, dict: stem + end, ta };
}
const ovJp = s => '<span class="jp" lang="ja">' + rubyHtml(s) + '</span>';
const ovTxt = s => esc(s).replace(/([぀-ヿ㐀-鿿々ー・～]+)/g, '<span class="jp" lang="ja">$1</span>');
const ovTick = id => '<label class="rm-mini' + (rm.t[id] ? ' on' : '') + '"><input type="checkbox" data-rmt="' + id + '"' + (rm.t[id] ? ' checked' : '') + '><span class="rm-box" aria-hidden="true">✓</span><span>Nhớ rồi</span></label>';
const ovCount = pre => Object.keys(rm.t).filter(k => k.startsWith(pre)).length;
function ovFold(id, title, ja, sub, done, tot, body) {
    return '<details class="card rm-fold ov-fold' + (done >= tot ? ' done' : '') + '" data-rmsec="' + id + '"' + (rmOpen[id] ? ' open' : '') + '><summary><span class="rm-ft"><b>' + title + '</b> <span class="jp" lang="ja">' + ja +
        '</span><span class="rm-fsub">' + sub + '</span></span><span class="rm-fprog num' + (done >= tot ? ' ok-t' : '') + '">' + done + '/' + tot + (done >= tot ? ' ✓' : '') + '</span></summary>' + body + '</details>';
}

/* ----- Trợ từ ----- */
function ovParticles() {
    let h = '<p class="hint">Mỗi trợ từ là một “nhãn” trả lời một câu hỏi. は đọc là wa, へ đọc là e, を đọc là o khi làm trợ từ. Thuộc 16 nhãn này là đọc được hầu hết câu N5.</p><ul class="ov-list">';
    N5_PARTICLES.forEach(([p, g, q, use, ex, vi], i) => {
        h += '<li class="ov-item"><span class="ov-p jp" lang="ja">' + p + '</span><div class="ov-b"><span class="lbl">' + esc(g) + ' · ' + esc(q) + '</span><p>' + esc(use) + '</p>' +
            '<p class="ov-ex">' + rmSay(ex.replace(/ \/ .*$/, '')) + '<span>' + ovJp(ex) + '<span class="rm-vi">' + esc(vi) + '</span></span></p>' + ovTick('ov-p-' + i) + '</div></li>';
    });
    h += '</ul><span class="lbl rm-sub">Bốn cặp hay nhầm</span><ul class="ov-conf">' + N5_CONFUSE.map(([a, b, ex]) => '<li><b>' + esc(a) + '</b><span>' + esc(b) + '</span><span class="ov-cex">' + ovJp(ex) + '</span></li>').join('') + '</ul>';
    const ans = N5_PQUIZ.map((q, i) => rmOv[i]), done = ans.filter(a => a != null).length, ok = ans.filter(a => a === 0).length;
    h += '<span class="lbl rm-sub">Thử tay: điền trợ từ · 10 câu' + (done ? ' · đúng ' + ok + '/' + done : '') + '</span>' + N5_PQUIZ.map(([q, opts, , why], qi) => {
        const pick = rmOv[qi];
        return '<div class="rm-q"><p class="rm-qq">' + (qi + 1) + '. ' + rmJaU(q) + '</p><div class="rm-opts">' + rmHashOrder('ov' + qi, opts.length).map(oi => {
            const cls = pick == null ? '' : oi === 0 ? ' right' : oi === pick ? ' wrong' : '';
            return '<button type="button" class="rm-opt' + cls + '" data-ovq="' + qi + ':' + oi + '"' + (pick != null ? ' disabled' : '') + '>' + rmJa(opts[oi]) + '</button>';
        }).join('') + '</div>' + (pick != null ? '<p class="rm-why ' + (pick === 0 ? 'ok-t' : 'ng-t') + '">' + (pick === 0 ? '✓ Đúng. ' : '✗ Chưa đúng. ') + '<span>' + esc(why) + '</span></p>' : '') + '</div>';
    }).join('') + (done === N5_PQUIZ.length ? '<p class="rm-clear ' + (ok >= 8 ? 'ok-t' : 'mid-t') + '">Kết quả: ' + ok + '/' + N5_PQUIZ.length + '</p>' : '') + (done ? '<button type="button" class="btn sm" data-ovreset="1">Làm lại</button>' : '');
    return h;
}

/* ----- Chia động từ ----- */
function ovVerbs() {
    const row = (a, b, c) => '<tr><th>' + a + '</th><td>' + b + '</td><td>' + c + '</td></tr>';
    let h = '<p class="hint">Mọi dạng đều chia từ dạng ます bạn đã thuộc: biết nhóm, nhìn chữ ngay trước ます, rồi chia.</p>' +
        '<span class="lbl rm-sub">Bước 1 · Nhận nhóm</span><div class="ov-groups">' +
        '<div><b>Nhóm 2</b><span>Thường có âm え ngay trước ます (<span class="jp" lang="ja">食べます, 寝ます</span>); vài từ có い cần nhớ riêng: <span class="jp" lang="ja">見ます, 起きます, 着ます, います</span>.</span></div>' +
        '<div><b>Nhóm 3</b><span>Chỉ có <span class="jp" lang="ja">します</span> (kể cả mọi <span class="jp" lang="ja">〜します</span>) và <span class="jp" lang="ja">来ます</span>.</span></div>' +
        '<div><b>Nhóm 1</b><span>Âm い ngay trước ます (<span class="jp" lang="ja">書きます, 飲みます, 帰ります</span>): chia bằng bảng 50 âm.</span></div></div>' +
        '<ul class="rm-tips ov-traps">' + N5_VERB_TRAPS.map(t => '<li>★ ' + ovTxt(t) + '</li>').join('') + '</ul>' +
        '<span class="lbl rm-sub">Bước 2 · Luật bốn dạng</span><div class="ov-scroll"><table class="ov-tab"><thead><tr><th>Dạng</th><th>Nhóm 2 · nhóm 3</th><th>Nhóm 1 · nhìn chữ trước ます</th></tr></thead><tbody>' +
        row('Thể て', 'Nhóm 2: bỏ ます + て. Nhóm 3: <span class="jp" lang="ja">して · きて</span>', ovTxt('い・ち・り → って；み・び・に → んで；き → いて；ぎ → いで；し → して。Ngoại lệ: 行きます → 行って')) +
        row('Thể ない', 'Nhóm 2: bỏ ます + ない. Nhóm 3: <span class="jp" lang="ja">しない · こない</span>', ovTxt('Lên hàng あ + ない；い → わ (買います → 買わない)；あります → ない')) +
        row('Thể từ điển', 'Nhóm 2: bỏ ます + る. Nhóm 3: <span class="jp" lang="ja">する · くる</span>', 'Xuống hàng う (<span class="jp" lang="ja">書きます → 書く</span>)') +
        row('Thể た', 'Lấy thể て rồi đổi て → た, で → だ (cả ba nhóm, kể cả <span class="jp" lang="ja">行って → 行った</span>)', '—') +
        '</tbody></table></div>' +
        '<span class="lbl rm-sub">Nhóm 1 · bảng 50 âm</span><div class="ov-scroll"><table class="ov-tab ov-mini"><thead><tr><th>Đuôi</th><th>ます</th><th>て</th><th>ない</th><th>Ví dụ</th></tr></thead><tbody>' +
        [['く', '書（か）'], ['ぐ', '泳（およ）'], ['す', '話（はな）'], ['つ', '待（ま）'], ['ぶ', '遊（あそ）'], ['む', '飲（の）'], ['る', '帰（かえ）'], ['う', '買（か）']].map(([e, s]) => {
            const c = ovConj([s, e, '', 1]);
            return '<tr><td>' + ovJp(e) + '</td><td>' + ovJp(OV_E[e][0] + 'ます') + '</td><td>' + ovJp('〜' + OV_E[e][1]) + '</td><td>' + ovJp('〜' + OV_E[e][2] + 'ない') + '</td><td>' + ovJp(c.dict + ' → ' + c.te + ' · ' + c.nai) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    // 34 động từ
    const done = ovCount('ov-v-');
    h += '<span class="lbl rm-sub">34 động từ N5 chia sẵn · đã nhớ ' + done + '/' + N5_VERBS.length + '</span><div class="ov-scroll"><table class="ov-tab ov-verbs"><thead><tr><th>ます</th><th>Nghĩa · nhóm</th><th>て</th><th>ない</th><th>Từ điển</th><th>た</th><th></th></tr></thead><tbody>' +
        N5_VERBS.map((v, i) => {
            const c = ovConj(v), on = rm.t['ov-v-' + i];
            return '<tr class="' + (on ? 'on' : '') + '"><td>' + ovJp(c.masu) + '</td><td>' + esc(v[2]) + ' · ' + v[3] + '</td><td>' + ovJp(c.te) + '</td><td>' + ovJp(c.nai) + '</td><td>' + ovJp(c.dict) + '</td><td>' + ovJp(c.ta) + '</td>' +
                '<td><label class="rm-mini' + (on ? ' on' : '') + '"><input type="checkbox" data-rmt="ov-v-' + i + '"' + (on ? ' checked' : '') + ' aria-label="Nhớ rồi"><span class="rm-box" aria-hidden="true">✓</span></label></td></tr>';
        }).join('') + '</tbody></table></div>';
    // dùng ở đâu
    h += '<span class="lbl rm-sub">Dạng nào dùng ở đâu</span><ul class="ov-use">' + N5_VERB_USE.map(([a, b]) => '<li><b>' + esc(a) + '</b><span>' + ovTxt(b) + '</span></li>').join('') + '</ul>';
    // thể thông thường
    const pick = d => { const v = N5_VERBS.find(x => x[1] + '' && ovConj(x).dict === d); return v ? ovConj(v) : null; };
    const forms = ['行（い）く', '食（た）べる', 'する', '来（く）る'].map(pick).filter(Boolean);
    h += '<span class="lbl rm-sub">Lịch sự và thông thường</span><div class="ov-scroll"><table class="ov-tab ov-mini"><thead><tr><th></th><th>Bây giờ</th><th>Không</th><th>Đã</th><th>Đã không</th></tr></thead><tbody>' +
        forms.map(c => {
            const st = c.masu.slice(0, -2), pn = c.nai === 'ない' ? 'なかった' : c.nai.slice(0, -1) + 'かった';
            return '<tr><th>' + ovJp(c.dict) + '</th><td>' + ovJp(c.masu) + ' · ' + ovJp(c.dict) + '</td><td>' + ovJp(st + 'ません') + ' · ' + ovJp(c.nai) + '</td><td>' + ovJp(st + 'ました') + ' · ' + ovJp(c.ta) + '</td><td>' + ovJp(st + 'ませんでした') + ' · ' + ovJp(c.nai.slice(0, -1) + 'かった') + '</td></tr>';
        }).join('') + '</tbody></table></div><p class="hint">Mỗi ô: dạng lịch sự · dạng thông thường. Thể ない chia như tính từ い: ない → なかった.</p>';
    // tính từ
    h += '<span class="lbl rm-sub">Chia tính từ</span><div class="ov-scroll"><table class="ov-tab ov-mini"><thead><tr><th></th><th>Bây giờ</th><th>Không</th><th>Đã</th><th>Đã không</th></tr></thead><tbody>' +
        N5_ADJ.map(r => '<tr><th>' + esc(r[0]) + '</th>' + r.slice(1).map(x => '<td>' + ovJp(x) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' +
        '<p class="hint">★ きれい và 嫌い（きらい）tận cùng bằng い nhưng là tính từ な.</p>';
    // tự chia
    h += '<span class="lbl rm-sub">Tự chia 10 động từ</span><p class="hint">Viết ra giấy 4 dạng て · ない · từ điển · た của từng từ, rồi mở đáp án. Chú ý ba từ hay bẫy: 起きます, 見ます, 来ます.</p><ol class="ov-pract">' +
        N5_PRACTICE_VERBS.map(v => '<li>' + ovJp(ovConj(v).masu) + ' <span class="rm-vi">' + esc(v[2]) + ' · nhóm ' + v[3] + '</span></li>').join('') + '</ol>' +
        '<details class="rm-script"><summary>Xem đáp án</summary><ol class="ov-pract">' + N5_PRACTICE_VERBS.map(v => { const c = ovConj(v); return '<li>' + ovJp(c.masu + ': ' + c.te + ' · ' + c.nai + ' · ' + c.dict + ' · ' + c.ta) + '</li>'; }).join('') + '</ol></details>';
    return h;
}

/* ----- 61 mẫu ngữ pháp ----- */
function ovGrammar() {
    let h = '<p class="hint">Xếp theo chủ đề giao tiếp, từ dễ đến khó. Che dòng nghĩa, nhìn mẫu và tự nói nghĩa cùng một câu ví dụ; nói được thì bấm “Nhớ rồi”.</p>';
    N5_GRAMMAR.forEach(([name, desc, items], ci) => {
        const d = items.filter((_, i) => rm.t['ov-g-' + ci + '-' + i]).length;
        h += '<section class="ov-chang"><div class="ov-ch"><h3>' + esc(name) + '</h3><span class="num hint">' + d + '/' + items.length + '</span></div><p class="hint">' + esc(desc) + '</p><ul class="ov-list">' +
            items.map(([p, m, ex, vi], i) => '<li class="ov-item"><div class="ov-b"><b class="ov-pat">' + ovTxt(p) + '</b><p>' + ovTxt(m) + '</p><p class="ov-ex">' + rmSay(ex) + '<span>' + ovJp(ex) + '<span class="rm-vi">' + esc(vi) + '</span></span></p>' + ovTick('ov-g-' + ci + '-' + i) + '</div></li>').join('') + '</ul></section>';
    });
    return h;
}

function rmOverview() {
    if (typeof N5_PARTICLES !== 'object') return '';
    const nP = N5_PARTICLES.length, nV = N5_VERBS.length, nG = N5_GRAMMAR.reduce((n, g) => n + g[2].length, 0);
    return '<div class="sec-h"><h2>Tổng quan ngữ pháp N5</h2><span class="hint">Xem lại trước khi luyện đề.</span></div>' +
        ovFold('ovP', 'Trợ từ N5', '助詞', nP + ' nhãn · 4 cặp hay nhầm · 10 câu thử tay', ovCount('ov-p-'), nP, ovParticles()) +
        ovFold('ovV', 'Chia động từ N5', '動詞', '3 nhóm · 4 dạng · 34 động từ chia sẵn', ovCount('ov-v-'), nV, ovVerbs()) +
        ovFold('ovG', 'Toàn bộ mẫu ngữ pháp N5', '文法', nG + ' mẫu · 5 chặng', ovCount('ov-g-'), nG, ovGrammar());
}
