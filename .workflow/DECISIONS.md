# Technical Decisions

このファイルは重要な技術的決定を記録します。
将来「なぜこの選択をしたのか？」を思い出すためのログです。

---

## 2025-10-12: Guest Mode (No Database)

**Context**: ゲストユーザーのチャット機能実装時、UUID外部キー制約エラーが発生

**Decision**: ゲストユーザーはデータベースを使用せず、メモリ内（in-memory）のみで動作

**Alternatives Considered**:
- ダミーユーザーをDBに作成（却下：複雑、保守が難しい）
- 全ユーザーに認証必須（却下：UX悪化、離脱率上昇）
- ゲスト用の別テーブル作成（却下：スキーマ複雑化）

**Consequences**:
- ✅ 実装がシンプル
- ✅ パフォーマンス向上（DB不要）
- ✅ 即座に使い始められる（サインアップ不要）
- ❌ ゲストの会話履歴は永続化されない
- ❌ ゲスト→認証ユーザーの移行パスが必要

**Reversibility**: 中（認証ユーザーへの移行パスを実装すれば解決）

**Implementation**:
- File: `apps/web/app/api/chat/route.ts:26-44`
- Pattern: `if (!userId)` で分岐、ゲストはDB処理をスキップ

---

## Template（新しい決定を追加する際のテンプレート）

**Context**: [なぜこの決定が必要になったのか]

**Decision**: [何を決めたのか - 1文で]

**Alternatives Considered**:
- 選択肢A（却下：理由）
- 選択肢B（却下：理由）
- 選択肢C（却下：理由）

**Consequences**:
- ✅ メリット1
- ✅ メリット2
- ❌ デメリット1
- ❌ デメリット2

**Reversibility**: [High/Medium/Low - 変更の難易度]

**Implementation**: [実装場所やパターン]
