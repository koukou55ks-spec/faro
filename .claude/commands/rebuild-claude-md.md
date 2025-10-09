---
description: CLAUDE.mdを/specs/から自動再生成
---

# CLAUDE.md 自動再生成

以下のスクリプトを実行してください:

```bash
python scripts/build_claude_md.py
```

## 実行内容

1. `specs/_ABSOLUTE.md`を読み込み（絶対優先）
2. `specs/high/*.md`を全て読み込み（高優先）
3. `specs/low/*.md`を要約して読み込み（低優先）
4. 既存のCLAUDE.mdをバックアップ
5. 新しいCLAUDE.mdを生成

## 実行後

- 生成されたCLAUDE.mdを確認
- 内容が正しければGitにコミット

```bash
git add CLAUDE.md
git commit -m "chore: Rebuild CLAUDE.md from specs/"
git push
```
