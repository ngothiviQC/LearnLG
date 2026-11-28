/* Tổng quan ngữ pháp N5 để xem lại trước khi luyện đề (Lộ trình N5, hiện giữa Giai đoạn 1 và Giai đoạn 2).
   Claude soạn lại bằng lời riêng, tham khảo bố cục của ba bảng tham khảo hinelearn (trợ từ, chia động từ, tổng hợp ngữ pháp N5).
   Furigana dạng 漢字（かんじ）; không ghi số Ả Rập trước furigana.
   N5_PARTICLES: [trợ từ, họ, trả lời câu hỏi, cách dùng, ví dụ, nghĩa]; N5_CONFUSE: [cặp, phân biệt, ví dụ]; N5_PQUIZ: [câu, [lựa chọn, đúng ở vị trí 0], 0, giải thích].
   N5_VERBS: [gốc, đuôi, nghĩa, nhóm]; N5_PRACTICE_VERBS: 10 động từ tự chia; N5_GRAMMAR: [[tên chặng, mô tả, [[mẫu, ý nghĩa, ví dụ, nghĩa ví dụ]]]]. */
const N5_PARTICLES = [
  ['は', 'Chủ đề', 'nói về ai, cái gì?', 'Đặt chủ đề của câu; đọc là “wa”.', '私（わたし）は 学生（がくせい）です。', 'Tôi là sinh viên.'],
  ['も', 'Chủ đề', 'cũng vậy à?', 'Thay は / が / を khi nói điều giống câu trước; không viết はも.', '私（わたし）も 学生（がくせい）です。', 'Tôi cũng là sinh viên.'],
  ['を', 'Đối tượng', 'cái gì?', 'Đánh dấu thứ mà động từ tác động; đọc là “o”.', 'お茶（ちゃ）を 飲（の）みます。', 'Tôi uống trà.'],
  ['が', 'Đối tượng', 'cái gì? ai?', 'Cái mới xuất hiện; cái được thích, hiểu, muốn; hoặc nối hai ý trái nhau (“nhưng”).', '猫（ねこ）が います。 / 犬（いぬ）が 好（す）きです。', 'Có một con mèo. / Tôi thích chó.'],
  ['に', 'Mốc, nơi chốn', 'lúc nào? ở đâu? đến đâu?', 'Giờ cụ thể, nơi có người/vật, nơi đến, đi để làm gì.', '七時（しちじ）に 起（お）きます。', 'Tôi dậy lúc bảy giờ.'],
  ['から', 'Mốc', 'từ khi nào? vì sao?', 'Từ (mốc); hoặc đứng sau lý do (“vì…”).', '九時（くじ）から 始（はじ）まります。', 'Bắt đầu từ chín giờ.'],
  ['まで', 'Mốc', 'đến khi nào?', 'Đến (mốc), hay đi cặp với から.', '五時（ごじ）まで 働（はたら）きます。', 'Tôi làm việc đến năm giờ.'],
  ['へ', 'Nơi, cách thức', 'đi đâu?', 'Hướng đi, dùng với いきます / きます / かえります; đọc là “e”.', '学校（がっこう）へ 行（い）きます。', 'Tôi đi đến trường.'],
  ['で', 'Nơi, cách thức', 'bằng gì? làm ở đâu?', 'Phương tiện, nơi diễn ra việc, phạm vi, ngôn ngữ.', 'バスで 会社（かいしゃ）へ 行（い）きます。', 'Tôi đi làm bằng xe buýt.'],
  ['の', 'Nối, so sánh', 'của ai, thuộc đâu?', 'Nối hai danh từ, danh từ sau là trung tâm.', '友達（ともだち）の 本（ほん）', 'sách của bạn'],
  ['と', 'Nối, so sánh', 'với ai?', 'Cùng với ai; A và B (kể đủ); trích dẫn ý nghĩ, lời nói.', '姉（あね）と 買（か）い物（もの）に 行（い）きます。', 'Tôi đi mua sắm với chị.'],
  ['や', 'Nối, so sánh', 'kể vài cái?', 'Liệt kê vài thứ (còn nữa); と thì kể hết.', '机（つくえ）の 上（うえ）に 本（ほん）や ペンが あります。', 'Trên bàn có sách, bút…'],
  ['より', 'Nối, so sánh', 'so với cái gì?', 'Gắn vào vế đem ra so sánh.', 'ハノイは 東京（とうきょう）より 暑（あつ）いです。', 'Hà Nội nóng hơn Tokyo.'],
  ['か', 'Cuối câu', 'phải không?', 'Thêm vào cuối câu để hỏi.', 'これは 何（なん）ですか。', 'Đây là cái gì?'],
  ['ね', 'Cuối câu', 'nhỉ?', 'Tìm sự đồng tình của người nghe.', '今日（きょう）は 寒（さむ）いですね。', 'Hôm nay lạnh nhỉ.'],
  ['よ', 'Cuối câu', 'đấy!', 'Báo điều người nghe chưa biết.', 'あの 店（みせ）は おいしいですよ。', 'Quán đó ngon đấy.'],
];
const N5_CONFUSE = [
  ['は hay が', 'は nói về điều đã biết; が đưa điều mới vào, hoặc đi với thích / hiểu / muốn.', '部屋（へや）に 猫（ねこ）が います。猫（ねこ）は 窓（まど）の そばに います。'],
  ['に hay で', 'に: chỗ người / vật đang ở. で: chỗ diễn ra một hành động.', '教室（きょうしつ）に 先生（せんせい）が います。教室（きょうしつ）で 勉強（べんきょう）します。'],
  ['へ hay に', 'Chỉ hướng đi: dùng へ hay に đều được; に nhấn điểm đến.', '学校（がっこう）へ 行（い）きます。'],
  ['を hay が', 'Động từ hành động đi với を; すき, きらい, じょうず, わかる, ほしい đi với が.', 'パンを 食（た）べます。パンが 好（す）きです。'],
];
const N5_PQUIZ = [
  ['私（わたし）＿ 先生（せんせい）です。', ['は', 'を', 'で', 'に'], 0, 'Nói về “tôi” là chủ đề → は.'],
  ['毎日（まいにち）、水（みず）＿ 飲（の）みます。', ['を', 'が', 'に', 'で'], 0, 'Uống thứ gì: động từ tác động lên tân ngữ → を.'],
  ['図書館（としょかん）＿ 本（ほん）を 読（よ）みます。', ['で', 'に', 'へ', 'を'], 0, 'Đọc là hành động diễn ra ở đó → で.'],
  ['私（わたし）は 音楽（おんがく）＿ 好（す）きです。', ['が', 'を', 'は', 'と'], 0, 'Thích → が.'],
  ['八時（はちじ）＿ 家（いえ）を 出（で）ます。', ['に', 'で', 'を', 'の'], 0, 'Giờ cụ thể → に.'],
  ['電車（でんしゃ）＿ 会社（かいしゃ）へ 行（い）きます。', ['で', 'と', 'を', 'が'], 0, 'Đi bằng gì → で.'],
  ['友達（ともだち）＿ 映画（えいが）を 見（み）ます。', ['と', 'で', 'を', 'より'], 0, 'Cùng với ai → と.'],
  ['この 魚（さかな）は 肉（にく）＿ 安（やす）いです。', ['より', 'から', 'まで', 'へ'], 0, 'Vế đem ra so sánh → より.'],
  ['月曜日（げつようび）＿ 金曜日（きんようび）＿ 働（はたら）きます。', ['から／まで', 'を／に', 'で／が', 'と／の'], 0, 'Từ… đến… → から… まで….'],
  ['冷蔵庫（れいぞうこ）の 中（なか）＿ 牛乳（ぎゅうにゅう）が あります。', ['に', 'で', 'を', 'も'], 0, 'Nơi có đồ vật (あります) → に.'],
];

