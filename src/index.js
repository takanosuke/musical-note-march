import { Player, Ease } from "textalive-app-api";
import Lottie from "lottie-web";
import Sans from './assets/NotoSansJP-Regular.otf';
import CorporateLogo from './assets/Corporate-Logo-Rounded.ttf';
import Pop from './assets/pop.json';
import P5 from "p5";

// 各種変数定義
const width = window.innerWidth;
const height = window.innerHeight;
const xmax = Math.floor(width / 2);
const ymax = Math.floor(height / 2);
const xmin = -1 * xmax;
const ymin = -1 * ymax;
const SONG = require('./SONG');
const defaultSong = SONG["濁茶 / 密かなる交信曲"];
let isChangingSong = false;
let isClickSeekBar = false;
let phrasePoints;
let extPoints;
let interludes;
let choruses;
let videoEndTime;
let titleCharSize;
let maxAmp;

// 画面の要素を取得
const openSettingsBtn = document.querySelector("#open-settings");
const closeSettingsBtn = document.querySelector("#close-settings");
const settings = document.querySelector("#settings");
const centerPlayBtn = document.querySelector("#center-play");
const playBtn = document.querySelectorAll(".play");
const pauseBtn = document.querySelector("#pause");
const songSelect = document.querySelector("#song-select");
const seekBar = document.querySelector("#seek-bar");
const seekBarLabel = document.querySelector("#seek-bar-label");
const artistSpan = document.querySelector("#artist");
const songSpan = document.querySelector("#song");
const changeSongBtn = document.querySelector("#change-song");

// TextAlive Player　のインスタンス作成
const player = new Player({
  app: {
    token: "xS2qwXBPVRUpwLWO",
    appAuthor: "takanosuke",
    appName: "musical-note-march",
  },
  vocalAmplitudeEnabled: true,
  mediaBannerPosition: null,
  mediaElement: document.querySelector("#media"),
  throttleInterval: 100
});

// TextAlive Player のイベントリスナを登録する
player.addListener({
  onAppReady,
  onVideoReady,
  onTimerReady,
  onThrottledTimeUpdate,
  onPlay,
  onPause,
  onStop,
});

/**
 * TextAlive App が初期化されたときに呼ばれる
 *
 * @param {IPlayerApp} app - https://developer.textalive.jp/packages/textalive-app-api/interfaces/iplayerapp.html
 */
function onAppReady(app) {
  // TextAlive ホストと接続されていなければコントロールを表示する
  if (!app.managed) {
    document.querySelector("#control").style.display = "block";
    // 再生ボタン
    playBtn.forEach((playBtn) =>
      playBtn.addEventListener("click", () => {
        if (!player.isPlaying) {
          player.video && player.requestPlay();
        }
      })
    );
    // 一時停止ボタン
    pauseBtn.addEventListener("click", () => {player.video && player.requestPause()});
    // コントロールメニューを開くボタン
    openSettingsBtn.addEventListener("click",　() => {
        if (settings.style.display == "none") {
          document.querySelector("#control").style.display = "none";
          settings.style.display = "block";
        }
      }
    );
    // コントロールメニューを閉じるボタン
    closeSettingsBtn.addEventListener("click",　() => {
        if (settings.style.display == "block") {
          document.querySelector("#control").style.display = "block";
          settings.style.display = "none";
        } 
      }
    );
    // 楽曲変更ボタン
    changeSongBtn.addEventListener("click", () => {
      isChangingSong = true;
      inactiveBtn(centerPlayBtn);
      seekBar.value = 0;
      seekBarLabel.textContent = `動画再生位置:[...]　:　再生パート:[...]`
      const song = SONG[songSelect.value]
      player.createFromSongUrl(song.songUrl, { video: song.video });
    })
    // シークバーで再生位置変更時
    seekBar.addEventListener("change", (e) => {
      player.video && player.requestMediaSeek(e.target.value);
    });
    // シークバー操作中のラベル更新
    seekBar.addEventListener("input", (e) => {
      updateSeekbarLabel(seekBar.value);
    });
    // シークバー操作中
    seekBar.addEventListener("mousedown", (e) => { isClickSeekBar = true });
    // シークバー操作終了後
    seekBar.addEventListener("mouseup", (e) => { isClickSeekBar = false });
  }
  // 曲が設定されていなければデフォルトの曲を読み込む
  if (!app.songUrl) {
    player.createFromSongUrl(defaultSong.songUrl, { video: defaultSong.video });
  }
  console.log("onAppReady");
}

