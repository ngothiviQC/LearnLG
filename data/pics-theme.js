/* Tranh có chủ đề: một cảnh có nhân vật, các chi tiết trong cảnh thể hiện từ vựng của bài (khác bảng đồ vật trong data/pics.js).
   RM_PICS_THEME[số trạm] = mảng tranh { title, svg, pins }, hiện TRƯỚC các tranh đồ vật. pins: [chỉ số từ, x, y, hướng nhãn]. Tranh SVG do Claude vẽ. */
const _SKN = '#f6d3b0';
// Nhân vật hoạt hình: gốc tọa độ ở giữa hai bàn chân, đầu hướng lên (y âm). o: kiểu tóc, màu áo/quần, phụ kiện…
function _ch(x, y, o) {
  o = Object.assign({ skin: _SKN, hair: '#2a2a2a', style: 'short', top: '#4d9de0', bottom: '#3b4a6b', shoes: '#333', armL: [-34, -52], armR: [34, -52], s: 1, back: '', mid: '', front: '', hand: '' }, o);
  const hairBack = o.style === 'long' ? `<rect x="-30" y="-138" width="60" height="64" rx="26" fill="${o.hair}"/>` : '';
  const cap = o.style === 'none' ? '' : `<path d="M-27 -114a27 27 0 0 1 54 0q-12-12-27-12t-27 12z" fill="${o.hair}"/>` + (o.style === 'bun' ? `<circle cx="0" cy="-146" r="12" fill="${o.hair}"/>` : '');
  const arm = ([ex, ey], sx) => `<path d="M${sx * 22} -84L${ex} ${ey}" stroke="${o.top}" stroke-width="12" stroke-linecap="round"/><circle cx="${ex}" cy="${ey}" r="6.5" fill="${o.skin}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${o.s})">${o.back}${hairBack}<ellipse cx="0" cy="2" rx="34" ry="6" fill="#000" opacity=".12"/>` +
    `<rect x="-17" y="-42" width="14" height="40" rx="5" fill="${o.bottom}"/><rect x="3" y="-42" width="14" height="40" rx="5" fill="${o.bottom}"/><ellipse cx="-10" cy="-1" rx="13" ry="5.5" fill="${o.shoes}"/><ellipse cx="10" cy="-1" rx="13" ry="5.5" fill="${o.shoes}"/>` +
    `<rect x="-24" y="-94" width="48" height="60" rx="15" fill="${o.top}"/>${o.mid}` + arm(o.armL, -1) + arm(o.armR, 1) + o.hand +
    `<rect x="-5" y="-100" width="10" height="12" rx="3" fill="${o.skin}"/><circle cx="-27" cy="-112" r="5" fill="${o.skin}"/><circle cx="27" cy="-112" r="5" fill="${o.skin}"/><circle cx="0" cy="-114" r="27" fill="${o.skin}"/>${cap}` +
    `<ellipse cx="-10" cy="-112" rx="4.2" ry="5.4" fill="#222"/><ellipse cx="10" cy="-112" rx="4.2" ry="5.4" fill="#222"/><circle cx="-9" cy="-114" r="1.5" fill="#fff"/><circle cx="11" cy="-114" r="1.5" fill="#fff"/><ellipse cx="-17" cy="-102" rx="5" ry="3" fill="#f4a6a0" opacity=".65"/><ellipse cx="17" cy="-102" rx="5" ry="3" fill="#f4a6a0" opacity=".65"/><path d="M-6 -100q6 7 12 0" stroke="#a5503a" stroke-width="2.2" fill="none" stroke-linecap="round"/>${o.front}</g>`;
}
const _bubble = (x, y, w, h, tx, lines, tail) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="#9aa9b8" stroke-width="2"/><path d="M${tail[0] - 7} ${y + h - 1}l7 ${tail[1]}l7 -${tail[1]}z" fill="#fff" stroke="#9aa9b8" stroke-width="2"/><rect x="${tail[0] - 8}" y="${y + h - 4}" width="16" height="5" fill="#fff"/>` +
  lines.map((t, i) => `<text x="${x + w / 2}" y="${y + 20 + i * 17}" text-anchor="middle" font-size="13" font-weight="700" fill="#2b3a4a" font-family="sans-serif">${t}</text>`).join('') + '</g>';

const _EF2 = 'font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"';
// bong bóng chỉ chứa biểu tượng, không ghi chữ Nhật trên tranh; tail = [x, độ dài] nếu có đuôi trỏ xuống nhân vật
const _bubI = (x, y, w, h, icon, tail) => {
  let b = _bubble(x, y, w, h, 0, [''], tail || [0, 0]);
  if (!tail) b = b.replace(/<path d="M-?\d+[^"]*" fill="#fff" stroke="#9aa9b8" stroke-width="2"\/><rect[^>]*\/>/, '');
  return b.replace(/<text[\s\S]*?<\/text>/g, '') + `<text x="${x + w / 2}" y="${y + h / 2 + 1}" font-size="28" text-anchor="middle" dominant-baseline="central" ${_EF2}>${icon}</text>`;
};

const RM_PICS_THEME = {
1: [{ title: 'Buổi gặp gỡ ở trường đại học',
  svg: `<defs><linearGradient id="tS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3f7"/><stop offset="1" stop-color="#eaf7ff"/></linearGradient></defs><rect width="400" height="440" fill="url(#tS)"/>` +
    `<circle cx="350" cy="40" r="22" fill="#ffd54a"/><g fill="#fff"><ellipse cx="60" cy="52" rx="32" ry="12"/><ellipse cx="86" cy="44" rx="22" ry="12"/><ellipse cx="290" cy="80" rx="28" ry="10"/></g>` +
    // tòa nhà đại học
    `<rect x="84" y="86" width="232" height="168" fill="#e6d3b4" stroke="#b79d74" stroke-width="3"/><path d="M70 90l130-52 130 52z" fill="#c9b08a" stroke="#b79d74" stroke-width="3"/><rect x="150" y="56" width="100" height="30" rx="5" fill="#2f4f9a"/><text x="200" y="70" font-size="22" text-anchor="middle" dominant-baseline="central" ${_EF2}>🎓</text>` +
    `<g fill="#fff6dc" stroke="#b79d74" stroke-width="2"><rect x="100" y="110" width="30" height="40"/><rect x="146" y="110" width="30" height="40"/><rect x="224" y="110" width="30" height="40"/><rect x="270" y="110" width="30" height="40"/></g><rect x="176" y="168" width="48" height="86" fill="#8a5a35"/><path d="M200 168v86" stroke="#6b4423" stroke-width="2"/><circle cx="192" cy="214" r="2.5" fill="#e6c34a"/><circle cx="208" cy="214" r="2.5" fill="#e6c34a"/>` +
    `<g fill="#cdb98f"><rect x="88" y="170" width="12" height="84"/><rect x="300" y="170" width="12" height="84"/></g>` +
    // dây cờ
    `<path d="M0 26Q100 60 200 28T400 26" stroke="#8a5a35" stroke-width="2" fill="none"/><g><path d="M30 36l12 4-8 12z" fill="#da251d"/><path d="M74 46l12 0-6 14z" fill="#ffd400"/><path d="M120 50l12-2-4 14z" fill="#4d9de0"/><path d="M268 44l12 4-8 12z" fill="#2e9a5a"/><path d="M312 40l12 0-6 14z" fill="#e07a9b"/><path d="M356 34l12-2-4 14z" fill="#f4a259"/></g>` +
    // cờ lớn Việt Nam (trái) và Nhật (phải)
    `<rect x="14" y="96" width="4" height="150" fill="#8a929a"/><rect x="18" y="100" width="62" height="42" fill="#da251d"/><path d="M49 108l5 13h14l-11 8 4 14-12-9-12 9 4-14-11-8h14z" fill="#ffd400"/>` +
    `<rect x="382" y="96" width="4" height="150" fill="#8a929a"/><rect x="322" y="100" width="60" height="42" fill="#fff" stroke="#ccc"/><circle cx="352" cy="121" r="13" fill="#d9253a"/>` +
    // mặt đất
    `<path d="M0 262q200-22 400 0v178H0z" fill="#a8d08a"/><path d="M60 440q80-130 140-178h0q60 48 140 178z" fill="#eadcc0" opacity=".9"/><g fill="#8fc274"><ellipse cx="40" cy="300" rx="22" ry="7"/><ellipse cx="370" cy="320" rx="26" ry="8"/></g>` +
    // nhân vật
    _ch(62, 388, { style: 'long', hair: '#2a2a2a', top: '#ffffff', bottom: '#2f4f9a', armR: [38, -64], back: '<rect x="-34" y="-92" width="22" height="46" rx="8" fill="#d9534f"/>', mid: '<path d="M-8 -94l8 14 8-14z" fill="#2f4f9a"/><rect x="-16" y="-72" width="12" height="9" fill="#da251d"/><path d="M-10 -71l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="#ffd400"/>', hand: '' }) +
    _ch(140, 388, { hair: '#6b6b6b', top: '#f4f1ea', bottom: '#5b6b7a', armL: [-38, -64], armR: [30, -52], mid: '<path d="M-24 -90h48v54a8 8 0 0 1-8 8h-32a8 8 0 0 1-8-8z" fill="#7a8896" opacity=".85"/><path d="M-6 -94l6 12 6-12z" fill="#fff"/><path d="M0 -82v26" stroke="#d9534f" stroke-width="4"/><rect x="10" y="-76" width="13" height="9" fill="#fff" stroke="#ccc"/><circle cx="16.5" cy="-71.5" r="3" fill="#d9253a"/>', front: '<circle cx="-10" cy="-112" r="9" fill="none" stroke="#333" stroke-width="2.2"/><circle cx="10" cy="-112" r="9" fill="none" stroke="#333" stroke-width="2.2"/><path d="M-1 -112h2" stroke="#333" stroke-width="2.2"/>', hand: '<rect x="22" y="-66" width="20" height="26" rx="3" fill="#3d7ea6" stroke="#2c5f82" transform="rotate(12 32 -54)"/>' }) +
    `<circle cx="101" cy="340" r="9" fill="${_SKN}" stroke="#e8b98f" stroke-width="1.5"/>` +
    _ch(215, 388, { hair: '#222', top: '#3b4a6b', bottom: '#2c3850', armL: [-30, -48], armR: [34, -40], mid: '<path d="M-9 -94l9 18 9-18z" fill="#fff"/><path d="M-3 -88l3 4 3-4-2 22h-2z" fill="#d9534f"/>', hand: '<rect x="26" y="-42" width="30" height="22" rx="4" fill="#8b5a3c" stroke="#5b3a24" stroke-width="2"/><path d="M34 -42v-6h14v6" stroke="#5b3a24" stroke-width="3" fill="none"/>' }) +
    _ch(282, 388, { hair: '#3a2a22', top: '#f4a259', bottom: '#4b5c70', armL: [-30, -48], armR: [38, -60], mid: '<rect x="-24" y="-74" width="48" height="7" fill="#fff" opacity=".85"/><rect x="-24" y="-56" width="48" height="7" fill="#fff" opacity=".85"/>', front: '<path d="M-29 -118a29 26 0 0 1 58 0z" fill="#ffd23f" stroke="#e0b92c" stroke-width="2"/><rect x="-32" y="-120" width="64" height="7" rx="3" fill="#e0b92c"/><rect x="-5" y="-146" width="10" height="12" rx="3" fill="#e0b92c"/>', hand: '<path d="M38 -60l16 -22" stroke="#888" stroke-width="5" stroke-linecap="round"/><circle cx="56" cy="-86" r="8" fill="none" stroke="#888" stroke-width="5"/>' }) +
    _ch(342, 388, { style: 'bun', hair: '#4a2f22', top: '#ffffff', bottom: '#5b6b7a', armL: [-30, -48], armR: [32, -56], mid: '<path d="M-24 -92h48l4 78H-28z" fill="#fff" stroke="#d6dde4" stroke-width="2"/><path d="M-12 -92q-6 30 12 40q18-10 12-40" stroke="#555" stroke-width="3" fill="none"/><circle cx="0" cy="-50" r="4" fill="#777"/><rect x="10" y="-76" width="10" height="10" fill="#fff" stroke="#e0443e"/><path d="M15 -75v8M11 -71h8" stroke="#e0443e" stroke-width="2.5"/>', hand: '<rect x="26" y="-74" width="22" height="30" rx="3" fill="#8fd0f5" stroke="#5b9ac0" stroke-width="2"/><path d="M31 -66h12M31 -60h12M31 -54h8" stroke="#fff" stroke-width="2"/>' }) +
    ``,
  pins: [[2, 62, 410, 'b'], [4, 140, 410, 'b'], [3, 215, 410, 'b'], [5, 282, 410, 'b'], [6, 342, 410, 'b'], [7, 48, 166, 'b'], [8, 352, 166, 'b'], [9, 200, 108, 'b']] },
  { title: 'Tự giới thiệu và chào hỏi',
  svg: `<defs><linearGradient id="tW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf0dc"/><stop offset="1" stop-color="#f1dcba"/></linearGradient></defs><rect width="400" height="440" fill="url(#tW)"/><rect y="388" width="400" height="52" fill="#d9b98c"/><rect y="384" width="400" height="8" fill="#c9a572"/>` +
    `<rect x="150" y="14" width="100" height="70" rx="6" fill="#fff"/><rect x="156" y="20" width="88" height="58" fill="#cfe8f7"/><path d="M200 20v58M156 49h88" stroke="#fff" stroke-width="4"/><circle cx="224" cy="36" r="8" fill="#ffd54a"/>` +
    `<g transform="translate(366 392)"><rect x="-4" y="-40" width="8" height="40" fill="#8a5a35"/><ellipse cx="-14" cy="-52" rx="16" ry="9" fill="#5aa469" transform="rotate(-30 -14 -52)"/><ellipse cx="14" cy="-52" rx="16" ry="9" fill="#5aa469" transform="rotate(30 14 -52)"/><ellipse cx="0" cy="-62" rx="9" ry="16" fill="#4f9660"/></g>` +
    `<g transform="translate(36 392)"><rect x="-14" y="-24" width="28" height="24" rx="4" fill="#c9915a"/><ellipse cx="0" cy="-26" rx="12" ry="8" fill="#5aa469"/><circle cx="-6" cy="-34" r="6" fill="#e0527a"/><circle cx="6" cy="-32" r="5" fill="#f6d44b"/></g>` +
    `<ellipse cx="200" cy="404" rx="52" ry="8" fill="#000" opacity=".1"/><rect x="170" y="350" width="60" height="8" rx="4" fill="#a56d3f"/><rect x="196" y="358" width="8" height="40" fill="#8a5a35"/><g><rect x="178" y="334" width="18" height="16" rx="3" fill="#fff" stroke="#bbb"/><path d="M196 338h5q4 0 4 5t-4 5h-5" fill="none" stroke="#bbb" stroke-width="2"/><rect x="206" y="334" width="18" height="16" rx="3" fill="#fff" stroke="#bbb"/><path d="M224 338h5q4 0 4 5t-4 5h-5" fill="none" stroke="#bbb" stroke-width="2"/></g>` +
    // Nam (trái): chỉ vào mình
    _ch(100, 388, { hair: '#2a2a2a', top: '#4d9de0', bottom: '#3b4a6b', armR: [4, -66], armL: [-34, -52], mid: '<rect x="-14" y="-78" width="26" height="16" rx="2" fill="#fff" stroke="#9aa9b8"/><path d="M-9 -72h16M-9 -67h10" stroke="#9aa9b8" stroke-width="2"/>' }) +
    `<path d="M70 252q-8-10 0-20M62 256q-12-14 -2-30" stroke="#9aa9b8" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    // Tanaka (phải): chỉ về phía Nam
    _ch(300, 388, { style: 'bun', hair: '#4a2f22', top: '#e07a9b', bottom: '#5b4a8a', armL: [-48, -86], armR: [34, -52], mid: '<rect x="-12" y="-78" width="26" height="16" rx="2" fill="#fff" stroke="#9aa9b8"/><path d="M-7 -72h16M-7 -67h10" stroke="#9aa9b8" stroke-width="2"/>', hand: '<path d="M-48 -86l-12 -4" stroke="#f6d3b0" stroke-width="5" stroke-linecap="round"/>' }) +
    `<path d="M330 252q8-10 0-20M338 256q12-14 2-30" stroke="#9aa9b8" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    // các câu nói
    _bubI(44, 104, 84, 38, '🙇') + _bubI(44, 148, 84, 38, '🙋') + _bubI(44, 192, 84, 38, '🎂20', [96, 22]) +
    _bubI(264, 104, 84, 38, '🙇‍♀️') + _bubI(264, 192, 84, 38, '👉❓', [300, 22]),
  pins: [[11, 24, 123, 'l'], [0, 24, 167, 'l'], [10, 24, 211, 'l'], [12, 366, 123, 'l'], [1, 366, 211, 'l']] }
],
};

/* ===== Các bài 2–25: tranh chủ đề dựng bằng nền cảnh + nhân vật + đồ vật (emoji). Không có chữ trên tranh; số nằm dưới từng chi tiết. ===== */
const _TG = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
const _TB = {
  room: _TG('tR', '#fbf0dc', '#f1dcba') + '<rect width="400" height="440" fill="url(#tR)"/><rect y="372" width="400" height="68" fill="#d9b98c"/><rect y="368" width="400" height="8" fill="#c9a572"/>',
  sky: _TG('tS2', '#bfe3f7', '#eaf7ff') + '<rect width="400" height="440" fill="url(#tS2)"/><circle cx="340" cy="50" r="24" fill="#ffd54a"/><g fill="#fff"><ellipse cx="70" cy="58" rx="34" ry="13"/><ellipse cx="96" cy="50" rx="22" ry="12"/><ellipse cx="250" cy="92" rx="28" ry="11"/></g><path d="M0 330q100-40 200-12t200-16v138H0z" fill="#a8d08a"/><path d="M0 380q120-24 220-4t180-10v74H0z" fill="#8fc274"/>',
  street: _TG('tT2', '#cfe8f7', '#eef7fc') + '<rect width="400" height="440" fill="url(#tT2)"/><g fill="#c3ccd6"><rect x="6" y="170" width="64" height="200"/><rect x="78" y="130" width="52" height="240"/><rect x="262" y="150" width="70" height="220"/><rect x="338" y="196" width="56" height="174"/></g><g fill="#e8eef4"><rect x="18" y="190" width="10" height="12"/><rect x="40" y="190" width="10" height="12"/><rect x="90" y="150" width="10" height="12"/><rect x="108" y="150" width="10" height="12"/><rect x="274" y="170" width="10" height="12"/><rect x="298" y="170" width="10" height="12"/></g><rect y="366" width="400" height="74" fill="#8f98a3"/><path d="M0 404h400" stroke="#fff" stroke-width="4" stroke-dasharray="26 18"/>',
  sea: _TG('tSe', '#bfe3f7', '#e8f6ff') + '<rect width="400" height="440" fill="url(#tSe)"/><circle cx="330" cy="56" r="24" fill="#ffd54a"/><rect y="180" width="400" height="150" fill="#4aa8d8"/><path d="M0 214q25-12 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><path d="M0 322q100-30 200-6t200-10v134H0z" fill="#f3dca8"/>',
  night: _TG('tN', '#1f2a4a', '#3b4a7a') + '<rect width="400" height="440" fill="url(#tN)"/><circle cx="330" cy="58" r="24" fill="#ffe9a8"/><g fill="#ffe9a8"><circle cx="60" cy="50" r="2"/><circle cx="120" cy="90" r="2"/><circle cx="220" cy="40" r="2"/><circle cx="280" cy="110" r="2"/></g><rect y="376" width="400" height="64" fill="#2c3a63"/>',
  office: _TG('tO', '#e7edf4', '#d3dde9') + '<rect width="400" height="440" fill="url(#tO)"/><rect y="376" width="400" height="64" fill="#b9c4d1"/><rect x="26" y="26" width="120" height="76" rx="4" fill="#cfe8f7" stroke="#fff" stroke-width="6"/><path d="M86 26v76M26 64h120" stroke="#fff" stroke-width="4"/>',
  kitchen: '<rect width="400" height="440" fill="#fff8ec"/><g stroke="#e8dcc4" stroke-width="2"><path d="M0 60h400M0 120h400M0 180h400M0 240h400M0 300h400M0 360h400"/><path d="M60 0v440M140 0v440M220 0v440M300 0v440M380 0v440"/></g><rect y="372" width="400" height="68" fill="#d9b98c"/>',
  mint: _TG('tM', '#eaf7f1', '#d6eee3') + '<rect width="400" height="440" fill="url(#tM)"/><rect y="376" width="400" height="64" fill="#bfe0d0"/>',
  lilac: _TG('tL', '#f3effc', '#e3dcf5') + '<rect width="400" height="440" fill="url(#tL)"/><rect y="380" width="400" height="60" fill="#d8cdef"/>',
};
const _pe = (e, x, y, s) => { const n = [...e].length, fs = s * (n > 1 ? Math.min(1, 1.4 / n) : 1); return `<text x="${x}" y="${y}" font-size="${fs}" text-anchor="middle" dominant-baseline="central" ${_EF2}>${e}</text>`; };
// list: chuỗi = svg thô; [chỉ số từ, emoji, x, y, cỡ(, pinX, pinY)] = đồ vật có số; [chỉ số từ, '<svg…>', pinX, pinY] = hình tự dựng có số
function _sc(title, bg, list) {
  let svg = _TB[bg] || _TB.lilac; const pins = [];
  list.forEach(it => {
    if (typeof it === 'string') { svg += it; return; }
    const [vi, e, a, b, c, d, f] = it;
    if (e.startsWith('<')) { svg += e; pins.push([vi, a, b, 'b']); }
    else { svg += _pe(e, a, b, c); pins.push([vi, d !== undefined ? d : a, f !== undefined ? f : b + c * .68, 'b']); }
  });
  return { title, svg, pins };
}
const _m = (x, y, top, o) => _ch(x, y, Object.assign({ top, bottom: '#3b4a6b' }, o || {}));
const _w = (x, y, top, o) => _ch(x, y, Object.assign({ style: 'long', hair: '#4a2f22', top, bottom: '#5b4a8a' }, o || {}));
const _k = (x, y, top, o) => _ch(x, y, Object.assign({ s: .72, top, bottom: '#2f4f9a' }, o || {}));
const _desk = (y) => `<rect x="14" y="${y}" width="372" height="14" rx="4" fill="#c9915a"/><rect x="24" y="${y + 14}" width="352" height="${440 - y - 14}" fill="#a56d3f"/>`;
const _win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#cfe8f7" stroke="#fff" stroke-width="7"/><path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#fff" stroke-width="5"/>`;
const _door = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c || '#c9915a'}" stroke="#8a5a35" stroke-width="3"/><circle cx="${x + w - 10}" cy="${y + h / 2}" r="3.5" fill="#e6c34a"/>`;