/* Động từ: [gốc, đuôi nguyên dạng, nghĩa, nhóm]. Nhóm 3 và các ngoại lệ được xử lý trong roadmap.js (rmConj). */
const N5_VERBS = [
  ['起（お）き', 'る', 'dậy', 2], ['寝（ね）', 'る', 'ngủ', 2], ['食（た）べ', 'る', 'ăn', 2], ['見（み）', 'る', 'xem, nhìn', 2], ['入（い）れ', 'る', 'cho vào', 2], ['教（おし）え', 'る', 'dạy, chỉ', 2], ['着（き）', 'る', 'mặc (áo)', 2], ['い', 'る', 'có, ở (người, vật sống)', 2],
  ['来（く）', 'る', 'đến', 3], ['', 'する', 'làm', 3], ['勉強（べんきょう）', 'する', 'học', 3],
  ['書（か）', 'く', 'viết', 1], ['行（い）', 'く', 'đi', 1], ['働（はたら）', 'く', 'làm việc', 1], ['弾（ひ）', 'く', 'chơi (đàn)', 1], ['泳（およ）', 'ぐ', 'bơi', 1], ['飲（の）', 'む', 'uống', 1], ['読（よ）', 'む', 'đọc', 1], ['住（す）', 'む', 'sống, ở', 1], ['遊（あそ）', 'ぶ', 'chơi', 1],
  ['待（ま）', 'つ', 'đợi', 1], ['持（も）', 'つ', 'cầm, mang', 1], ['買（か）', 'う', 'mua', 1], ['使（つか）', 'う', 'dùng', 1], ['会（あ）', 'う', 'gặp', 1], ['洗（あら）', 'う', 'rửa', 1], ['帰（かえ）', 'る', 'về', 1], ['作（つく）', 'る', 'làm, nấu', 1], ['入（はい）', 'る', 'vào', 1],
  ['降（ふ）', 'る', '(mưa, tuyết) rơi', 1], ['登（のぼ）', 'る', 'leo', 1], ['分（わ）か', 'る', 'hiểu', 1], ['あ', 'る', 'có (đồ vật)', 1], ['話（はな）', 'す', 'nói chuyện', 1],
];
const N5_VERB_TRAPS = [
  '起きます・見ます・着ます có âm い trước ます nhưng thuộc nhóm 2 (起きない, 見ない, 着ない), không phải 起かない.',
  '帰ります・入ります trông như nhóm 2 nhưng là nhóm 1 (帰らない, 入らない).',
  '行きます: thể て và thể た là いって / いった, còn thể ない vẫn là いかない.',
  '買います・使います・会います・洗います: ở thể ない, い đổi thành わ (買わない), không phải あ.',
  'あります: thể ない là ない (không có あらない).',
  '来ます: nhóm 3, học thuộc cả ba cách đọc 来（き）ます / 来（こ）ない / 来（く）る.',
];
const N5_PRACTICE_VERBS = [['書（か）', 'く', 'viết', 1], ['飲（の）', 'む', 'uống', 1], ['買（か）', 'う', 'mua', 1], ['帰（かえ）', 'る', 'về', 1], ['待（ま）', 'つ', 'đợi', 1], ['話（はな）', 'す', 'nói chuyện', 1], ['遊（あそ）', 'ぶ', 'chơi', 1], ['起（お）き', 'る', 'dậy', 2], ['見（み）', 'る', 'xem, nhìn', 2], ['来（く）', 'る', 'đến', 3]];
const N5_VERB_USE = [
  ['Thân ます', '～たいです · ～に行きます · ～ませんか'],
  ['Thể て', '～てください · ～ています · ～てもいいです · ～てから'],
  ['Thể ない', '～ないでください · ～なければなりません · ～なくてもいいです'],
  ['Thể từ điển', '～ことができます · ～前に'],
  ['Thể た', '～たことがあります · ～たり～たりします'],
  ['Thể thông thường', '～と思います · ～と言いました · nói với bạn bè'],
];
const N5_ADJ = [
  ['Tính từ い', '大（おお）きいです', '大（おお）きくないです', '大（おお）きかったです', '大（おお）きくなかったです'],
  ['Tính từ い: いい (bất quy tắc)', 'いいです', 'よくないです', 'よかったです', 'よくなかったです'],
  ['Tính từ な', '静（しず）かです', '静（しず）かじゃ ありません', '静（しず）かでした', '静（しず）かじゃ ありませんでした'],
];

