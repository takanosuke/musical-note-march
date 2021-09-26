import { Player, Ease } from "textalive-app-api";
import Sans from './assets/NotoSansJP-Regular.otf';
import CorporateLogo from './assets/Corporate-Logo-Rounded.ttf';
import P5 from "p5";

const SONG = require('./SONG');
const width = window.innerWidth;
const height = window.innerHeight;
const xmax = Math.floor(width / 2);
const ymax = Math.floor(height / 2);
const xmin = -1 * xmax;
const ymin = -1 * ymax;
let isChangingSong = false;
let isClickSeekBar = false;
let phrasePoints;
let extPoints;
let interludes;
let choruses;
let videoEndTime;
let maxAmp;
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
const defaultSong = SONG["濁茶 / 密かなる交信曲"];
const player = new Player({
  app: {
    appAuthor: "takanosuke",
    appName: "magicalmirai2021-procon",
  },
  valenceArousalEnabled: true,
  vocalAmplitudeEnabled: true,
  mediaBannerPosition: "nil",
  mediaElement: document.querySelector("#media"),
  throttleInterval: 1000
});

// TextAlive Player のイベントリスナを登録する
player.addListener({
  onAppReady,
  onVideoReady,
  onTimerReady,
  onThrottledTimeUpdate,
  onAppMediaChange,
  onPlay,
  onPause,
  onStop,
  onSeek,
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

    // 詳細設定を開くボタン
    openSettingsBtn.addEventListener(
      "click",
      () => {
        if (settings.style.display == "none") {
          document.querySelector("#control").style.display = "none";
          settings.style.display = "block";
        }
      }
    );
    // 詳細設定を閉じるボタン
    closeSettingsBtn.addEventListener(
      "click",
      () => {
        if (settings.style.display == "block") {
          document.querySelector("#control").style.display = "block";
          settings.style.display = "none";
        } 
      }
    );
    changeSongBtn.addEventListener("click", () => {
      isChangingSong = true;
      inactiveBtn(centerPlayBtn);
      const song = SONG[songSelect.value]
      player.createFromSongUrl(song.songUrl, { video: song.video });
    })
  }
  if (!app.songUrl) {
    player.createFromSongUrl(defaultSong.songUrl, { video: defaultSong.video });
  }
  console.log("player.onAppReady");
}

/**
 * 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
 *
 * @param {IVideo} v - https://developer.textalive.jp/packages/textalive-app-api/interfaces/ivideo.html
 */
function onVideoReady(v) {
  // メタデータを表示する
  seekBar.value = 0;
  seekBarLabel.textContent = `動画再生位置:[...]　:　再生パート:[...]`
  artistSpan.textContent = player.data.song.artist.name;
  songSpan.textContent = player.data.song.name;
  setVideoData();
  seekBar.setAttribute("max", videoEndTime);
  seekBar.setAttribute("value", 0);
  seekBar.addEventListener("change", (e) => {
    player.video && player.requestMediaSeek(e.target.value);
  });
  seekBar.addEventListener("input", (e) => {
    updateSeekbarLabel(seekBar.value);
  });
  seekBar.addEventListener("mousedown", (e) => { isClickSeekBar = true });
  seekBar.addEventListener("mouseup", (e) => {isClickSeekBar = false});
  console.log("player.onVideoReady");
}

/**
 * 音源の再生準備が完了した時に呼ばれる
 *
 * @param {Timer} t - https://developer.textalive.jp/packages/textalive-app-api/interfaces/timer.html
 */
function onTimerReady(t) {
  // ボタンを有効化する
  if (!player.app.managed) {
    document
      .querySelectorAll("button")
      .forEach((btn) => (btn.disabled = false));
    activeBtn(centerPlayBtn);
  }

  isChangingSong = false;
  console.log("player.onTimerReady");
}

/**
 * 動画の再生位置が変更されたときに呼ばれる（あまりに頻繁な発火を防ぐため一定間隔に間引かれる）
 *
 * @param {number} position - https://developer.textalive.jp/packages/textalive-app-api/interfaces/playereventlistener.html#onthrottledtimeupdate
 */