Object.assign(RM_PICS_THEME, {
2: [_sc('Bàn làm việc của chị Mai', 'office', [_w(130, 428, '#e07a9b'), _desk(338), [0, '📖', 48, 310, 46], [11, '📇', 94, 326, 32], [1, '📚', 214, 308, 48], [3, '📰', 266, 312, 46], [9, '📓', 314, 312, 46], [10, '🖊️', 358, 308, 42]]),
    _sc('Lối ra vào nhà', 'room', [_win(236, 34, 140, 112), '<rect x="236" y="118" width="140" height="28" fill="#9aa3ab"/>', [8, '🚗', 306, 108, 54], [6, '⏰', 90, 84, 62], '<rect x="150" y="196" width="100" height="14" rx="6" fill="#8a5a35"/>', [7, '🔑', 200, 172, 40], '<rect x="26" y="272" width="124" height="10" fill="#8a5a35"/>', [2, '📙', 88, 244, 48], _w(210, 424, '#4d9de0'), [4, '☂️', 336, 336, 76], [5, '👜', 104, 356, 62]])],

3: [_sc('Hành lang công ty', 'office', ['<rect y="340" width="400" height="8" fill="#9aa8b8"/>', _door(14, 196, 64, 144, '#d9b27c'), _door(88, 196, 64, 144, '#c9915a'), _door(162, 196, 64, 144, '#e0b080'), _door(236, 196, 64, 144, '#8fc1d9'), '<rect x="312" y="196" width="76" height="144" rx="4" fill="#c0c6cc" stroke="#8a929a" stroke-width="3"/><path d="M350 196v144" stroke="#8a929a" stroke-width="3"/>',
      [3, '🏫', 46, 166, 44, 46, 356], [5, '💼', 120, 166, 44, 120, 356], [4, '🍽️', 194, 166, 44, 194, 356], [6, '🚻', 268, 166, 44, 268, 356], [8, '🛗', 350, 166, 44, 350, 356]]),
    _sc('Sảnh tiếp tân và quầy bán nước', 'office', ['<rect y="376" width="400" height="64" fill="#b9c4d1"/>', _w(96, 396, '#e0443e'), '<rect x="16" y="318" width="170" height="70" rx="6" fill="#c9915a"/><rect x="16" y="312" width="170" height="10" fill="#a56d3f"/>', [7, '🛎️', 150, 296, 40], [10, '🏢', 300, 66, 58], [9, '🔢', 200, 66, 44],
      '<path d="M214 440L252 336H320L372 440z" fill="#e6dccb"/>', [0, '🚩', 262, 414, 56, 232, 420], [1, '🚩', 296, 372, 38, 318, 376], [2, '🚩', 300, 344, 24, 326, 346],
      '<rect x="336" y="150" width="52" height="116" rx="4" fill="#d9534f"/><rect x="342" y="158" width="40" height="16" fill="#222"/>', [11, '🏷️', 362, 196, 30], [12, '💴', 362, 236, 30]])],

4: [_sc('Buổi sáng của Nam', 'room', [_win(236, 30, 130, 110), [4, '🌄', 301, 92, 70, 301, 150], '<rect x="20" y="272" width="190" height="70" rx="8" fill="#7aa7d9"/><rect x="20" y="256" width="190" height="24" rx="6" fill="#fff"/>', _m(98, 350, '#f4a259', { armL: [-30, -92], armR: [30, -92] }), [6, '🥱', 150, 238, 44, 98, 366], '<rect x="240" y="300" width="130" height="14" rx="5" fill="#a56d3f"/><rect x="250" y="314" width="8" height="56" fill="#8a5a35"/><rect x="352" y="314" width="8" height="56" fill="#8a5a35"/>', [1, '🕖', 270, 276, 46], [3, '🕧', 332, 278, 46], [12, '🔁☀️', 80, 166, 60]]),
    _sc('Từ buổi chiều đến đêm', 'lilac', ['<rect x="6" y="6" width="190" height="206" rx="12" fill="#fdf0d5"/><rect x="204" y="6" width="190" height="206" rx="12" fill="#e8f1fb"/><rect x="6" y="220" width="190" height="214" rx="12" fill="#eaf6e4"/><rect x="204" y="220" width="190" height="214" rx="12" fill="#1f2a4a"/>',
      [5, '🌇', 160, 38, 40, 160, 86], _m(94, 190, '#4d9de0'), '<rect x="30" y="132" width="140" height="12" fill="#a56d3f"/>', [8, '💻', 92, 112, 44, 40, 166], [10, '📚', 270, 122, 56, 300, 172], _w(292, 112, '#e0605b', { s: .6 }), [9, '🛋️', 100, 300, 70, 100, 350], _w(100, 330, '#f4a259', { s: .6 }), [7, '😴', 300, 316, 64, 300, 366], [11, '🏁', 360, 252, 36, 360, 296], [13, '⏪', 40, 252, 34, 40, 290], [2, '⏱️', 160, 252, 34, 160, 290]])],

5: [_sc('Nhà ga, bến xe và sân bay', 'sky', ['<rect y="296" width="400" height="144" fill="#9aa3ab"/><path d="M0 366h400" stroke="#fff" stroke-width="4" stroke-dasharray="26 18"/><rect y="252" width="400" height="10" fill="#6b6b6b"/>', [5, '✈️', 90, 96, 70], [3, '🚆', 120, 222, 66], [4, '🚌', 290, 322, 70], [6, '🚶', 70, 340, 56, 70, 392], _m(330, 396, '#4d9de0', { s: .6 }), [0, '➡️', 200, 392, 38], [2, '🏠', 350, 252, 40, 350, 296]]),
    _sc('Bữa tiệc sinh nhật', 'room', ['<rect x="240" y="40" width="130" height="90" rx="6" fill="#fff" stroke="#e7d3b0" stroke-width="4"/>', [10, '🗓️', 120, 80, 58], [11, '📆', 305, 84, 50], '<rect x="120" y="318" width="160" height="60" rx="8" fill="#f6d9a8"/>', [12, '🎂', 200, 296, 64, 200, 392], _w(60, 400, '#e07a9b', { s: .86 }), _m(110, 400, '#4d9de0', { s: .86 }), [8, '<g/>', 85, 412], _w(300, 400, '#6aa56a', { s: .86 }), _w(340, 400, '#f4c542', { s: .86 }), [7, '<g/>', 320, 412], [9, '🧍', 372, 330, 50, 372, 392], [1, '🚪', 372, 160, 50]])],

6: [_sc('Quán cơm: ăn uống cùng nhau', 'room', ['<rect x="30" y="300" width="340" height="12" rx="5" fill="#a56d3f"/><rect x="44" y="312" width="10" height="70" fill="#8a5a35"/><rect x="346" y="312" width="10" height="70" fill="#8a5a35"/>', _m(110, 400, '#f4a259', { s: .9 }), _w(290, 400, '#e07a9b', { s: .9 }), [9, '🍚', 112, 280, 50], [0, '😋', 112, 196, 44, 70, 412], [1, '🥤', 290, 282, 46], [12, '🧑‍🤝‍🧑', 200, 120, 50, 200, 172], [8, '🤝', 200, 262, 44]]),
    _sc('Cuối tuần của chị Lan', 'street', ['<rect x="16" y="60" width="150" height="100" rx="8" fill="#222"/><rect x="24" y="68" width="134" height="84" fill="#3d6fb5"/>', [10, '🎬', 91, 110, 56, 91, 176], [2, '👀', 210, 100, 40], [3, '🎧', 300, 100, 50], [4, '📖', 70, 280, 52], [5, '✍️', 160, 280, 48], [6, '🛍️', 250, 282, 54], [7, '📷', 336, 282, 50], [11, '🖼️', 336, 140, 50]])],
});

