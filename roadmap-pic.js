/* ===================== Tranh từ vựng (mục “Tranh từ vựng” trong trạm của Lộ trình N5) =====================
   Tranh SVG + số đánh trên từng đồ vật (data/pics.js: RM_PICS). Chạm số trên tranh (hoặc chip bên dưới) để xem và nghe từ;
   trên tranh chỉ có số; nút “Che chữ” làm mờ từ ở danh sách để tự kiểm tra trí nhớ. Lưu trong hvn.rm.pic = { số trạm: [chỉ số từ đã xem] }. Phải nạp SAU roadmap.js. */
let rmPicSel = {};      // số trạm → số thứ tự pin đang chọn (trong tranh đang xem)
let rmPicCur = {};      // số trạm → chỉ số tranh đang xem (0, 1, …)
let rmPicHide = false;  // true = che chữ trên tranh
const rmPicSeen = n => ((rm.pic || {})[n] || []);
// Một trạm có thể có nhiều tranh (mảng); mỗi lần hiện một tranh, tranh sau không có svg thì dùng lại svg của tranh đầu
const rmPicScenes = n => {
    const arr = x => !x ? [] : Array.isArray(x) ? x : [x];
    // tranh có chủ đề (nhân vật, cảnh) hiện trước, rồi tới các tranh đồ vật
    const t = arr(typeof RM_PICS_THEME === 'object' ? RM_PICS_THEME[n] : null);
    return t.length ? t : arr(typeof RM_PICS === 'object' ? RM_PICS[n] : null);
};

function rmPicSec(n) {
    const S = rmPicScenes(n), L = rmL(n);
    if (!S.length || !L) return '';
    const k = Math.min(rmPicCur[n] || 0, S.length - 1), P = S[k], base = S[0].svg;
    const [vx, vy, vw, vh] = (P.vb || '0 0 400 440').split(' ').map(Number);
    const seen = rmPicSeen(n), word = i => L.vocab[P.pins[i][0]], sel = rmPicSel[n];
    const all = S.reduce((a, s) => a.concat(s.pins.map(p => p[0])), []), total = all.length, done = all.filter(v => seen.includes(v)).length;
    const pins = P.pins.map((p, i) => {
        const [vi, x, y, side] = p, cls = 'pic-pin s-' + side + (seen.includes(vi) ? ' seen' : '') + (sel === i ? ' sel' : '');
        return '<button type="button" class="' + cls + '" style="left:' + ((x - vx) / vw * 100) + '%;top:' + ((y - vy) / vh * 100) + '%" data-pic="' + n + ':' + i + '" aria-label="' + (i + 1) + '. ' + esc(plainJa(word(i)[0])) + '">' +
            '<b>' + (i + 1) + '</b></button>';
    }).join('');
    // vùng chạm lớn phủ lên đồ vật (pin có phần tử thứ 5 = [tâm x, tâm y, cỡ])
    const hits = P.pins.map((p, i) => !p[4] ? '' : '<button type="button" class="pic-hit' + (sel === i ? ' sel' : '') + '" tabindex="-1" aria-hidden="true" style="left:' + ((p[4][0] - vx) / vw * 100) + '%;top:' + ((p[4][1] - vy) / vh * 100) + '%;width:' + (p[4][2] / vw * 100) + '%;height:' + (p[4][2] / vh * 100) + '%" data-pic="' + n + ':' + i + '"></button>').join('');
    let card = '<p class="hint pic-card">Chạm vào số trên tranh (hoặc vào đồ vật) để xem và nghe từ; từ vựng nằm ở danh sách bên dưới.</p>';
    if (sel != null && P.pins[sel]) {
        const [ja, vi] = word(sel);
        card = '<div class="pic-card on"><span class="pic-no">' + (sel + 1) + '</span>' + rmSay(ja) + '<div>' + rmJa(ja) + '<span class="rm-vi">' + esc(vi) + '</span></div></div>';
    }
    const list = P.pins.map((p, i) => '<button type="button" class="pic-li' + (seen.includes(p[0]) ? ' seen' : '') + (sel === i ? ' sel' : '') + '" data-pic="' + n + ':' + i + '"><b>' + (i + 1) + '</b>' +
        '<span class="jp' + (rmPicHide && sel !== i ? ' pic-mask' : '') + '" lang="ja">' + esc(plainJa(word(i)[0])) + '</span></button>').join('');
    const tabs = S.length > 1 ? '<div class="seg pic-tabs" role="tablist">' + S.map((s, j) => {
        const c = s.pins.filter(p => seen.includes(p[0])).length;
        return '<button type="button" role="tab" data-picsc="' + n + ':' + j + '" aria-pressed="' + (j === k) + '"><span class="num">Tranh ' + (j + 1) + '/' + S.length + '</span> ' + esc(s.title) + ' <span class="num">' + c + '/' + s.pins.length + '</span></button>';
    }).join('') + '</div>' : '';
    return rmSec('pic', 'Tranh từ vựng · ' + esc(S.length > 1 ? S.length + ' tranh' : P.title) + ' (' + total + ' từ)',
        '<div class="pic' + (rmPicHide ? ' pic-hide' : '') + '">' + tabs + '<div class="pic-top"><span class="num hint">Đã xem ' + done + '/' + total + '</span>' +
        '</div>' +
        '<div class="pic-wrap" style="aspect-ratio:' + vw + '/' + vh + '"><svg viewBox="' + vx + ' ' + vy + ' ' + vw + ' ' + vh + '" role="img" aria-label="' + esc(P.title) + '">' + (P.svg || base) + '</svg>' + hits + pins + '</div>' + card + '<div class="pic-list">' + list + '</div>' +
        '<p class="hint">Mẹo nhớ: nhìn tranh, tự đoán từ rồi mới chạm số để kiểm tra. Các từ còn lại của bài nằm ở mục Từ vựng bên dưới.</p></div>');
}
function rmPicPick(v) {
    const [n, i] = v.split(':').map(Number), S = rmPicScenes(n), P = S[Math.min(rmPicCur[n] || 0, S.length - 1)]; if (!P || !P.pins[i]) return;
    rmPicSel[n] = i; rm.pic = rm.pic || {};
    const a = rm.pic[n] = rm.pic[n] || [], vi = P.pins[i][0];
    if (!a.includes(vi)) { a.push(vi); rmSave(); rmMarkDay('v'); }
    try { rmPlay(rmL(n).vocab[vi][0], { classList: { add() { }, remove() { } } }); } catch (e) { }
    rmRe();
}
function rmPicScene(v) { const [n, j] = v.split(':').map(Number); rmPicCur[n] = j; delete rmPicSel[n]; rmRe(); }
