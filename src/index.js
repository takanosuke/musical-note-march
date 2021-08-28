import { Player, Ease } from "textalive-app-api";
import Sans from './assets/NotoSansJP-Regular.otf';

import P5 from "p5";


// 初期化
const SONG_DATA = {
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
  },
}
const openSettingsBtn = document.querySelector("#open-settings");
const playBtn = document.querySelectorAll(".play");
const jumpBtn = document.querySelector("#jump");
const pauseBtn = document.querySelector("#pause");
const rewindBtn = document.querySelector("#rewind");
const songSelect = document.querySelector("#song-select");
const positionEl = document.querySelector("#position strong");
const artistSpan = document.querySelector("#artist span");
const songSpan = document.querySelector("#song span");
const changeSongBtn = document.querySelector("#change-song");

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
    playBtn.forEach((playBtn) =>
      playBtn.addEventListener("click", () => {
        console.log("click playBtn");
        player.video && player.requestPlay();
      })
    );

    // 歌詞頭出しボタン / Seek to the first character in lyrics text
    jumpBtn.addEventListener(
      "click",
      () => player.video && player.requestMediaSeek(player.video.firstChar.startTime)
    );

    // 一時停止ボタン / Pause music playback
    pauseBtn.addEventListener("click", () => {
      player.video && player.requestPause();
      console.log("click playBtn");
    });

    // 巻き戻しボタン / Rewind music playback
    rewindBtn.addEventListener(
      "click",
      () => player.video && player.requestMediaSeek(0)
    );

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
      (event) => {
        const song = SONG_DATA[songSelect.value];
        player.createFromSongUrl(song.songUrl, { video: song.video });
      }
    )
    const song = SONG_DATA["真島ゆろ / 嘘も本当も君だから"];
    player.createFromSongUrl(song.songUrl, { video: song.video });
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
}

/**
 * 音源の再生準備が完了した時に呼ばれる
 *
 * @param {Timer} t - https://developer.textalive.jp/packages/textalive-app-api/interfaces/timer.html
 */
