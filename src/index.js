import { Player, Ease } from "textalive-app-api";
import Sans from './assets/NotoSansJP-Regular.otf';

import P5 from "p5";

const width = window.innerWidth;
const xmax = Math.floor(width / 2);
const xmin = -1 * xmax;
const height = window.innerHeight;
const ymax = Math.floor(height / 2);
const ymin = -1 * ymax;
let allPointList;
let interludeList;
let pointVector = [];
let maxAmp;
// 初期化
const openSettingsBtn = document.querySelector("#open-settings");
const playBtn = document.querySelector("#play");
const jumpBtn = document.querySelector("#jump");
const pauseBtn = document.querySelector("#pause");
const rewindBtn = document.querySelector("#rewind");
const songSelect = document.querySelector("#song-select");
const positionEl = document.querySelector("#position strong");
const artistSpan = document.querySelector("#artist span");
const songSpan = document.querySelector("#song span");
const changeSongBtn = document.querySelector("#change-song");
const SONG = {
  "blues / First Note": {
      "songUrl": "https://piapro.jp/t/FDb1/20210213190029",
      "video": {
          "beatId": 3953882,
          "repetitiveSegmentId": 2099561,
          "lyricId": 52065,
          "lyricDiffId": 5093,
      }
  },
  "chiquewa / Freedom!": {
      "songUrl": "https://piapro.jp/t/N--x/20210204215604",
      "video": {
          "beatId": 3953761,
          "repetitiveSegmentId": 2099586,
          "lyricId": 52094,
          "lyricDiffId": 5171,
      }
  },
  "ラテルネ / その心に灯る色は": {
    "songUrl": "http://www.youtube.com/watch?v=bMtYf3R0zhY",
    "video": {
        "beatId": 3953902,
        "repetitiveSegmentId": 2099660,
        "lyricId": 52093,
        "lyricDiffId": 5177,
    }
  },
  "真島ゆろ / 嘘も本当も君だから": {
    "songUrl": "https://piapro.jp/t/YW_d/20210206123357",
    "video": {
        "beatId": 3953908,
        "repetitiveSegmentId": 2099661,
        "lyricId": 52061,
        "lyricDiffId": 5123,
    }
  },
  "シロクマ消しゴム / 夏をなぞって": {
    "songUrl": "https://piapro.jp/t/R6EN/20210222075543",
    "video": {
        "beatId": 3953764,
        "repetitiveSegmentId": 2099662,
        "lyricId": 52062,
        "lyricDiffId": 5133,
    }
  },
  "濁茶 / 密かなる交信曲": {
    "songUrl": "http://www.youtube.com/watch?v=Ch4RQPG1Tmo",
    "video": {
        "beatId": 3953917,
        "repetitiveSegmentId": 2099665,
        "lyricId": 52063,
        "lyricDiffId": 5149,
    }
  }
}

const player = new Player({
  app: {
    appAuthor: "takanosuke",
    appName: "magicalmirai2021-procon",
  },
  valenceArousalEnabled: true,
  vocalAmplitudeEnabled: true,
  mediaElement: document.querySelector("#media"),
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

    // 再生ボタン / Start music playback
    playBtn.addEventListener("click", () => {
      if (player.isPlaying) {
        player.video && player.requestPause();
      }
      else {
        player.video && player.requestPlay();
      }
    });

    // 歌詞頭出しボタン / Seek to the first character in lyrics text
    jumpBtn.addEventListener("click", () => player.video && player.requestMediaSeek(player.video.firstChar.startTime));

    // 一時停止ボタン / Pause music playback
    pauseBtn.addEventListener("click", () => {player.video && player.requestPause()});

    // 巻き戻しボタン / Rewind music playback
    rewindBtn.addEventListener("click", () => player.video && player.requestMediaSeek(80000));

    // 詳細設定を開く/閉じるボタン
    openSettingsBtn.addEventListener(
      "click",
      () => {
        if (document.querySelector("#settings").style.display == "block") {
          document.querySelector("#settings").style.display = "none";
          openSettingsBtn.innerHTML = "設定開く";
        } else if (document.querySelector("#settings").style.display == "none") {
          document.querySelector("#settings").style.display = "block";
          openSettingsBtn.innerHTML = "設定閉じる";
        }
      }
    );
  }

  if (!app.songUrl) {
    changeSongBtn.addEventListener(
      "click",
      () => {
        if (player.isPlaying) {
          player.video && player.requestPause();
        }
        const song = SONG[songSelect.value]
        player.createFromSongUrl(song.songUrl, { video: song.video});
      }
    )
    const defaultSong = SONG["濁茶 / 密かなる交信曲"];
    player.createFromSongUrl(defaultSong.songUrl, { video: defaultSong.video });
  }
  
}

