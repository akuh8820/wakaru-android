#!/usr/bin/env python3
"""Generate kanji-detail.json: curated N5 example sentences + related kosakata per kanji."""
import json, os

BASE = os.path.join(os.path.dirname(__file__), '..', 'app', 'src', 'main', 'assets', 'data', 'n5')

# Curated example sentences (N5 grammar, uses N5 vocab). jp = kanji form, kana = reading, id = Indonesian.
EXAMPLES = {
    '一': [{"jp": "一つください。", "kana": "ひとつください。", "id": "Tolong satu."},
          {"jp": "一月に日本へ行きます。", "kana": "いちがつににほんへいきます。", "id": "Saya pergi ke Jepang bulan Januari."}],
    '七': [{"jp": "七時に起きます。", "kana": "しちじにおきます。", "id": "Saya bangun jam 7."}],
    '万': [{"jp": "一万円です。", "kana": "いちまんえんです。", "id": "Ini sepuluh ribu yen."}],
    '三': [{"jp": "三つください。", "kana": "みっつください。", "id": "Tolong tiga."},
          {"jp": "三時に会いましょう。", "kana": "さんじにあいましょう。", "id": "Mari bertemu jam 3."}],
    '上': [{"jp": "机の上に本があります。", "kana": "つくえのうえにほんがあります。", "id": "Ada buku di atas meja."}],
    '下': [{"jp": "椅子の下に猫がいます。", "kana": "いすのしたにねこがいます。", "id": "Ada kucing di bawah kursi."}],
    '中': [{"jp": "箱の中に何がありますか。", "kana": "はこのなかに なにがありますか。", "id": "Apa yang ada di dalam kotak?"}],
    '九': [{"jp": "九時まで働きます。", "kana": "くじまではたらきます。", "id": "Saya bekerja sampai jam 9."}],
    '二': [{"jp": "二つください。", "kana": "ふたつください。", "id": "Tolong dua."},
          {"jp": "二時に昼ご飯を食べます。", "kana": "にじにひるごはんをたべます。", "id": "Saya makan siang jam 2."}],
    '五': [{"jp": "五時半です。", "kana": "ごじはんです。", "id": "Sekarang jam 5.30."}],
    '人': [{"jp": "あの人は先生です。", "kana": "あのひとはせんせいです。", "id": "Orang itu adalah guru."}],
    '今': [{"jp": "今、何時ですか。", "kana": "いま、なんじですか。", "id": "Sekarang jam berapa?"}],
    '休': [{"jp": "明日は休みです。", "kana": "あしたはやすみです。", "id": "Besok libur."}],
    '何': [{"jp": "それは何ですか。", "kana": "それはなんですか。", "id": "Apa itu?"}],
    '先': [{"jp": "先週、京都へ行きました。", "kana": "せんしゅう、きょうとへいきました。", "id": "Minggu lalu saya pergi ke Kyoto."}],
    '入': [{"jp": "部屋に入ってください。", "kana": "へやにはいってください。", "id": "Silakan masuk ke ruangan."}],
    '八': [{"jp": "八時に学校へ行きます。", "kana": "はちじにがっこうへいきます。", "id": "Saya pergi ke sekolah jam 8."}],
    '六': [{"jp": "六時に起きます。", "kana": "ろくじにおきます。", "id": "Saya bangun jam 6."}],
    '円': [{"jp": "これは百円です。", "kana": "これはひゃくえんです。", "id": "Ini seratus yen."}],
    '出': [{"jp": "家を出ます。", "kana": "いえをでます。", "id": "Saya keluar rumah."}],
    '前': [{"jp": "駅の前に銀行があります。", "kana": "えきのまえにぎんこうがあります。", "id": "Ada bank di depan stasiun."}],
    '北': [{"jp": "北に山があります。", "kana": "きたにやまがあります。", "id": "Ada gunung di utara."}],
    '十': [{"jp": "十時です。", "kana": "じゅうじです。", "id": "Sekarang jam 10."}],
    '千': [{"jp": "千円ください。", "kana": "せんえんください。", "id": "Tolong seribu yen."}],
    '午': [{"jp": "午後、買い物に行きます。", "kana": "ごご、かいものにいきます。", "id": "Sore nanti saya pergi belanja."}],
    '半': [{"jp": "七時半に起きます。", "kana": "しちじはんにおきます。", "id": "Saya bangun jam 7.30."}],
    '南': [{"jp": "南に海があります。", "kana": "みなみにうみがあります。", "id": "Ada laut di selatan."}],
    '友': [{"jp": "友だちと話します。", "kana": "ともだちとはなします。", "id": "Saya berbicara dengan teman."}],
    '右': [{"jp": "右に曲がってください。", "kana": "みぎにまがってください。", "id": "Tolong belok kanan."}],
    '名': [{"jp": "お名前は何ですか。", "kana": "おなまえはなんですか。", "id": "Siapa nama Anda?"}],
    '四': [{"jp": "四時に帰ります。", "kana": "よじにかえります。", "id": "Saya pulang jam 4."}],
    '国': [{"jp": "日本はきれいな国です。", "kana": "にほんはきれいなくにです。", "id": "Jepang adalah negara yang indah."}],
    '土': [{"jp": "土曜日に遊びます。", "kana": "どようびにあそびます。", "id": "Saya bermain pada hari Sabtu."}],
    '外': [{"jp": "外は寒いです。", "kana": "そとはさむいです。", "id": "Di luar dingin."}],
    '大': [{"jp": "大きい犬ですね。", "kana": "おおきいいぬですね。", "id": "Anjing yang besar ya."}],
    '天': [{"jp": "今日は天気がいいです。", "kana": "きょうはてんきがいいです。", "id": "Hari ini cuacanya bagus."}],
    '女': [{"jp": "あの女の人は日本人です。", "kana": "あのおんなのひとはにほんじんです。", "id": "Wanita itu orang Jepang."}],
    '子': [{"jp": "子供が公園で遊んでいます。", "kana": "こどもがこうえんであそんでいます。", "id": "Anak-anak bermain di taman."}],
    '学': [{"jp": "日本語を勉強しています。", "kana": "にほんごをべんきょうしています。", "id": "Saya sedang belajar bahasa Jepang."}],
    '小': [{"jp": "小さい猫がいます。", "kana": "ちいさいねこがいます。", "id": "Ada kucing kecil."}],
    '山': [{"jp": "富士山は高いです。", "kana": "ふじさんはたかいです。", "id": "Gunung Fuji tinggi."}],
    '川': [{"jp": "川で魚を見ました。", "kana": "かわでさかなをみました。", "id": "Saya melihat ikan di sungai."}],
    '左': [{"jp": "左に曲がってください。", "kana": "ひだりにまがってください。", "id": "Tolong belok kiri."}],
    '年': [{"jp": "今年は2026年です。", "kana": "ことしはにせんにじゅうろくねんです。", "id": "Tahun ini 2026."}],
    '後': [{"jp": "後で電話します。", "kana": "あとででんわします。", "id": "Saya akan menelepon nanti."}],
    '日': [{"jp": "今日はいい日です。", "kana": "きょうはいいひです。", "id": "Hari ini adalah hari yang baik."}],
    '時': [{"jp": "今、何時ですか。", "kana": "いま、なんじですか。", "id": "Sekarang jam berapa?"}],
    '書': [{"jp": "手紙を書きます。", "kana": "てがみをかきます。", "id": "Saya menulis surat."}],
    '月': [{"jp": "月がきれいです。", "kana": "つきがきれいです。", "id": "Bulan itu indah."}],
    '木': [{"jp": "木の下で休みます。", "kana": "きのしたでやすみます。", "id": "Saya beristirahat di bawah pohon."}],
    '本': [{"jp": "本を読みます。", "kana": "ほんをよみます。", "id": "Saya membaca buku."}],
    '来': [{"jp": "来週、大阪へ行きます。", "kana": "らいしゅう、おおさかへいきます。", "id": "Minggu depan saya pergi ke Osaka."}],
    '東': [{"jp": "東から日が昇ります。", "kana": "ひがしからひがのぼります。", "id": "Matahari terbit dari timur."}],
    '校': [{"jp": "学校は八時からです。", "kana": "がっこうははちじからです。", "id": "Sekolah mulai jam 8."}],
    '母': [{"jp": "母は料理が上手です。", "kana": "はははりょうりがじょうずです。", "id": "Ibu pandai memasak."}],
    '毎': [{"jp": "毎朝、コーヒーを飲みます。", "kana": "まいあさ、こーひーをのみます。", "id": "Setiap pagi saya minum kopi."}],
    '気': [{"jp": "気をつけてください。", "kana": "きをつけてください。", "id": "Tolong hati-hati."}],
    '水': [{"jp": "水を飲みます。", "kana": "みずをのみます。", "id": "Saya minum air."}],
    '火': [{"jp": "火曜日に会いましょう。", "kana": "かようびにあいましょう。", "id": "Mari bertemu hari Selasa."}],
    '父': [{"jp": "父は会社員です。", "kana": "ちちはかいしゃいんです。", "id": "Ayah adalah karyawan perusahaan."}],
    '生': [{"jp": "学生です。", "kana": "がくせいです。", "id": "Saya pelajar."}],
    '男': [{"jp": "あの男の人は医者です。", "kana": "あのおとこのひとはいしゃです。", "id": "Pria itu adalah dokter."}],
    '白': [{"jp": "白い車が好きです。", "kana": "しろいくるまがすきです。", "id": "Saya suka mobil putih."}],
    '百': [{"jp": "百円です。", "kana": "ひゃくえんです。", "id": "Seratus yen."}],
    '聞': [{"jp": "音楽を聞きます。", "kana": "おんがくをききます。", "id": "Saya mendengarkan musik."}],
    '行': [{"jp": "学校へ行きます。", "kana": "がっこうへいきます。", "id": "Saya pergi ke sekolah."}],
    '西': [{"jp": "西に山があります。", "kana": "にしにやまがあります。", "id": "Ada gunung di barat."}],
    '見': [{"jp": "テレビを見ます。", "kana": "てれびをみます。", "id": "Saya menonton TV."}],
    '話': [{"jp": "日本語で話しましょう。", "kana": "にほんごではなしましょう。", "id": "Mari berbicara dalam bahasa Jepang."}],
    '語': [{"jp": "日本語を勉強します。", "kana": "にほんごをべんきょうします。", "id": "Saya belajar bahasa Jepang."}],
    '読': [{"jp": "新聞を読みます。", "kana": "しんぶんをよみます。", "id": "Saya membaca koran."}],
    '車': [{"jp": "車で行きます。", "kana": "くるまでいきます。", "id": "Saya pergi dengan mobil."}],
    '金': [{"jp": "金曜日に会いましょう。", "kana": "きんようびにあいましょう。", "id": "Mari bertemu hari Jumat."}],
    '長': [{"jp": "長い川ですね。", "kana": "ながいかわですね。", "id": "Sungai yang panjang ya."}],
    '間': [{"jp": "間に合いました。", "kana": "まにあいました。", "id": "Saya tepat waktu."}],
    '雨': [{"jp": "雨が降っています。", "kana": "あめがふっています。", "id": "Sedang hujan."}],
    '電': [{"jp": "電車で行きます。", "kana": "でんしゃでいきます。", "id": "Saya pergi dengan kereta."}],
    '食': [{"jp": "ご飯を食べます。", "kana": "ごはんをたべます。", "id": "Saya makan nasi."}],
    '高': [{"jp": "高い山ですね。", "kana": "たかいやまですね。", "id": "Gunung yang tinggi ya."}],
    '会': [{"jp": "友だちに会います。", "kana": "ともだちにあいます。", "id": "Saya bertemu teman."}],
    '使': [{"jp": "パソコンを使います。", "kana": "ぱそこんをつかいます。", "id": "Saya menggunakan komputer."}],
    '分': [{"jp": "日本語がわかります。", "kana": "にほんごがわかります。", "id": "Saya mengerti bahasa Jepang."}],
    '口': [{"jp": "口を開けてください。", "kana": "くちをあけてください。", "id": "Tolong buka mulut."}],
    '古': [{"jp": "古い本ですね。", "kana": "ふるいほんですね。", "id": "Buku yang tua ya."}],
    '場': [{"jp": "ここは駐車場です。", "kana": "ここはちゅうしゃじょうです。", "id": "Ini tempat parkir."}],
    '売': [{"jp": "この店はパンを売っています。", "kana": "このみせはぱんをうっています。", "id": "Toko ini menjual roti."}],
    '多': [{"jp": "人が多いですね。", "kana": "ひとがおおいですね。", "id": "Orangnya banyak ya."}],
    '安': [{"jp": "この店は安いです。", "kana": "このみせはやすいです。", "id": "Toko ini murah."}],
    '少': [{"jp": "少し待ってください。", "kana": "すこしまってください。", "id": "Tolong tunggu sebentar."}],
    '届': [{"jp": "荷物が届きました。", "kana": "にもつがとどきました。", "id": "Paket sudah tiba."}],
    '市': [{"jp": "市役所はどこですか。", "kana": "しやくしょはどこですか。", "id": "Di mana kantor kota?"}],
    '店': [{"jp": "あの店で買います。", "kana": "あのみせでかいます。", "id": "Saya membeli di toko itu."}],
    '待': [{"jp": "ちょっと待ってください。", "kana": "ちょっとまってください。", "id": "Tolong tunggu sebentar."}],
    '思': [{"jp": "いいと思います。", "kana": "いいとおもいます。", "id": "Saya pikir bagus."}],
    '急': [{"jp": "急いでください。", "kana": "いそいでください。", "id": "Tolong cepat."}],
    '手': [{"jp": "手を洗います。", "kana": "てをあらいます。", "id": "Saya mencuci tangan."}],
    '持': [{"jp": "かばんを持ちます。", "kana": "かばんをもちます。", "id": "Saya membawa tas."}],
    '新': [{"jp": "新しい車が欲しいです。", "kana": "あたらしいくるまがほしいです。", "id": "Saya ingin mobil baru."}],
    '歩': [{"jp": "駅まで歩きます。", "kana": "えきまであるきます。", "id": "Saya berjalan ke stasiun."}],
    '番': [{"jp": "何番ですか。", "kana": "なんばんですか。", "id": "Nomor berapa?"}],
    '目': [{"jp": "目が大きいですね。", "kana": "めがおおきいですね。", "id": "Matanya besar ya."}],
    '知': [{"jp": "知っていますか。", "kana": "しっていますか。", "id": "Apakah kamu tahu?"}],
    '社': [{"jp": "会社へ行きます。", "kana": "かいしゃへいきます。", "id": "Saya pergi ke perusahaan."}],
    '空': [{"jp": "空が青いです。", "kana": "そらがあおいです。", "id": "Langit biru."}],
    '立': [{"jp": "ここに立ってください。", "kana": "ここにたってください。", "id": "Tolong berdiri di sini."}],
    '耳': [{"jp": "耳が痛いです。", "kana": "みみがいたいです。", "id": "Telinga saya sakit."}],
    '花': [{"jp": "花がきれいです。", "kana": "はながきれいです。", "id": "Bunganya indah."}],
    '言': [{"jp": "日本語で言ってください。", "kana": "にほんごでいってください。", "id": "Tolong katakan dalam bahasa Jepang."}],
    '買': [{"jp": "パンを買います。", "kana": "ぱんをかいます。", "id": "Saya membeli roti."}],
    '足': [{"jp": "足が痛いです。", "kana": "あしがいたいです。", "id": "Kaki saya sakit."}],
    '送': [{"jp": "メールを送ります。", "kana": "めーるをおくります。", "id": "Saya mengirim email."}],
    '週': [{"jp": "週に一度、泳ぎます。", "kana": "しゅうにいちど、およぎます。", "id": "Seminggu sekali saya berenang."}],
    '道': [{"jp": "この道をまっすぐ行ってください。", "kana": "このみちをまっすぐいってください。", "id": "Tolong lurus di jalan ini."}],
    '院': [{"jp": "病院へ行きます。", "kana": "びょういんへいきます。", "id": "Saya pergi ke rumah sakit."}],
    '飲': [{"jp": "水を飲みます。", "kana": "みずをのみます。", "id": "Saya minum air."}],
    '駅': [{"jp": "駅はここです。", "kana": "えきはここです。", "id": "Stasiun di sini."}],
    '魚': [{"jp": "魚を食べます。", "kana": "さかなをたべます。", "id": "Saya makan ikan."}],
}