Object.assign(RM_PICS_THEME, {
7: [_sc('Bàn ăn và góc làm việc', 'room', ['<rect y="236" width="400" height="204" fill="#cf9a63"/><rect y="232" width="400" height="8" fill="#b57a45"/>', [3, '💻', 70, 190, 78], [6, '💐', 205, 186, 70], [4, '📱', 330, 296, 52], [1, '✋', 70, 330, 74], [0, '🥢', 200, 352, 58, 200, 398], [2, '✂️', 320, 372, 52, 320, 412]]),
    _sc('Tặng quà, cho mượn và học hỏi', 'lilac', ['<rect x="6" y="6" width="190" height="206" rx="12" fill="#fff3e0"/><rect x="204" y="6" width="190" height="206" rx="12" fill="#e8f1fb"/><rect x="6" y="220" width="388" height="214" rx="12" fill="#eaf6e4"/>',
      _m(60, 190, '#4d9de0', { s: .8, armR: [40, -60] }), [5, '🎁', 104, 130, 46, 104, 170], _w(150, 190, '#e07a9b', { s: .8, armL: [-30, -52] }), [7, '<g/>', 60, 200], [8, '<g/>', 150, 200],
      _m(256, 190, '#f4a259', { s: .8 }), [9, '📖', 300, 130, 40, 300, 170], _w(346, 190, '#6aa56a', { s: .8 }), [10, '<g/>', 346, 200],
      [11, '🧑‍🏫', 100, 300, 64, 100, 350], [12, '🧑‍🎓', 300, 300, 64, 300, 350]])],

8: [_sc('Phố mua sắm: to nhỏ, mới cũ, đắt rẻ', 'street', [[0, '🏢', 80, 276, 100, 80, 340], [1, '🏠', 190, 316, 52, 190, 350], [2, '🆕', 300, 276, 70, 300, 320], [3, '🏚️', 360, 316, 60, 360, 356], '<rect x="20" y="40" width="170" height="70" rx="10" fill="#fff" stroke="#c9a96e" stroke-width="3"/><rect x="210" y="40" width="170" height="70" rx="10" fill="#fff" stroke="#c9a96e" stroke-width="3"/>', [4, '💎', 105, 76, 50], [5, '🪙', 295, 76, 46], [12, '🌟', 200, 140, 36]]),
    _sc('Thị trấn qua bốn mùa', 'sky', ['<path d="M0 330q100-40 200-12t200-16v138H0z" fill="#a8d08a" opacity=".0"/>', [7, '🥵', 70, 80, 60], [8, '🥶', 330, 80, 60], [6, '🍜', 200, 120, 60], [10, '🤫', 60, 250, 54], [11, '🎉', 340, 250, 54], [9, '🏃', 120, 360, 54], [13, '🌸', 230, 260, 54], [14, '🤝', 300, 360, 54]])],

9: [_sc('Sở thích cuối tuần', 'room', ['<rect y="300" width="400" height="8" fill="#b57a45" opacity=".0"/>', [4, '🍳', 70, 100, 70], [5, '🎸', 200, 96, 66], [6, '🎤', 330, 100, 64], [7, '⚽', 70, 260, 66], [8, '🖌️', 200, 260, 64], [11, '⏳', 330, 260, 58], [12, '📅', 200, 380, 52], _m(60, 420, '#4d9de0', { s: .6 })]),
    _sc('Thích, ghét, giỏi, kém', 'lilac', ['<rect x="6" y="6" width="190" height="206" rx="12" fill="#ffe3ea"/><rect x="204" y="6" width="190" height="206" rx="12" fill="#e8e8f2"/><rect x="6" y="220" width="190" height="214" rx="12" fill="#e4f5e0"/><rect x="204" y="220" width="190" height="214" rx="12" fill="#fff0d4"/>',
      [0, '❤️', 100, 90, 70], [1, '🥦', 296, 80, 58, 296, 150], [2, '🎹', 100, 310, 66, 100, 372], [3, '🎨', 296, 310, 66, 296, 372], [9, '💡', 40, 246, 30, 40, 284], [13, '❓', 360, 246, 30, 360, 284]])],

10: [_sc('Trong phòng bếp', 'kitchen', [_win(20, 40, 130, 150), '<rect x="62" y="130" width="14" height="60" fill="#8a5a35"/><circle cx="68" cy="112" r="30" fill="#5aa469"/>', [6, '🌳', 85, 112, 80, 85, 196], '<rect x="296" y="108" width="92" height="262" rx="7" fill="#e8eef2" stroke="#b8c4cc" stroke-width="2"/><path d="M296 188h92" stroke="#b8c4cc" stroke-width="3"/>', [8, '🧊', 342, 150, 66, 342, 226], [7, '📦', 200, 332, 64], [5, '🐈', 200, 272, 52, 150, 292], _m(64, 400, '#4d9de0'), [2, '<g/>', 64, 412], _w(260, 400, '#e07a9b'), [3, '<g/>', 260, 412], [4, '🐕', 340, 368, 56, 340, 416]]),
    _sc('Mèo và chiếc hộp', 'lilac', ['<rect x="6" y="6" width="190" height="136" rx="12" fill="#fff3e0"/><rect x="204" y="6" width="190" height="136" rx="12" fill="#e8f1fb"/><rect x="6" y="150" width="190" height="136" rx="12" fill="#eaf6e4"/><rect x="204" y="150" width="190" height="136" rx="12" fill="#ffe3ea"/><rect x="6" y="294" width="190" height="136" rx="12" fill="#f0e8ff"/><rect x="204" y="294" width="190" height="136" rx="12" fill="#e4f0f5"/>',
      _pe('📦', 100, 100, 56), [9, '🐈', 100, 52, 48, 28, 128], _pe('📦', 300, 50, 50), [10, '🐈', 300, 108, 40, 372, 128], _pe('📦', 100, 190, 46), [11, '🐈', 100, 242, 54, 28, 272], _pe('🐈', 300, 190, 40), [12, '📦', 300, 236, 58, 372, 272], _pe('📦', 70, 340, 50), [13, '🐈', 140, 360, 50, 28, 416], _pe('📦', 260, 350, 50), _pe('📦', 340, 350, 50), [14, '🐈', 300, 362, 44, 372, 416]])],

11: [_sc('Chợ trái cây', 'sky', ['<rect x="20" y="128" width="360" height="12" rx="5" fill="#a56d3f"/><rect x="20" y="268" width="360" height="12" rx="5" fill="#a56d3f"/>', [0, '🍎', 60, 100, 48], [1, '🍎🍎', 200, 100, 62], [2, '🍎🍎🍎', 330, 100, 72], [3, '🧍', 60, 224, 56], [4, '👫', 200, 224, 62], [5, '👨‍👩‍👧‍👦', 330, 224, 62]].map(it => it)),
    _sc('Bưu điện và văn phòng', 'office', [[11, '📮', 70, 90, 60], [12, '✉️', 200, 90, 58], [6, '📄', 330, 90, 54], [7, '💻', 70, 230, 60], [8, '🔁', 200, 230, 54], [9, '⏳', 330, 230, 54], [10, '📆', 130, 360, 52], [13, '👬', 280, 360, 56]])],

12: [_sc('Du lịch bốn mùa', 'sky', [_m(70, 400, '#4d9de0', { s: .9 }), [11, '🧳', 120, 390, 50, 120, 420], [10, '🌤️', 90, 90, 60], [12, '🍂', 330, 90, 56], [8, '🌷', 90, 220, 54], [9, '🍃', 330, 220, 54], [0, '👌', 210, 300, 54], [1, '🤯', 310, 340, 54]]),
    _sc('Cuộc chạy đua', 'sky', ['<rect y="360" width="400" height="12" fill="#fff" opacity=".0"/><path d="M0 330q100-40 200-12t200-16" stroke="none"/>', [4, '🐇', 90, 200, 70], [5, '🐢', 270, 330, 70], [13, '🥇', 330, 100, 64], [2, '🔎', 60, 340, 52], [3, '🔭', 200, 100, 52], [6, '📈', 100, 90, 48], [7, '📉', 220, 220, 48]])],
});

