# GitHub Pagesで公開する手順(初心者向け)

1. GitHubにログインし、右上の「+」→「New repository」を押します。
2. Repository name に好きな名前(例: tarot-training)を入れ、**Public** を選んで「Create repository」。
3. 作成後の画面で「uploading an existing file」のリンクを押し、このフォルダの中身(index.html、.github フォルダなど全部)をドラッグ&ドロップします。
   - フォルダごとではなく「中身」をアップロードしてください。`.github` は隠しフォルダなので、見えない場合はPCの設定で隠しファイルを表示します。
4. 「Commit changes」を押します。
5. リポジトリの Settings → Pages → Source を **GitHub Actions** にします。
6. 上部の Actions タブで、緑のチェックが付くまで1〜2分待ちます。
7. 公開URLは `https://<ユーザー名>.github.io/<リポジトリ名>/` です。スマホで開いて「ホーム画面に追加」で完成です。

## 公開前の注意
- **画像の権利を人が確認してから Public にしてください(要確認)。** カード画像(Wikimedia由来)、ロゴ(wordmark.png)、アイコン画像(目・鍵穴・鳩・太陽)は、出典と利用条件が未確認です。確認が取れるまでは、公開せず、手元で使うだけにしてください。
- 無料プランのGitHub Pagesは、Publicリポジトリでのみ使えます。Privateのまま公開したい場合は有料プランが必要です。
- Publicリポジトリは誰でも見られます。クライアント名・未発表情報・個人情報は入れないでください。
- LICENSE(MIT)の著作権表記はそのまま残してください。自分の名前に変えたい場合は、元の作者との関係を確認してからにしてください。
- ファイルを変更したら `sw.js` の `CACHE_NAME` の数字を上げると、インストール済みのスマホにも更新が届きます。
