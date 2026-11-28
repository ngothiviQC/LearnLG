/* ===================== Học Việt - Nhật =====================
   Cấu trúc theo trang "Luyện câu Việt Nhật": màn chào (chọn người Việt / người Nhật) → danh sách 50 bài → luyện từng bài
   (Việt → Nhật hoặc Nhật → Việt, tự viết hoặc trắc nghiệm). Thêm mục ngữ pháp N5.
   Dữ liệu câu: data/lessons.js (biến LESSONS); ngữ pháp: data/grammar.js (biến GRAMMAR). */

/* ===================== Tiện ích & lưu trữ cục bộ ===================== */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

/* ===================== Tải dữ liệu bài học khi cần ===================== */
// Dữ liệu lớn (1500 câu, ghi chú ngữ pháp, file nghe, Lộ trình, Kanji) không nạp sẵn trong index.html:
// chỉ tải khi rời màn chào (Tiếp tục học, chọn xuất thân) hoặc khi mở link có #. Tải song song, chạy theo đúng thứ tự.
const DATA_FILES = ['data/lessons.js', 'data/grammar.js'].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => 'data/notes-' + n + '.js'),
    ['data/clips.js', 'data/clips-vi.js', 'data/roadmap-lessons.js', 'data/roadmap-n4.js', 'data/kanji-viet.js', 'data/n5-overview.js', 'data/n5-grammar-plus.js', 'data/pics.js', 'data/n5-mock.js', 'data/pics-theme.js', 'data/roadmap-audio.js', 'data/roadmap-listen-audio.js', 'data/kanji-story.js']);
const DATA_VER = (() => { try { const s = document.currentScript && document.currentScript.src; return s && s.includes('?') ? s.slice(s.indexOf('?')) : ''; } catch (e) { return ''; } })();
const dataReady = () => typeof LESSONS !== 'undefined';
let dataP = null;
function loadData() {
    if (dataReady()) return Promise.resolve();
    if (!dataP) dataP = new Promise((res, rej) => {
        let left = DATA_FILES.length;
        DATA_FILES.forEach(f => {
            const el = document.createElement('script'); el.src = f + DATA_VER; el.async = false;   // async=false: giữ thứ tự chạy
            el.onload = () => { if (--left === 0) res(); };
            el.onerror = () => { dataP = null; rej(new Error(f)); };
            document.head.appendChild(el);
        });
    });
    return dataP;
}
// Chạy fn sau khi có dữ liệu; trong lúc tải đổi con trỏ chuột sang dạng chờ
function withData(fn) {
    if (dataReady()) return fn();
    document.documentElement.style.cursor = 'progress';
    loadData().then(() => { document.documentElement.style.cursor = ''; fn(); })
        .catch(() => { document.documentElement.style.cursor = ''; alert('Chưa tải được dữ liệu bài học. Kiểm tra mạng rồi thử lại.'); });
}

let pref = Object.assign({ furi: true, wmode: 'seq', rate: 1, script: 'hira' }, load('hvn.pref', {}));
// Không còn mục chọn chiều dịch: chiều dịch theo xuất thân (người Việt: Việt → Nhật, người Nhật: Nhật → Việt).
pref.dir = pref.ui === 'ja' ? 'jv' : 'vj';
if (!pref.mode) pref.mode = 'write';
if (pref.nodau == null) pref.nodau = pref.ui === 'ja';
const savePref = () => save('hvn.pref', pref);
// Thống kê sự kiện: đã gỡ Firebase Analytics, giữ hàm rỗng để các chỗ gọi track() không phải sửa
const track = () => { };
let wgr = load('hvn.write', {});   // { khóa bộ câu: { số thứ tự câu: 'ok' | 'mid' | 'ng' } }