Object.assign(RM_PICS_THEME, {
13: [_sc('Ngày nghỉ ở biển', 'sea', [[10, '🌊', 90, 230, 70, 90, 280], [2, '🏊', 200, 232, 58], [1, '🏐', 320, 330, 58, 320, 382], _w(70, 420, '#e07a9b', { s: .8 }), [11, '💧', 110, 354, 40, 110, 416], [4, '😩', 200, 340, 52], [12, '🤤', 240, 400, 40, 240, 430], [7, '🍽️', 330, 240, 52]]),
    _sc('Một ngày trong thành phố', 'street', [[9, '🖼️', 70, 110, 62], [8, '🚶', 200, 300, 60], [6, '🛒', 330, 300, 62], [0, '🤩', 330, 110, 56], [5, '💍', 70, 300, 60], [3, '🤗', 200, 110, 56]])],

14: [_sc('Căn phòng ngày mưa', 'room', [_win(30, 36, 150, 130), [13, '☔', 105, 100, 70, 105, 184], [12, '🌧️', 70, 70, 36, 30, 172], [14, '🪟', 105, 100, 1, 190, 100], '<rect x="220" y="60" width="150" height="6" rx="3" fill="#8a5a35"/>', [0, '💡', 255, 100, 50, 255, 140], [1, '🌑', 335, 100, 50, 335, 140], _door(216, 210, 70, 160, '#d9b27c'), [2, '🚪', 251, 290, 40, 251, 384], _door(310, 210, 70, 160, '#8a5a35'), [3, '🔒', 345, 290, 40, 345, 384]].filter(x => !(Array.isArray(x) && x[1] === '🪟'))),
    _sc('Nhờ vả và giúp nhau', 'street', [_m(60, 400, '#4d9de0', { s: .86 }), [7, '🤝', 100, 300, 44, 100, 412], [5, '⏳', 200, 300, 48, 200, 360], [4, '🏃', 320, 300, 58], [6, '🤲', 70, 180, 50], [8, '📣', 200, 150, 52], [9, '🗣️', 330, 170, 52], [10, '🙌', 120, 110, 50], [11, '🛠️', 280, 90, 50]])],

15: [_sc('Xưởng và văn phòng', 'office', ['<rect y="300" width="400" height="10" fill="#a8b4c2"/>', [6, '📑', 70, 100, 62], [7, '📦', 200, 100, 62], [1, '🔨', 330, 100, 60], [2, '🏪', 70, 250, 62], [5, '🔬', 200, 250, 62], [0, '📥', 330, 250, 58], _m(200, 420, '#f4a259', { s: .6 })]),
    _sc('Phòng chờ: chỗ ngồi và cuộc sống', 'lilac', [[4, '🏠', 70, 100, 62], [3, '🧠', 200, 100, 56], [8, '🙋‍♂️', 330, 100, 56], [9, '💑', 70, 250, 62], [10, '🚬', 200, 250, 52], [11, '🪑', 330, 250, 62], [12, '🧍', 200, 380, 58]])],

16: [_sc('Tiệm làm tóc', 'mint', [[12, '💇', 70, 130, 70], [13, '👁️', 200, 130, 62], [7, '🧒', 330, 130, 62], [8, '📏', 100, 280, 56], [9, '🤏', 200, 280, 52], [10, '🔆', 300, 280, 56], [11, '🌑', 200, 390, 52]]),
    _sc('Đi xe buýt và tắm', 'street', [[0, '🚌', 70, 120, 70], [1, '🚏', 200, 120, 62], [2, '🔄', 330, 120, 58], [6, '👆', 70, 260, 58], [4, '📥', 200, 260, 56], [5, '📤', 330, 260, 56], [3, '🚿', 200, 380, 60]])],

17: [_sc('Ở bệnh viện', 'mint', ['<rect y="376" width="400" height="64" fill="#bfe0d0"/><rect x="150" y="22" width="100" height="60" rx="8" fill="#fff"/><path d="M200 32v40M180 52h40" stroke="#e0443e" stroke-width="12"/>', [12, '🤒', 70, 150, 70], [11, '🌡️', 200, 150, 66], [10, '💊', 330, 150, 62], [7, '😟', 70, 300, 56], [6, '🧥', 200, 300, 60], [13, '💎', 330, 300, 52]]),
    _sc('Công việc và việc hằng ngày', 'office', [[8, '🌃', 70, 100, 62], [9, '🧳', 200, 100, 60], [3, '💳', 330, 100, 56], [4, '🔙', 70, 240, 56], [2, '🕵️', 200, 240, 60], [1, '💭', 330, 240, 56], [0, '🧠', 130, 370, 54], [5, '🚶', 280, 370, 58]])],

18: [_sc('Góc sở thích', 'room', [[9, '🎨', 70, 100, 66], [2, '🎹', 200, 100, 66], [3, '🎤', 330, 100, 62], [4, '🧲', 70, 250, 60], [7, '🚗', 200, 250, 64], [10, '📔', 330, 250, 58], [11, '💵', 200, 380, 56]]),
    _sc('Dịch vụ và việc nhà', 'kitchen', [[1, '🧼', 70, 120, 62], [5, '🗑️', 200, 120, 62], [6, '💱', 330, 120, 60], [8, '📞', 70, 280, 58], [0, '💪', 200, 280, 60], [13, '🙏', 330, 280, 58]])],

19: [_sc('Cuối tuần bận rộn', 'sky', [[2, '🧹', 70, 110, 64], [3, '🧺', 200, 110, 62], [4, '🏋️', 330, 110, 62], [0, '🧗', 70, 270, 64], [1, '🏨', 200, 270, 62], [6, '😪', 330, 270, 60]]),
    _sc('Thay đổi từng chút', 'lilac', [[7, '💪', 70, 110, 62], [8, '🥀', 200, 110, 58], [5, '🦋', 330, 110, 60], [9, '📊', 70, 260, 58], [11, '📈', 200, 260, 56], [12, '⏳', 330, 260, 56], [10, '1️⃣', 200, 380, 52]])],
});