/**
 * 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
 *
 * @param {IVideo} v - https://developer.textalive.jp/packages/textalive-app-api/interfaces/ivideo.html
 */
function onVideoReady(v) {
  // 演出に必要なデータを変数にセットする
  setVideoData();
  // コントロールメニューに表示するデータをセット
  seekBar.value = 0;
  seekBarLabel.textContent = `動画再生位置:[...]　:　再生パート:[...]`
  artistSpan.textContent = player.data.song.artist.name;
  songSpan.textContent = player.data.song.name;
  // シークバーの最大値を楽曲の終了時間にセット
  seekBar.setAttribute("max", videoEndTime);
  seekBar.setAttribute("value", 0);
  console.log("onVideoReady");
}

/**
 * 音源の再生準備が完了した時に呼ばれる
 *
 * @param {Timer} t - https://developer.textalive.jp/packages/textalive-app-api/interfaces/timer.html
 */
function onTimerReady(t) {
  if (!player.app.managed) {
    // ボタンを有効化する
    document.querySelectorAll("button").forEach((btn) => (btn.disabled = false));
    // 再生ボタンを表示
    activeBtn(centerPlayBtn);
  }
  isChangingSong = false;
  console.log("onTimerReady");
}

/**
 * 動画の再生位置が変更されたときに呼ばれる（あまりに頻繁な発火を防ぐため一定間隔に間引かれる）
 *
 * @param {number} position - https://developer.textalive.jp/packages/textalive-app-api/interfaces/playereventlistener.html#onthrottledtimeupdate
 */
function onThrottledTimeUpdate(position) {
  // シークバーの再生位置を更新する。スライダーを操作中は更新をしない。
  if (player.isPlaying　&& !isClickSeekBar && !player.app.managed) {
    seekBar.value = Math.floor(position);
    updateSeekbarLabel(seekBar.value);
  }
}

/**
 * 再生が始まったときに呼ばれる
 */
function onPlay() {
  if (!player.app.managed) {
    inactiveBtn(centerPlayBtn);
  }
  console.log("onPlay");
}

/**
 * 再生が一時停止されたときに呼ばれる
 */
function onPause() {
  if (!player.app.managed && !isChangingSong) {
    activeBtn(centerPlayBtn);
  }
    console.log("onPause");
}

/**
 * 再生が停止されたときに呼ばれる
 */
function onStop() {
  if (!player.app.managed && !isChangingSong) {
    activeBtn(centerPlayBtn);
  }
  console.log("onStop");
}