function onTimerReady(t) {
  // ボタンを有効化する
  console.log("onTimerReady!");
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
  const width = window.innerWidth;
  const xmax = Math.floor(width / 2);
  const xmin = -1 * xmax;
  const height = window.innerHeight;
  const ymax = Math.floor(height / 2);
  const ymin = -1 * ymax;
  const charMargin = 5;
  // let baseCharSize = 70;
  // let charSize = baseCharSize;
  let currentPhraseIndex = -1;
  let currentBeatPosi = -1;
  let bgColor = p5.color(255, 255, 255, 100);
  let charColor = p5.color(0, 0, 0);
  let ballNum = 0;
  let balls = new Array(1000);
  let randX = 0;
  let randY = 0;
  let lFlag = true;
  let pointList = [
    [xmin, ymin, p5.color(0, 0, 0, 0)],
    [xmin, ymax, p5.color(0, 0, 0, 0)],
    [xmax, ymin, p5.color(0, 0, 0, 0)],
    [xmax, ymax, p5.color(0, 0, 0, 0)],
  ]; //フレーズの数だけ用意
  let concatPoint = 1;

  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height, p5.WEBGL);
    p5.frameRate(60);
    p5.background(40);
    p5.noStroke(); // 図形の輪郭線を消す
    p5.textFont(p5.loadFont(Sans));
    p5.angleMode(p5.DEGREES);
    p5.textAlign(p5.LEFT, p5.CENTER);
    for (let i = 0; i < balls.length; i++) {
      balls[i] = [Math.floor((Math.random() * ((width / 2) - (-width / 2)) + (-width / 2))), Math.floor(Math.random() * ((height / 2) - (-height / 2)) + (-height / 2))];
      // balls[i] = [Math.random() * 300, Math.random() * 300];
    }
    
  };

  p5.draw = () => {
    // プレイヤーが準備できていなかったら何もしない
    if (!player || !player.video) {
      return;
    }

    const position = player.timer.position;
    const beat = player.findBeat(position);
    const chorus = player.findChorus(position);
    const cord = player.findChord(position);
    const va = player.getValenceArousal(position);
    const max_amp = player.getMaxVocalAmplitude();
    const amp = player.getVocalAmplitude(position);
    const phrase = player.video.findPhrase(position);
    let angle;

    p5.background(bgColor);



    let charSize = p5.map(amp, 0, max_amp, 50, 150);
    let baseCharSize = 70;
    if (chorus) {
      charSize = charSize + 20;
      baseCharSize = baseCharSize + 20;
    }

    if (phrase) {
      const phraseWidth = p5.textWidth(phrase.text) + (phrase.charCount - 1) * charMargin;
      if (player.video.findIndex(phrase) != currentPhraseIndex) {
        currentPhraseIndex = player.video.findIndex(phrase);
        const randXmax = lFlag ? -200 : xmax - (baseCharSize + charMargin);
        const randXmin = lFlag ? -1 * xmax : 0;
        lFlag = ! lFlag;
        const randYmax = ymax - (baseCharSize + charMargin);
        const randYmin = -1 * randYmax;

        randX = randInt(randXmax, randXmin);
        randY = randInt(randYmax, randYmin);
        const r = randInt(0, 255);
        const g = randInt(0, 255);
        const b = randInt(0, 255);
        const addMaxMin = Math.max(r, g, b) + Math.min(r, g, b);
        bgColor = p5.color(r, g, b, 100);
        charColor = p5.color(addMaxMin - r, addMaxMin - g, addMaxMin - b);
        pointList.push([randX, randY, charColor]);
      }
      let char = phrase.firstChar;
      let x = randX;
      let y = randY;

      if (x + phraseWidth > xmax) {
        const ytmp = Math.ceil((x + phraseWidth) / (xmax - x)) * baseCharSize;
        if (ytmp > ymax) {
          y = y - (ytmp - ymax);
          if (y < ymin) {
            x = xmin;
            y = ymin;
          }
        }
      }
      if (phrase.endTime >= position) {
        while (char) {
          if (char.startTime <= position) {
            if (char.endTime >= position) {
              p5.textSize(charSize);
            }
            else {
              p5.textSize(baseCharSize);
            }
            p5.fill(10, 128);
            p5.text(char.text, x + 3, y + 3);
            p5.fill(charColor);
            p5.text(char.text, x, y);
            p5.textSize(baseCharSize);
          }
          x += p5.textWidth(char.text) + charMargin;
          if (x + p5.textWidth(char.text) + charMargin > xmax) {
            x = randX;
            y += baseCharSize + charMargin;
          }
          char = char.next;
        }
      }
    }
    pointList.forEach(point => {
      p5.push();
      let pointSize = 10;
      if (beat && !phrase) {
        pointSize = Ease.quintIn(beat.progress(position)) * 100;
      }
      p5.fill(point[2]);
      p5.circle(point[0], point[1], pointSize);
      p5.pop();
    });

    if (chorus) {
      if (beat) {
        if (beat.position != currentBeatPosi) {
          currentBeatPosi = beat.position;
          concatPoint = (concatPoint + 1) % (pointList.length - 1)
        }
      }
      if (pointList.length > 1) {
        p5.push();
        for (let i = 0; i < pointList.length; i++) {
          for (let j = 0; j < pointList.length; j++) {
            let alpha = Ease.quintIn(beat.progress(position)) * 150 + 50;
            p5.strokeWeight(alpha / 255 * 5);
            p5.stroke(p5.color(255, 255, 255, alpha));
            if (i != j && (i == j + concatPoint || i == j + concatPoint + 1)) {
              p5.line(pointList[i][0], pointList[i][1], pointList[j][0], pointList[j][1])
            }
          }
        }
        p5.pop();
      }
    }
  }
});

const randInt = (max, min) => {
  return Math.random() * (max - min) + min;
}