/* ===================== Furigana ===================== */
// Tài liệu ghi dạng 漢字（かんじ）. Chuyển sang <ruby>, và tạo bản chỉ kanji / chỉ kana để so đáp án.
const FURI = /([一-鿿々〆ヶ]+)([぀-ゟ]*)（([぀-ヿー・]+)）/g;
function rubyHtml(s) {
    let out = '', last = 0; s = String(s);
    s.replace(FURI, (m, k, tail, r, at) => {
        out += esc(s.slice(last, at));
        if (!tail) out += '<ruby>' + esc(k) + '<rt>' + esc(r) + '</rt></ruby>';
        else if (r.endsWith(tail) && r.length > tail.length) out += '<ruby>' + esc(k) + '<rt>' + esc(r.slice(0, -tail.length)) + '</rt></ruby>' + esc(tail);
        else out += esc(k + tail) + '<span class="kn-small">（' + esc(r) + '）</span>';
        last = at + m.length; return m;
    });
    return out + esc(s.slice(last));
}
const plainJa = s => String(s).replace(/（[぀-ヿー・]+）/g, '');
const kanaJa = s => String(s).replace(FURI, (m, k, tail, r) => (!tail || r.endsWith(tail)) ? r : r + tail);
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const norm = s => String(s).normalize('NFKC').replace(/[\s、。，．,.!?！？「」『』…・〜~"'()（）]/g, '').toLowerCase();
function matchKind(input, ans) {
    const a = norm(input); if (!a) return null;
    if (a === norm(plainJa(ans))) return 'exact';
    if (toHira(a) === toHira(norm(kanaJa(ans)))) return 'kana';
    return null;
}

/* ===================== Chủ đề: gom 50 bài theo nội dung ===================== */
const TOPICS = [
    { mark: '人', vi: 'Làm quen & con người', ja: '出会いと人', dvi: 'Chào hỏi, thông tin cá nhân, cảm xúc, tính cách, ngoại hình, bạn bè.', dja: 'あいさつ、自己紹介、気持ち、性格、外見、友達。', ls: [1, 2, 8, 9, 10, 11] },
    { mark: '家', vi: 'Gia đình & đời sống hằng ngày', ja: '家族と毎日の生活', dvi: 'Gia đình, thói quen, giờ giấc, thời tiết, màu sắc, nhà cửa, việc nhà.', dja: '家族、日課、時間と日付、天気、色と形、住まい、家事。', ls: [3, 4, 5, 6, 7, 17, 32] },
    { mark: '夢', vi: 'Sở thích, kế hoạch & ước mơ', ja: '趣味・予定・夢', dvi: 'Thời gian rảnh, sự kiện, cuộc hẹn, nêu ý kiến, mục tiêu và tương lai.', dja: '趣味、イベント、約束、意見、目標と将来。', ls: [12, 39, 40, 44, 45, 50] },
    { mark: '食', vi: 'Ăn uống & mua sắm', ja: '食事と買い物', dvi: 'Mua sắm, món ăn, đồ uống, nhà hàng, gọi món, nấu ăn, dịch vụ.', dja: '買い物、食べ物と飲み物、レストラン、注文、料理、サービス。', ls: [13, 14, 15, 16, 34, 41] },
    { mark: '旅', vi: 'Đi lại & du lịch', ja: '移動と旅行', dvi: 'Khu phố, chỉ đường, giao thông, tham quan, khách sạn, sân bay.', dja: '町、道案内、交通、観光、ホテル、空港。', ls: [18, 19, 20, 22, 33, 42, 43] },
    { mark: '学', vi: 'Học tập & công sở', ja: '学校と職場', dvi: 'Trường lớp, văn phòng, họp hành, phỏng vấn, làm việc nhóm, sự nghiệp.', dja: '学校、オフィス、会議、面接、チームワーク、キャリア。', ls: [21, 23, 24, 25, 26, 30] },
    { mark: '商', vi: 'Kinh doanh & khách hàng', ja: 'ビジネスと接客', dvi: 'Tiếp khách, điện thoại, email, bán hàng, hợp đồng, an toàn nhà máy.', dja: '接客、電話とメール、販売、契約、工場の安全。', ls: [27, 28, 29, 46, 47, 48] },
    { mark: '健', vi: 'Sức khỏe & thủ tục', ja: '健康と手続き', dvi: 'Bệnh viện, sự cố khẩn cấp, bưu điện, thủ tục hành chính, làm tóc, môi trường.', dja: '病院、緊急時、郵便、役所の手続き、美容院、環境。', ls: [31, 35, 36, 37, 38, 49] },
];
const topicOf = no => TOPICS.findIndex(T => T.ls.includes(no)) + 1;   // số chủ đề (1–8) của một bài
// Số bài hiển thị: đánh số liên tục theo thứ tự chủ đề (chủ đề 1 = bài 1–6, chủ đề 2 = bài 7–13 …).
// Mã bài gốc (no) vẫn dùng cho đường dẫn #bai-no, tiến độ và file nghe.
const LESSON_ORDER = TOPICS.reduce((a, T) => a.concat(T.ls), []);
const dispNo = no => LESSON_ORDER.indexOf(no) + 1 || no;

/* ===================== Ngôn ngữ giao diện (vi / ja) ===================== */
// pref.ui: 'vi' | 'ja'; pref.dir: 'vj' (Việt → Nhật) | 'jv' (Nhật → Việt); pref.mode: 'write' | 'mc'.
const TX = {
    vi: {
        kicker: 'Luyện câu song ngữ', home: 'Trang chủ', h1: 'Việt ⇄ Nhật · 1500 câu', theme: 'Sáng/Tối', langBtn: '日本語',
        pick: 'Chọn bài', reached: (a, b) => 'đã đạt ' + a + '/' + b, lesson: n => 'Bài ' + n, gramTab: 'Ngữ pháp N5',
        dirLbl: 'Chiều dịch', vj: 'Việt → Nhật', jv: 'Nhật → Việt', modeLbl: 'Cách làm', write: 'Tự viết', mc: 'Trắc nghiệm',
        order: 'Thứ tự', seq: 'Lần lượt', rand: 'Ngẫu nhiên', todo: 'Chỉ câu chưa đạt', nodau: 'Không bắt buộc dấu',
        driveLink: n => 'Nghe đáp án bài ' + n + ' ↗',
        reachedN: (a, b) => 'Đã đạt ' + a + '/' + b, qLbl: (k, p, n) => 'Câu ' + k + ' · ' + p + '/' + n + ' trong lượt này', q: k => 'Câu ' + k,
        last: '· lần trước: ', G: { ok: 'đạt', mid: 'gần đúng', ng: 'chưa đúng' }, prev: '← Câu trước', next: 'Câu sau →',
        hintBtn: 'Xem gợi ý từ vựng', phJa: 'Gõ câu tiếng Nhật…', phVi: 'Gõ câu tiếng Việt…',
        check: 'Kiểm tra', reveal: 'Xem đáp án', kbd: 'Ctrl + Enter để kiểm tra',
        exact: 'Khớp đáp án', kana: 'Khớp đáp án (viết bằng kana)', nodauOk: 'Đúng, chỉ thiếu dấu', nodauMid: 'Đúng chữ nhưng thiếu dấu',
        self: 'Tự chấm: câu của bạn có diễn đạt đúng ý không?', ref: 'Đáp án tham khảo',
        fixed: 'Tài liệu gốc ghi nhầm hoặc thiếu đáp án câu này; câu tiếng Nhật do Claude soạn theo từ gợi ý.',
        cmp: 'Câu của bạn so với đáp án', legend: 'Đỏ: có trong câu của bạn nhưng không có trong đáp án. Xanh: đáp án có mà bạn thiếu. Một câu có thể có nhiều cách viết đúng.',
        del: 'Không có trong đáp án', ins: 'Đáp án có', grades: { ok: 'Đúng ý', mid: 'Gần đúng', ng: 'Chưa đúng' },
        retry: 'Viết lại', nextQ: 'Câu tiếp', lap: 'Hết lượt · làm lại từ đầu', lapDone: n => 'Đã đi hết ' + n + ' câu của lượt này. Chọn “Chỉ câu chưa đạt” để ôn lại những câu chưa đạt.',
        mcAsk: 'Chọn câu đúng nghĩa', mcOk: 'Chính xác', mcNg: 'Chưa đúng · đáp án đúng được tô xanh',
        sayVi: 'Nghe tiếng Việt', sayJa: 'Nghe tiếng Nhật', slow: 'Chậm', normal: 'Bình thường',
        noVoice: { vi: 'Máy này chưa có giọng đọc tiếng Việt. Cài giọng tiếng Việt trong cài đặt hệ điều hành rồi mở lại trang.', ja: 'Máy này chưa có giọng đọc tiếng Nhật. Cài giọng tiếng Nhật trong cài đặt hệ điều hành rồi mở lại trang.' },
        recLoading: n => 'Đang tải file nghe bài ' + n + '…', recFail: 'Chưa phát được bản ghi. Bấm lại thử.', clipWarn: 'Bản ghi bài này được chia câu tự động và có thể lệch.',
        noSpeech: 'Trình duyệt này không hỗ trợ đọc thành tiếng.',
        tOk: 'câu đã đạt / ', tTried: 'câu đã làm', tFull: 'bài đạt đủ 30 câu', cont: (n, t) => 'Học tiếp bài ' + n + ' · ' + t, perL: c => c + '/30 câu đạt',
        how: { vj: { write: 'Đọc câu tiếng Việt, tự viết câu tiếng Nhật, rồi so với đáp án.', mc: 'Đọc câu tiếng Việt, chọn câu tiếng Nhật đúng nghĩa.' },
               jv: { write: 'Đọc câu tiếng Nhật, tự viết nghĩa tiếng Việt, rồi so với đáp án.', mc: 'Đọc câu tiếng Nhật, chọn câu tiếng Việt đúng nghĩa.' } },
        course: 'Khóa học', topicsH: 'Chủ đề', topicsSub: 'Chọn một chủ đề để xem các bài trong đó.', topicN: k => 'Chủ đề ' + k, lessonsN: n => n + ' bài',
        settings: 'Cách luyện', continueLbl: 'Học tiếp', topicDone: 'Đã xong',
        foot: 'Nội dung: 1500 câu giao tiếp thực chiến, 50 bài. Tiến độ của mỗi chiều dịch lưu riêng trên trình duyệt này.',
        gramH: 'Ngữ pháp tiếng Nhật N5', gramSub: (n, g) => n + ' mẫu ngữ pháp N5 theo thứ tự giáo trình Minna no Nihongo, Bài 1–' + g + '. Bấm vào mẫu để xem cách dùng và ví dụ.',
        sgH: 'Ngữ pháp trong câu này', gramCard: 'Các mẫu ngữ pháp cơ bản theo giáo trình Minna no Nihongo.', gramCardN: (b, n) => b + ' bài · ' + n + ' mẫu', gramCardD: 'Mỗi mẫu có giải thích cách dùng và câu ví dụ có furigana.', gramGroup: k => 'Bài ' + k, gramN: 'mẫu',
        gramFoot: 'Ký hiệu: N = danh từ, V = động từ, A い = tính từ đuôi い, A な = tính từ đuôi な, S = câu. Danh sách điểm ngữ pháp theo giáo trình Minna no Nihongo Sơ cấp I; lời giải thích và ví dụ do Claude soạn.',
    },
    ja: {
        kicker: '日越 文章練習', home: 'ホーム', h1: 'ベトナム語 ⇄ 日本語 · 1500文', theme: 'ライト/ダーク', langBtn: 'Tiếng Việt',
        pick: '課を選ぶ', reached: (a, b) => '達成 ' + a + '/' + b, lesson: n => '第' + n + '課',
        dirLbl: '翻訳の方向', vj: 'ベトナム語 → 日本語', jv: '日本語 → ベトナム語', modeLbl: '練習方法', write: '記述式', mc: '選択式',
        order: '出題順', seq: '順番どおり', rand: 'ランダム', todo: '未達成のみ', nodau: '声調記号なしでも可',
        driveLink: n => '第' + n + '課の音声（Drive）↗',
        reachedN: (a, b) => '達成 ' + a + '/' + b, qLbl: (k, p, n) => '問' + k + ' · 今回 ' + p + '/' + n, q: k => '問' + k,
        last: '· 前回：', G: { ok: '達成', mid: 'おしい', ng: '不正解' }, prev: '← 前の問題', next: '次の問題 →',
        hintBtn: '単語ヒントを見る', phJa: '日本語で入力…', phVi: 'ベトナム語で入力…',
        check: '答え合わせ', reveal: '解答を見る', kbd: 'Ctrl + Enter で答え合わせ',
        exact: '正解と一致', kana: '正解と一致（かな表記）', nodauOk: '正解（声調記号なし）', nodauMid: 'つづりは正しいが声調記号がない',
        self: '自己採点：意味は正しく伝わっていますか？', ref: '参考解答',
        fixed: '元の資料の誤り・欠落のため、この文の日本語はClaudeがヒントをもとに作成しました。',
        cmp: 'あなたの答えと解答の比較', legend: '赤：あなたの答えにあって解答にない部分。緑：解答にあってあなたの答えにない部分。正しい言い方は一つとは限りません。',
        del: '解答にない', ins: '解答にある', grades: { ok: '正解', mid: 'おしい', ng: '不正解' },
        retry: '書き直す', nextQ: '次の問題', lap: '一周終了 · 最初から', lapDone: n => n + '問を一周しました。「未達成のみ」で復習できます。',
        mcAsk: '正しい意味の文を選んでください', mcOk: '正解', mcNg: '不正解 · 正しい答えは緑色です',
        sayVi: 'ベトナム語を聞く', sayJa: '日本語を聞く', slow: 'ゆっくり', normal: '普通',
        noVoice: { vi: 'この端末にはベトナム語の音声がありません。OSの設定でベトナム語の音声を追加してから開き直してください。', ja: 'この端末には日本語の音声がありません。OSの設定で日本語の音声を追加してから開き直してください。' },
        recLoading: n => '第' + n + '課の音声を読み込み中…', recFail: '再生できませんでした。もう一度押してください。', clipWarn: 'この課の音声は自動で区切っているため、ずれることがあります。',
        noSpeech: 'このブラウザは音声読み上げに対応していません。',
        tOk: '達成した文 / ', tTried: '練習した文', tFull: '30問すべて達成した課', cont: (n, t) => '第' + n + '課から続ける · ' + t, perL: c => c + '/30 達成',
        how: { vj: { write: 'ベトナム語の文を読んで、日本語で書いてみましょう。', mc: 'ベトナム語の文を読んで、正しい日本語を選びましょう。' },
               jv: { write: '日本語の文を見て、ベトナム語で書いてみましょう。', mc: '日本語の文を見て、正しいベトナム語を選びましょう。' } },
        course: 'コース', topicsH: 'テーマ', topicsSub: 'テーマを選ぶと、その課が表示されます。', topicN: k => 'テーマ' + k, lessonsN: n => n + '課',
        settings: '練習の設定', continueLbl: '続きから', topicDone: '完了',
        foot: '内容：実践会話1500文（全50課）。進み具合は方向ごとにこのブラウザに保存されます。',
    },
};
const t = (k, ...a) => { const v = (TX[pref.ui || 'vi'] || TX.vi)[k]; return typeof v === 'function' ? v(...a) : v; };
const JA = () => pref.ui === 'ja';

/* ===================== Đọc thành tiếng (giọng của trình duyệt) ===================== */
let playing = null;   // khóa của nút đang phát
const voiceFor = lang => { try { return speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(lang)) || null; } catch (e) { return null; } };
try { speechSynthesis.getVoices(); } catch (e) { }
function setPlaying(v) { playing = v; document.querySelectorAll('[data-play]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.play === v))); }
function stopAudio() { clearInterval(audTimer); AUD.pause(); try { speechSynthesis.cancel(); } catch (e) { } setPlaying(null); }

/* File nghe đáp án: tiếng Nhật = audio/bN.mp3 (bản ghi người dùng gửi, mốc trong data/clips.js);
   tiếng Việt = audio/vN.mp3 (tạo bằng giọng "Microsoft An", mốc trong data/clips-vi.js) */
const AUD = new Audio(); AUD.preload = 'none';
let audTimer = 0;
const BLOB = {};
const REC = { ja: { file: 'b', clips: () => typeof CLIPS === 'object' ? CLIPS : {} },
              vi: { file: 'v', clips: () => typeof CLIPS_VI === 'object' ? CLIPS_VI : {} } };
const clipFor = (lang, no, i) => { const C = REC[lang].clips()[no]; return C && i >= 0 && i < C.t.length ? C.t[i] : null; };
// Tải nguyên file một lần rồi phát từ bộ nhớ, để tua tới đúng câu ở mọi trình duyệt
function loadRec(lang, no) {
    const k = REC[lang].file + no;
    if (!BLOB[k]) BLOB[k] = fetch('audio/' + k + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(b => URL.createObjectURL(b)).catch(e => { delete BLOB[k]; throw e; });
    return BLOB[k];
}
// Phát câu i của bài no (ngôn ngữ lang) từ file nghe; không có file thì gọi fallback() (giọng của máy)
function playClip(lang, no, i, fallback) {
    const c = clipFor(lang, no, i);
    if (!c) { fallback(); return; }
    stopAudio();
    const st = Math.max(0, c[0] / 10 - 0.15), en = c[1] / 10 + 0.3;
    setPlaying(lang); sayMsg(BLOB[REC[lang].file + no] ? '' : t('recLoading', dispNo(no)));
    loadRec(lang, no).then(url => {
        if (playing !== lang) return;
        const go = () => {
            try { AUD.currentTime = st; } catch (e) { }
            AUD.playbackRate = pref.rate;
            AUD.play().then(() => {
                sayMsg(REC[lang].clips()[no].ok ? '' : t('clipWarn'));
                audTimer = setInterval(() => { if (AUD.currentTime >= en) { AUD.pause(); clearInterval(audTimer); setPlaying(null); } }, 40);
            }).catch(() => { setPlaying(null); sayMsg(t('recFail')); });
        };
        if (AUD.src !== url) { AUD.src = url; AUD.addEventListener('loadedmetadata', go, { once: true }); AUD.load(); } else go();
    }).catch(() => { setPlaying(null); fallback(); });
}
AUD.addEventListener('pause', () => { if (playing) { clearInterval(audTimer); setPlaying(null); } });
function sayMsg(text) { document.querySelectorAll('.saymsg').forEach(el => { el.textContent = text; }); }
function speak(text, lang, key) {
    stopAudio();
    if (!('speechSynthesis' in window)) { sayMsg(t('noSpeech')); return; }
    const v = voiceFor(lang);
    sayMsg(v ? '' : t('noVoice')[lang]);
    // Danh sách giọng đã có mà thiếu giọng đúng ngôn ngữ: không phát, vì trình duyệt sẽ dùng giọng khác
    // (vd. giọng Anh đọc câu Nhật chỉ ra mỗi con số) → âm thanh không khớp câu.
    let n = 0; try { n = speechSynthesis.getVoices().length; } catch (e) { }
    if (!v && n) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = v ? v.lang : (lang === 'ja' ? 'ja-JP' : 'vi-VN');
    if (v) u.voice = v;
    u.rate = pref.rate === 1 ? 1 : 0.75;
    u.onend = u.onerror = () => setPlaying(null);
    if (key) setPlaying(key);
    speechSynthesis.speak(u);
}
const rateChips = () => '<span class="chips">' + [[0.75, t('slow')], [1, t('normal')]].map(r => '<button type="button" class="chip" data-rate="' + r[0] + '" aria-pressed="' + (pref.rate === r[0]) + '">' + r[1] + '</button>').join('') + '</span>';
// Nút nghe chỉ có ở phần đáp án (câu hỏi không có nút nghe).
const sayRow = lang => '<div class="row"><button type="button" class="btn sm" data-play="' + lang + '" aria-pressed="' + (playing === lang) + '">🔊 ' + t(lang === 'vi' ? 'sayVi' : 'sayJa') + '</button>' +
    rateChips() + '<span class="hint saymsg" role="status"></span></div>';

/* ===================== So khớp đáp án ===================== */
const normVi = s => String(s).normalize('NFC').toLowerCase().replace(/[\s.,!?;:"'“”‘’()…\-–—]/g, '');
const noDau = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
function matchVi(input, ans) {
    const a = normVi(input); if (!a) return null;
    const b = normVi(ans);
    if (a === b) return 'exact';
    if (noDau(a) === noDau(b)) return 'nodau';
    return null;
}
/* So khớp theo phần tử (LCS) để tô chỗ thiếu / thừa: ký tự với tiếng Nhật, từ với tiếng Việt */
function diffTokens(a, b, eq, sep) {
    if (a.length * b.length > 40000) return esc(a.join(sep));
    const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = eq(a[i], b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = [], del = x => '<del title="' + t('del') + '">' + esc(x) + '</del>', ins = x => '<ins title="' + t('ins') + '">' + esc(x) + '</ins>';
    let i = 0, j = 0;
    while (i < n && j < m) {
        if (eq(a[i], b[j])) { out.push(esc(b[j])); i++; j++; }
        else if (L[i + 1][j] >= L[i][j + 1]) out.push(del(a[i++]));
        else out.push(ins(b[j++]));
    }
    while (i < n) out.push(del(a[i++]));
    while (j < m) out.push(ins(b[j++]));
    return out.join(sep);
}
const diffJa = (mine, ans) => diffTokens([...String(mine).normalize('NFKC')], [...plainJa(ans)], (x, y) => x === y, '');
const words = s => String(s).normalize('NFC').split(/\s+/).filter(Boolean);
const wkey = w => w.toLowerCase().replace(/[.,!?;:"'“”‘’()…]/g, '');
const diffVi = (mine, ans) => diffTokens(words(mine), words(ans), (x, y) => wkey(x) === wkey(y) || (pref.nodau && noDau(wkey(x)) === noDau(wkey(y))), ' ');

/* ===================== Điều hướng (theo #hash) ===================== */
let route = 'luyen-cau';
function parseHash() {
    const h = location.hash.slice(1);
    if (h === 'ngu-phap' || h === 'lo-trinh' || h === 'lo-trinh-n4' || (typeof MK_RE !== 'undefined' && MK_RE.test(h))) return h;
    if (h === 'kanji') { try { rmOpen.kanji = true; } catch (e) { } return 'lo-trinh'; }   // Kanji N5 nằm trong Lộ trình N5
    if (h === 'kana') return 'ngu-phap';   // link cũ của mục Bảng Kana
    const tp = h.match(/^chu-de-(\d+)$/); if (tp && +tp[1] >= 1 && +tp[1] <= TOPICS.length) return h;
    const m = h.match(/^bai-(\d+)$/); if (m && +m[1] >= 1 && +m[1] <= LESSONS.length) return h;
    return 'luyen-cau';
}
function go(r) { if (r === 'kanji') { try { rmOpen.kanji = true; } catch (e) { } r = 'lo-trinh'; }   // Kanji N5 nằm trong Lộ trình N5 (giống parseHash)
    if (location.hash.slice(1) !== r) { try { location.hash = r; } catch (e) { } } route = r; render(); window.scrollTo(0, 0); }
document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a || a.target === '_blank') return; e.preventDefault(); stopAudio(); go(a.getAttribute('href').slice(1)); });
window.addEventListener('hashchange', () => withData(() => { const r = parseHash(); if (r !== route) { route = r; render(); } }));
// Các nút đổi giao diện, chiều dịch, cách làm (dùng chung cho mọi màn hình)
document.addEventListener('click', e => {
    const b = e.target.closest('[data-ui],[data-dir],[data-mode],[data-nodau],#langBtn'); if (!b) return;
    if (b.id === 'langBtn') { pref.ui = JA() ? 'vi' : 'ja'; }
    else if (b.dataset.ui) { helloOn = false; pref.ui = b.dataset.ui; pref.nodau = pref.ui === 'ja'; pref.dir = pref.ui === 'ja' ? 'jv' : 'vj'; window.scrollTo(0, 0); track('select_origin', { ui: pref.ui }); }
    else if (b.dataset.dir) { pref.dir = b.dataset.dir; ws = null; }
    else if (b.dataset.mode) { pref.mode = b.dataset.mode; ws = null; }
    else if (b.dataset.nodau != null) { pref.nodau = !pref.nodau; }
    stopAudio(); savePref(); withData(render);
});
// Tab giai đoạn của Lộ trình N5/N4: chọn giai đoạn rồi cuộn tới khung của nó
document.addEventListener('click', e => {
    const b = e.target.closest('[data-rmstab]'); if (!b) return;
    const [lv, id] = b.dataset.rmstab.split(':'); rm['stab' + lv] = id; rmSave(); stopAudio(); render();
    const el = document.querySelector('.rm-stagebox'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
// Tốc độ đọc
document.addEventListener('click', e => {
    const b = e.target.closest('[data-rate]'); if (!b) return;
    pref.rate = +b.dataset.rate; savePref(); AUD.playbackRate = pref.rate;
    document.querySelectorAll('[data-rate]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.rate === pref.rate)));
});

const keyOf = no => (pref.dir === 'jv' ? 'r' : 'l') + no;
let helloOn = false;   // đang mở lại màn chào từ nút Trang chủ
$('homeBtn').onclick = () => { stopAudio(); helloOn = true; render(); window.scrollTo(0, 0); };
$('goResume').onclick = () => withData(() => { helloOn = false; render(); window.scrollTo(0, 0); });
/* ===== Thanh điều hướng: tiêu đề đúng vị trí, nút Quay lại (nhớ các trang đã xem), tab nhớ trang gần nhất của từng mục ===== */
const SOLO = document.documentElement.classList.contains('mk-solo');   // trang làm bài thi thử mở ở tab riêng
let navStack = [];                                  // các trang đã xem trong phiên này (cuối = trang hiện tại)
let lastIn = load('hvn.last', {});                  // trang gần nhất trong từng mục: { course, n5, n4 }
const sectionOf = r => r === 'lo-trinh-n4' ? 'n4' : (r === 'lo-trinh' || /^thi-thu-/.test(r)) ? 'n5' : 'course';
const sectionRoot = { course: 'luyen-cau', n5: 'lo-trinh', n4: 'lo-trinh-n4' };
function routeInfo(r) {
    const ja = JA(), course = { kicker: t('kicker'), h1: t('h1'), label: t('course'), parent: null };
    if (r === 'luyen-cau') return course;
    if (r === 'ngu-phap') return ja ? course : { kicker: t('course'), h1: t('gramTab'), label: t('gramTab'), parent: 'luyen-cau' };
    let m = r.match(/^chu-de-(\d+)$/); if (m && TOPICS[m[1] - 1]) return { kicker: t('course'), h1: topicName(TOPICS[m[1] - 1]), label: topicName(TOPICS[m[1] - 1]), parent: 'luyen-cau' };
    m = r.match(/^bai-(\d+)$/); if (m) { const k = topicOf(+m[1]); return { kicker: TOPICS[k - 1] ? topicName(TOPICS[k - 1]) : t('course'), h1: t('lesson', dispNo(+m[1])), label: t('lesson', dispNo(+m[1])), parent: 'chu-de-' + k }; }
    if (ja) return course;
    if (r === 'lo-trinh') return { kicker: 'Luyện thi JLPT', h1: 'Lộ trình chinh phục N5', label: 'Lộ trình N5', parent: null };
    if (r === 'lo-trinh-n4') return { kicker: 'Luyện thi JLPT', h1: 'Lộ trình chinh phục N4', label: 'Lộ trình N4', parent: null };
    m = typeof MK_RE !== 'undefined' ? r.match(MK_RE) : null; if (m) return { kicker: 'Luyện thi JLPT · Lộ trình N5', h1: 'Thi thử JLPT N5 · Đề ' + m[1], label: 'Thi thử · Đề ' + m[1], parent: 'lo-trinh' };
    return course;
}
function trackRoute(r) {
    if (navStack[navStack.length - 1] === r) return;
    if (navStack.length > 1 && navStack[navStack.length - 2] === r) navStack.pop(); else navStack.push(r);   // bấm Quay lại / nút Back của trình duyệt: lùi một bước
    if (navStack.length > 40) navStack.shift();
    if (!/^thi-thu-/.test(r)) { lastIn[sectionOf(r)] = r; save('hvn.last', lastIn); }
}
function backTarget() {
    if (SOLO) return { href: 'index.html#lo-trinh', label: 'Lộ trình N5' };
    if (navStack.length > 1) { const p = navStack[navStack.length - 2]; return { route: p, label: routeInfo(p).label }; }
    const par = routeInfo(route).parent; return par ? { route: par, label: routeInfo(par).label } : null;
}
function renderHeader() {
    document.documentElement.lang = JA() ? 'ja' : 'vi';
    const info = routeInfo(route);
    $('kicker').textContent = info.kicker; $('h1').textContent = info.h1;
    try { document.title = info.h1 + ' · ' + (JA() ? '日越学習' : 'Học Việt - Nhật'); } catch (e) { }
    $('homeTxt').textContent = t('home'); $('backbarTxt').textContent = JA() ? 'コースへ戻る' : 'Quay về Khóa học'; $('homeBtn').hidden = SOLO;   // trang thi riêng: chỉ giữ nút Quay lại
    const bt = backTarget(), bb = $('backBtn');
    bb.hidden = !bt; if (bt) $('backTxt').textContent = (JA() ? '戻る · ' : 'Quay lại · ') + bt.label;
}
$('backBtn').onclick = () => {
    const bt = backTarget(); if (!bt) return; stopAudio();
    if (bt.href) { location.href = bt.href; return; }
    go(bt.route);
};
function renderNav() {
    if (!pref.ui || !dataReady()) { $('sub').innerHTML = ''; return; }
    const done = LESSONS.reduce((n, L) => n + okCount(keyOf(L[0])), 0), sec = sectionOf(route);
    const tab = (href, label, on, title) => '<a class="tab" href="' + (/^index\.html/.test(href) ? href : '#' + href) + '"' + (on ? ' aria-current="page"' : '') + (title ? ' title="' + esc(title) + '"' : '') + '>' + label + '</a>';
    if (SOLO) { const info = routeInfo(route); $('sub').innerHTML = tab('index.html#lo-trinh', 'Lộ trình N5', false) + tab(route, esc(info.label), true); return; }
    // các mục chính; bấm vào mục khác sẽ về trang bạn xem gần nhất của mục đó, bấm lại mục đang đứng để về đầu mục
    const go1 = k => sec === k ? sectionRoot[k] : (lastIn[k] || sectionRoot[k]);
    let h = tab('luyen-cau', (JA() ? '文章練習' : 'Luyện câu') + ' · ' + done + '/' + LESSONS.length * 30, sec === 'course', JA() ? '文章練習' : 'Luyện câu song ngữ');
    const rmLvNow = route === 'lo-trinh-n4' ? 4 : route === 'lo-trinh' ? 5 : 0;
    if (rmLvNow && !JA() && typeof rmStageTabsHtml === 'function') { $('sub').innerHTML = rmStageTabsHtml(rmLvNow); const c1 = $('sub').querySelector('[aria-current="page"]'); if (c1) $('sub').scrollLeft = Math.max(0, c1.offsetLeft + c1.offsetWidth - $('sub').clientWidth + 16); return; }
    const tm = route.match(/^chu-de-(\d+)$/), bm = route.match(/^bai-(\d+)$/), curTopic = tm ? +tm[1] : bm ? topicOf(+bm[1]) : 0;
    if (curTopic) {   // đang trong mục Luyện câu: các tab bên cạnh là những chủ đề khác
        h = tab('luyen-cau', (JA() ? '文章練習' : 'Luyện câu') + ' · ' + done + '/' + LESSONS.length * 30, false, JA() ? '文章練習' : 'Luyện câu song ngữ') + TOPICS.map((T, i) => tab('chu-de-' + (i + 1), T.mark + ' ' + esc(topicName(T)), i + 1 === curTopic, JA() ? T.dja : T.dvi)).join('');
    } else if (!JA()) h += tab(go1('n5'), 'Lộ trình N5 · ' + rmDoneCount() + '/25', sec === 'n5', 'Lộ trình chinh phục N5') + tab(go1('n4'), 'Lộ trình N4 · ' + rm4DoneCount() + '/25', sec === 'n4', 'Lộ trình chinh phục N4');
    $('sub').innerHTML = h;
    // trên điện thoại thanh tab cuộn ngang: đưa tab đang chọn vào tầm nhìn (chỉ cuộn thanh tab, không cuộn trang)
    const cur = $('sub').querySelector('[aria-current="page"]');
    if (cur) $('sub').scrollLeft = Math.max(0, cur.offsetLeft + cur.offsetWidth - $('sub').clientWidth + 16);
}
const topicName = T => JA() ? T.ja : T.vi;
// Đường dẫn Khóa học › Chủ đề › Bài (mục cuối là trang đang xem, không có link)
function crumbs() { return ''; }   // đường dẫn đã có ở đầu trang (nút Quay lại, tiêu đề, tab) nên không vẽ thêm thanh thứ hai
const lessonCrumbs = no => { const k = topicOf(no); return crumbs([['chu-de-' + k, topicName(TOPICS[k - 1])], ['bai-' + no, t('lesson', dispNo(no))]]); };
function render() {
    trackRoute(route); renderHeader(); renderNav();
    document.body.classList.toggle('nofuri', !pref.furi);
    const hello = !pref.ui || helloOn;
    showHello(hello); $('goResume').hidden = !pref.ui;
    document.body.classList.toggle('on-home', route === 'luyen-cau' && !hello);
    if (hello) return;
    if (route === 'luyen-cau') return renderLessons();
    if (route === 'ngu-phap') return JA() ? renderLessons() : renderGrammar();
    const mk = typeof MK_RE !== 'undefined' ? route.match(MK_RE) : null;
    if (mk) return JA() ? renderLessons() : renderMockExam(+mk[1], mk[2]);   // roadmap-mock.js: trang làm bài thi thử (mở ở tab mới)
    if (route === 'lo-trinh') return JA() ? renderLessons() : renderRoadmap();   // roadmap.js
    if (route === 'lo-trinh-n4') return JA() ? renderLessons() : renderRoadmapN4();   // roadmap-n4.js
    if (route === 'kanji') return JA() ? renderLessons() : renderKanji();          // kanji.js
    const tp = route.match(/^chu-de-(\d+)$/); if (tp) return renderTopic(+tp[1]);
    const m = route.match(/^bai-(\d+)$/); if (m) return renderWrite(lessonSet(+m[1]));
}
const chip = (attr, val, on, label) => '<button type="button" class="chip" ' + attr + '="' + val + '" aria-pressed="' + on + '">' + label + '</button>';
// Nút gạt nhiều lựa chọn (có nhãn phía trên) và công tắc bật/tắt
const seg = (label, attr, opts, cur) => '<div class="set"><span class="lbl">' + label + '</span><div class="seg" role="group" aria-label="' + label + '">' +
    opts.map(([v, l]) => '<button type="button" ' + attr + '="' + v + '" aria-pressed="' + (cur === v) + '">' + l + '</button>').join('') + '</div></div>';
const sw = (attr, on, label, id) => '<button type="button" class="sw" ' + attr + (id ? ' id="' + id + '"' : '') + ' role="switch" aria-checked="' + on + '"><span class="track" aria-hidden="true"><span class="knob"></span></span><span>' + label + '</span></button>';
function ctrlRow() {
    return '<div class="settings">' +
        seg(t('modeLbl'), 'data-mode', [['write', t('write')], ['mc', t('mc')]], pref.mode) +
        (pref.dir === 'jv' && pref.mode === 'write' ? sw('data-nodau=""', pref.nodau, t('nodau')) : '') + '</div>';
}

/* ===================== Luyện câu ===================== */
const okCount = key => Object.values(wgr[key] || {}).filter(g => g === 'ok').length;
function lessonSet(no) {
    const L = LESSONS[no - 1];
    return JA() ? { key: keyOf(no), items: L[4], title: t('lesson', dispNo(no)) + ' · ' + plainJa(L[1]), sub: L[2], audio: L[3], no }
                : { key: keyOf(no), items: L[4], title: t('lesson', dispNo(no)) + ' · ' + L[2], jt: L[1], audio: L[3], no };
}
let ws = null;   // { key, order, pos, input, checked, hint, kind, mc }
function wsFor(set) {
    if (!ws || ws.key !== set.key) {
        ws = { key: set.key, order: orderFor(set), pos: 0, input: '', checked: false, hint: false, kind: null, mc: null };
        track('lesson_start', { lesson: set.no, ui: pref.ui || 'vi', dir: pref.dir, mode: pref.mode });
    }
    return ws;
}
function orderFor(set) {
    const idx = set.items.map((_, i) => i), g = wgr[set.key] || {};
    if (pref.wmode === 'rand') return shuffle(idx);
    if (pref.wmode === 'todo') { const t2 = idx.filter(i => g[i] !== 'ok'); return t2.length ? t2 : idx; }
    return idx;
}
const resetQ = s => { s.input = ''; s.checked = false; s.kind = null; s.hint = false; s.mc = null; };
/* 4 lựa chọn: đáp án đúng + 3 câu khác trong cùng bài (khác nội dung) */
function mcFor(s, set, i) {
    if (s.mc && s.mc.i === i) return s.mc;
    const txt = k => pref.dir === 'vj' ? plainJa(set.items[k][2]) : set.items[k][0];
    const seen = new Set([txt(i)]), others = [];
    shuffle(set.items.map((_, k) => k)).forEach(k => { if (others.length < 3 && k !== i && !seen.has(txt(k))) { seen.add(txt(k)); others.push(k); } });
    s.mc = { i, opts: shuffle([i].concat(others)), picked: null };
    return s.mc;
}
function setGrade(key, i, g) { wgr[key] = wgr[key] || {}; wgr[key][i] = g; save('hvn.write', wgr); rmMarkDay('n'); track('answer', { lesson: +key.slice(1), result: g, ui: pref.ui || 'vi' }); }
const jaHtml = s => '<span class="jp" lang="ja">' + rubyHtml(s) + '</span>';
// Giải thích ngữ pháp riêng của từng câu (data/notes-*.js: NOTES[số bài][số câu] = [[mẫu, giải thích], …]); hiện sau khi xem đáp án.
function gramBlock(no, i) {
    if (JA()) return '';   // chỉ có giải thích cho người Việt học tiếng Nhật
    const L = ((window.NOTES || {})[no] || [])[i];
    if (!L || !L.length) return '';
    return '<details class="sg"' + (pref.sgOpen === false ? '' : ' open') + '><summary>' + t('sgH') + '</summary><ul>' +
        L.map(([p, d]) => '<li><span class="sg-p jp" lang="ja">' + rubyHtml(p) + '</span><span class="sg-d" lang="vi">' + esc(d) + '</span></li>').join('') + '</ul></details>';
}
function renderWrite(set) {
    const s = wsFor(set), n = s.order.length, i = s.order[s.pos], it = set.items[i], g = wgr[set.key] || {};
    const vj = pref.dir === 'vj', mc = pref.mode === 'mc', fixed = it[3] === 1;
    const ans = vj ? it[2] : it[0];
    const okN = okCount(set.key);
    let h = lessonCrumbs(set.no) + '<section class="card"><div class="wtop"><div style="flex:1;min-width:0"><h2>' + esc(set.title) + '</h2>' +
        (set.jt ? '<div class="jt jp" lang="ja">' + rubyHtml(set.jt) + '</div>' : '') + (set.sub ? '<div class="sub" lang="vi">' + esc(set.sub) + '</div>' : '') + '</div>' +
        (set.audio ? '<a class="btn sm" href="https://drive.google.com/file/d/' + esc(set.audio) + '/view" target="_blank" rel="noopener">' + t('driveLink', dispNo(set.no)) + '</a>' : '') + '</div>' +
        ctrlRow() +
        '<div class="settings">' + seg(t('order'), 'data-wm', ['seq', 'rand', 'todo'].map(m => [m, t(m)]), pref.wmode) +
        '<span class="r">' + sw('', pref.furi, 'Furigana', 'furi') + '</span></div>' +
        '<div class="prog"><span class="num">' + t('reachedN', okN, set.items.length) + '</span><div class="bar"><i style="width:' + (okN / set.items.length * 100) + '%;background:var(--ok)"></i></div></div>' +
        '<div class="dots">' + set.items.map((_, k) => '<button type="button" class="dot' + (g[k] ? ' ' + g[k] : '') + '" data-goto="' + k + '"' + (k === i ? ' aria-current="true"' : '') + ' aria-label="' + t('q', k + 1) + '">' + (k + 1) + '</button>').join('') + '</div></section>';
    h += '<section class="card"><div class="row"><span class="lbl">' + t('qLbl', i + 1, s.pos + 1, n) + '</span>' + (g[i] ? '<span class="hint">' + t('last') + t('G')[g[i]] + '</span>' : '') +
        '<span class="chips r"><button type="button" class="btn sm" data-nav="-1"' + (i === 0 ? ' disabled' : '') + '>' + t('prev') + '</button><button type="button" class="btn sm" data-nav="1"' + (i === set.items.length - 1 ? ' disabled' : '') + '>' + t('next') + '</button></span></div>';
    // Đề bài
    h += vj ? '<p class="vi" lang="vi">' + esc(it[0]) + '</p>' : '<p class="vi prompt jp" lang="ja">' + rubyHtml(it[2]) + '</p>';
    if (fixed && !vj) h += '<span class="note">' + t('fixed') + '</span>';
    if (it[1]) h += s.hint ? '<div class="hints">' + it[1].split(/\s*•\s*/).filter(Boolean).map(x => '<span class="hw"><span class="jp" lang="ja">' + rubyHtml(x) + '</span></span>').join('') + '</div>' : '<div><button type="button" class="btn sm" id="hintBtn">' + t('hintBtn') + '</button></div>';
    const ansBlock = () => vj ? '<div class="ans jp" lang="ja">' + rubyHtml(ans || '—') + '</div>' + (fixed ? '<span class="note">' + t('fixed') + '</span>' : '') + sayRow('ja')
                              : '<div class="ans" lang="vi">' + esc(ans || '—') + '</div>' + sayRow('vi');
    if (mc) {
        const M = mcFor(s, set, i);
        h += '<span class="lbl">' + t('mcAsk') + '</span><div class="opts">' + M.opts.map((k, j) => {
            const cls = s.checked ? (k === i ? ' right' : k === M.picked ? ' wrong' : '') : '';
            return '<button type="button" class="opt' + cls + '" data-mc="' + k + '"' + (s.checked ? ' disabled' : '') + '><span class="k">' + (j + 1) + '</span><span class="t">' + (vj ? jaHtml(set.items[k][2]) : '<span lang="vi">' + esc(set.items[k][0]) + '</span>') + '</span></button>';
        }).join('') + '</div>';
        if (s.checked) h += '<div class="fb ' + (M.picked === i ? 'ok' : 'ng') + '" role="status"><span class="v ' + (M.picked === i ? 'ok-t' : 'ng-t') + '">' + (M.picked === i ? t('mcOk') : t('mcNg')) + '</span>' + ansBlock() + '</div>' +
            gramBlock(set.no, i) +
            '<div class="row"><button class="btn pri r" id="wNext" type="button">' + (s.pos + 1 < n ? t('nextQ') : t('lap')) + '</button></div>';
        else h += '<span class="kbd">1–4</span>';
    } else {
        h += '<textarea class="inp" id="wIn" lang="' + (vj ? 'ja' : 'vi') + '" rows="2" placeholder="' + (vj ? t('phJa') : t('phVi')) + '"' + (s.checked ? ' readonly' : '') + '>' + esc(s.input) + '</textarea>';
        if (!s.checked) {
            h += '<div class="row"><button class="btn pri" id="chk" type="button">' + t('check') + '</button><button class="btn" id="reveal" type="button">' + t('reveal') + '</button><span class="kbd r">' + t('kbd') + '</span></div>';
        } else {
            const k = s.kind, good = k && (k !== 'nodau' || pref.nodau);
            const verdict = k === 'exact' ? t('exact') : k === 'kana' ? t('kana') : k === 'nodau' ? (pref.nodau ? t('nodauOk') : t('nodauMid')) : '';
            h += '<div class="fb ' + (good ? 'ok' : k === 'nodau' ? 'mid' : g[i] === 'ok' ? 'ok' : g[i] === 'mid' ? 'mid' : g[i] === 'ng' ? 'ng' : '') + '" role="status">' +
                (k ? '<span class="v ' + (good ? 'ok-t' : 'mid-t') + '">' + verdict + '</span>' : s.input.trim() ? '<span class="v">' + t('self') + '</span>' : '<span class="v">' + t('ref') + '</span>') +
                ansBlock() +
                (!good && s.input.trim() ? '<div><span class="lbl">' + t('cmp') + '</span><div class="mine" lang="' + (vj ? 'ja' : 'vi') + '">' + (vj ? diffJa(s.input.trim(), ans) : diffVi(s.input.trim(), ans)) + '</div><span class="hint">' + t('legend') + '</span></div>' : '') +
                (!good ? '<div class="grades">' + ['ok', 'mid', 'ng'].map(x => '<button type="button" class="grade ' + x + '" data-gr="' + x + '" aria-pressed="' + (g[i] === x) + '">' + t('grades')[x] + '</button>').join('') + '</div>' : '') + '</div>' +
                gramBlock(set.no, i) +
                '<div class="row"><button class="btn" id="retry" type="button">' + t('retry') + '</button><button class="btn pri r" id="wNext" type="button">' + (s.pos + 1 < n ? t('nextQ') : t('lap')) + '</button></div>';
        }
    }
    h += '</section>';
    if (s.pos + 1 >= n && s.checked) h += '<p class="hint">' + t('lapDone', n) + '</p>';
    $('view').innerHTML = h;

    const inp = $('wIn'), val = () => inp ? inp.value : '';
    if (inp) inp.oninput = () => { s.input = inp.value; };
    if (inp) inp.onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (!s.checked) check(); else nextW(); } };
    const check = () => {
        s.input = val(); s.checked = true;
        s.kind = vj ? matchKind(s.input, ans) : matchVi(s.input, ans);
        if (s.kind === 'nodau') setGrade(set.key, i, pref.nodau ? 'ok' : 'mid'); else if (s.kind) setGrade(set.key, i, 'ok');
        renderNav(); renderWrite(set);
    };
    const nextW = () => { stopAudio(); if (s.pos + 1 < n) s.pos++; else { s.order = orderFor(set); s.pos = 0; } resetQ(s); renderWrite(set); focusIn($('wIn')); };
    const pickMc = k => { if (s.checked) return; s.mc.picked = k; s.checked = true; setGrade(set.key, i, k === i ? 'ok' : 'ng'); renderNav(); renderWrite(set); };
    s.keyFn = e => {
        if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
        if (mc && !s.checked && /^[1-4]$/.test(e.key) && s.mc && s.mc.opts[+e.key - 1] != null) pickMc(s.mc.opts[+e.key - 1]);
        else if (mc && s.checked && e.key === 'Enter') { e.preventDefault(); nextW(); }
    };
    const cb = $('chk'); if (cb) cb.onclick = check;
    const rv = $('reveal'); if (rv) rv.onclick = () => { s.input = val(); s.checked = true; s.kind = null; renderWrite(set); };
    const hb = $('hintBtn'); if (hb) hb.onclick = () => { s.input = val(); s.hint = true; renderWrite(set); };
    const rt = $('retry'); if (rt) rt.onclick = () => { s.checked = false; s.kind = null; renderWrite(set); focusIn($('wIn')); };
    const nx = $('wNext'); if (nx) nx.onclick = nextW;
    $('view').querySelectorAll('[data-mc]').forEach(b => b.onclick = () => pickMc(+b.dataset.mc));
    $('view').querySelectorAll('[data-gr]').forEach(b => b.onclick = () => { setGrade(set.key, i, b.dataset.gr); renderNav(); renderWrite(set); });
    $('view').querySelectorAll('[data-goto]').forEach(b => b.onclick = () => { stopAudio(); const k = +b.dataset.goto; let p = s.order.indexOf(k); if (p < 0) { s.order = set.items.map((_, j) => j); p = k; } s.pos = p; resetQ(s); renderWrite(set); });
    $('view').querySelectorAll('[data-wm]').forEach(b => b.onclick = () => { pref.wmode = b.dataset.wm; savePref(); s.order = orderFor(set); s.pos = 0; resetQ(s); renderWrite(set); });
    $('furi').onclick = () => { pref.furi = !pref.furi; savePref(); render(); };
    const sg = $('view').querySelector('details.sg'); if (sg) sg.addEventListener('toggle', () => { pref.sgOpen = sg.open; savePref(); });
    $('view').querySelectorAll('[data-nav]').forEach(b => b.onclick = () => { const k = i + +b.dataset.nav; if (k < 0 || k >= set.items.length) return; stopAudio(); let p = s.order.indexOf(k); if (p < 0) { s.order = set.items.map((_, j) => j); p = k; } s.pos = p; resetQ(s); renderWrite(set); });
    $('view').querySelectorAll('[data-play]').forEach(b => b.onclick = () => {
        if (playing === b.dataset.play) { stopAudio(); return; }
        if (b.dataset.play === 'vi') { const tts = () => speak(it[0], 'vi', 'vi'); if (set.no) playClip('vi', set.no, i, tts); else tts(); return; }
        const tts = () => speak(plainJa(it[2]), 'ja', 'ja');
        // Câu do Claude soạn lại (it[3] === 1): bản ghi đọc câu gốc khác → dùng giọng của máy
        if (set.no && it[3] !== 1) playClip('ja', set.no, i, tts); else tts();
    });
    if (inp && !s.checked && document.activeElement === document.body) focusIn(inp);
}
/* Cảm ứng (iPhone/iPad): không tự focus để bàn phím không che đề; chạm vào ô mới mở bàn phím */
const focusIn = el => { if (el && !(window.matchMedia && matchMedia('(pointer: coarse)').matches)) el.focus({ preventScroll: true }); };
document.addEventListener('keydown', e => { if (ws && ws.keyFn && /^bai-/.test(route)) ws.keyFn(e); });

/* ===================== Trang khóa học: tổng quan + danh sách chủ đề ===================== */
const lessonName = L => JA() ? plainJa(L[1]) : L[2];
const lessonSub = L => JA() ? '<span lang="vi">' + esc(L[2]) + '</span>' : '<span class="jp" lang="ja">' + esc(plainJa(L[1])) + '</span>';
const topicOk = T => T.ls.reduce((s, no) => s + okCount(keyOf(no)), 0);
function renderLessons() {
    const total = LESSONS.length * 30, K = L => keyOf(L[0]);
    const ok = LESSONS.reduce((s, L) => s + okCount(K(L)), 0);
    const tried = LESSONS.reduce((s, L) => s + Object.keys(wgr[K(L)] || {}).length, 0);
    const nextL = LESSONS[(LESSON_ORDER.find(no => okCount(keyOf(no)) < 30) || LESSON_ORDER[0]) - 1];
    let h = '<div class="course-frame"><div class="sec-h"><h2>' + t('kicker') + '</h2><span class="hint">' + (JA() ? '1500文 · ' + TOPICS.length + 'テーマ' : '1500 câu · ' + TOPICS.length + ' chủ đề · ' + LESSONS.length + ' bài') + '</span></div><section class="card course-sum"><div class="sum-main"><span class="lbl">' + t('continueLbl') + '</span>' +
        '<a class="btn pri big" href="#bai-' + nextL[0] + '">' + esc(t('cont', dispNo(nextL[0]), lessonName(nextL))) + ' →</a>' +
        '<span class="hint">' + t('how')[pref.dir][pref.mode] + '</span></div>' +
        '<div class="tiles"><div class="tile"><b>' + ok + '</b><span>' + t('tOk') + total + '</span></div><div class="tile"><b>' + tried + '</b><span>' + t('tTried') + '</span></div><div class="tile"><b>' + LESSONS.filter(L => okCount(K(L)) >= 30).length + '</b><span>' + t('tFull') + '</span></div></div></section>';
    // Đã bỏ thẻ "Cách luyện" (chọn cách làm nằm trong trang bài) và ẩn thẻ Ngữ pháp N5 (vẫn mở được từ các trạm của Lộ trình N5).
    // Thẻ chủ đề dạng gọn: chữ biểu tượng + tên + số bài / tiến độ (mô tả hiện khi rê chuột)
    h += '<div class="sec-h"><h2>' + t('topicsH') + '</h2><span class="hint">' + t('topicsSub') + '</span></div><div class="topics-mini">' +
        TOPICS.map((T, i) => {
            const o = topicOk(T), tot = T.ls.length * 30, full = o >= tot;
            return '<a class="tmini' + (full ? ' full' : '') + '" href="#chu-de-' + (i + 1) + '" title="' + esc(JA() ? T.dja : T.dvi) + '">' +
                '<span class="tm-mark jp" lang="ja" aria-hidden="true">' + T.mark + '</span>' +
                '<span class="tm-t"><b>' + esc(topicName(T)) + '</b><span class="tm-s num">' + t('lessonsN', T.ls.length) + ' · ' + (full ? t('topicDone') + ' ✓' : o + '/' + tot) + '</span>' +
                '<span class="bar"><i style="width:' + (o / tot * 100) + '%"></i></span></span></a>';
        }).join('') + '</div></div>';
    if (!JA()) h += '<div class="course-frame">' + rmCourseCard() + '</div><div class="course-frame">' + rmCourseCardN4() + '</div>';   // roadmap.js — sau mục Chủ đề (Kanji N5 nằm trong Lộ trình)
    h += '<p class="hint">' + t('foot') + '</p>';
    $('view').innerHTML = h;
}

/* ===================== Trang một chủ đề: các bài trong chủ đề ===================== */
function renderTopic(k) {
    const T = TOPICS[k - 1], o = topicOk(T), tot = T.ls.length * 30;
    let h = crumbs([['chu-de-' + k, topicName(T)]]);
    h += '<section class="card topic-hero"><span class="th-mark jp" lang="ja" aria-hidden="true">' + T.mark + '</span><div class="th-txt">' +
        '<span class="lbl">' + t('topicN', k) + ' · ' + t('lessonsN', T.ls.length) + '</span><h2>' + esc(topicName(T)) + '</h2>' +
        (JA() ? '<div class="jt" lang="vi">' + esc(T.vi) + '</div>' : '<div class="jt jp" lang="ja">' + esc(T.ja) + '</div>') +
        '<p class="hint">' + esc(JA() ? T.dja : T.dvi) + '</p>' +
        '<div class="prog"><span class="num">' + t('reachedN', o, tot) + '</span><div class="bar"><i style="width:' + (o / tot * 100) + '%;background:var(--ok)"></i></div></div></div></section>';
    h += '<ol class="lesson-list">' + T.ls.map(no => {
        const L = LESSONS[no - 1], c = okCount(keyOf(no));
        return '<li><a class="lrow" href="#bai-' + no + '"><span class="lr-no num">' + dispNo(no) + '</span>' +
            '<span class="lr-t"><span class="lbl">' + t('lesson', dispNo(no)) + '</span><b' + (JA() ? ' class="jp" lang="ja"' : '') + '>' + esc(lessonName(L)) + '</b>' + lessonSub(L) + '</span>' +
            '<span class="lr-p"><span class="num">' + t('perL', c) + '</span><span class="bar"><i style="width:' + (c / 30 * 100) + '%"></i></span></span>' +
            '<span class="lr-go" aria-hidden="true">' + (c >= 30 ? '✓' : '→') + '</span></a></li>';
    }).join('') + '</ol>';
    $('view').innerHTML = h;
}

/* ===================== Ngữ pháp N5 ===================== */
// Dữ liệu: data/grammar.js (biến GRAMMAR). Mỗi nhóm là một thẻ; mỗi mẫu câu mở/đóng được (<details>), có ví dụ và nút nghe.
let gOpen = load('hvn.gopen', {});   // { mã mẫu: true } các mẫu đang mở, giữ lại khi quay lại trang
function renderGrammar() {
    const total = GRAMMAR.reduce((n, G) => n + G.items.length, 0);
    let h = crumbs([['ngu-phap', t('gramTab')]]) + '<section class="card"><div class="wtop"><div style="flex:1;min-width:0"><h2>' + t('gramH') + '</h2><p class="hint">' + t('gramSub', total, GRAMMAR.length) + '</p></div>' +
        '<span class="r">' + sw('', pref.furi, 'Furigana', 'furi') + '</span></div>' +
        '<div class="row"><div class="chips">' + GRAMMAR.map((G, k) => '<button type="button" class="chip" data-gjump="' + G.no + '" title="' + esc(G.vi) + '">' + t('gramGroup', G.no) + '</button>').join('') + '</div></div>' +
        '</section>';
    GRAMMAR.forEach(G => {
        const k = G.no - 1;
        h += '<section class="card gsec" id="g-' + G.no + '"><div class="gs-h"><span class="gs-mark" aria-hidden="true">' + G.no + '</span>' +
            '<div><span class="lbl">' + t('gramGroup', G.no) + ' · ' + G.items.length + ' ' + t('gramN') + '</span><h2>' + esc(G.vi) + ' <span class="jp gs-ja" lang="ja">' + rubyHtml(G.ja) + '</span></h2></div></div>' +
            '<div class="glist">' + G.items.map((it, j) => {
                const id = 'b' + G.no + '-' + j;
                return '<details class="gp" data-gid="' + id + '"' + (gOpen[id] ? ' open' : '') + '><summary><span class="gp-no">' + (k + 1) + '.' + (j + 1) + '</span>' +
                    '<span class="gp-p jp" lang="ja">' + rubyHtml(it.p) + '</span><span class="gp-vi">' + esc(it.vi) + '</span></summary>' +
                    '<div class="gp-body"><p class="gp-d">' + esc(it.d) + '</p><ul class="gp-ex">' + it.ex.map(([ja, vi]) =>
                        '<li><div><span class="jp gx-ja" lang="ja">' + rubyHtml(ja) + '</span><span class="gx-vi" lang="vi">' + esc(vi) + '</span></div></li>').join('') + '</ul></div></details>';
            }).join('') + '</div></section>';
    });
    h += '<p class="hint">' + t('gramFoot') + '</p>';
    $('view').innerHTML = h;
    $('furi').onclick = () => { pref.furi = !pref.furi; savePref(); render(); };
    $('view').querySelectorAll('[data-gjump]').forEach(b => b.onclick = () => { const el = $('g-' + b.dataset.gjump); if (el) el.scrollIntoView({ behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth', block: 'start' }); });
    const ds = [...$('view').querySelectorAll('details.gp')];
    ds.forEach(d => d.addEventListener('toggle', () => { if (d.open) gOpen[d.dataset.gid] = true; else delete gOpen[d.dataset.gid]; save('hvn.gopen', gOpen); }));
    // Mở từ trạm của Lộ trình: nhảy tới nhóm ngữ pháp của bài đó
    if (window.hvnGramJump) { const el = $('g-' + window.hvnGramJump); window.hvnGramJump = 0; if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' })); }
}

/* ===================== Cánh hoa rơi ===================== */
// Cánh hoa màu đào như trong ảnh, rơi chéo theo hướng nắng (trên phải → dưới trái), vừa rơi vừa lắc lư và lật mặt.
// Thỉnh thoảng có một cơn gió đẩy cả đàn cánh sang trái; rê chuột qua thì cánh hoa dạt ra.
// Màn chào: lớp sau chữ nhiều cánh nhỏ (cánh xa nhạt và nhòe) + lớp trước chữ vài cánh lớn nhòe mạnh như sát ống kính.
// Trang học: một lớp thưa, nhạt hơn, nằm sau các thẻ nội dung nên không che chữ.
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)');
// Mức blur dựng sẵn cho sprite cánh hoa (đơn vị: pixel của sprite 64×80, trước khi thu nhỏ khi vẽ)
const PETAL_BLURS = [8, 14];
const CAN_BLUR = (() => { try { const c = document.createElement('canvas').getContext('2d'); c.filter = 'blur(2px)'; return c.filter === 'blur(2px)'; } catch (e) { return false; } })();
const PETAL_SPRITES = (() => {
    // [đầu tròn (sáng), thân, đầu nhọn (đậm)] — cam đào như những cánh hoa trong ảnh
    const COLORS = [['#fcd9c2', '#f2a47e', '#d9663f'], ['#fde2cf', '#f5b28f', '#e07a52'], ['#f9cdb2', '#ec966d', '#c95a36']];
    // Vẽ sẵn một cánh hoa hình giọt nước lệch: đầu nhọn ở dưới, đầu tròn ở trên, một bên phình hơn như cánh hơi cong.
    // Các cánh sau chỉ việc xoay / co giãn; co theo chiều dọc khi lật tạo cảm giác cánh cuộn trong gió.
    return COLORS.map(([round, mid, tip]) => {
        const s = document.createElement('canvas'); s.width = 64; s.height = 80;
        const c = s.getContext('2d'); c.translate(32, 76);
        const len = 70, w = 20;
        const shape = () => {
            c.beginPath(); c.moveTo(0, 0);
            c.bezierCurveTo(w * .95, -len * .14, w * 1.15, -len * .68, w * .38, -len * .96);
            c.bezierCurveTo(w * .02, -len * 1.04, -w * .62, -len * .92, -w * .8, -len * .62);
            c.bezierCurveTo(-w * .92, -len * .36, -w * .4, -len * .12, 0, 0); c.closePath();
        };
        shape();
        const g = c.createLinearGradient(0, 0, w * .2, -len);
        g.addColorStop(0, tip); g.addColorStop(.45, mid); g.addColorStop(1, round);
        c.globalAlpha = .92; c.fillStyle = g; c.fill(); c.globalAlpha = 1;
        c.save(); c.clip();
        // vùng sáng mềm gần đầu tròn, như nắng xuyên qua cánh mỏng
        const rg = c.createRadialGradient(w * .15, -len * .72, 0, w * .15, -len * .72, len * .42);
        rg.addColorStop(0, 'rgba(255,240,225,.55)'); rg.addColorStop(1, 'rgba(255,240,225,0)');
        c.fillStyle = rg; c.fillRect(-w * 1.5, -len * 1.1, w * 3, len * 1.1);
        // nếp gấp giữa cánh: một đường sáng và một đường tối sát nhau
        c.lineWidth = 1.1;
        c.strokeStyle = 'rgba(255,235,215,.45)';
        c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(w * .35, -len * .5, w * .1, -len * .92); c.stroke();
        c.strokeStyle = 'rgba(170,70,40,.18)';
        c.beginPath(); c.moveTo(1.5, -2); c.quadraticCurveTo(w * .5, -len * .5, w * .25, -len * .9); c.stroke();
        c.restore();
        // mép cánh sáng mảnh
        shape(); c.strokeStyle = 'rgba(255,230,210,.5)'; c.lineWidth = 1; c.stroke();
        // Blur sẵn một lần ở vài mức cố định (theo pixel của sprite) để vòng lặp vẽ không phải đặt c.filter cho từng cánh.
        // Viền đệm pad = 2×blur để phần nhòe không bị cắt mép. Trình duyệt không hỗ trợ filter thì dùng lại bản gốc.
        const levels = [{ c: s, pad: 0 }].concat(PETAL_BLURS.map(b => {
            if (!CAN_BLUR) return { c: s, pad: 0 };
            const pad = Math.ceil(b * 2), o = document.createElement('canvas');
            o.width = 64 + pad * 2; o.height = 80 + pad * 2;
            const oc = o.getContext('2d'); oc.filter = 'blur(' + b + 'px)'; oc.drawImage(s, pad, pad);
            return { c: o, pad };
        }));
        return { levels };
    });
})();

// opts: back, front (canvas, có thể bỏ trống), area() → khung chứa {left, top, width, height},
//       density (số cánh trên mỗi px²), max, frontCount, alpha (hệ số độ đậm)
function makePetals(opts) {
    const { back, front } = opts, sprites = PETAL_SPRITES, REDUCED = REDUCED_MOTION;
    const canvases = [back, front].filter(Boolean);
    let W = 0, H = 0, D = 1, list = [], raf = 0, last = 0, running = false, gust = 0, gustT = 4;
    const mouse = { x: -1e4, y: -1e4 };
    // Kích thước vùng chỉ đo lại khi bắt đầu chạy, khi đổi cỡ cửa sổ, khi cuộn hoặc khi phần tử đổi cỡ (ResizeObserver);
    // không đo trong từng khung hay từng lần di chuột.
    let rect = null;
    const measure = () => { rect = opts.area(); };

    // z: 0 = xa (nhỏ, nhạt, rơi chậm) → 1 = gần (to, rõ, rơi nhanh)
    function make(anywhere, isFront) {
        const z = isFront ? 1 : Math.random();
        const size = isFront ? 36 + Math.random() * 22 : 10 + z * 16;
        // độ nhòe mong muốn trên màn hình (px) → quy về pixel sprite (chia cho tỉ lệ thu nhỏ) → chọn mức dựng sẵn gần nhất
        const blur = isFront ? 6 + Math.random() * 5 : (z < .3 ? 1.5 : 0);
        const want = blur / (size / 70);
        const lv = blur ? 1 + PETAL_BLURS.reduce((bi, b, i) => Math.abs(b - want) < Math.abs(PETAL_BLURS[bi] - want) ? i : bi, 0) : 0;
        return {
            front: isFront, z, size,
            x: Math.random() * (W + 200) - 50,
            y: anywhere ? Math.random() * H : -size * 2 - Math.random() * H * .3,
            vy: (isFront ? 55 : 22 + z * 40) * (.8 + Math.random() * .4),
            vx: -(10 + z * 22) * (.6 + Math.random() * .8),
            sway: 12 + Math.random() * 30, ph: Math.random() * 6.28, sf: .6 + Math.random() * .9,
            rot: Math.random() * 6.28, vr: (Math.random() - .5) * 2.2,
            flip: Math.random() * 6.28, vf: 1.2 + Math.random() * 2.6,
            alpha: (isFront ? .55 : .45 + z * .5) * (opts.alpha || 1), lv,
            sp: sprites[Math.random() * sprites.length | 0], push: 0, pushY: 0,
        };
    }
    function seed() {
        const n = Math.round(Math.min(opts.max, Math.max(8, W * H * opts.density)));
        list = Array.from({ length: n }, () => make(true, false));
        if (front) for (let i = 0; i < (W < 720 ? Math.ceil(opts.frontCount / 2) : opts.frontCount); i++) list.push(make(true, true));
    }
    function fit() {
        if (!rect) measure();
        const r = rect, d = Math.min(2, window.devicePixelRatio || 1);
        if (!r.width || !r.height) return false;
        const changed = Math.round(r.width) !== W || Math.round(r.height) !== H || d !== D;
        if (changed) {
            W = Math.round(r.width); H = Math.round(r.height); D = d;
            canvases.forEach(cv => { cv.width = W * D; cv.height = H * D; });
            seed();
        }
        return changed;
    }
    function step(p, dt, t) {
        p.y += p.vy * dt;
        p.x += (p.vx - gust * (30 + p.z * 70)) * dt;
        p.rot += p.vr * dt * (1 + Math.abs(gust));
        p.flip += p.vf * dt;
        // dạt ra khi chuột lại gần, rồi từ từ trở lại
        const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < 120 && !p.front) { const f = (1 - dist / 120) * 260 * dt; p.push += dx / (dist || 1) * f; p.pushY += dy / (dist || 1) * f; }
        p.push *= .96; p.pushY *= .96;
        if (p.y > H + p.size * 2 || p.x < -p.size * 3) Object.assign(p, make(false, p.front));
    }
    function draw(p, c, t) {
        const x = p.x + Math.sin(p.ph + t * p.sf) * p.sway + p.push, y = p.y + p.pushY;
        const sc = p.size / 70, sy = .25 + .75 * Math.abs(Math.cos(p.flip));   // lật mặt: cánh mỏng lại khi nghiêng
        c.save();
        c.globalAlpha = p.alpha;
        c.translate(x, y); c.rotate(p.rot); c.scale(sc, sc * sy);
        const L = p.sp.levels[p.lv];   // sprite đã blur sẵn, không dùng c.filter trong vòng lặp
        c.drawImage(L.c, -32 - L.pad, -76 - L.pad);
        c.restore();
    }
    function paint(t) {
        const cb = back.getContext('2d'), cf = front ? front.getContext('2d') : cb;
        canvases.forEach(cv => { const c = cv.getContext('2d'); c.setTransform(D, 0, 0, D, 0, 0); c.clearRect(0, 0, W, H); });
        list.forEach(p => draw(p, p.front ? cf : cb, t));
    }
    function frame(now) {
        if (!running) return;
        const t = now / 1000, dt = last ? Math.min(.05, t - last) : 0; last = t;
        fit();
        // gió: cứ vài giây lại có một cơn, mạnh lên rồi lặng dần
        gustT -= dt;
        if (gustT <= 0) { gust = .6 + Math.random() * .9; gustT = 5 + Math.random() * 6; }
        gust *= Math.pow(.55, dt);
        list.forEach(p => step(p, dt, t));
        paint(t);
        raf = requestAnimationFrame(frame);
    }
    function start() {
        if (running) return;
        measure(); fit();
        if (REDUCED.matches) { paint(0); return; }   // tắt chuyển động: chỉ vẽ cánh hoa đứng yên
        running = true; last = 0; raf = requestAnimationFrame(frame);
    }
    let wanted = false;   // vùng này đang hiện trên màn hình
    function stop() { running = false; cancelAnimationFrame(raf); }
    function show(on) { wanted = on; if (on) start(); else stop(); }

    window.addEventListener('pointermove', e => { if (!running || !rect) return; mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; }, { passive: true });
    document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (wanted) start(); });
    window.addEventListener('resize', () => { measure(); if (wanted && !running) { fit(); paint(0); } });
    window.addEventListener('scroll', () => { if (running) measure(); }, { passive: true });
    if (opts.el && window.ResizeObserver) new ResizeObserver(() => { if (wanted) measure(); }).observe(opts.el);
    REDUCED.addEventListener('change', () => { stop(); if (wanted) start(); });
    return { show };
}

const helloPetals = makePetals({
    back: $('petalsBack'), front: $('petalsFront'),
    area: () => $('hello').getBoundingClientRect(), el: $('hello'),
    density: 1 / 26000, max: 46, frontCount: 4,
});
// Trang học: canvas cố định theo khung nhìn, thưa và nhạt, không có lớp trước chữ.
const pagePetals = makePetals({
    back: $('petalsPage'),
    area: () => ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }),
    density: 1 / 70000, max: 18, alpha: .7,
});

/* ===================== Tà áo dài bay trong gió ===================== */
// Ảnh là ảnh tĩnh, nên vẽ lại riêng vùng tà áo phía trước lên một canvas trùng khít ảnh:
// chia vùng thành các dải dọc mảnh, dịch mỗi dải lên/xuống theo sóng chạy từ eo ra mũi tà.
// Gần eo gần như đứng yên, càng ra mũi tà càng bay mạnh. Dịch cả phần nền quanh tà để không lộ bóng tà cũ;
// mép vùng được làm mờ dần để hòa vào ảnh.
const Dress = (() => {
    const img = $('helloImg'), cv = $('dressCanvas');
    // Tọa độ theo pixel của ảnh gốc (1694 × 928)
    const ANCHOR_X = 1010, TIP_X = 505;                 // eo (đứng yên) → mũi tà (bay mạnh nhất)
    const REGION = [[1030, 455], [1050, 928], [360, 928], [360, 690], [470, 650], [640, 590], [820, 520]];
    // Phất nhẹ: sóng rất dài nên cả vạt nâng lên hạ xuống gần như cùng lúc (không uốn lượn), biên độ nhỏ, nhịp chậm;
    // chỉ ở sát mũi tà có thêm một gợn rung rất nhỏ như mép vải gặp gió.
    const AMP = 6, WAVE = 1400, SPEED = 1.4;           // biên độ ở mũi tà (px ảnh), bước sóng, tốc độ
    const DEBUG = /debug-ta-ao/.test(location.hash);
    let W = 0, H = 0, D = 1, S = 1, OX = 0, OY = 0, mask = null, raf = 0, running = false, wanted = false;

    // Số đo khung (kích thước canvas, mật độ điểm ảnh, object-position của ảnh): chỉ đo lại khi bắt đầu, đổi cỡ, ảnh tải xong
    let meas = null;
    function measure() {
        meas = { r: cv.getBoundingClientRect(), d: Math.min(2, window.devicePixelRatio || 1),
            pos: (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map(v => parseFloat(v) / 100) };
    }
    function layout() {
        if (!meas) measure();
        const { r, d, pos } = meas;
        if (!r.width || !r.height || !img.naturalWidth) return false;
        const iw = img.naturalWidth, ih = img.naturalHeight, w = Math.round(r.width), h = Math.round(r.height);
        if (w === W && h === H && d === D && mask && mask.px === pos[0]) return true;
        W = w; H = h; D = d;
        S = Math.max(W / iw, H / ih);                   // giống object-fit: cover
        OX = (W - iw * S) * (isNaN(pos[0]) ? .5 : pos[0]);
        OY = (H - ih * S) * (isNaN(pos[1]) ? .5 : pos[1]);
        cv.width = W * D; cv.height = H * D;
        // mặt nạ mềm cho vùng tà áo
        mask = document.createElement('canvas'); mask.width = cv.width; mask.height = cv.height; mask.px = pos[0];
        const m = mask.getContext('2d'); m.setTransform(D, 0, 0, D, 0, 0);
        try { m.filter = 'blur(' + Math.max(8, 40 * S) + 'px)'; } catch (e) { }
        m.fillStyle = '#000'; m.beginPath();
        REGION.forEach(([x, y], i) => { const X = OX + x * S, Y = OY + y * S; i ? m.lineTo(X, Y) : m.moveTo(X, Y); });
        m.closePath(); m.fill();
        return true;
    }
    // độ bay theo vị trí ngang: 0 ở eo → 1 ở mũi tà (cong dần, phần gần eo gần như không động)
    const flex = x => { const f = Math.min(1, Math.max(0, (ANCHOR_X - x) / (ANCHOR_X - TIP_X))); return f * f * (1.6 - .6 * f); };
    function paint(t) {
        if (!layout()) return;
        const c = cv.getContext('2d');
        c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
        c.setTransform(D, 0, 0, D, 0, 0);
        const xs = REGION.map(p => p[0]), ys = REGION.map(p => p[1]);
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) - 30, y1 = Math.min(img.naturalHeight, Math.max(...ys));
        const breath = .8 + .2 * Math.sin(t * .31) + .06 * Math.sin(t * 1.1);   // gió lúc mạnh lúc nhẹ
        const step = 6 / S;   // mỗi dải ~6px trên màn hình (trước là 3px): giảm một nửa số lần drawImage mỗi khung

        for (let sx = x0; sx < x1; sx += step) {
            const f = flex(sx + step / 2);
            const tipF = f * f * f;   // gợn rung chỉ đáng kể ở sát mũi tà
            const dy = AMP * breath * (f * Math.sin(2 * Math.PI * sx / WAVE + SPEED * t) + .12 * tipF * Math.sin(2 * Math.PI * sx / 140 + 4.2 * t));
            const dx = AMP * .2 * f * breath * Math.sin(SPEED * .7 * t + .6);   // vạt hơi đưa ra vào theo gió
            c.drawImage(img, sx, y0, step + .6 / S, y1 - y0, OX + (sx + dx) * S, OY + (y0 + dy) * S, (step + .6 / S) * S, (y1 - y0) * S);
        }
        // chỉ giữ phần trong mặt nạ mềm
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.globalCompositeOperation = 'destination-in'; c.drawImage(mask, 0, 0); c.globalCompositeOperation = 'source-over';
        if (DEBUG) {
            c.setTransform(D, 0, 0, D, 0, 0); c.strokeStyle = '#0f0'; c.lineWidth = 2; c.beginPath();
            REGION.forEach(([x, y], i) => { const X = OX + x * S, Y = OY + y * S; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); c.stroke();
            [[ANCHOR_X, '#ff0'], [TIP_X, '#f0f']].forEach(([x, col]) => { c.strokeStyle = col; c.beginPath(); c.moveTo(OX + x * S, 0); c.lineTo(OX + x * S, H); c.stroke(); });
        }
    }
    function frame(now) { if (!running) return; paint(now / 1000); raf = requestAnimationFrame(frame); }
    function start() {
        if (running) return;
        if (!img.complete) { img.addEventListener('load', () => { if (wanted) start(); }, { once: true }); return; }
        measure();
        if (REDUCED_MOTION.matches) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); return; }   // tắt chuyển động: để ảnh gốc
        running = true; raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function show(on) { wanted = on; if (on) start(); else stop(); }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (wanted) start(); });
    REDUCED_MOTION.addEventListener('change', () => { stop(); if (wanted) start(); });
    window.addEventListener('resize', () => { if (wanted) measure(); });
    img.addEventListener('load', () => { if (wanted) measure(); });
    if (window.ResizeObserver) new ResizeObserver(() => { if (wanted) measure(); }).observe(cv);
    return { show };
})();

/* ===================== Màn chào ===================== */
function showHello(on) {
    const was = !$('hello').hidden;
    $('hello').hidden = !on; document.querySelector('.page').hidden = on; $('petalsPage').hidden = on;
    if (on && !was) { $('step1').hidden = false; $('step2').hidden = true; }
    helloPetals.show(on); pagePetals.show(!on); Dress.show(on);
}
$('goAsk').onclick = () => { $('step1').hidden = true; $('step2').hidden = false; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); };
$('goBack').onclick = () => { $('step2').hidden = true; $('step1').hidden = false; $('goAsk').focus({ preventScroll: true }); };

/* ===================== Khởi động ===================== */
// Nút Sáng/Tối đã bỏ: giao diện sáng/tối theo cài đặt của máy.
// Mở đường link gốc (không có #…) thì luôn hiện màn chào trước, kể cả khi đã chọn xuất thân từ lần trước;
// màn chào có nút "Tiếp tục học" để vào thẳng khóa học. Link có # (vd #lo-trinh, #bai-3) vẫn mở đúng trang đó.
// Màn chào không cần dữ liệu bài học nên hiện ngay; dữ liệu chỉ tải khi rời màn chào (withData).
if (!location.hash || location.hash === '#' || !pref.ui) { helloOn = !!pref.ui; route = 'luyen-cau'; render(); }
else withData(() => { route = parseHash(); render(); });

// Lối vào riêng: kéo hình cô gái Việt (màn hình chọn xuất thân) sang trái hoặc sang phải hơn 140px để mở QA Mastery Roadmap ngay trong trang.
// Không có gợi ý trên màn hình. Trên claude.ai chỉ chủ trang (isOwner) mở được; trên GitHub Pages (không có claude.ai) ai kéo cũng mở được,
// khi đó QA lưu tiến độ trong localStorage của trình duyệt (qaLocalDb trong qa/hub.html).
(() => {
    const img = document.querySelector('.origin[data-ui="vi"] .o-mark'); if (!img) return;
    const card = img.closest('.origin');
    let owner = false;
    (async () => {
        if (!(window.claude && window.claude.use)) { owner = true; return; }   // không chạy trên claude.ai (GitHub Pages)
        try { const u = await window.claude.use('user'); owner = !!(u && await u.isOwner()); } catch (e) { }
    })();
    let layer = null, loaded = false, want = false, wait = null;
    // Hiệu ứng màn chào (cánh hoa, tà áo) bị lớp QA che mất nhưng vẫn vẽ liên tục làm QA ì: dừng khi mở QA, chạy lại khi đóng.
    const pauseFx = () => { helloPetals.show(false); pagePetals.show(false); Dress.show(false); };
    const resumeFx = () => { const h = !$('hello').hidden; helloPetals.show(h); pagePetals.show(!h); Dress.show(h); };
    const reveal = () => { if (wait) { wait.remove(); wait = null; } layer.style.visibility = ''; document.documentElement.style.overflow = 'hidden'; };
    const closeQA = () => {
        want = false; if (wait) { wait.remove(); wait = null; }
        if (layer) { layer.hidden = true; layer.style.visibility = ''; document.documentElement.style.overflow = ''; }
        resumeFx();
    };
    window.hvnCloseQA = closeQA; // mục "Luyện câu tiếng Nhật" trong QA gọi hàm này để quay về
    const openQA = () => {
        want = true; pauseFx();
        if (!layer) {
            layer = document.createElement('div'); layer.className = 'qa-layer';
            const fr = document.createElement('iframe'); fr.title = 'QA Mastery Roadmap';
            // Chỉ hiện lớp QA khi trang đã tải xong; trong lúc chờ có dòng "Đang mở…" nhỏ ở giữa màn hình
            fr.addEventListener('load', () => { loaded = true; if (want) reveal(); }, { once: true });
            fr.src = 'qa/hub.html';
            const x = document.createElement('button'); x.type = 'button'; x.className = 'qa-close'; x.setAttribute('aria-label', 'Đóng'); x.textContent = '×';
            x.onclick = closeQA;
            layer.append(fr, x); document.body.appendChild(layer);
            document.addEventListener('keydown', e => { if (e.key === 'Escape' && (want || (layer && !layer.hidden))) closeQA(); });
        }
        layer.hidden = false;
        if (loaded) { reveal(); return; }
        layer.style.visibility = 'hidden';   // vẫn tải iframe nhưng chưa hiện
        if (!wait) {
            wait = document.createElement('div'); wait.setAttribute('role', 'status'); wait.textContent = 'Đang mở QA Mastery…';
            wait.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1000;padding:12px 18px;border-radius:999px;background:rgba(20,12,8,.82);color:#fff1d5;font:600 14px/1.2 var(--f-body,system-ui);box-shadow:0 6px 24px rgba(0,0,0,.3)';
            document.body.appendChild(wait);
        }
    };
    img.draggable = false; img.classList.add('o-drag');
    let sx = 0, dx = 0, on = false, moved = false;
    img.addEventListener('dragstart', e => e.preventDefault());
    img.addEventListener('pointerdown', e => {
        if (e.button) return;
        on = true; moved = false; sx = e.clientX; dx = 0; img.style.transition = 'none';
        try { img.setPointerCapture(e.pointerId); } catch (x) { }
    });
    img.addEventListener('pointermove', e => {
        if (!on) return;
        const d = e.clientX - sx; if (Math.abs(d) > 6) moved = true;
        dx = d; img.style.transform = 'translateX(' + dx + 'px)';   // kéo được cả hai phía
    });
    const end = () => {
        if (!on) return; on = false;
        img.style.transition = ''; img.style.transform = '';
        if (Math.abs(dx) > 140 && owner) openQA();
        setTimeout(() => { moved = false; }, 0);
    };
    img.addEventListener('pointerup', end); img.addEventListener('pointercancel', end);
    // Kéo xong thì không tính là bấm chọn "Tôi là người Việt".
    card.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
})();