// p5.js を初期化
new P5((p5) => {
  // 演出用の変数を定義
  const charMargin = 5;
  const lottiePopContainer = document.querySelector("#lottie-pop");
  let currentBeatPosi = -1;
  let bgColor = [255, 255, 255, 255];
  let sansFont;
  let logoFont;
  let lottiePopAnimation;
  let isOpening = false;
  let isEnding = false;

  p5.preload = () => {
    // フォントの読み込み
    sansFont = p5.loadFont(Sans);
    logoFont = p5.loadFont(CorporateLogo);
  }

  p5.setup = () => {
    // キャンバスの作成と基本設定
    p5.createCanvas(width, height, p5.WEBGL);
    p5.frameRate(60);
    p5.background(bgColor);
    p5.noStroke();
    p5.textFont(logoFont);
    p5.angleMode(p5.DEGREES);
    p5.textAlign(p5.CENTER, p5.CENTER);
    // 音譜手動追加時のアニメーションを定義
    lottiePopAnimation = Lottie.loadAnimation({
      container: lottiePopContainer,
      loop: false,
      autoplay: false,
      animationData: Pop,
      renderer: "svg",
      rendererSettings: {
        id: 'pop'
      },
    })
    lottiePopAnimation.goToAndStop(0);
    lottiePopAnimation.setSpeed(1);
    lottiePopAnimation.goToAndStop(0);
    lottiePopAnimation.onComplete = () => {
      lottiePopAnimation.goToAndStop(0);
    }
  };

  p5.draw = () => {
    // ----------------------------------------------------
    // 動画読込中パート
    // ----------------------------------------------------
    if (!player || player.isLoading) {
      p5.background(bgColor);
      p5.textSize(50);
      p5.fill(0);
      const loadingText = "Loading"
      p5.text(loadingText, 0, 0);
      let w = p5.textWidth(loadingText) / 2 + 10;
      for (let i = 0; i < (p5.frameCount / 10) % 5; i++){
        p5.text(".", w, 0);
        w += p5.textWidth(".");
      }
      p5.text(".")
      return;
    }
    // ----------------------------------------------------
    // 情報取得&定義パート
    // ----------------------------------------------------
    const position = player.timer.position;
    // 一時停止後に再生すると一瞬ありえないposition値を取得してしまう事象を防止
    if (position >= videoEndTime) return;
    const beat = player.findBeat(position);
    const chorus = findChorus(position);
    const interlude = findInterlude(position);
    const cord = player.findChord(position);
    const amp = player.getVocalAmplitude(position);
    const phrase = player.video.findPhrase(position);
    const firstPhraseStart = player.video.firstPhrase.startTime;
    // オープニング及びエンデイングの判定
    isOpening = interlude && interlude.name == "前奏" && (position < firstPhraseStart);
    isEnding = interlude && interlude.name == "後奏" && (position > videoEndTime - 15000);
    // 現在のフレーズの位置を取得（音譜を表示する個数にも利用）
    let phraseIndex = player.video.findIndex(player.video.findPhrase(position, { loose: true }));
    if (phraseIndex < 0) phraseIndex = phrasePoints.length;
    // フレーズサイズの設定（サビならサイズする拡大）
    let charSize = p5.map(amp, 0, maxAmp, width * 1/40, width * 3/40);
    let baseCharSize = width * 7/200;
    if (chorus)　charSize += width * 1/100;

    // 音譜の設定
    let pointSize;
    // 画面上に表示する音譜のリスト。フレーズから生まれた音符と、手動追加した音譜を結合する。
    let points = (phrasePoints.slice(0, phraseIndex)).concat(extPoints);
    // 現在のフレーズの音譜
    const currentPoint = phrasePoints[phraseIndex];
    // ビートが変わるタイミングで実行する
    if (beat && beat.position != currentBeatPosi) {
      currentBeatPosi = beat.position;
      // 各音譜の移動ベクトルを更新
      for (let i = 0; i < points.length; i++) {
        points[i].vx = 1 + (points[i].type / 3);
        points[i].vy = randInt(-1, 1);
      }
    }

    // ----------------------------------------------------
    // 背景描画パート
    // ----------------------------------------------------
    // オープニング、サビ、エンディングの背景色は白に設定
    bgColor = [255, 255, 255, 255];
    if (!(isEnding || isOpening || chorus) && currentPoint) {
      // それ以外の時はフレーズの色の補色になるように背景色を設定
      const maxColor = Math.max(currentPoint.color[0], currentPoint.color[1], currentPoint.color[2])
      const minColor = Math.min(currentPoint.color[0], currentPoint.color[1], currentPoint.color[2]);
      const addMaxMin = maxColor + minColor;
      bgColor = [addMaxMin - currentPoint.color[0], addMaxMin - currentPoint.color[1], addMaxMin - currentPoint.color[2], 30];
    }
    p5.background(bgColor);

    // ----------------------------------------------------
    // 前奏演出パート
    // ----------------------------------------------------
    if (isOpening && (position > firstPhraseStart - 15000)) {
      p5.push();
      const openingProgress = Math.min(1, p5.map(position, firstPhraseStart - 15000, firstPhraseStart, 0, 1));
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textFont(logoFont);
      p5.fill(phrasePoints[0].color);
      p5.fill([100, 100, 100, 250]);
      // テキストサイズはオープニングが進むにつれて小さくする
      p5.textSize(Ease.quintOut(1 - openingProgress) * titleCharSize);
      p5.text(player.data.song.name, 0, 0);
      p5.pop();
    }

    // ----------------------------------------------------
    // サビ演出（楽譜の描画）パート
    // ----------------------------------------------------
    if (chorus) {
      p5.push();
      p5.fill(0, 255);
      p5.stroke(0);
      p5.strokeWeight(5);
      // 五線譜の描画
      p5.line(xmin, height * -1/5, -1, xmax, height * -1/5, -1);
      p5.line(xmin, height * -1/10, -1, xmax, height * -1/10, -1);
      p5.line(xmin, 0, -1, xmax, 0, -1);
      p5.line(xmin, height * 1/10, -1, xmax, height * 1/10, -1);
      p5.line(xmin, height * 1/5, -1, xmax, height * 1/5, -1);
      // リピート記号の描画
      p5.line(xmin + width * 3/20, height * -1/5, -1, xmin + width * 3/20, height * -1/5, -1);
      p5.line(xmax - width * 1/25, height * -1/5, -1, xmax - width * 1/25, height * 1/5, -1);
      p5.strokeWeight(15);
      p5.line(xmax - width * 1/40, height * -1/5, -1, xmax - width * 1/40, height * 1/5, -1);
      p5.noStroke();
      p5.circle(xmax - width * 3/50, height * -1/20, width * 3/200);
      p5.circle(xmax - width * 3/50, height * 1/20, width * 3/200);
      // 曲名/アーティスト名の描画
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(width * 1/35);
      p5.text(player.data.song.name, 0, height * -2/5);
      p5.textSize(width * 1/70);
      p5.text(player.data.song.artist.name, 0, height * -34/100);
      // 楽譜上にコード進行を描画
      if (cord) {
        p5.textAlign(p5.CENTER, p5.BUTTOM);
        p5.textSize(width * 1/80);
        // 現在のコードを中央に表示
        p5.text(cord.name, 0, height * -11 / 50);
        p5.textSize(width * 1/100);
        // 前のコード進行があれば表示
        const prevCord = cord.previous;
        if (prevCord) {
          p5.text(prevCord.name, width * -3/20, height * -11/50);
          const prevCord2 = cord.previous.previous;
          if (prevCord2) {
            p5.text(prevCord2.name, width * -3/10, height * -11/50);
            const prevCord3 = cord.previous.previous.previous;
            if (prevCord3) p5.text(prevCord3.name, width * -9/20, height * -11/50);
          }
        }
        // 次のコード進行があれば表示
        const nextCord = cord.next;
        if (nextCord) {
          p5.text(nextCord.name, width * 3/20, height * -11/50);
          const nextCord2 = cord.next.next;
          if (nextCord2) {
            p5.text(nextCord2.name, width * 3/10, height * -11/50);
            const nextCord3 = cord.next.next.next;
            if (nextCord3) p5.text(nextCord3.name, width * 9/20, height * -11/50);
          }
        }
      }
      p5.pop()
      // 行進の演出のために音譜の座標ををアップデートする
      if (!isEnding && player.isPlaying && beat) points = updatePoints(position, points, beat);
    }

    // ----------------------------------------------------
    // 音譜描画パート
    // ----------------------------------------------------
    // エンディング以外の音譜描画
    if (!isEnding) {
      points.forEach((point, i) => {
        p5.push();
        p5.fill(point.color);
        p5.translate(point.x, point.y);
        pointSize = point.size;
        // 間奏時はビートに合わせて音譜を震わせる（音譜の種類によって動きの幅を変える）
        if (interlude && beat) {
          pointSize = point.size + Ease.quintIn(beat.progress(position)) * point.size;
          const angle = p5.map(Ease.elasticOut(beat.progress(position)), 0, 1, -5 - point.type * 2, 5 + point.type * 2);
          p5.rotate(angle);
        }
        // サビ演出時はビートに合わせて音譜を傾ける（音譜の種類によって動きの幅を変える）
        else if (chorus && beat) {
          const angle = p5.map(Ease.quintInOut(beat.progress(position)), 0, 1, -5 - point.type * 2, 5 + point.type * 2);
          p5.rotate(angle);
        }
        p5.textFont(sansFont);
        p5.textSize(pointSize);
        p5.text(point.note, 0, 0);
        p5.pop();
      });
    }
    // エンディング時の音譜描画
    else{
      // 3段階のエンディングを管理するために3つの時間管理変数を用意
      const ending1Progress = Math.min(1, p5.map(videoEndTime - position, 15000, 12000, 0, 1));
      const ending2Progress = Math.min(1, p5.map(videoEndTime - position, 12000, 5000, 0, 1));
      const ending3Progress = Math.min(1, p5.map(videoEndTime - position, 5000, 0, 0, 1));
      // エンディングの流れ
      //   1. 音譜が円陣になるように整列
      //   2. 音譜の円陣を徐々に中央に収束
      //   3. 音譜の円陣を広げて&曲のタイトル囲うように回る
      if (ending3Progress < 1) {
        points.forEach((point, i) => {
          let x, y, r;
          p5.push();
          if (ending1Progress < 1) {
            r = height * 3/10;
            x = p5.cos((position / 30 + (i * 360 / points.length))) * r;
            y = p5.sin((position / 30 + (i * 360 / points.length))) * r;
            pointSize = point.size;
          // ending1Progressが進む(1に近づく)毎に徐々に円陣へと変わっていく
            p5.translate(point.x - (point.x - x) * ending1Progress, point.y - (point.y - y) * ending1Progress);
          }
          else if (ending2Progress < 1) {
            // 円の半径を徐々に狭めていく
            r = (height * 3/10) - ending2Progress * (height * 1/4);
            x = p5.cos((position / 30 + (i * 360 / points.length))) * r;
            y = p5.sin((position / 30 + (i * 360 / points.length))) * r;
            pointSize = point.size;
            p5.translate(x, y);
          }
          else {
            // ポイントのサイズを大きくする
            pointSize = point.size + Ease.quintOut(ending3Progress) * (height * 1 / 12);
            // 画面の比率に合わせた楕円上の大きな円の座標計算
            r = (height * 1/20) + Ease.quintOut(ending3Progress) * (Math.min((width - pointSize) / 2, (height - pointSize) / 2) - (height * 1/20));
            x = p5.cos((position / 30 + (i * 360 / points.length))) * r * 1.05;
            y = p5.sin((position / 30 + (i * 360 / points.length))) * r - (pointSize / 6);
            if (width > height) x *= width / height;
            else y *= height / width;
            p5.translate(x * Ease.quintOut(ending3Progress), y * Ease.quintOut(ending3Progress));
          }
          p5.fill(point.color);
          p5.textFont(sansFont);
          p5.textSize(pointSize);
          p5.text(point.note, 0, 0);
          p5.pop();
        });        
      }
      // 3段階目のエンディングが始まったら中央から曲名を飛び出させる
      if (ending3Progress>0) {
        p5.textAlign(p5.CENTER, p5.CENTER);
        // 終了までに全ての音譜の色をタイトルに付ける
        const colorIndex = Math.floor((5000 - (videoEndTime - position)) / ((5000 / points.length)));
        p5.fill(points[colorIndex].color);
        p5.textSize(Ease.quintOut(ending3Progress) * titleCharSize);
        p5.text(player.data.song.name, 0, 0)
      }
    }

    // ----------------------------------------------------
    // フレーズ描画パート
    // ----------------------------------------------------
    if (phrase && phrase.endTime >= position) {
      // サビの時は画面下にフレーズを固定
      if (chorus) {
        currentPoint.x = Math.max(xmin, - phrase.charCount * (baseCharSize + charMargin) / 2);
        currentPoint.y = height * 3/10;
        currentPoint.color[3] = 255;
      }
      p5.push();
      p5.translate(currentPoint.x, currentPoint.y);
      // 最初の1文字目はフレーズではなく音譜を表示する。音譜はビートに合わせて震わせる
      if (beat) {
        pointSize = (width * 8/200) + Ease.quintIn(beat.progress(position)) * (width * 8/200);
        const angle = p5.map(Ease.elasticOut(beat.progress(position)), 0, 1, -5 - currentPoint.type * 2, 5 + currentPoint.type * 2);
        p5.rotate(angle);
      }
      p5.fill(currentPoint.color);
      p5.textFont(sansFont);
      p5.textSize(pointSize);
      p5.text(currentPoint.note, 0, 0);
      p5.pop();
      // フレーズ開始位置の定義
      const startX = currentPoint.x + baseCharSize + charMargin;
      let x = startX;
      let y = currentPoint.y;

      // フレーズを1文字ずつ描画
      let char = phrase.firstChar;
      while (char) {
        // フレーズの発声が始まっていれば
        if (char.startTime <= position) {
          p5.textSize(baseCharSize);
          // 発生中のフレーズは声量に合わせてサイズを変化させる
          if (char.endTime >= position) p5.textSize(charSize);
          // フレーズの影の描画
          p5.fill(10, 128);
          p5.text(char.text, x + 3, y + 3);
          // フレーズの描画
          p5.fill(currentPoint.color);
          p5.text(char.text, x, y);
        }
        // 表示位置の更新
        x += baseCharSize + charMargin;
        // 文字がはみ出たときは1段下げて表示
        if (x + p5.textWidth(char.text) + charMargin > xmax) {
          x = startX;
          y += baseCharSize + charMargin;
        }
        char = char.next;
      }
    }
  }
  // 画面クリック時
  p5.mouseClicked = () => {
    // 再生中かつ、エンディング以外の時のみ有効
    if (player && player.isPlaying && !player.isLoading && !isEnding) {
      // コントロールメニュー上はクリックしても反応しないようにする
      const ignoreArea = Math.max(openSettingsBtn.offsetHeight, settings.offsetHeight)
      if (p5.mouseY < height - ignoreArea) {
        const ml = p5.mouseX - width / 4;
        const mt = p5.mouseY - height / 4;
        const x = p5.mouseX - width / 2;
        const y = p5.mouseY - height / 2;
        const popElement = document.querySelector("#pop");
        popElement.style.marginLeft = ml;
        popElement.style.marginTop = mt;
        // クリックした位置にアニメーションを再生
        lottiePopAnimation.goToAndPlay(500);
        // クリックした座標に音譜を追加する
        extPoints.push(createPointObj(x, y));
        // 手動追加した音譜が15個より多いなら、追加順に削除する
        if (extPoints.length > 15) extPoints.shift();
      }
    }
  }
  // キーボード押下時
  p5.keyTyped = () => {
    // エンディング以外で、押されたキーがdなら手動追加した音譜を全て削除
    if (!isEnding && p5.key == "d") {
      extPoints = [];
    }
  }
});

