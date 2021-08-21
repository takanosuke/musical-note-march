import { Player, Ease } from "textalive-app-api";
import Sans from './assets/NotoSansJP-Regular.otf';
import P5 from "p5";
import { random } from "core-js/core/number";

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
const songSelectionBtn = document.querySelector(".song_selection_btn");

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
    songSelect.addEventListener(
      "change",
      (event) => {
        const song = SONG_DATA[event.currentTarget.value];
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
  const height = window.innerHeight;
  const charMargin = 0;
  // let baseCharSize = 70;
  // let charSize = baseCharSize;
  let currentPhraseIndex = 0;
  let y = 0;
  let addx = 0;
  let bgColor = p5.color(255, 255, 255);
  let charColor = p5.color(0, 0, 0);

  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height, p5.WEBGL);
    p5.frameRate(60);
    p5.background(40);
    p5.noStroke(); // 図形の輪郭線を消す
    p5.textFont(p5.loadFont(Sans));
    p5.textAlign(p5.LEFT, p5.CENTER);
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

    p5.background(bgColor);
    let charSize = p5.map(amp, 0, max_amp, 50, 150);
    let baseCharSize = 70;
    if (chorus) {
      charSize = charSize + 40;
      baseCharSize = baseCharSize + 40;
    }
    if (va) {
      // p5.fill(255, 0, 0);
      // p5.circle(500, 200, va.v * 500);
      // p5.fill(0, 0, 2550);
      // p5.circle(500, -200, va.a * 500);
    }
    if (amp) {
      // p5.fill(255, 255, 70);
      // p5.circle(-500, 0, amp/100);
    }
    if (beat) {
      // const progress = beat.progress(position);
      // // const rectHeight = Ease.quintIn(progress) * height;
      // p5.fill(0, 0, 0, Ease.quintOut(progress) * 60);
      // if (chorus) {
      //   p5.fill(255, 0, 70);
      // }
      // p5.circle(0, 0, beat.position * 50);
    }
    if (phrase) {
      const phraseWidth = p5.textWidth(phrase.text) + (phrase.charCount - 1) * charMargin;
      if (player.video.findIndex(phrase) != currentPhraseIndex) {
        console.log("changePhrase");
        currentPhraseIndex = player.video.findIndex(phrase);
        const ymax = 400;
        const ymin = -400;
        const xmax = 400;
        const xmin = -400;
        y = Math.random() * (ymax - ymin) + ymin;
        addx = Math.random() * (xmax - xmin) + xmin;
        const r = Math.random() * 255;
        const g = Math.random() * 255;
        const b = Math.random() * 255;
        const addMaxMin = Math.max(r, g, b) + Math.min(r, g, b);
        bgColor = p5.color(r, g, b);
        charColor = p5.color(addMaxMin - r, addMaxMin - g, addMaxMin - b);
      }
      let char = phrase.firstChar;
      let x = - phraseWidth / 2;
      p5.fill(charColor);
      if (phrase.endTime >= position) {
        while (char) {
          if (char.startTime <= position) {
            if (char.endTime >= position) {
              p5.textSize(charSize);
              p5.text(char.text, x + addx, y);
            }
            else {
              p5.textSize(baseCharSize);
              p5.text(char.text, x + addx, y);
            }
          }
          p5.textSize(baseCharSize);
          x += p5.textWidth(char.text) + charMargin;
          char = char.next;
        }
      }
    }
  }
});


    // if (phrase) {
    //   const phraseHeight = p5.textWidth(phrase.text) + (phrase.charCount + 1) * charMargin;
    //   let char = phrase.firstChar;
    //   let y = charMargin - phraseHeight / 2;
    //   if (phrase.endTime >= position) {
    //     while (char) {
    //       if (char.startTime <= position) {
    //         if (char.endTime >= position) {
    //           p5.textSize(charSize);
    //           p5.text(char.text, 300, y);
    //         }
    //         else {
    //           p5.textSize(baseCharSize);
    //           p5.text(char.text, 300, y);
    //         }
    //       }
    //       p5.textSize(baseCharSize);
    //       y += p5.textWidth(char.text);
    //       char = char.next;
    //     }
    //   }
    // }

    // if (phrase) {
    //   const phraseWidth = p5.textWidth(phrase.text);
    //   let word = phrase.firstWord;
    //   let x = - phraseWidth / 2
    //   if (phrase.endTime >= position) {
    //     while (word) {
    //       if (word.startTime <= position) {
    //         if (word.endTime >= position) {
    //           p5.textSize(size);
    //         }
    //         p5.text(word.text, x, -200);
    //       }
    //       x += p5.textWidth(word.text);
    //       word = word.next;
    //     }
    //   }

    //   while (char) {
    //     if (char.endTime + 100 < position) {
    //       // これ以降の文字は表示する必要がない
    //       break;
    //     }
    //     if (char.startTime < position + 100) {
    //       const x = (((index % numChars) + 0.5) * (textAreaWidth / numChars)) - textAreaWidth/2;
    //       let transparency = 1

    //       p5.fill(0, 0, 255, transparency * 100);
    //       if (position < char.startTime || char.endTime < position) {
    //         p5.textSize(base_size);
    //       }
    //       else {
    //         p5.textSize(size);
    //       }
    //       p5.text(char.text, x, 0);
          
    //       p5.textSize(50);
    //       p5.text(cord.name, x, 150);
    //     }
    //     char = char.next;
    //     index++;
    //   }
    // }


    // // 歌詞
    // // - 再生位置より 100 [ms] 前の時点での発声文字を取得
    // // - { loose: true } にすることで発声中でなければ一つ後ろの文字を取得
    // let char = player.video.findChar(position - 5000, { loose: true });
    // if (char) {
    //   // 位置決めのため、文字が歌詞全体で何番目かも取得しておく
    //   let index = player.video.findIndex(char);
    //   while (char) {
    //     if (char.endTime + 5000 < position) {
    //       // これ以降の文字は表示する必要がない
    //       break;
    //     }
    //     // 文字の開始日時が指定時間の
    //     if (char.startTime < position + 100) {
    //       const x = ((index % numChars) + 0.5) * (textAreaWidth / numChars);
    //       const y = (Math.floor(index / numChars) % 5) * margin;
    //       let transparency = 1, size = 39;
          
    //       p5.fill(30, 255, 255, transparency * 100);
    //       p5.textSize(size);
    //       p5.text(char.text, margin + x, height / 2 + y);
    //     }
    //     char = char.next;
    //     index++;
    //   }
    // }


    
