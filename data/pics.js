/* Tranh từ vựng cho các trạm của Lộ trình N5.
   Mỗi tranh = một nền cảnh (SVG) + các đồ vật lớn, dễ nhận ra (emoji màu của thiết bị) đặt trên thẻ tròn; số + nhãn nằm ngay dưới từng đồ vật.
   RM_PICS[số trạm] = mảng các tranh { title, svg, pins }, mỗi lần hiện một tranh (tối đa ~9 từ / tranh).
   Item: [chỉ số từ trong RM_LESSONS[n].vocab, emoji | hàm vẽ (x, y, s) → svg]. Vị trí được tự xếp lưới bởi _scene(). */
const _EF = 'font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"';
const _G = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
const _BG = {
  room: _G('gR', '#fbf0dc', '#f1dcba') + '<rect width="400" height="440" fill="url(#gR)"/><rect y="372" width="400" height="68" fill="#d9b98c"/><rect y="368" width="400" height="8" fill="#c9a572"/><g stroke="#c9a572" stroke-width="2" opacity=".5"><path d="M0 396h400M0 420h400"/></g><rect x="150" y="22" width="100" height="64" rx="6" fill="#fff" opacity=".4"/><path d="M200 22v64M150 54h100" stroke="#e7d3b0" stroke-width="3"/>',
  sky: _G('gS', '#bfe3f7', '#eaf7ff') + '<rect width="400" height="440" fill="url(#gS)"/><circle cx="340" cy="52" r="26" fill="#ffd54a" opacity=".9"/><g fill="#fff"><ellipse cx="70" cy="60" rx="34" ry="14"/><ellipse cx="96" cy="52" rx="24" ry="14"/><ellipse cx="250" cy="96" rx="30" ry="12"/></g><path d="M0 360q100-50 200-14t200-20v114H0z" fill="#a8d08a"/><path d="M0 400q120-30 220-4t180-14v58H0z" fill="#8fc274"/>',
  street: _G('gT', '#cfe8f7', '#eef7fc') + '<rect width="400" height="440" fill="url(#gT)"/><g fill="#c3ccd6"><rect x="10" y="190" width="60" height="180"/><rect x="80" y="150" width="50" height="220"/><rect x="250" y="170" width="70" height="200"/><rect x="330" y="210" width="60" height="160"/></g><g fill="#e8eef4"><rect x="20" y="206" width="10" height="12"/><rect x="40" y="206" width="10" height="12"/><rect x="90" y="170" width="10" height="12"/><rect x="108" y="170" width="10" height="12"/><rect x="262" y="190" width="10" height="12"/><rect x="284" y="190" width="10" height="12"/></g><rect y="366" width="400" height="74" fill="#8f98a3"/><path d="M0 404h400" stroke="#fff" stroke-width="4" stroke-dasharray="26 18"/>',
  sea: _G('gSe', '#bfe3f7', '#e8f6ff') + '<rect width="400" height="440" fill="url(#gSe)"/><circle cx="330" cy="56" r="24" fill="#ffd54a"/><rect y="190" width="400" height="150" fill="#4aa8d8"/><path d="M0 220q25-12 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><path d="M0 330q100-30 200-6t200-10v126H0z" fill="#f3dca8"/>',
  night: _G('gN', '#1f2a4a', '#3b4a7a') + '<rect width="400" height="440" fill="url(#gN)"/><circle cx="330" cy="60" r="24" fill="#ffe9a8"/><g fill="#ffe9a8"><circle cx="60" cy="50" r="2"/><circle cx="120" cy="90" r="2"/><circle cx="220" cy="40" r="2"/><circle cx="280" cy="110" r="2"/><circle cx="40" cy="140" r="2"/></g><rect y="376" width="400" height="64" fill="#2c3a63"/>',
  office: _G('gO', '#e7edf4', '#d3dde9') + '<rect width="400" height="440" fill="url(#gO)"/><rect y="376" width="400" height="64" fill="#b9c4d1"/><rect x="40" y="26" width="120" height="76" rx="4" fill="#cfe8f7" stroke="#fff" stroke-width="6"/><path d="M100 26v76M40 64h120" stroke="#fff" stroke-width="4"/><rect x="240" y="30" width="110" height="64" rx="3" fill="#fff" stroke="#b9c4d1" stroke-width="3"/>',
  kitchen: '<rect width="400" height="440" fill="#fff8ec"/><g stroke="#e8dcc4" stroke-width="2"><path d="M0 60h400M0 120h400M0 180h400M0 240h400M0 300h400M0 360h400"/><path d="M60 0v440M140 0v440M220 0v440M300 0v440M380 0v440"/></g><rect y="372" width="400" height="68" fill="#d9b98c"/>',
  mint: _G('gM', '#eaf7f1', '#d6eee3') + '<rect width="400" height="440" fill="url(#gM)"/><rect y="376" width="400" height="64" fill="#bfe0d0"/><rect x="170" y="22" width="60" height="60" rx="8" fill="#fff"/><path d="M200 32v40M180 52h40" stroke="#e0443e" stroke-width="12"/>',
  lilac: _G('gL', '#f3effc', '#e3dcf5') + '<rect width="400" height="440" fill="url(#gL)"/><circle cx="60" cy="50" r="22" fill="#fff" opacity=".5"/><circle cx="350" cy="400" r="30" fill="#fff" opacity=".4"/>',
};
// Hình minh họa tự vẽ cho những từ không có emoji hợp (cờ, quan hệ vị trí)
const _flagVN = (x, y, s) => `<g><rect x="${x - s * .45}" y="${y - s * .3}" width="${s * .9}" height="${s * .6}" fill="#da251d" stroke="#ccc"/><path d="M${x} ${y - s * .17}l${s * .05} ${s * .12}h${s * .13}l-${s * .1} ${s * .08} ${s * .04} ${s * .13}-${s * .12}-${s * .08}-${s * .12} ${s * .08} ${s * .04}-${s * .13}-${s * .1}-${s * .08}h${s * .13}z" fill="#ffd400"/></g>`;
const _flagJP = (x, y, s) => `<g><rect x="${x - s * .45}" y="${y - s * .3}" width="${s * .9}" height="${s * .6}" fill="#fff" stroke="#ccc"/><circle cx="${x}" cy="${y}" r="${s * .18}" fill="#d9253a"/></g>`;
const _rel = k => (x, y, s) => {
  const b = s * .42, r = s * .14, box = (cx, cy) => `<rect x="${cx - b / 2}" y="${cy - b / 2}" width="${b}" height="${b}" rx="${s * .05}" fill="#c9915a" stroke="#8a5a35" stroke-width="2.5"/>`;
  const ball = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e0443e" stroke="#9b2c28" stroke-width="2.5"/>`;
  if (k === 'ue') return box(x, y + s * .16) + ball(x, y + s * .16 - b / 2 - r);
  if (k === 'shita') return box(x, y - s * .16) + ball(x, y - s * .16 + b / 2 + r);
  if (k === 'tonari') return box(x - s * .22, y + s * .06) + ball(x + s * .22, y + s * .06 + b / 2 - r);
  if (k === 'aida') return box(x - s * .3, y + s * .06) + box(x + s * .3, y + s * .06) + ball(x, y + s * .06 + b / 2 - r);
  if (k === 'mae') return box(x, y - s * .1) + `<circle cx="${x}" cy="${y + s * .2}" r="${r * 1.3}" fill="#e0443e" stroke="#9b2c28" stroke-width="2.5"/>`;
  return ball(x + s * .12, y - s * .12) + box(x - s * .06, y + s * .04);   // ushiro: bóng nằm sau hộp
};