/**
 * 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
 *
 * @param {IVideo} v - https://developer.textalive.jp/packages/textalive-app-api/interfaces/ivideo.html
 */
function onVideoReady(v) {
  console.log("onVideoReady!");
  if (!player.app.managed) {
    document.querySelector("#message").className = "active";
  }
  // メタデータを表示する
  artistSpan.textContent = player.data.song.artist.name;
  songSpan.textContent = player.data.song.name;

  // 演出に必要なデータを取得
  const phraseNum = player.video.phraseCount;
  const phrases = player.video.phrases;
  const videoEndTime = player.video.endTime;
  allPointList = createPointList(phraseNum);
  pointVector = Array(phraseNum).fill().map(() => ({ "x": 0, "y": 0 }));
  interludeList = createInterludeList(phrases, videoEndTime);
  console.log(interludeList);
  maxAmp = player.getMaxVocalAmplitude();
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
  }
  document.querySelector("#overlay").className = "inactive";
  // 歌詞がなければ歌詞頭出しボタンを無効にする
  jumpBtn.disabled = !player.video.firstChar;
}

/**
 * 動画の再生位置が変更されたときに呼ばれる（あまりに頻繁な発火を防ぐため一定間隔に間引かれる）
 *
 * @param {number} position - https://developer.textalive.jp/packages/textalive-app-api/interfaces/playereventlistener.html#onthrottledtimeupdate
 */
function onThrottledTimeUpdate(position) {
  // 再生位置を表示する
  positionEl.textContent = String(Math.floor(position));
}

// 再生が始まったら #overlay を非表示に
function onPlay() {
  document.querySelector("#message").className = "inactive";
  if (!player.app.managed) {
    document.querySelector("#control").className = "";
  }
  console.log("player.onPlay");
}

function onPause() {
  console.log("player.onPause");
}

function onSeek() {
  console.log("player.onSeek");
}

function onStop() {
  if (!player.app.managed) {
    document.querySelector("#control").className = "active";
  }
  console.log("player.onStop");
}

