#!/usr/bin/env python3
"""Add pos (part-of-speech) field to n5/kosakata.json."""
import json, re
from collections import Counter

PATH = "app/src/main/assets/data/n5/kosakata.json"

# ══════════════════════════════════════════════════════════════════════
# CURATED LISTS (kana readings, primary reading only)
# ══════════════════════════════════════════════════════════════════════

KNOWN_VERBS = {
    # godan
    "あう", "あく", "あそぶ", "あらう", "あるく", "ある", "いう", "いう",
    "いく", "いそぐ", "うたう", "うつ", "うむ", "うれる", "おもう",
    "おる", "おろす", "かえる", "かく", "かす", "かたる", "かつ",
    "かなう", "かぶる", "かりる", "きく", "きめる", "くう", "くぶ",
    "くる", "くらべる", "ける", "こう", "こぼす", "こむ", "こめる",
    "さす", "しぬ", "しめる", "すう", "すくう", "すむ", "する",
    "ぜめる", "そだてる", "たたう", "たす", "たたむ", "たつ", "たのむ",
    "たべる", "つくる", "つたえる", "つむ", "つれる", "てつだう",
    "とどける", "とまる", "とる", "なぐる", "なす", "なれる",
    "にぎる", "ぬすむ", "のぼる", "はいる", "はしる", "はなす",
    "はねる", "はやす", "ひく", "ふえる", "ふる", "へる", "ほうむる",
    "まつ", "まもる", "みがく", "みせる", "むかう", "むすぶ",
    "もつ", "もつ", "もる", "やく", "やく", "やる", "よぶ",
    "よむ", "わかる", "われる", "わたる",
    # ichidan
    "あける", "あびる", "あげる", "あてる", "いる",
    "うける", "うごく", "おきる", "おくる", "おくる", "おどろく",
    "おぼえる", "おる", "おろす", "かえる", "かかる", "かける",
    "かせぐ", "きめる", "きる", "くいる", "くっつける", "ける",
    "ける", "げる", "こえる", "ころぶ", "ころす", "される",
    "しあげる", "しかる", "しめる", "すすめる", "すてる", "する",
    "せる", "そう", "そだてる", "たえる", "たてる", "たすける",
    "たてる", "ちがう", "つく", "つける", "つける", "つづける",
    "つれる", "でかける", "できる", "てつだう", "とおす", "とおる",
    "とける", "とめる", "とりだす", "なおす", "ながめる",
    "なける", "なす", "なれる", "ぬける", "ぬすむ", "ぬすむ",
    "ねる", "のぼる", "のぞく", "はじめる", "はいる",
    "はしる", "はなす", "はなれる", "はめる", "はやす",
    "ひける", "ふえる", "ふく", "ふる", "へらす", "へる",
    "ほす", "まつ", "まつ", "まもる", "みがく", "みせる",
    "むかう", "むすぶ", "もつ", "もつ", "もれる", "やく",
    "やく", "やめる", "やる", "よぶ", "よめる", "わかる",
    "われる", "わたす", "わたる",
    # suru compounds (any word + する)
    "べんきょうする", "りょこうする", "せんたくする", "そうじする",
    "はんせいする", "しゅっせきする", "ひるがえす",
}

# Also: anything ending in する is a verb (handled in classify)

KNOWN_IADJ = {
    "あおい", "あかい", "あかるい", "あたたかい", "あたらしい",
    "あつい", "あぶない", "あまい",
    "いい", "よい",
    "いそがしい", "いたい",
    "うすい", "うるさい",
    "おいしい", "おおい", "おおきい",
    "おそい", "おもい", "おもしろい",
    "からい", "かるい", "かわいい",
    "きいろい", "きたない",
    "くらい", "くろい",
    "さむい",
    "しろい", "すくない", "すずしい",
    "せまい",
    "たかい", "たのしい", "ちいさい", "ちかい",
    "つまらない", "つめたい", "つよい",
    "とおい",
    "ながい", "ぬるい",
    "はやい", "ひくい", "ひろい", "ふとい", "ふるい",
    "ほしい", "ほそい",
    "まずい", "まるい", "みじかい", "むずかしい",
    "やさしい", "やすい", "よわい",
    "わかい", "わるい",
}

NA_ADJ = {
    "げんき", "しずか", "にぎやか", "ゆうめい", "べんり", "ふべん",
    "じょうず", "へた",
    "すき", "きらい", "だいすき", "だいきらい",
    "きれい", "しんせつ", "ていねい", "たいせつ",
    "だいじ", "じゅうよう", "ひつよう", "かんたん", "ふくざつ",
    "あんぜん", "きけん", "じょうぶ", "しんぱい", "じゆう",
    "ゆたか", "さかん",
    "ひま",  # 暇 = free time
    "ふべん",
}

