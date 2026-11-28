/* ===================== Tranh từ vựng (mục “Tranh từ vựng” trong trạm của Lộ trình N5) =====================
   Tranh SVG + số đánh trên từng đồ vật (data/pics.js: RM_PICS). Chạm số trên tranh (hoặc chip bên dưới) để xem và nghe từ;
   nút “Che chữ” ẩn chữ trên tranh để tự kiểm tra trí nhớ. Lưu trong hvn.rm.pic = { số trạm: [chỉ số từ đã xem] }. Phải nạp SAU roadmap.js. */
let rmPicSel = {};      // số trạm → số thứ tự pin đang chọn
let rmPicHide = false;  // true = che chữ trên tranh
const rmPicSeen = n => ((rm.pic || {})[n] || []);

function rmPicSec(n) {
    const P = typeof RM_PICS === 'object' ? RM_PICS[n] : null, L = rmL(n);
    if (!P || !L) return '';
    const seen = rmPicSeen(n), word = i => L.vocab[P.pins[i][0]];
    const sel = rmPicSel[n], done = P.pins.filter(p => seen.includes(p[0])).length;
    const pins = P.pins.map((p, i) => {
        const [vi, x, y, side] = p, cls = 'pic-pin s-' + side + (seen.includes(vi) ? ' seen' : '') + (sel === i ? ' sel' : '');
        return '<button type="button" class="' + cls + '" style="left:' + (x / 4) + '%;top:' + (y / 4.4) + '%" data-pic="' + n + ':' + i + '" aria-label="' + (i + 1) + '. ' + esc(plainJa(word(i)[0])) + '">' +
            '<b>' + (i + 1) + '</b><span class="pic-chip jp" lang="ja">' + esc(plainJa(word(i)[0])) + '</span></button>';
    }).join('');
    let card = '<p class="hint pic-card">Chạm vào số trên tranh để xem và nghe từ.</p>';
    if (sel != null && P.pins[sel]) {
        const [ja, vi] = word(sel);
        card = '<div class="pic-card on"><span class="pic-no">' + (sel + 1) + '</span>' + rmSay(ja) + '<div>' + rmJa(ja) + '<span class="rm-vi">' + esc(vi) + '</span></div></div>';
    }
    const list = P.pins.map((p, i) => '<button type="button" class="pic-li' + (seen.includes(p[0]) ? ' seen' : '') + (sel === i ? ' sel' : '') + '" data-pic="' + n + ':' + i + '"><b>' + (i + 1) + '</b>' +
        '<span class="jp' + (rmPicHide && sel !== i ? ' pic-mask' : '') + '" lang="ja">' + esc(plainJa(word(i)[0])) + '</span></button>').join('');
    return rmSec('pic', 'Tranh từ vựng · ' + esc(P.title) + ' (' + P.pins.length + ' từ)',
        '<div class="pic' + (rmPicHide ? ' pic-hide' : '') + '"><div class="pic-top"><span class="num hint">Đã xem ' + done + '/' + P.pins.length + '</span>' +
        '<button type="button" class="btn sm" data-pichide="1" aria-pressed="' + rmPicHide + '">' + (rmPicHide ? '👁 Hiện chữ' : '🙈 Che chữ để tự kiểm tra') + '</button></div>' +
        '<div class="pic-wrap"><svg viewBox="0 0 400 440" role="img" aria-label="' + esc(P.title) + '">' + P.svg + '</svg>' + pins + '</div>' + card + '<div class="pic-list">' + list + '</div>' +
        '<p class="hint">Mẹo nhớ: nhìn tranh, tự đoán từ rồi mới chạm số để kiểm tra. Các từ còn lại của bài nằm ở mục Từ vựng bên dưới.</p></div>');
}
function rmPicPick(v) {
    const [n, i] = v.split(':').map(Number), P = RM_PICS[n]; if (!P || !P.pins[i]) return;
    rmPicSel[n] = i; rm.pic = rm.pic || {};
    const a = rm.pic[n] = rm.pic[n] || [], vi = P.pins[i][0];
    if (!a.includes(vi)) { a.push(vi); rmSave(); rmMarkDay('v'); }
    try { rmPlay(rmL(n).vocab[vi][0], { classList: { add() { }, remove() { } } }); } catch (e) { }
    rmRe();
}