/**
 * 指定した範囲のランダムな整数を返す
 *
 * @param {number} min - 最小値
 * @param {number} max - 最大値
*/
const randInt = (min, max) => {return Math.floor(Math.random() * (max + 1 - min) + min);}

/**
 * 演出に必要なデータを取得し変数にセットする
*/
const setVideoData = () => {
  // 演出に必要なデータを取得・定義
  const video = player.video
  videoEndTime = video.duration;
  phrasePoints = getPhrasePoints(video.phraseCount);
  extPoints = [];
  interludes = getInterludes(video.phrases, videoEndTime);
  choruses = player.getChoruses();
  maxAmp = player.getMaxVocalAmplitude();
  // オープニングとエンディングで表示する曲名のサイズを定義
  titleCharSize = (width * 0.8) / player.data.song.name.split("").length
}

/**
 * 引数で受け取った座標で音譜オブジェクトを生成する。
 *
 * @param {number} x - オブジェクトのx座標
 * @param {number} y - オブジェクトのy座標
*/
const createPointObj = (x, y) => {
  const noteList = ["♩", "♪", "♫", "♬", "♭", "♯", "♮"];
  const color = [randInt(0, 255), randInt(0, 255), randInt(0, 255), randInt(200, 255)];
  const size = randInt(width * 1/30, width * 3/50);
  const type = randInt(0, noteList.length - 1);
  const note = noteList[type];
  return { "type": type, "note": note, "x": x, "y": y, "color": color, "size": size, "vx": 0, "vy": 0 };
}