# Adverbs, pronouns, particles, greetings, question words, etc. → "other"
OTHER_WORDS = {
    # Adverbs
    "いつも", "ときどき", "とても", "たくさん", "ちょっと", "すこし",
    "すくなくとも", "まだ", "もう", "すぐ", "よく", "たいへん",
    "ぜんぜん", "だいたい", "いっしょに", "もちろん", "だんだん",
    "どんどん", "まさか", "きっと", "たぶん", "もしかして", "やはり",
    # Greetings / sentence expressions
    "どうぞ", "どうも", "どう",
    "はじめまして", "こんにちは", "こんばんは", "さようなら", "おはよう",
    "いらっしゃい", "ありがとうございます", "すみません",
    "いただきます", "ごちそうさま",
    # Yes/no
    "はい", "いいえ", "ええ",
    "さあ", "ねえ",
    # Demonstratives / pronouns
    "これ", "それ", "あれ", "どれ",
    "ここ", "そこ", "あそこ", "どこ",
    "こちら", "そちら", "あちら", "どちら",
    "この", "その", "あの", "どの",
    "こう", "そう", "ああ",
    "こんな", "そんな", "あんな", "どんな",
    "わたし", "ぼく", "あたし", "きみ",
    # Question words
    "いつ", "どこ", "だれ", "なに", "なぜ", "なん",
    "いくら", "いくつ",
    # Particles / conjunctions
    "から", "まで", "より",
    # Sentence-final
    "よ", "ね", "な",
    # Other functional
    "ください",
}

# Nouns (time words, common nouns that are NOT verbs/adj)
TIME_NOUNS = {
    "しゅうまつ", "あさ", "よる", "きょう", "あした", "いま", "まいにち",
    "らいしゅう", "せんしゅう", "きのう", "ことし", "らいねん",
    "ひる", "けさ", "こんばん",
    "しゅうにち", "ひにち",
    "とし", "つき", "ひ", "ふゆ", "なつ", "はる", "あき",
    "ごご", "ごぜん",
    "にちようび", "げつようび", "かようび", "すいようび", "もくようび",
    "きんようび", "どようび",
    "いちがつ", "にがつ", "さんがつ", "しがつ", "ごがつ",
    "ろくがつ", "しちがつ", "はちがつ", "くがつ", "じゅうがつ",
    "じゅういちがつ", "じゅうにがつ",
}


def classify(item):
    kana_raw = item["kana"].strip()
    # Use primary reading (before comma/slash)
    kana = kana_raw.split(",")[0].strip()
    kana = kana.split("/")[0].strip()
    # Remove spaces and punctuation for matching
    kana_clean = re.sub(r'[。、！？「」（）・…\s]', '', kana)

    # 1. NA_ADJ first (some end in い but are na-adj)
    if kana_clean in NA_ADJ:
        return "na-adj"

    # 2. KNOWN_VERBS
    if kana_clean in KNOWN_VERBS:
        return "verb"

    # 3. OTHER_WORDS
    if kana_clean in OTHER_WORDS:
        return "other"

    # 4. Suru compound: anything ending in する
    if kana_clean.endswith("する"):
        return "verb"

    # 5. KNOWN_IADJ
    if kana_clean in KNOWN_IADJ:
        return "i-adj"

    # 6. Verb conjugation patterns (godan endings)
    if kana_clean:
        last = kana_clean[-1]
        if last in "うくぐすつぬぶむ":
            return "verb"
        if last == "る" and len(kana_clean) >= 2:
            before = kana_clean[-2]
            # i-row or e-row before る → likely ichidan verb
            irow = {"き", "し", "ち", "に", "ひ", "み", "り"}
            erow = {"け", "せ", "て", "ね", "へ", "め", "れ"}
            if before in irow or before in erow:
                return "verb"

    # 7. TIME_NOUNS
    if kana_clean in TIME_NOUNS:
        return "noun"

    # 8. Default: noun
    return "noun"


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    original = json.loads(json.dumps(data))  # deep copy for order check
    print(f"Loaded {len(data)} items")

    for item in data:
        item["pos"] = classify(item)

    # Verify order preserved
    for i, (orig, cur) in enumerate(zip(original, data)):
        assert orig["kana"] == cur["kana"], f"Order broken at {i}: {orig['kana']} != {cur['kana']}"
    print("Order preserved ✓")

    # Distribution
    dist = Counter(item["pos"] for item in data)
    print("\n=== POS Distribution ===")
    for pos, count in sorted(dist.items(), key=lambda x: -x[1]):
        print(f"  {pos}: {count}")

    # All "other" items
    others = [(i, item) for i, item in enumerate(data) if item["pos"] == "other"]
    print(f"\n=== All 'other' items ({len(others)}) ===")
    for idx, item in others:
        print(f"  [{idx:3d}] kanji={item['kanji']!r:12s} kana={item['kana']!r:18s} arti={item['arti']!r}")

    # Sanity samples
    for pos in ["verb", "i-adj", "na-adj", "noun", "other"]:
        samples = [item for item in data if item["pos"] == pos][:10]
        total = dist.get(pos, 0)
        print(f"\n=== Sample {pos} ({total} total) ===")
        for s in samples:
            print(f"  kanji={s['kanji']!r:12s} kana={s['kana']!r:18s} arti={s['arti']!r}")

    # Write back — compact JSON (no extra whitespace), UTF-8, preserve all fields
    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"\nWrote {len(data)} items to {PATH}")

    # Verify re-read
    with open(PATH, "r", encoding="utf-8") as f:
        verify = json.load(f)
    assert len(verify) == len(data), f"Length mismatch: {len(verify)} vs {len(data)}"
    for i, item in enumerate(verify):
        assert "pos" in item, f"Missing pos at {i}"
        assert item["pos"] in {"noun", "verb", "i-adj", "na-adj", "other"}, f"Invalid pos at {i}: {item['pos']}"
    print("Verification passed ✓")


if __name__ == "__main__":
    main()