/* 61 mẫu ngữ pháp N5 theo 5 chặng */
const N5_GRAMMAR = [
  ['Trạm 1 · Giới thiệu bản thân, hỏi han, mua sắm', 'Câu “A là B”, câu hỏi, cái này / cái đó, hỏi giá và hỏi nơi chốn (11 mẫu)', [
    ['～は～です', 'A là B (lịch sự); は đánh dấu chủ đề.', 'ミンさんは 医者（いしゃ）です。', 'Anh Minh là bác sĩ.'],
    ['～じゃ ありません', 'Phủ định lịch sự của です: không phải là….', '私（わたし）は 先生（せんせい）じゃ ありません。', 'Tôi không phải giáo viên.'],
    ['～か', 'Đặt cuối câu để hỏi.', 'あなたは 学生（がくせい）ですか。', 'Bạn là sinh viên phải không?'],
    ['～も', 'Cũng — thay は khi giống câu trước.', '田中（たなか）さんも 日本人（にほんじん）です。', 'Anh Tanaka cũng là người Nhật.'],
    ['～の～', 'Của, thuộc về; nối hai danh từ.', '私（わたし）の かばん', 'cặp của tôi'],
    ['だれ / だれの', 'Ai? / của ai?', 'これは だれの 傘（かさ）ですか。', 'Đây là ô của ai?'],
    ['これ・それ・あれ', 'Cái này (gần mình) · cái đó (gần người nghe) · cái kia (xa cả hai).', 'それは 何（なん）ですか。', 'Đó là cái gì?'],
    ['この・その・あの + danh từ', '…này / …đó / …kia; đứng trước danh từ.', 'あの 人（ひと）は だれですか。', 'Người kia là ai?'],
    ['何・いくら・～を ください', 'Cái gì? Bao nhiêu tiền? Cho tôi….', 'これを ください。', 'Cho tôi cái này.'],
    ['～は どこですか', 'Ở đâu? Trả lời bằng ここ / そこ / あそこ.', 'トイレは どこですか。', 'Nhà vệ sinh ở đâu?'],
    ['何階・～階', 'Tầng mấy? / tầng….', '食堂（しょくどう）は 三階（さんがい）です。', 'Nhà ăn ở tầng ba.'],
  ]],
  ['Trạm 2 · Sinh hoạt hằng ngày', 'Động từ lịch sự, giờ giấc, đi lại, quá khứ, rủ rê (10 mẫu)', [
    ['～ます・～ません', 'Động từ lịch sự: làm / không làm.', '毎朝（まいあさ）、パンを 食（た）べます。', 'Sáng nào tôi cũng ăn bánh mì.'],
    ['～時に', 'Lúc… giờ; に đánh dấu mốc giờ cụ thể.', '十一時（じゅういちじ）に 寝（ね）ます。', 'Tôi ngủ lúc mười một giờ.'],
    ['～から～まで', 'Từ… đến….', '九時（くじ）から 五時（ごじ）まで 働（はたら）きます。', 'Tôi làm từ chín đến năm giờ.'],
    ['～ました・～ませんでした', 'Quá khứ lịch sự: đã / đã không.', '昨日（きのう）は どこへも 行（い）きませんでした。', 'Hôm qua tôi không đi đâu cả.'],
    ['何も + ～ません', 'Không… gì cả (chỉ đi với phủ định).', '何（なに）も 食（た）べませんでした。', 'Tôi không ăn gì cả.'],
    ['～へ 行きます・来ます・帰ります', 'Đi / đến / về nơi nào; へ đọc “e”.', '友達（ともだち）の 家（いえ）へ 行（い）きます。', 'Tôi đến nhà bạn.'],
    ['で（bằng gì）・と（với ai）', 'で = phương tiện; と = cùng ai; 一人（ひとり）で = một mình.', '友達（ともだち）と 電車（でんしゃ）で 行（い）きます。', 'Tôi đi tàu cùng bạn.'],
    ['～を + động từ', 'を đánh dấu thứ động từ tác động.', '本（ほん）を 読（よ）みます。', 'Tôi đọc sách.'],
    ['Nơi + で + động từ', 'で = nơi diễn ra việc.', '公園（こうえん）で 走（はし）ります。', 'Tôi chạy ở công viên.'],
    ['～ませんか・～ましょう', 'Rủ: cùng… không? Hưởng ứng: cùng… nào!', 'いっしょに 帰（かえ）りませんか。', 'Cùng về nhé?'],
  ]],
  ['Trạm 3 · Miêu tả, tồn tại, thích ghét, so sánh', 'Tính từ, có / ở đâu, vị trí, thích – giỏi – hiểu, lý do, so sánh (15 mẫu)', [
    ['Tính từ い + です', 'Tính từ い làm vị ngữ; phủ định ～くないです.', 'この 部屋（へや）は 広（ひろ）いです。', 'Phòng này rộng.'],
    ['Tính từ な + です', 'Tính từ な; trước danh từ thêm な.', '静（しず）かな 町（まち）です。', 'Đó là thị trấn yên tĩnh.'],
    ['とても・あまり～ない・ね・よ', 'Rất · không… lắm · nhỉ · đấy.', 'この 映画（えいが）は あまり 面白（おもしろ）くないです。', 'Phim này không hay lắm.'],
    ['～かったです', 'Quá khứ của tính từ い.', '昨日（きのう）は 寒（さむ）かったです。', 'Hôm qua lạnh.'],
    ['～でした・～じゃ ありませんでした', 'Quá khứ của danh từ / tính từ な.', '試験（しけん）は 簡単（かんたん）でした。', 'Bài thi dễ.'],
    ['Câu 1 + が、Câu 2', 'が nối hai ý trái nhau: nhưng.', '高（たか）いですが、おいしいです。', 'Đắt nhưng ngon.'],
    ['あります・います', 'Có: あります (đồ vật, cây), います (người, động vật).', '庭（にわ）に 木（き）が あります。', 'Trong vườn có cây.'],
    ['Nơi + に + Cái gì + が + あります', 'Ở chỗ X có Y.', '机（つくえ）の 上（うえ）に 本（ほん）が あります。', 'Trên bàn có sách.'],
    ['X の 上・下・中・となり', 'Chỉ vị trí: trên, dưới, trong, bên cạnh, trước, sau.', '銀行（ぎんこう）は 駅（えき）の となりに あります。', 'Ngân hàng ở cạnh ga.'],
    ['～が 好き・嫌い・上手・下手・分かります', 'Thích, ghét, giỏi, kém, hiểu đều đi với が.', '私（わたし）は 料理（りょうり）が 上手（じょうず）です。', 'Tôi nấu ăn giỏi.'],
    ['上手ですね／まだまだです', 'Khen người khác; được khen thì khiêm tốn đáp いいえ、まだまだです.', '日本語（にほんご）が 上手（じょうず）ですね。', 'Bạn giỏi tiếng Nhật nhỉ.'],
    ['どうして～か・～から', 'Vì sao…? / Vì….', '雨（あめ）ですから、行（い）きません。', 'Vì trời mưa nên tôi không đi.'],
    ['A は B より ～です', 'A… hơn B.', 'バスは 電車（でんしゃ）より 遅（おそ）いです。', 'Xe buýt chậm hơn tàu.'],
    ['AとBと、どちらが～／Bのほうが～', 'So sánh hai thứ: cái nào hơn? Bên B hơn.', '肉（にく）と 魚（さかな）と、どちらが 好（す）きですか。', 'Thịt với cá, bạn thích cái nào hơn?'],
    ['～で ～が いちばん ～', 'Trong phạm vi X, Y là… nhất.', 'クラスで 彼（かれ）が いちばん 背（せ）が 高（たか）いです。', 'Trong lớp anh ấy cao nhất.'],
  ]],
  ['Trạm 4 · Nhờ vả, đang làm, xin phép, nối việc', 'Muốn, nhờ, thể て, đang làm, được phép – bị cấm, kể việc theo thứ tự (12 mẫu)', [
    ['～が ほしいです', 'Muốn có (đồ vật).', '新（あたら）しい パソコンが ほしいです。', 'Tôi muốn có máy tính mới.'],
    ['～たいです', 'Muốn làm gì (bỏ ます + たい).', '日本（にほん）へ 行（い）きたいです。', 'Tôi muốn đi Nhật.'],
    ['～に 行きます', 'Đi để làm gì.', '本（ほん）を 買（か）いに 行（い）きます。', 'Tôi đi mua sách.'],
    ['～て ください', 'Nhờ / yêu cầu lịch sự.', 'ゆっくり 話（はな）して ください。', 'Xin hãy nói chậm.'],
    ['Thể て（3 nhóm）', 'Dạng て, nền của nhiều mẫu; xem phần Chia động từ.', '少（すこ）し 待（ま）って ください。', 'Xin hãy đợi một chút.'],
    ['～て います（đang）', 'Đang làm.', '今（いま）、ご飯（はん）を 作（つく）って います。', 'Bây giờ tôi đang nấu cơm.'],
    ['～て います（trạng thái）', 'Trạng thái kéo dài: sống ở, kết hôn, biết….', '私（わたし）は 大阪（おおさか）に 住（す）んで います。', 'Tôi sống ở Osaka.'],
    ['知っていますか／知りません', 'Biết không? — はい、知っています／いいえ、知りません.', 'この 歌（うた）を 知（し）って いますか。', 'Bạn biết bài hát này không?'],
    ['～ても いいですか', 'Xin phép: …được không?', 'ここに 座（すわ）っても いいですか。', 'Tôi ngồi đây được không?'],
    ['～ては いけません', 'Cấm: không được….', 'ここで 食（た）べては いけません。', 'Ở đây không được ăn.'],
    ['～て、～て、～ます', 'Kể nhiều việc theo thứ tự.', '起（お）きて、顔（かお）を 洗（あら）って、学校（がっこう）へ 行（い）きます。', 'Tôi dậy, rửa mặt rồi đi học.'],
    ['～てから', 'Làm xong A rồi mới B.', '手（て）を 洗（あら）ってから、食（た）べます。', 'Rửa tay xong rồi mới ăn.'],
  ]],
  ['Trạm 5 · Thể ngắn và mẫu nâng cao', 'Thể ない, thể từ điển, thể た: phải làm, không cần, từng làm, ý kiến, trích lời (13 mẫu)', [
    ['Thể ない（3 nhóm）', 'Dạng phủ định thân mật; xem phần Chia động từ.', '今日（きょう）は 行（い）かない。', 'Hôm nay tôi không đi.'],
    ['～ないで ください', 'Xin đừng….', 'ここで 写真（しゃしん）を 撮（と）らないで ください。', 'Xin đừng chụp ảnh ở đây.'],
    ['～なければ なりません', 'Phải làm.', '宿題（しゅくだい）を しなければ なりません。', 'Tôi phải làm bài tập.'],
    ['～なくても いいです', 'Không cần làm.', '明日（あした）は 来（こ）なくても いいです。', 'Ngày mai không cần đến.'],
    ['Thể từ điển（3 nhóm）', 'Dạng gốc của động từ.', '私（わたし）は 毎朝（まいあさ）、走（はし）る。', 'Sáng nào tôi cũng chạy.'],
    ['～ことです・～ことが できます', 'Sở thích là…; có thể làm….', '私（わたし）は 泳（およ）ぐことが できます。', 'Tôi biết bơi.'],
    ['～前に', 'Trước khi….', '寝（ね）る 前（まえ）に、歯（は）を 磨（みが）きます。', 'Trước khi ngủ tôi đánh răng.'],
    ['Thể た', 'Dạng quá khứ thân mật.', '昨日（きのう）、映画（えいが）を 見（み）た。', 'Hôm qua tôi đã xem phim.'],
    ['～た ことが あります', 'Đã từng; chưa từng: ～たことが ありません.', '京都（きょうと）へ 行（い）った ことが あります。', 'Tôi đã từng đến Kyoto.'],
    ['～たり ～たり します', 'Nào là… nào là….', '週末（しゅうまつ）は 掃除（そうじ）したり、買（か）い物（もの）したり します。', 'Cuối tuần tôi nào dọn dẹp, nào mua sắm.'],
    ['Thể thông thường', 'Nói với bạn bè / người nhà (bỏ です・ます).', '明日（あした）、暇（ひま）？', 'Mai rảnh không?'],
    ['～と 思います', 'Tôi nghĩ rằng….', '日本語（にほんご）は おもしろいと 思（おも）います。', 'Tôi nghĩ tiếng Nhật thú vị.'],
    ['～と 言いました', 'Ai đó đã nói rằng….', '先生（せんせい）は 「明日（あした）は 休（やす）みだ」と 言（い）いました。', 'Cô giáo nói ngày mai nghỉ.'],
  ]],
];