/**
 * フレーズの数だけ音譜オブジェクトのリストを作成する
 *
 * @param {number} num - フレーズの数(生成する音譜オブジェクトの数)
*/
const getPhrasePoints = (num) => {
  let result = [];
  let prevX = 0;
  let prevY = 0;
  let isIgnoreArea = false;
  let isIgnoreArea2 = false;
  let isCloseDistance = false;
  let x, y;
  for (let i = 0; i < num; i++){
    // フレーズが見切れるような隅のエリアや、1つ前の要素と距離が近いところは避けてランダムな位置を生成する
    do {
      x = randInt(xmin + width * 1 / 40, xmax - width * 3 / 20);
      y = randInt(ymin + height * 1 / 15, ymax - height * 1 / 10);
      isIgnoreArea = (x > (xmax - width * 1 / 3) && y > (ymax - height * 2 / 5));
      isIgnoreArea2 = (x > (xmax - width * 1 / 2) && y < (ymin + height * 1 / 5));
      isCloseDistance = Math.sqrt(Math.pow(prevX - x, 2) + Math.pow(prevY - y, 2)) < width * 1 / 10;
    } while (isIgnoreArea || isIgnoreArea2 || isCloseDistance);
    result.push(createPointObj(x, y));
  }
  // 1フレーズ目は中央に固定で配置する
  result[0].x = 0;
  result[0].y = 0;
  return result
}

