# 音譜の行進隊
初音ミク「マジカルミライ 2021」 プログラミング・コンテスト応募作品
![概要](https://user-images.githubusercontent.com/38162502/135104803-7e1e9d42-7b06-4401-8c62-17a81e3f1aae.png)

## 概要
* TextAliveAppAPIを利用して楽曲に合わせた演出を行うWebアプリケーションです。
* TextAliveAppAPIに対応した楽曲全てに対応しています。
* フレーズと共に出現する音譜が、サビや間奏で音楽に合わせて行進、ダンスする演出を楽しめます。
* 音譜の手動生成機能によって、演出をただ眺めるだけではなく自分の手で演出を創り出すことができます。
* 偶然が生み出すランダムな演出によって、何度再生しても毎回異なる演出を楽しむことができます。

## 使用方法
### 利用準備
* (前提) Node.jsがインストールされていること
* 以下のコマンドでプロジェクトのクローンと必要なモジュールをインストールします。
<pre>
git clone https://github.com/takanosuke/musical-note-march.git
cd musical-note-march/
npm install
</pre>
※ 動作確認をした環境はnpm@7.20.0です。

### 開発サーバ起動
* 以下のコマンドで開発用サーバが起動します。ローカル環境でテストする際に利用します。
<pre>
npm run dev
</pre>

### ビルド
* 以下のコマンドで<code>docs</code>ディレクトリ以下にビルド済みファイルが生成されます。
<pre>
npm run build
</pre>

### 操作方法
* 画面中央の再生ボタンを押すことで楽曲&演出の再生ができます。
* 画面下の ^ ボタンを押すことでコントロールメニューが開き、楽曲の変更や再生位置の変更等ができます。

## 演出
演出パターンは以下の5つのパートに分かれています。
* オープニング
* メロディパート
* サビ
* 間奏
* エンディング

### オープニング
* 灰色の曲のタイトルが画面中央に徐々に吸い込まれていく演出です。吸い込まれた後にそこから1つ目のフレーズが生まれます。
※ 前奏がない楽曲の場合はこの演出がない or 短縮版の演出となります。
![オープニング](https://user-images.githubusercontent.com/38162502/135092518-d697801b-3b89-4f6f-a1fd-f366338de3ae.gif)

### メロディパート
* 楽曲に合わせてフレーズが出現します。出現位置はランダムですが、連続で同じ位置にならないように、画面から見切れないように対策を入れています。
* 楽曲の声量に合わせて歌詞のサイズが変化します。まるで文字が歌っているような楽曲と同期した演出を楽しめます。
* 1つのフレーズに対して1つの音譜が生まれ、この音譜達がサビや間奏で楽曲を盛り上げます。
* 出現位置、色、音譜のサイズ、音譜の種類がランダムなので、毎回異なる演出を楽しめます。
![メロディ](https://user-images.githubusercontent.com/38162502/135092504-3ed32bbe-4328-40d0-8915-e69d400eb078.gif)

### サビパート
* フレーズから生まれた音譜達が楽曲に合わせて楽譜の上を元気に行進します。
* よく見ると音譜の種類によって足の速さが違います。
* メロディパートと同様に、声量に合わせて歌詞のサイズが変化し、1フレーズに対して1つの音譜が生まれます。
![サビ](https://user-images.githubusercontent.com/38162502/135092528-b05bd54a-e9d7-41bf-8301-b36729293006.gif)

### 間奏パート
* フレーズから生まれた音譜達が楽曲に合わせて元気に踊ります。
![間奏](https://user-images.githubusercontent.com/38162502/135092551-134ad959-bb4a-47c4-b4a5-bc1c7b937d13.gif)

### エンディング
* 生まれた音譜達が徐々に集まって円陣となります。
* 集まった音譜達は、オープニングで吸い込まれた曲のタイトルを引っ張って飛び出します。
* オープニング時は灰色だった曲のタイトルは、生まれた音譜達の色で輝きます。
※ 後奏がない楽曲の場合はこの演出がない or 短縮版の演出となります。
![エンディング](https://user-images.githubusercontent.com/38162502/135092785-7364203e-589c-4bc3-abe5-7843cf08c752.gif)

## 機能
このアプリケーションには主に以下2つの機能があります。
* 音譜の手動生成機能
* 楽曲コントロール機能(TextAliveホスト未接続時)

### 音譜の手動生成機能
* 楽曲の再生中に画面をクリックすることで、任意の位置に音符を生み出すことができます。
* 手動で生成した音譜達も他の音譜達と同様にサビや間奏、エンディングで動き出し、演出に加わります。
* 音譜は最大で30個まで生成でき、以降は最初に追加した音譜から消えていきます。
* 手動で追加した音譜はキーボードで<code>d</code>を入力することで全て削除できます。

※ エンディング時は音譜の生成/削除ができません。  
※ 環境によっては音譜を追加しすぎると動作が重くなることがあります。
![手動追加](https://user-images.githubusercontent.com/38162502/135092544-5c6980dc-326d-41d1-ba0d-98ae74e2f164.gif)

### 楽曲コントロール機能
* 画面下の ^ ボタンを押すことでコントロールメニューが開きます。
* コントロールメニュー内の v ボタンを押すことでコントロールメニューが閉じます。
* シークバーでは再生位置の確認と、楽曲の再生位置を自由に変更することができます。
* 楽曲の再生と停止、再生する楽曲の変更が可能です。
![コントロールメニュー](https://user-images.githubusercontent.com/38162502/135110750-5a11e28d-09e6-4909-8424-02b3a9a5a0b6.jpeg)