function onThrottledTimeUpdate(position) {
  // スライダー上の再生位置を更新する。スライダーをクリック中は更新をしない。
  if (!isClickSeekBar) {
    seekBar.value = Math.floor(position);
    updateSeekbarLabel(seekBar.value);
  }
}
/**
 * TextAlive アプリの再生すべき楽曲URLが変更されたときに呼ばれる
 * 
 * @param songUrl — 楽曲URL / Song URL
 * @param videoPromise — 動画オブジェクトと Timer の準備が整ったときに解決される Promise オブジェクト / A promise to resolve after the video object and Timer gets ready
 */
function onAppMediaChange(songUrl, videoPromise) {
  console.log("player.onAppMediaChange");

}

function onPlay() {
  if (!player.app.managed) {
    inactiveBtn(centerPlayBtn);
  }
  console.log("player.onPlay");
}

function onPause() {
  if (!player.app.managed && !isChangingSong) {
    activeBtn(centerPlayBtn);
  }
    console.log("player.onPause");
}

function onSeek() {
  console.log("player.onSeek");
}

function onStop() {
  if (!player.app.managed && !isChangingSong) {
    activeBtn(centerPlayBtn);
  }
  console.log("player.onStop");
}

// p5.js を初期化
new P5((p5) => {
  // キャンバスの大きさなどを計算
  const charMargin = 5;
  let currentBeatPosi = -1;
  let bgColor = [255, 255, 255, 255];
  let font;
  let logoFont;

  p5.preload = () => {
    font = p5.loadFont(Sans);
    logoFont = p5.loadFont(CorporateLogo);
  }
  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height, p5.WEBGL);
    p5.frameRate(60);
    p5.background(bgColor);
    p5.noStroke(); // 図形の輪郭線を消す
    p5.textFont(logoFont);
    p5.angleMode(p5.DEGREES);
    p5.textAlign(p5.CENTER, p5.CENTER);
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
    // 一時停止後に再生すると一瞬ありえないposition値を取得してしまうため防止
    if (position >= videoEndTime) return;

    const beat = player.findBeat(position);
    const chorus = findChorus(position);
    const interlude = findInterlude(position);
    const cord = player.findChord(position);
    const amp = player.getVocalAmplitude(position);
    const phrase = player.video.findPhrase(position);
    const firstPhraseStart = player.video.firstPhrase.startTime
    const isOpening = interlude && interlude.name == "前奏" && (position > firstPhraseStart - 15000) && (position < firstPhraseStart);
    const isEnding = interlude && interlude.name == "後奏" && (position > videoEndTime - 15000);
    let phraseIndex = player.video.findIndex(player.video.findPhrase(position, { loose: true }));
    if (phraseIndex < 0) phraseIndex = phrasePoints.length - 1;

    // 歌詞サイズの設定（サビならサイズ拡大）
    let charSize = p5.map(amp, 0, maxAmp, 50, 150);
    let baseCharSize = 70;
    if (chorus)　charSize = charSize + 20;
    // 音譜の設定
    let pointSize;
    let points = (phrasePoints.slice(0, phraseIndex)).concat(extPoints);
    const currentPoint = phrasePoints[phraseIndex];
    // ビート変更時の処理
    if (beat && beat.position != currentBeatPosi) {
      currentBeatPosi = beat.position;
      for (let i = 0; i < points.length; i++) {
        points[i].vx = 1 + (points[i].type / 3);
        points[i].vy = randInt(-1, 1);
      }
    }

    // ----------------------------------------------------
    // 背景描画パート
    // ----------------------------------------------------
    if (!isEnding) {
      let mv = player.getMedianValenceArousal().v;
      let kv = 700;
      let v = Math.max(0, Math.min(100, mv * kv));
      let vv = Math.max(60, Math.min(90, mv * kv));
      p5.push();
      p5.colorMode(p5.HSL);
      p5.background([30, v, vv, 1]);
      p5.pop();
    }
    // サビの背景は白色
    if (chorus || isEnding) p5.background(255,255,255,1);

    // ----------------------------------------------------
    // 前奏演出パート
    // ----------------------------------------------------
    if (isOpening) {
      p5.push();
      const openingProgress = Math.min(1, p5.map(position, firstPhraseStart - 15000, firstPhraseStart, 0, 1));
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textFont(logoFont);
      // p5.translate(x, y);
      // if (beat) {
      //   const angle = p5.map(Ease.elasticOut(beat.progress(position)), 0, 1, -5 - point.type * 2, 5 + point.type * 2);
      //   p5.rotate(angle);
      // }
      p5.fill(phrasePoints[0].color);
      p5.textSize(Ease.quintOut(1 - openingProgress) * 200);
      p5.text(player.data.song.name, 0, 0);
      p5.pop();
    }

    // ----------------------------------------------------
    // サビ演出（楽譜の描画）パート
    // ----------------------------------------------------
    if (chorus) {
      p5.push()
      p5.fill(0, 255);
      p5.stroke(0);
      p5.strokeWeight(5);
      // 五線譜の描画
      p5.line(xmin, -200, -1, xmax, -200, -1);
      p5.line(xmin, -100, -1, xmax, -100, -1);
      p5.line(xmin, 0, -1, xmax, 0, -1);
      p5.line(xmin, 100, -1, xmax, 100, -1);
      p5.line(xmin, 200, -1, xmax, 200, -1);
      p5.line(xmin + 300, -200, -1, xmin + 300, 200, -1);
      // リピート記号の描画
      p5.line(xmax - 80, -200, -1, xmax - 80, 200, -1);
      p5.strokeWeight(15);
      p5.line(xmax - 50, -200, -1, xmax - 50, 200, -1);
      p5.noStroke();
      p5.circle(xmax - 120, -50, 30);
      p5.circle(xmax - 120, 50, 30);
      // 曲名/歌詞名の描画
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(50);
      p5.text(player.data.song.name, 0, -400)
      p5.textSize(25);
      p5.text(player.data.song.artist.name, 0, -340)
      p5.textSize(20);
      // 楽譜上にコード進行を描画
      if (cord) {
        p5.push();
        // p5.textSize(Ease.quintIn(cord.progress(position)) * 15 + 20);
        p5.text(cord.name, 0, -220)
        p5.pop();
        const prevCord = cord.previous;
        if (prevCord) {
          p5.text(prevCord.name, -300, -220);
          const prevCord2 = cord.previous.previous
          if (prevCord2) {
            p5.text(prevCord2.name, -600, -220);
            const prevCord3 = cord.previous.previous.previous
            if (prevCord3) p5.text(prevCord3.name, -900, -220);
          }
        }
        const nextCord = cord.next;
        if (nextCord) {
          p5.text(nextCord.name, 300, -220);
          const nextCord2 = cord.next.next
          if (nextCord2) {
            p5.text(nextCord2.name, 600, -220);
            const nextCord3 = cord.next.next.next
            if (nextCord3) p5.text(nextCord3.name, 900, -220);
          }
        }
      }
      p5.pop()
      // 行進演出のために音譜の座標をアップデート
      if (!isEnding && player.isPlaying && beat) points = updatePoints(position, points, beat);
    }

    // ----------------------------------------------------
    // 音譜描画パート
    // ----------------------------------------------------
    // 通常時の音譜描画(エンディングではない時)
    if (!isEnding) {
      // 音譜の描画
      points.forEach((point, i) => {
        p5.push();
        p5.fill(point.color);
        p5.translate(point.x, point.y);
        pointSize = point.size;
        // 間奏時はビートに合わせて音譜を震わせる
        if (interlude && beat) {
          pointSize = point.size + Ease.quintIn(beat.progress(position)) * point.size;
          const angle = p5.map(Ease.elasticOut(beat.progress(position)), 0, 1, -5 - point.type * 2, 5 + point.type * 2);
          p5.rotate(angle);
        }
        // サビ演出時は音譜が行進するようにビートに合わせて音譜を傾ける
        else if (chorus && beat) {
          const angle = p5.map(Ease.quintInOut(beat.progress(position)), 0, 1, -5 - point.type * 2, 5 + point.type * 2);
          p5.rotate(angle);
        }
        p5.textFont(font);
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
      //   3. 音譜の円陣を発散&曲のタイトルが飛び出す
      if (ending3Progress < 1) {
        points.forEach((point, i) => {
          let r;
          if (ending1Progress < 1) {
            r = 300;
            pointSize = point.size;
          }
          else if (ending2Progress < 1) {
            r = 300 - ending2Progress * 250;
            pointSize = point.size;
          }
          else {
            r = 50 + Ease.quintOut(ending3Progress) * 1500;
            pointSize = point.size + Ease.quintOut(ending3Progress) * 250;
          }
          const x = p5.cos((position / 30 + (i * 360 / points.length))) * r;
          const y = p5.sin((position / 30 + (i * 360 / points.length))) * r;
          p5.push();
          p5.fill(point.color);
          // ending1Progressが進む(1に近づく)毎に徐々に円陣へと変わっていく
          p5.translate(point.x - (point.x - x) * ending1Progress, point.y - (point.y - y) * ending1Progress);
          p5.textFont(font);
          p5.textSize(pointSize);
          p5.text(point.note, 0, 0);
          p5.pop();
        });        
      }
      // 3段階目のエンディングが始まったら中央から曲名を飛び出させる
      if (ending3Progress>0) {
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.fill(point.color);
        p5.textSize(Ease.quintOut(ending3Progress) * 200);
        p5.text(player.data.song.name, 0, 0)
      }
    }

    // ----------------------------------------------------
    // 歌詞描画パート
    // ----------------------------------------------------
    if (phrase && phrase.endTime >= position) {
      // 歌詞を表示する位置の定義。サビの時は固定。サビ以外の時は事前に準備したランダムな座標。
      if (chorus) {
        currentPoint.x = -font.textBounds(phrase.text, 0, 0, baseCharSize).w / 2;
        currentPoint.y = 300;
        currentPoint.color[3] = 255;
      }
      let x = currentPoint.x;
      let y = currentPoint.y;
      p5.push();
      p5.translate(x, y);

      // 最初の1文字目は歌詞ではなく音譜を表示する。音譜はビートに合わせて震わせる
      if (beat) {
        pointSize = 70 + Ease.quintIn(beat.progress(position)) * 70;
        const angle = p5.map(Ease.elasticOut(beat.progress(position)), 0, 1, -5 - currentPoint.type * 2, 5 + currentPoint.type * 2);
        p5.rotate(angle);
      }
      p5.fill(currentPoint.color);
      p5.textFont(font);
      p5.textSize(pointSize);
      p5.text(currentPoint.note, 0, 0);
      p5.pop();
      x += baseCharSize + charMargin;

      // 歌詞を1文字ずつ描画
      let char = phrase.firstChar;
      while (char) {
        // 歌詞の発声が始まっていれば
        if (char.startTime <= position) {
          p5.textSize(baseCharSize);
          // 発生中の歌詞は声量に合わせてサイズを変化させる
          if (char.endTime >= position) p5.textSize(charSize);
          // 歌詞の影の描画
          p5.fill(10, 128);
          p5.text(char.text, x + 3, y + 3);
          // 歌詞の描画
          p5.fill(currentPoint.color);
          p5.text(char.text, x, y);
        }
        // 表示位置の更新
        x += baseCharSize + charMargin;
        // 文字がはみ出たときは1段下げて表示
        if (x + p5.textWidth(char.text) + charMargin > xmax) {
          x = currentPoint.x;
          y += baseCharSize + charMargin;
        }
        char = char.next;
      }
    }
  }
  p5.mouseClicked = () => {
    if (player && player.isPlaying && !player.isLoading) {
      const ignoreArea = Math.max(openSettingsBtn.offsetHeight, settings.offsetHeight)
      console.log(ignoreArea);
      if (p5.mouseY < height - ignoreArea) {
        const color = [randInt(0, 255), randInt(0, 255), randInt(0, 255), randInt(150, 255)];
        const size = randInt(50, 120);
        const noteList = ["♩", "♪", "♫", "♬", "♭", "♯", "♮"];
        const type = randInt(0, noteList.length - 1);
        const note = noteList[type];
        const x = p5.mouseX - width / 2 ;
        const y = p5.mouseY - height / 2;
        extPoints.push({ "type": type, "note": note, 'x': x, 'y': y, 'color': color, 'size': size, "vx": 0, "vy": 0 });
        if (extPoints.length > 15) extPoints.shift();
      }
    }
  }
});