/**
 * 音譜の座標をビートに合わせて更新する
 *
 * @param {number} position - 再生位置
 * @param points - 音譜のリスト
 * @param beat - ビート情報
*/
const updatePoints = (position, points, beat) => {
  for (let i = 0; i < points.length; i++) {
    // 音譜のx座標を、音譜のベクトルとビートをもとに更新する
    points[i].x = points[i].x + (Ease.quintIn(beat.progress(position))) * width/400 * points[i].vx;
    // 音譜のx座標が右端に到達したら左端に戻す
    if (points[i].x > xmax) { points[i].x = xmin; }
    // 音譜のy座標を、音譜のベクトルとビートをもとに更新する
    points[i].y = points[i].y + Ease.quintIn(beat.progress(position)) * height / 50 * points[i].vy
    // 音譜がy座標が表示範囲から外れそうになったら進行方向のベクトルを変更する
    if (points[i].y > ymax - points[i].size) { points[i].vy = -1; }
    if (points[i].y < ymin + points[i].size/2) { points[i].vy = 1; }
  }
  return points;
}

/**
 * 楽曲の前奏、間奏、後奏をフレーズの発声タイミングから取得する
 *
 * @param phrases - 楽曲の全フレーズ
 * @param {number} videoEndTime - 楽曲の終了時間
 * @param {number} interludeTime - フレーズの間がこの値以上空いていたら間奏と判定する
*/
const getInterludes = (phrases, videoEndTime, interludeTime = 3000) => {
  let result = [];
  // 楽曲開始から1フレーズ目の開始時間までがinterludeTimeより空いていれば前奏とする
  if (phrases[0].startTime > interludeTime) {
    result.push({ "startTime": 0, "endTime": phrases[0].startTime - 1, "name":  "前奏"});
  }
  // 前のフレーズとの間がinterludeTimeより空いていたら間奏とする
  let index = 0;
  for (let i = 0; i < phrases.length - 1; i++){
    if (phrases[i + 1].startTime - phrases[i].endTime > interludeTime) {
      result.push({ "startTime": phrases[i].endTime + 1, "endTime": phrases[i + 1].startTime - 1, "name": `間奏${index + 1}` });
      index++;
    }
  }
  // 最後のフレーズの終了時間から楽曲の終了時間までがinterludeTimeより空いていれば後奏とする
  if (videoEndTime - phrases.slice(-1)[0].endTime > interludeTime) {
    result.push({ "startTime": phrases.slice(-1)[0].endTime + 1, "endTime": videoEndTime, "name": "後奏"});
  }
  return result;
}