Object.assign(RM_PICS_THEME, {
20: [_sc('Du lịch Nhật Bản', 'street', [[9, '👘', 70, 110, 66], [10, '🛂', 200, 110, 62], [2, '🔧', 330, 110, 58], [1, '🔍', 70, 270, 58], [7, '💬', 200, 270, 58], [8, '🏷️', 330, 270, 58]]),
    _sc('Trò chuyện với bạn thân', 'lilac', [_m(80, 410, '#4d9de0', { s: .9 }), _w(320, 410, '#e07a9b', { s: .9 }), [3, '<g/>', 80, 424], [4, '👉', 200, 300, 50], [5, '👍', 200, 110, 54], [6, '👎', 330, 110, 54], [11, '▶️', 70, 110, 50], [12, '⏹️', 200, 200, 50], [0, '🤲', 330, 230, 54]].filter(x => !(Array.isArray(x) && x[1] === '<g/>')))],

21: [_sc('Trận bóng đá', 'sky', ['<path d="M0 330q100-40 200-12t200-16v138H0z" fill="#7bbf7b"/>', [7, '⚽', 200, 280, 64], [2, '🏆', 80, 130, 64], [3, '😢', 320, 130, 60], [10, '🚦', 70, 270, 60], [8, '🗳️', 330, 270, 58], [9, '💬', 200, 130, 58]]),
    _sc('Buổi họp ý kiến', 'office', [[0, '🤔', 70, 100, 58], [1, '🗨️', 200, 100, 58], [12, '🤷', 330, 100, 58], [13, '💯', 70, 240, 56], [4, '👍', 200, 240, 56], [5, '💸', 330, 240, 56], [6, '🚧', 130, 370, 54], [11, '🆕', 280, 370, 54]])],

22: [_sc('Cửa hàng quần áo', 'room', ['<rect x="16" y="100" width="368" height="8" fill="#8a5a35"/><rect x="16" y="244" width="368" height="8" fill="#8a5a35"/>', [2, '🧢', 60, 70, 52], [6, '🎩', 160, 70, 52], [3, '🕶️', 260, 70, 52], [5, '👓', 350, 70, 52], [0, '👕', 70, 214, 58], [1, '👖', 200, 214, 58], [7, '👟', 330, 214, 58], _w(200, 424, '#e07a9b', { s: .7 })]),
    _sc('Căn hộ mới', 'kitchen', [[4, '👶', 70, 110, 62], [9, '🏢', 200, 110, 64], [10, '💴', 330, 110, 58], [11, '🍳', 70, 270, 60], [12, '✅', 200, 270, 56], [8, '📝', 330, 270, 56]])],

23: [_sc('Ngã tư đường phố', 'street', ['<rect y="340" width="400" height="100" fill="#8f98a3"/><rect x="150" y="150" width="100" height="290" fill="#8f98a3"/><g fill="#fff"><rect x="160" y="350" width="12" height="40"/><rect x="180" y="350" width="12" height="40"/><rect x="200" y="350" width="12" height="40"/><rect x="220" y="350" width="12" height="40"/></g>', [8, '🚦', 60, 250, 64], [9, '🔀', 200, 250, 56, 200, 300], [10, '🌉', 330, 120, 66], [11, '📐', 60, 120, 52], [12, '⬆️', 200, 130, 52, 200, 170], [6, '↪️', 320, 250, 56], [5, '🚸', 200, 410, 50, 130, 420], [4, '🚶', 290, 394, 50]]),
    _sc('Thao tác với đồ vật', 'lilac', [[0, '🔃', 70, 130, 62], [1, '🧲', 200, 130, 62], [2, '🔁', 330, 130, 58], [3, '🖐️', 120, 300, 62], [7, '😔', 280, 300, 62]])],

24: [_sc('Chuyển nhà', 'street', [[7, '🚚', 120, 280, 90], [8, '🍪', 300, 110, 62], [2, '📤', 70, 110, 58], [6, '✅', 200, 110, 54], [0, '🎁', 310, 280, 56], [1, '🧑‍🤝‍🧑', 200, 390, 56]]),
    _sc('Hướng dẫn và giới thiệu', 'office', [[3, '🤝', 70, 120, 62], [4, '🚩', 200, 120, 62], [5, '📣', 330, 120, 58], [10, '🙋', 70, 280, 58], [9, '🔢', 200, 280, 56], [11, '➕', 330, 280, 56]])],

25: [_sc('Từ quê lên đại học', 'sky', [[4, '🌾', 70, 120, 66], [5, '🏛️', 200, 120, 66], [2, '🎓', 330, 120, 62], [12, '💮', 70, 280, 58], [10, '💪', 200, 280, 58], [6, '🍀', 330, 280, 58]]),
    _sc('Chuyến bay công tác', 'sky', [[0, '💭', 70, 110, 58], [1, '🛬', 200, 110, 62], [3, '🤲', 330, 110, 56], [9, '🏢', 70, 260, 60], [11, '⚠️', 200, 260, 54], [7, '❔', 330, 260, 54], [8, '💴', 200, 380, 54]])],
});