// p5.js を初期化
new P5((p5) => {
  // キャンバスの大きさなどを計算
  const charMargin = 5;
  let currentBeatPosi = -1;
  let bgColor = [255, 255, 255, 100];
  let concatPoint = 1;
  let font;
  

  p5.preload = () => {
    font = p5.loadFont(Sans)
  }
  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height, p5.WEBGL);
    p5.frameRate(60);
    p5.background(bgColor);
    p5.noStroke(); // 図形の輪郭線を消す
    p5.textFont(font);
    p5.angleMode(p5.DEGREES);
    p5.textAlign(p5.CENTER, p5.CENTER);
  };

  p5.draw = () => {
    // プレイヤーが準備できていなかったら何もしない
    if (!player || !player.video) {
      return;
    }
    // 現在の再生位置の情報を取得する
    const position = player.timer.position;
    const beat = player.findBeat(position);
    const chorus = player.findChorus(position);
    const cord = player.findChord(position);
    const va = player.getValenceArousal(position);
    const amp = player.getVocalAmplitude(position);
    const phrase = player.video.findPhrase(position);
    const isInterlude = duringInterlude(position);    

    let phraseIndex = player.video.findIndex(player.video.findPhrase(position, { loose: true }));
    if (phraseIndex < 0) {
      phraseIndex = allPointList.length - 1;
    }
    // 文字サイズの定義
    let charSize = p5.map(amp, 0, maxAmp, 50, 150);
    let baseCharSize = 70;
    let pointSize = 0;
    
    let pointList = allPointList.slice(0, phraseIndex);
    const point = allPointList[phraseIndex];
    let x = point.x
    let y = point.y;

    // サビなら文字サイズ拡大
    if (chorus) {
      charSize = charSize + 20;
      baseCharSize = baseCharSize + 20;
    }
    // beatが変わった瞬間に実行
    if (beat && beat.position != currentBeatPosi) {
      currentBeatPosi = beat.position;
      concatPoint = (concatPoint % (pointList.length - 1)) + 1;
      for (let i = 0; i < pointList.length; i++) {
        // pointVector[i].x = randInt(-1, 1);
        pointVector[i].x = -1 - (pointList[i].type / 2);
        pointVector[i].y = randInt(-1, 1);
      }
    }

    // 背景の描画
    p5.background(bgColor);

    // ポイントの描画
    pointList.forEach(point => {
      p5.push();
      p5.fill(point.color);
      p5.translate(point.x, point.y);
      pointSize = point.size;
      // サビのときは音譜のサイズを拡大と回転
      if (beat && chorus) {
        pointSize = point.size + Ease.quintIn(beat.progress(position)) * point.size;
        const angle = p5.map(Ease.quintIn(beat.progress(position)), 0, 1, -5, 5);
        p5.rotate(angle)
      }
      p5.textSize(pointSize);
      p5.text(point.note, 0, 5);
      p5.pop();
    });

    // フレーズがなければ音譜を流す
    if (isInterlude && beat) {
      p5.push()
      p5.stroke(0);
      p5.strokeWeight(2);
      p5.line(xmin, -200, xmax, -200);
      p5.line(xmin, -100, xmax, -100);
      p5.line(xmin, 0, xmax, 0);
      p5.line(xmin, 100, xmax, 100);
      p5.line(xmin, 200, xmax, 200);
      p5.pop()
      for (let i = 0; i < pointList.length; i++) {
        pointList[i].x = pointList[i].x + (Ease.quintIn(beat.progress(position))+1) * 5 * pointVector[i].x;
        if (pointList[i].x < xmin) {
          pointList[i].x = xmax;
        }
        // if (pointList[i].x > xmax || pointList[i].x < xmin) {
        //   pointVector[i].x = -1 * pointVector[i].x;
        // }
        pointList[i].y = pointList[i].y + Ease.quintIn(beat.progress(position)) * 10 * pointVector[i].y
        if (pointList[i].y > ymax || pointList[i].y < ymin) {
          pointVector[i].y = -1 * pointVector[i].y;
        }
      }
    }
    // 歌詞を描画する
    if (phrase) {
      let char = phrase.firstChar;
      // フレーズが終わってなければ
      if (phrase.endTime >= position) {
        while (char) {
          // 文字の発声が始まっていれば
          if (char.startTime <= position) {
            // 文字の発声が終わっていなければ
            if (char.endTime >= position) {
              p5.textSize(charSize);
            }
            else {
              p5.textSize(baseCharSize);
            }
            
            p5.fill(10, 128);
            p5.text(char.text, x + 3, y + 3);
            p5.fill(point.color);
            p5.text(char.text, x, y);
          }
          x += baseCharSize + charMargin;
          // 文字がはみ出たときは
          if (x + p5.textWidth(char.text) + charMargin > xmax) {
            x = point.x;
            y += baseCharSize + charMargin;
          }
          char = char.next;
        }
      }
    }
  }
});

const randInt = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}


const createPointList = (num) => {
  let result = [];
  const noteList = ["♩", "♪", "♫", "♬"];
  for (let i = 0; i < num; i++){
    const x = (i % 2 == 0) ? randInt(xmin, 0) : randInt(0, xmax);
    const y = (i % 2 == 0) ? randInt(ymin, 0) : randInt(0, ymax);
    const color = [randInt(0, 255), randInt(0, 255), randInt(0, 255), randInt(100,255)];
    const size = randInt(30, 120);
    const type = randInt(0, noteList.length - 1);
    const note = noteList[type];
    result.push({ "type": type, "note":note, 'x': x, 'y': y, 'color': color, 'size': size});
  }
  return result
}

const createInterludeList = (phrases, videoEndTime, interludeTime = 1000) => {
  let result = [];
  // 前奏があればリストへ追加
  if (phrases[0].startTime > interludeTime) {
    result.push({ "startTime": 0, "endTime": phrases[0].startTime - 1 });
  }
  // 間奏があればリストへ追加
  for (let i = 0; i < phrases.length - 1; i++){
    if (phrases[i + 1].startTime - phrases[i].endTime > interludeTime) {
      result.push({ "startTime": phrases[i].endTime + 1, "endTime": phrases[i+1].startTime - 1 });
    }
  }
  // 後奏があればリストへ追加
  if (videoEndTime - phrases.slice(-1)[0].endTime > interludeTime) {
    result.push({ "startTime": phrases.slice(-1)[0].endTime + 1, "endTime": videoEndTime });
  }
  return result;
}

const duringInterlude = (position) => {
  for (let i = 0; i < interludeList.length; i++) {
    if (position >= interludeList[i].startTime && position <= interludeList[i].endTime) {
      return true;
    }
  }
  return false;
}