/**
 * 指定された位置の間奏情報を取得する
 *
 * @param {number} position - 再生位置
*/
const findInterlude = (position) => {
  for (let i = 0; i < interludes.length; i++) {
    if (position >= interludes[i].startTime && position <= interludes[i].endTime) {
      return interludes[i];
    }
  }
}

/**
 * 指定された位置のサビ情報を取得する
 * (Text Alive API上にも同様のメソッドはあるが頻繁に呼ばれるため、ネットワーク負荷軽減のためにローカルで実装)
 *
 * @param {number} position - 再生位置
*/
const findChorus = (position) => {
  for (let i = 0; i < choruses.length; i++) {
    if (position >= choruses[i].startTime && position <= choruses[i].endTime) {
      return choruses[i];
    }
  }
}

/**
 * シークバーのラベルを指定された位置の情報で更新
 *
 * @param {number} position - 再生位置
*/
const updateSeekbarLabel = (position) => {
  // 再生位置が、前奏、間奏、サビ、後奏のどのパートに属するかを判定する。
  // どれにも属さなければメロディとする
  let partName = "メロディ"
  const interlude = findInterlude(position);
  const chorus = findChorus(position);
  partName = interlude ? interlude.name : partName;
  partName = chorus ? `サビ${chorus.index + 1}` : partName;
  // シークバーのラベルを更新
  seekBarLabel.textContent = `動画再生位置:[${position}]　：　再生パート:[${partName}]`
}

/**
 * 引数で受け取ったボタンをアクティブにする
 *
 * @param btn - ボタン要素
*/
const activeBtn = (btn) => {
  btn.classList.remove("inactive");
  btn.classList.add("active");
  btn.disabled = false;
}

/**
 * 引数で受け取ったボタンをインアクティブにする
 *
 * @param btn - ボタン要素
*/
const inactiveBtn = (btn) => {
  btn.classList.remove("active");
  btn.classList.add("inactive");
  btn.disabled = true;  
}
