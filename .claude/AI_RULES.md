# 🚨 Claude Code 絶対ルール

**これらのルールは必ず守ってください。違反した場合は作業を中断してください。**

## 1️⃣ 最優先ルール：PROJECT.lock.json

```javascript
// 毎回の作業開始時に必ず実行
const projectLock = require('./PROJECT.lock.json')
const rules = projectLock.immutable_rules.rules
```

**PROJECT.lock.json は絶対的な仕様書です。ここに書かれていることが全てです。**

---

## 2️⃣ 変更禁止事項（FORBIDDEN）

### ❌ 絶対に変更してはいけないもの
1. **PROJECT.lock.json** - humanのみ編集可能
2. **技術スタック** - unlock_key無しで変更禁止
3. **.env.local** - 削除・名前変更禁止
4. **CLAUDE.md** - humanのみ編集可能

### ❌ 勝手に作成してはいけないもの
1. 新しいMDファイル（承認なしで作成禁止）
2. 新しいフォルダ（allowed_paths以外）
3. 新しいデータベース（Supabase以外禁止）
4. 新しいフレームワーク（Next.js以外禁止）

---

## 3️⃣ 承認が必要な作業（REQUIRES APPROVAL）

### 🔶 必ず「これを実行してもよいですか？」と確認
1. ファイル削除（→archiveフォルダへ移動）
2. データベーススキーマ変更
3. 新しいMDファイル作成
4. package.jsonの大幅変更
5. フォルダ構造の変更

**承認の取り方:**
```
Claude: 「○○を削除する必要があります。archiveフォルダに移動してもよいですか？」
User: 「OK」or「NG」
```

---

## 4️⃣ 自由に実行できる作業（ALLOWED）

### ✅ 承認なしで実行OK
1. allowed_paths内でのファイル作成・編集
2. バグ修正
3. テスト作成
4. .claude/CONTEXT.md の更新
5. Slash Commands実行

---

## 5️⃣ ドキュメント管理ルール

### 📄 有効なドキュメント（最新を保つ）
- **PROJECT.lock.json** - 絶対的仕様書
- **CLAUDE.md** - Claude Code用ガイド
- **.claude/CONTEXT.md** - 現在の状況

### 🗑️ 無効なドキュメント（無視する）
- IMPLEMENTATION_SUMMARY.md
- MIGRATION_COMPLETE.md
- CLEANUP_PLAN.md
- DEPLOY_NOW.md
- UPGRADE_COMPLETE.md
- その他の古いMDファイル

**新しいMDファイルを作りたい場合:**
```
Claude: 「新しいドキュメント○○.mdを作成する必要がありますが、承認いただけますか？」
User: 「必要ない、CONTEXT.mdに追記して」
```

---

## 6️⃣ 技術スタック変更プロトコル

### 🔐 技術を変更したい場合

**ステップ1: 提案**
```
Claude: 「FastAPIの代わりにExpressを使いたいです。理由は...」
```

**ステップ2: unlock_keyの確認**
```
User: 「unlock:2025-kouko-faro で承認」
```

**ステップ3: PROJECT.lock.json更新**
```javascript
// decision_logに追記
{
  "date": "2025-01-10",
  "decision": "Express導入",
  "by": "AI提案、human承認",
  "reason": "..."
}
```

---

## 7️⃣ エラー時の対処法

### 🚫 ルール違反に気づいたとき

1. **即座に作業停止**
2. **状況報告**
   ```
   「PROJECT.lock.jsonのルールに違反する可能性があります。
   実行しようとしたこと: ○○
   理由: ○○
   どのように進めますか？」
   ```
3. **指示を待つ**

---

## 8️⃣ 定期チェック項目

### 🔍 作業開始時に必ず確認

```bash
# 1. PROJECT.lock.jsonを読む
cat PROJECT.lock.json | grep "immutable_rules"

# 2. 現在の優先事項を確認
cat PROJECT.lock.json | grep -A 10 "current_priorities"

# 3. CONTEXT.mdで最新状況確認
cat .claude/CONTEXT.md | head -20
```

---

## 9️⃣ コミュニケーションルール

### 💬 明確な意思確認

**良い例:**
```
Claude: 「バグ修正のためにfrontend/app/api/chat/route.tsを編集します」
→ allowed_pathsなのでOK、実行

Claude: 「新機能のためにNEW_FEATURE.mdを作成してもよいですか？」
→ 承認待ち
```

**悪い例:**
```
Claude: 「効率化のためFastAPIを追加しました」
→ ルール違反！勝手に技術スタック変更
```

---

## 🔟 最重要：判断に迷ったら

**必ず聞く！勝手に判断しない！**

```
「PROJECT.lock.jsonには○○について明記されていません。
実行してもよいでしょうか？」
```

---

**このルールは絶対です。PROJECT.lock.jsonと共に、必ず参照してください。**

**Last Updated**: 2025-01-10
**Version**: 1.0.0