# Curated related fallback for kanji with no kosakata matches
RELATED_FALLBACK = {
    '送': [{"kanji": "送る", "kana": "おくる", "arti": "mengirim"},
           {"kanji": "放送", "kana": "ほうそう", "arti": "siaran"}],
    '思': [{"kanji": "思う", "kana": "おもう", "arti": "berpikir, mengira"},
           {"kanji": "思い出", "kana": "おもいで", "arti": "kenangan"}],
    '急': [{"kanji": "急ぐ", "kana": "いそぐ", "arti": "terburu-buru"},
           {"kanji": "急行", "kana": "きゅうこう", "arti": "kereta ekspres"}],
    '場': [{"kanji": "場所", "kana": "ばしょ", "arti": "tempat"},
           {"kanji": "駐車場", "kana": "ちゅうしゃじょう", "arti": "tempat parkir"},
           {"kanji": "場合", "kana": "ばあい", "arti": "kasus, keadaan"}],
    '市': [{"kanji": "市役所", "kana": "しやくしょ", "arti": "kantor kota"},
           {"kanji": "都市", "kana": "とし", "arti": "kota"}],
}

def main():
    kanji_list = json.load(open(os.path.join(BASE, 'kanji.json')))
    kosakata = json.load(open(os.path.join(BASE, 'kosakata.json')))

    # related words: kosakata whose kanji field contains this kanji char
    related = {}
    for item in kosakata:
        k = item.get('kanji') or ''
        for ch in set(k):
            if ch in EXAMPLES:
                related.setdefault(ch, []).append(item)

    out = {}
    missing = []
    for k in kanji_list:
        ch = k['kanji']
        if ch not in EXAMPLES:
            missing.append(ch)
            continue
        rel = related.get(ch, [])[:8]
        if not rel:
            rel = RELATED_FALLBACK.get(ch, [])
        out[ch] = {
            'examples': EXAMPLES[ch],
            'related': [{'kanji': r['kanji'], 'kana': r['kana'], 'arti': r['arti']} for r in rel]
        }

    if missing:
        print('WARN missing examples for:', missing)

    dest = os.path.join(BASE, 'kanji-detail.json')
    with open(dest, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'OK: {len(out)} kanji → {dest} ({os.path.getsize(dest)} bytes)')

if __name__ == '__main__':
    main()