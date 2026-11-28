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