/**
 * 指定した範囲のランダムな整数を返す
 *
 * @param {number}} min - 最小値
 * @param {number}} max - 最大値
*/
const randInt = (min, max) => {return Math.floor(Math.random() * (max + 1 - min) + min);}

/**
 * 演出に必要な動画データを取得し変数にセットする
 *
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
}

const getPhrasePoints = (num) => {
  let result = [];
  const noteList = ["♩", "♪", "♫", "♬", "♭", "♯", "♮"];
  for (let i = 0; i < num; i++){
    let x, y;
    const section = randInt(0,3);
    if (section == 0) {
      x = randInt(xmin + 50, 0);
      y = randInt(ymin + 100, 0);
    }
    if (section == 1) {
      x = randInt(xmin + 50, 0);
      y = randInt(0, ymax - 100);
    }
    if (section == 2) {
      x = randInt(0, xmax - 300);
      y = randInt(ymin + 100, 0);
    }
    if (section == 3) {
      x = randInt(0, xmax - 500);
      y = randInt(0, ymax - 300);
    }
    const color = [randInt(0, 255), randInt(0, 255), randInt(0, 255), randInt(150, 255)];
    const size = randInt(50, 120);
    const type = randInt(0, noteList.length - 1);
    const note = noteList[type];
    result.push({ "type": type, "note":note, "x": x, "y": y, "color": color, "size": size, "vx":0, "vy": 0});
  }
  // 1フレーズ目は中央に
  result[0].x = 0;
  result[0].y = 0;
  return result
}

const updatePoints = (position, points, beat) => {
  for (let i = 0; i < points.length; i++) {
    points[i].x = points[i].x + (Ease.quintIn(beat.progress(position))) * 5 * points[i].vx;
    if (points[i].x > xmax) {
      points[i].x = xmin;
    }
    points[i].y = points[i].y + Ease.quintIn(beat.progress(position)) * 20 * points[i].vy
    if (points[i].y > ymax || points[i].y < ymin) {
      points[i].vy = -1 * points[i].vy;
    }
  }
  return points;
}

const getInterludes = (phrases, videoEndTime, interludeTime = 3000) => {
  let result = [];
  // 前奏があればリストへ追加
  if (phrases[0].startTime > interludeTime) {
    result.push({ "startTime": 0, "endTime": phrases[0].startTime - 1, "name":  "前奏"});
  }
  // 間奏があればリストへ追加
  let index = 0;
  for (let i = 0; i < phrases.length - 1; i++){
    if (phrases[i + 1].startTime - phrases[i].endTime > interludeTime) {
      result.push({ "startTime": phrases[i].endTime + 1, "endTime": phrases[i + 1].startTime - 1, "name": `間奏${index + 1}` });
      index++;
    }
  }
  // 後奏があればリストへ追加
  if (videoEndTime - phrases.slice(-1)[0].endTime > interludeTime) {
    result.push({ "startTime": phrases.slice(-1)[0].endTime + 1, "endTime": videoEndTime, "name": "後奏"});
  }
  return result;
}

const findInterlude = (position) => {
  for (let i = 0; i < interludes.length; i++) {
    if (position >= interludes[i].startTime && position <= interludes[i].endTime) {
      return interludes[i];
    }
  }
}
const findChorus = (position) => {
  for (let i = 0; i < choruses.length; i++) {
    if (position >= choruses[i].startTime && position <= choruses[i].endTime) {
      return choruses[i];
    }
  }
}
const updateSeekbarLabel = (position) => {
  let partName = "メロディ"
  const interlude = findInterlude(position);
  const chorus = findChorus(position);
  partName = interlude ? interlude.name : partName;
  partName = chorus ? `サビ${chorus.index + 1}` : partName;
  seekBarLabel.textContent = `動画再生位置:[${position}]　：　再生パート:[${partName}]`
}

const activeBtn = (btn) => {
  btn.classList.remove("inactive");
  btn.classList.add("active");
  btn.disabled = false;
}

const inactiveBtn = (btn) => {
  btn.classList.remove("active");
  btn.classList.add("inactive");
  btn.disabled = true;  
}
