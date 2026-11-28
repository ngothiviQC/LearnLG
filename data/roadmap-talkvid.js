/* Video tình huống cho mục "Hội thoại mẫu" của từng trạm: tranh vẽ trong trang (roadmap-mockart.js) + file mp3 giọng nam/nữ (edge-tts) + phụ đề chạy theo giọng.
   RM_TALKVID[số bài] = { audio, dur (giây), g: giới tính người nói theo thứ tự ['m','f'], hint: từ khoá chọn bối cảnh, t: [[bắt đầu, kết thúc] mỗi câu] }. Hiện mới làm thử bài 1. */
const RM_TALKVID = {
  1: { audio: 'audio/talk/t01.mp3', dur: 26.88, g: ['m', 'f'], hint: 'しごと かいぎ パソコン', t: [[0.6, 5.81], [6.5, 13.03], [13.73, 18.46], [19.15, 26.18]] }
};