// Tự xếp lưới: cỡ đồ vật và vị trí theo số lượng
function _scene(title, bg, items) {
  const k = items.length, cfg = k <= 3 ? { c: k, ys: [215], s: 100 } : k === 4 ? { c: 2, ys: [130, 300], s: 96 } : k <= 6 ? { c: 3, ys: [130, 300], s: 84 } : { c: 3, ys: [82, 216, 350], s: 66 };
  const rows = []; for (let i = 0; i < k; i += cfg.c) rows.push(items.slice(i, i + cfg.c));
  let svg = _BG[bg] || _BG.lilac, pins = [];
  const gap = cfg.c === 2 ? 180 : 130;
  rows.forEach((row, ri) => row.forEach(([vi, e], ci) => {
    const x = 200 + (ci - (row.length - 1) / 2) * gap, y = cfg.ys[ri], s = cfg.s;
    svg += `<ellipse cx="${x}" cy="${y + s * .56}" rx="${s * .5}" ry="${s * .09}" fill="#000" opacity=".12"/><circle cx="${x}" cy="${y}" r="${s * .68}" fill="#fff" opacity=".62" stroke="#fff" stroke-width="3"/>`;
    if (typeof e === 'function') svg += e(x, y, s);
    else { const n = [...e].length, fs = s * (n > 1 ? Math.min(1, 1.5 / n) : 1); svg += `<text x="${x}" y="${y}" font-size="${fs}" text-anchor="middle" dominant-baseline="central" ${_EF}>${e}</text>`; }
    pins.push([vi, x, y + s * .75, 'b', [x, y, s * 1.3]]);
  }));
  return { title, svg, pins };
}

const RM_PICS = {
1: [_scene('Gặp gỡ: nghề nghiệp và quốc tịch', 'sky', [[2, '🧑‍🎓'], [3, '🧑‍💼'], [4, '🧑‍🏫'], [5, '👷'], [6, '🧑‍⚕️'], [9, '🏫'], [7, _flagVN], [8, _flagJP]])],
2: [_scene('Trên bàn học', 'room', [[0, '📖'], [1, '📚'], [2, '📙'], [3, '📰'], [9, '📓'], [10, '🖊️'], [11, '📇']]),
    _scene('Đồ dùng trong phòng', 'room', [[4, '☂️'], [5, '👜'], [6, '⏰'], [7, '🔑'], [8, '🚗']])],
3: [_scene('Các nơi trong tòa nhà', 'office', [[3, '🏫'], [4, '🍽️'], [5, '💼'], [6, '🚻'], [7, '🛎️'], [8, '🛗'], [10, '🏢']]),
    _scene('Chỗ này, chỗ đó, tầng và giá tiền', 'office', [[0, '📍'], [1, '👉'], [2, '🔭'], [9, '🏬'], [11, '🏷️'], [12, '💴']])],
4: [_scene('Giờ giấc', 'lilac', [[0, '⏰'], [1, '🕐'], [2, '⏱️'], [3, '🕧'], [4, '🌄'], [5, '🌇']]),
    _scene('Một ngày của bạn', 'room', [[6, '🥱'], [8, '🧑‍💻'], [10, '📚'], [9, '🛋️'], [7, '😴'], [11, '🏁'], [12, '☀️'], [13, '⏪']])],
5: [_scene('Đi bằng phương tiện gì', 'street', [[3, '🚆'], [4, '🚌'], [5, '✈️'], [6, '🚶'], [0, '➡️'], [2, '🏠']]),
    _scene('Đi với ai, khi nào', 'sky', [[7, '🧑‍🤝‍🧑'], [8, '👨‍👩‍👧'], [9, '🧍'], [12, '🎂'], [10, '🗓️'], [11, '📆']])],
6: [_scene('Ăn uống, xem phim, nghe nhạc', 'room', [[0, '😋'], [1, '🥤'], [9, '🍚'], [2, '👀'], [3, '👂'], [10, '🎬']]),
    _scene('Đọc, viết, mua sắm, chụp ảnh, gặp gỡ', 'street', [[4, '📖'], [5, '✍️'], [6, '🛍️'], [7, '📷'], [11, '🖼️'], [8, '🤝']])],
7: [_scene('Bàn ăn và đồ dùng trên bàn', 'room', [[0, '🥢'], [1, '✋'], [2, '✂️'], [3, '💻'], [4, '📱'], [5, '🎁'], [6, '💐']])],
8: [_scene('Đối lập: to – nhỏ, mới – cũ, đắt – rẻ', 'lilac', [[0, '🐘'], [1, '🐭'], [2, '🆕'], [3, '🏚️'], [4, '💎'], [5, '🪙']]),
    _scene('Cảm giác và tính chất', 'sky', [[7, '🥵'], [8, '🥶'], [6, '😋'], [13, '🌸'], [10, '🤫'], [11, '🎉'], [9, '💪'], [12, '⭐']])],
9: [_scene('Sở thích và thời gian rảnh', 'room', [[4, '🍳'], [5, '🎵'], [6, '🎤'], [7, '⚽'], [8, (x, y, s) => `<text x="${x}" y="${y}" font-size="${s * .8}" text-anchor="middle" dominant-baseline="central" font-weight="700" fill="#2f5d4b" font-family="sans-serif">字</text>`], [11, '⏳'], [12, '📅']]),
    _scene('Thích, ghét, giỏi, kém', 'lilac', [[0, '❤️'], [1, '💔'], [2, '👍'], [3, '👎'], [9, '💡'], [13, '❓']])],
10: [_scene('Ai và cái gì ở đây (います・あります)', 'kitchen', [[2, '👨'], [3, '👩'], [4, '🐕'], [5, '🐈'], [6, '🌳'], [7, '📦'], [8, '🧊']]),
    _scene('Vị trí: trên, dưới, trước, sau, bên cạnh, giữa', 'lilac', [[9, _rel('ue')], [10, _rel('shita')], [11, _rel('mae')], [12, _rel('ushiro')], [13, _rel('tonari')], [14, _rel('aida')]])],
11: [_scene('Đếm: cái, người', 'room', [[0, '🍎'], [1, '🍎🍎'], [2, '🍎🍎🍎'], [3, '🧍'], [4, '👫'], [5, '👨‍👩‍👧‍👦']]),
    _scene('Đếm: tờ, máy, lần, thời gian, gửi thư', 'office', [[6, '📄'], [7, '💻'], [8, '🔁'], [9, '⏳'], [10, '📆'], [11, '📮'], [12, '✉️'], [13, '👬']])],
12: [_scene('Bốn mùa, thời tiết và du lịch', 'sky', [[10, '🌤️'], [12, '🍂'], [8, '🌷'], [9, '🍃'], [11, '🧳'], [0, '👌'], [1, '🤯']]),
    _scene('Gần – xa, nhanh – chậm, nhiều – ít', 'lilac', [[4, '🐇'], [5, '🐢'], [2, '🔎'], [3, '🔭'], [6, '📈'], [7, '📉'], [13, '🥇'], [14, '♾️']])],
13: [_scene('Biển, bơi lội, đi chơi', 'sea', [[10, '🌊'], [2, '🏊'], [1, '🎮'], [8, '🚶'], [9, '🖼️'], [6, '🛒'], [7, '🍽️']]),
    _scene('Muốn, mệt, khát, đói', 'lilac', [[0, '🤩'], [4, '😩'], [11, '💧'], [12, '🤤'], [5, '💍'], [3, '🤗']])],
14: [_scene('Cửa sổ, mưa, đèn, cửa', 'room', [[14, '🪟'], [13, '☔'], [12, '🌧️'], [0, '💡'], [1, '🌑'], [2, '🚪'], [3, '🔒']]),
    _scene('Nhờ vả và làm giúp nhau', 'lilac', [[4, '🏃'], [5, '⏳'], [6, '🤲'], [7, '🤝'], [8, '📣'], [9, '🗣️'], [10, '🙌'], [11, '🛠️']])],
15: [_scene('Nơi làm việc', 'office', [[6, '📑'], [7, '📦'], [1, '🔨'], [2, '🏪'], [5, '🔬'], [0, '📥']]),
    _scene('Nơi ở, trạng thái, được phép – bị cấm', 'lilac', [[4, '🏠'], [3, '🧠'], [8, '🙋‍♂️'], [9, '💑'], [10, '🚬'], [11, '🪑'], [12, '🧍']])],
16: [_scene('Khuôn mặt và tóc', 'lilac', [[12, '💇'], [13, '👁️'], [7, '🧒'], [8, '📏'], [9, '🤏']]),
    _scene('Đi xe, thang máy, bỏ vào – lấy ra', 'street', [[0, '🚌'], [1, '🚏'], [2, '🔄'], [6, '👆'], [4, '📥'], [5, '📤']]),
    _scene('Tắm, sáng và tối', 'mint', [[3, '🚿'], [10, '🔆'], [11, '🌑']])],
17: [_scene('Sức khỏe', 'mint', [[12, '🤒'], [11, '🌡️'], [10, '💊'], [7, '😟'], [6, '🧥'], [13, '💎']]),
    _scene('Việc hằng ngày và công việc', 'office', [[0, '🧠'], [1, '💭'], [2, '🕵️'], [3, '💳'], [4, '🔙'], [5, '🚶'], [8, '🌃'], [9, '🧳']])],
18: [_scene('Sở thích và đồ vật', 'room', [[9, '🎨'], [2, '🎹'], [3, '🎤'], [4, '🧲'], [7, '🚗'], [10, '📔'], [11, '💵']]),
    _scene('Rửa, vứt, đổi, đặt trước', 'kitchen', [[1, '🧼'], [5, '🗑️'], [6, '🔄'], [8, '📞'], [0, '💪'], [13, '🙏']])],
19: [_scene('Việc nhà, luyện tập, leo núi', 'sky', [[2, '🧹'], [3, '🧺'], [4, '🏋️'], [0, '🧗'], [1, '🏨'], [6, '😪']]),
    _scene('Thay đổi và tình trạng', 'lilac', [[7, '💪'], [8, '🥀'], [5, '🦋'], [9, '📊'], [10, '1️⃣'], [11, '📈'], [12, '⏳']])],
20: [_scene('Văn hóa và giấy tờ', 'room', [[9, '👘'], [10, '🛂'], [2, '🔧'], [1, '🔍'], [7, '💬'], [8, '🏷️']]),
    _scene('Nói chuyện thân mật', 'lilac', [[3, '🧑'], [4, '👉'], [5, '👍'], [6, '👎'], [11, '▶️'], [12, '⏹️'], [0, '🤲']])],
21: [_scene('Trận đấu, giao thông, ý kiến', 'sky', [[7, '⚽'], [2, '🏆'], [3, '😢'], [10, '🚦'], [8, '🗳️'], [9, '💬']]),
    _scene('Nghĩ, nói, đánh giá', 'lilac', [[0, '🤔'], [1, '🗨️'], [12, '🤷'], [13, '💯'], [4, '👍'], [5, '💸'], [6, '🚧'], [11, '🆕']])],
22: [_scene('Trang phục: mặc, đội, đeo', 'room', [[2, '🧢'], [6, '🎩'], [3, '🕶️'], [5, '👓'], [0, '👕'], [1, '👖'], [7, '👟']]),
    _scene('Nơi ở và đời sống', 'kitchen', [[4, '👶'], [9, '🏢'], [10, '💴'], [11, '🍳'], [12, '✅'], [8, '📝']])],
23: [_scene('Đường phố: đèn, ngã tư, cầu, rẽ', 'street', [[8, '🚦'], [9, '🔀'], [10, '🌉'], [11, '📐'], [12, '⬆️'], [6, '↪️'], [5, '🚸'], [4, '🚶']]),
    _scene('Vặn, kéo, đổi, chạm', 'lilac', [[0, '🔃'], [1, '🧲'], [2, '🔁'], [3, '🖐️'], [7, '😔']])],
24: [_scene('Chuyển nhà, quà bánh, gửi đồ', 'room', [[7, '🚚'], [8, '🍪'], [2, '📤'], [6, '✅'], [0, '🎁'], [1, '🧑‍🤝‍🧑']]),
    _scene('Giới thiệu, hướng dẫn, giải thích', 'office', [[3, '🤝'], [4, '🚩'], [5, '📣'], [10, '🙋'], [9, '🔢'], [11, '➕']])],
25: [_scene('Quê, đại sứ quán, du học, thi đỗ', 'sky', [[4, '🌾'], [5, '🏛️'], [2, '🎓'], [12, '💮'], [10, '💪'], [6, '🍀']]),
    _scene('Suy nghĩ, đến nơi, điều kiện', 'lilac', [[0, '💭'], [1, '🛬'], [3, '🤲'], [9, '🏢'], [11, '⚠️'], [7, '❔'], [8, '💴']])],
};
