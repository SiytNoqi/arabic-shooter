// بارلىق import لارنى ئوخشاش بىر مەنبەدىن ئېلىڭ
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// بۇنىڭدىن كېيىن قالغان كودلىرىڭىزنى يېزىڭ...
// ئەگەر يەنىلا 'Identifier THREE has already been declared' دېسە، 
// كودىڭىزنىڭ باشقا يېرىدە THREE نى چوقۇم ئىككى قېتىم ئېلان قىلىپ قويدىڭىز.
// IDE (VS Code) دە 'THREE' نى ئىزدەپ (Ctrl + F)، قەيەردە ئىككى قېتىم يېزىلغانلىقىنى تېپىڭ.
let scene, camera, renderer, controls;
let raycaster, targets = [];
let particles = [];
let score = 0;

let highScore = parseInt(localStorage.getItem("arabic_game_highscore")) || 0;
let timeLeft = 40;
let gameActive = false;
let timerInterval = null;
let audioCtx = null;

let skyTime = 0;
let sunLight;

let currentCategory = "fruits"; 
const wordBank = {
    fruits: [
        { ar: "تُفَّاحَةٌ", uy: "ئالما", ar_pron: "tuffahatun", uy_pron: "alma" },
        { ar: "مَوْزٌ", uy: "بانان", ar_pron: "mawzun", uy_pron: "banan" },
        { ar: "بِرْتُقَالٌ", uy: "ئاپېلسىن", ar_pron: "burtuqalun", uy_pron: "apelsin" },
        { ar: "عِنَبٌ", uy: "ئۈزۈم", ar_pron: "ʿinabun", uy_pron: "üzüm" },
        { ar: "تَمْرٌ", uy: "خۇرما", ar_pron: "tamrun", uy_pron: "xurma" },
        { ar: "فَرَاوِلَةٌ", uy: "بۆلجۈرگەن", ar_pron: "farawilatun", uy_pron: "böljürgen" },
        { ar: "أَنَانَاسٌ", uy: "ئاناناس", ar_pron: "ananasun", uy_pron: "ananas" },
        { ar: "مَانْجُو", uy: "مانگو", ar_pron: "manju", uy_pron: "mango" },
        { ar: "كَرَزٌ", uy: "گىلاس", ar_pron: "karazun", uy_pron: "gilas" },
        { ar: "خَوْخٌ", uy: "شاپتۇل", ar_pron: "khawkhun", uy_pron: "shaptul" }
    ],
    animals: [
        { ar: "أَسَدٌ", uy: "شىر", ar_pron: "asadun", uy_pron: "shir" },
        { ar: "قِطٌّ", uy: "مۈشۈك", ar_pron: "qittun", uy_pron: "müshük" },
        { ar: "كَلْبٌ", uy: "ئىت", ar_pron: "kalbun", uy_pron: "it" },
        { ar: "أَرْنَبٌ", uy: "توشقان", ar_pron: "arnabun", uy_pron: "toshqan" },
        { ar: "حِصَانٌ", uy: "ئات", ar_pron: "hisanun", uy_pron: "at" },
        { ar: "فِيلٌ", uy: "پىل", ar_pron: "filun", uy_pron: "pil" },
        { ar: "زَرَافَةٌ", uy: "زۇراپە", ar_pron: "zarafatun", uy_pron: "zurape" },
        { ar: "جَمَلٌ", uy: "تۆگە", ar_pron: "jamalun", uy_pron: "töge" },
        { ar: "بَقَرَةٌ", uy: "سىيىر", ar_pron: "baqaratun", uy_pron: "siyir" },
        { ar: "غَنَمٌ", uy: "قوي", ar_pron: "ghanamun", uy_pron: "qoy" }
    ],
    household: [
        { ar: "بَيْتٌ", uy: "ئۆي", ar_pron: "baytun", uy_pron: "öy" },
        { ar: "كِتَابٌ", uy: "كىتاب", ar_pron: "kitabun", uy_pron: "kitab" },
        { ar: "قَلَمٌ", uy: "قەلەم", ar_pron: "qalamun", uy_pron: "qælæm" },
        { ar: "بَابٌ", uy: "ئىشىك", ar_pron: "babun", uy_pron: "ishik" },
        { ar: "مِصْبَاحٌ", uy: "چىراغ", ar_pron: "misbahun", uy_pron: "chiragh" },
        { ar: "سَرِيرٌ", uy: "كارىۋات", ar_pron: "sarirun", uy_pron: "kariwat" },
        { ar: "طَاوِلَةٌ", uy: "ئۈستەل", ar_pron: "tawilatun", uy_pron: "üstel" },
        { ar: "كُرْسِيٌّ", uy: "ئورۇندۇق", ar_pron: "kursiyyun", uy_pron: "orunduq" },
        { ar: "خِزَانَةٌ", uy: "ساندۇق", ar_pron: "khizanatun", uy_pron: "sanduq" },
        { ar: "مِرْآةٌ", uy: "ئەينەك", ar_pron: "mir'atun", uy_pron: "aynak" }
    ]
};

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa3e2f7);
    scene.fog = new THREE.FogExp2(0xa3e2f7, 0.008);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);

    const canvasElem = document.getElementById("gameCanvas");
    if (!canvasElem) {
        console.error("خاتالىق: HTML ئىچىدە id='gameCanvas' بولغان canvas ئېلېمېنتى تېپىلمىدى!");
        return;
    }

    renderer = new THREE.WebGLRenderer({
        canvas: canvasElem,
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.toneMappingExposure = 1.2;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x335533, 1.2);
    scene.add(hemiLight);

    sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    sunLight.position.set(40, 80, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048; // يۇقىرى ئېنىقلىق، لېكىن يېنىك ئىشلىشى ئۈچۈن 2K غا تەڭشەلدى
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    const d = 80;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x3b7a3e,
        roughness: 0.8,
        metalness: 0.1 
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());

    createUIElements();

    const startButton = document.getElementById("startButton");
    if (startButton) {
        startButton.addEventListener("click", () => {
            initAudio();
            const loadingScreen = document.getElementById("loadingScreen");
            if (loadingScreen) loadingScreen.style.display = "none";
            const catScreen = document.getElementById("categoryScreen");
            if (catScreen) catScreen.style.display = "flex"; 
        });
    }

    raycaster = new THREE.Raycaster();
    window.addEventListener("pointerdown", shoot);

    createWorld();
    window.addEventListener("resize", onResize);
}

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
}

function playShootSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(580, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
}

function playExplosionSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(10, audioCtx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
}

function speakArabic(text) {
    let spokenLocally = false;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ar-SA";
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.toLowerCase().includes("ar"));
        if (arabicVoice) {
            utterance.voice = arabicVoice;
            utterance.rate = 0.75;
            window.speechSynthesis.speak(utterance);
            spokenLocally = true; 
        }
    }
    if (!spokenLocally) {
        try {
            const encodedText = encodeURIComponent(text);
            const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodedText}`;
            const audio = new Audio(googleTtsUrl);
            audio.volume = 1.0;
            audio.play().catch(err => console.log("Audio play dynamic delay bypass."));
        } catch (e) {
            console.error("Audio system exception:", e);
        }
    }
}

function createUIElements() {
    // ئەگەر ئىلگىرى قۇرۇلغان تاختا بولسا قايتا قۇرۇشنىڭ ئالدىنى ئېلىش
    if(document.getElementById("timerBoard")) return;

    const scoreDiv = document.createElement("div");
    scoreDiv.id = "score";
    scoreDiv.style.position = "absolute";
    scoreDiv.style.top = "20px";
    scoreDiv.style.left = "20px";
    scoreDiv.style.color = "white";
    scoreDiv.style.fontSize = "24px";
    scoreDiv.style.fontFamily = "sans-serif";
    scoreDiv.style.fontWeight = "bold";
    scoreDiv.style.background = "rgba(0, 0, 0, 0.6)";
    scoreDiv.style.padding = "10px 20px";
    scoreDiv.style.borderRadius = "8px";
    scoreDiv.innerText = "⭐ Score : 0";
    document.body.appendChild(scoreDiv);

    const timerDiv = document.createElement("div");
    timerDiv.id = "timerBoard";
    timerDiv.style.position = "absolute";
    timerDiv.style.top = "20px";
    timerDiv.style.right = "20px";
    timerDiv.style.color = "white";
    timerDiv.style.fontSize = "24px";
    timerDiv.style.fontFamily = "sans-serif";
    timerDiv.style.fontWeight = "bold";
    timerDiv.style.background = "rgba(0, 0, 0, 0.6)";
    timerDiv.style.padding = "10px 20px";
    timerDiv.style.borderRadius = "8px";
    timerDiv.innerText = "⏳ ۋاقىت: 40";
    document.body.appendChild(timerDiv);

    const hiScoreDiv = document.createElement("div");
    hiScoreDiv.id = "highScoreBoard";
    hiScoreDiv.style.position = "absolute";
    hiScoreDiv.style.top = "70px";
    hiScoreDiv.style.left = "20px";
    hiScoreDiv.style.color = "#facc15";
    hiScoreDiv.style.fontSize = "22px";
    hiScoreDiv.style.fontFamily = "sans-serif";
    hiScoreDiv.style.fontWeight = "bold";
    hiScoreDiv.style.background = "rgba(15, 23, 42, 0.7)";
    hiScoreDiv.style.padding = "8px 15px";
    hiScoreDiv.style.borderRadius = "8px";
    hiScoreDiv.style.border = "1px solid #eab308";
    hiScoreDiv.innerText = "🏆 ئەڭ يۇقىرى: " + highScore;
    document.body.appendChild(hiScoreDiv);

    const popupDiv = document.createElement("div");
    popupDiv.id = "wordPopup";
    popupDiv.style.position = "absolute";
    popupDiv.style.bottom = "40px";
    popupDiv.style.left = "50%";
    popupDiv.style.transform = "translateX(-50%)";
    popupDiv.style.background = "rgba(255, 255, 255, 0.95)";
    popupDiv.style.border = "3px solid #3b82f6";
    popupDiv.style.borderRadius = "15px";
    popupDiv.style.padding = "15px 40px";
    popupDiv.style.textAlign = "center";
    popupDiv.style.display = "none";
    popupDiv.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
    popupDiv.style.zIndex = "50";
    popupDiv.innerHTML = `
        <h2 id="arabicWord" style="font-size: 45px; color: #1e293b; margin: 0; font-family: Arial;">-</h2>
        <p id="uyghurWord" style="font-size: 24px; color: #4b5563; margin: 5px 0 0 0; font-family: sans-serif; font-weight: bold;">-</p>
    `;
    document.body.appendChild(popupDiv);

    const gameOverDiv = document.createElement("div");
    gameOverDiv.id = "gameOverScreen";
    gameOverDiv.style.position = "absolute";
    gameOverDiv.style.top = "0";
    gameOverDiv.style.left = "0";
    gameOverDiv.style.width = "100%";
    gameOverDiv.style.height = "100%";
    gameOverDiv.style.background = "rgba(0, 0, 0, 0.85)";
    gameOverDiv.style.display = "none";
    gameOverDiv.style.flexDirection = "column";
    gameOverDiv.style.justifyContent = "center";
    gameOverDiv.style.alignItems = "center";
    gameOverDiv.style.color = "white";
    gameOverDiv.style.fontFamily = "sans-serif";
    gameOverDiv.style.zIndex = "999";
    gameOverDiv.innerHTML = `
        <h1 style="font-size: 50px; color: #ff4500; margin-bottom: 10px;">🎮 ئويۇن ئاخىرلاشتى!</h1>
        <p id="finalScoreText" style="font-size: 26px; margin-bottom: 5px;">تۆھپىڭىز: 0 نومۇر</p>
        <p id="recordText" style="font-size: 20px; color: #facc15; margin-bottom: 30px; font-weight: bold;"></p>
        <button id="restartButton" style="padding: 12px 35px; font-size: 22px; cursor: pointer; background: #22c55e; color: white; border: none; border-radius: 8px; font-weight: bold;">قايتا باشلاش</button>
    `;
    document.body.appendChild(gameOverDiv);

    document.getElementById("restartButton").addEventListener("click", () => {
        document.getElementById("gameOverScreen").style.display = "none";
        document.getElementById("categoryScreen").style.display = "flex"; 
    });

    const gunDiv = document.createElement("div");
    gunDiv.id = "gunHUD";
    gunDiv.style.position = "absolute";
    gunDiv.style.bottom = "0px";
    gunDiv.style.right = "20%";
    gunDiv.style.width = "70px";
    gunDiv.style.height = "160px";
    gunDiv.style.background = "linear-gradient(to top, #0f172a, #334155)";
    gunDiv.style.borderRadius = "15px 15px 0 0";
    gunDiv.style.border = "3px solid #1e293b";
    gunDiv.style.transformOrigin = "bottom center";
    gunDiv.style.transition = "transform 0.04s ease-out";
    gunDiv.style.zIndex = "10";
    
    const muzzle = document.createElement("div");
    muzzle.style.width = "20px";
    muzzle.style.height = "30px";
    muzzle.style.background = "#475569";
    muzzle.style.position = "absolute";
    muzzle.style.top = "-25px";
    muzzle.style.left = "22px";
    muzzle.style.borderRadius = "5px 5px 0 0";
    gunDiv.appendChild(muzzle);
    document.body.appendChild(gunDiv);

    const catDiv = document.createElement("div");
    catDiv.id = "categoryScreen";
    catDiv.style.position = "absolute";
    catDiv.style.top = "0";
    catDiv.style.left = "0";
    catDiv.style.width = "100%";
    catDiv.style.height = "100%";
    catDiv.style.background = "rgba(15, 23, 42, 0.95)";
    catDiv.style.display = "none";
    catDiv.style.flexDirection = "column";
    catDiv.style.justifyContent = "center";
    catDiv.style.alignItems = "center";
    catDiv.style.zIndex = "1000";
    catDiv.style.fontFamily = "sans-serif";
    catDiv.innerHTML = `
        <h2 style="color: white; font-size: 36px; margin-bottom: 30px;">📚 ئۆگىنىش تۈرىنى تاللاڭ</h2>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
            <button class="cat-btn" data-cat="fruits" style="padding: 15px 35px; font-size: 22px; cursor: pointer; background: #eab308; color: white; border: none; border-radius: 10px; font-weight: bold;">🍋 مېۋىلەر</button>
            <button class="cat-btn" data-cat="animals" style="padding: 15px 35px; font-size: 22px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 10px; font-weight: bold;">🦁 ھايۋانلار</button>
            <button class="cat-btn" data-cat="household" style="padding: 15px 35px; font-size: 22px; cursor: pointer; background: #ec4899; color: white; border: none; border-radius: 10px; font-weight: bold;">🏠 بۇيۇملار</button>
        </div>
    `;
    document.body.appendChild(catDiv);

    catDiv.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const selectedCat = e.target.getAttribute("data-cat");
            catDiv.style.display = "none";
            startGame(selectedCat); 
        });
    });

    const crosshair = document.createElement("div");
    crosshair.id = "crosshair";
    crosshair.style.position = "absolute";
    crosshair.style.top = "50%";
    crosshair.style.left = "50%";
    crosshair.style.width = "12px";
    crosshair.style.height = "12px";
    crosshair.style.borderRadius = "50%";
    crosshair.style.border = "2px solid rgba(255, 255, 255, 0.8)";
    crosshair.style.transform = "translate(-50%, -50%)";
    crosshair.style.pointerEvents = "none";
    crosshair.style.zIndex = "100";
    document.body.appendChild(crosshair);
}

function startGame(category) {
    currentCategory = category; 
    score = 0;
    timeLeft = 40;
    gameActive = true;
    skyTime = 0; 
    
    targets.forEach(t => {
        t.geometry.dispose();
        if(Array.isArray(t.material)) {
            t.material.forEach(m => { if(m.map) m.map.dispose(); m.dispose(); });
        } else {
            if(t.material.map) t.material.map.dispose();
            t.material.dispose();
        }
        scene.remove(t);
    });
    targets = [];

    const scoreElem = document.getElementById("score");
    const timerElem = document.getElementById("timerBoard");
    if(scoreElem) scoreElem.innerText = "⭐ Score : " + score;
    if(timerElem) timerElem.innerText = "⏳ ۋاقىت: " + timeLeft;
    
    controls.lock();

    for (let i = 0; i < 3; i++) {
        spawnTarget();
    }
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (gameActive) { 
            timeLeft--;
            const tBoard = document.getElementById("timerBoard");
            if(tBoard) tBoard.innerText = "⏳ ۋاقىت: " + timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    controls.unlock();
    
    let isNewRecord = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("arabic_game_highscore", highScore); 
        isNewRecord = true;
    }

    const finalScoreText = document.getElementById("finalScoreText");
    if(finalScoreText) finalScoreText.innerText = "تۆھپىڭىز: " + score + " نومۇر ⭐";
    
    const recText = document.getElementById("recordText");
    if (recText) {
        if (isNewRecord) {
            recText.innerText = "🔥 يېڭى رېكورت يارىتىلدى! قالتىس! 🔥";
            const hBoard = document.getElementById("highScoreBoard");
            if(hBoard) hBoard.innerText = "🏆 ئەڭ يۇقىرى: " + highScore;
        } else {
            recText.innerText = "🏆 نۆۋەتتىكى رېكورتىڭىز: " + highScore + " نومۇر";
        }
    }

    const goScreen = document.getElementById("gameOverScreen");
    if(goScreen) goScreen.style.display = "flex";
}

function createWorld() {
    for (let i = 0; i < 120; i++) {
        let x = (Math.random() - 0.5) * 400;
        let z = (Math.random() - 0.5) * 400;
        if (Math.abs(x) < 18 && Math.abs(z) < 18) continue;
        createTree(x, z);
    }
    
    for (let i = 0; i < 20; i++) {
        createCloud((Math.random() - 0.5) * 400, 25 + Math.random() * 10, (Math.random() - 0.5) * 400);
    }

    createMountain(-100, -160, 50, 70);
    createMountain(0, -200, 70, 90);
    createMountain(110, -150, 45, 60);

    for (let i = 0; i < 60; i++) {
        let x = (Math.random() - 0.5) * 80;
        let z = -5 - Math.random() * 60;
        createFlower(x, z);
    }
}

function createMountain(x, z, radius, height) {
    const geo = new THREE.ConeGeometry(radius, height, 6);
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0x556677, 
        roughness: 0.9,
        metalness: 0.1
    }); 
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2 - 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
}

function createFlower(x, z) {
    const colors = [0xff5533, 0xffcc00, 0xff66bb, 0x3399ff, 0xffffff];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 6, 6),
        new THREE.MeshStandardMaterial({ color: randomColor, roughness: 0.6 })
    );
    flower.position.set(x, 0.25, z);
    flower.castShadow = true;
    scene.add(flower);
}

function createTree(x, z) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 2.5, 10), 
        new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 })
    );
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 12, 12), 
        new THREE.MeshStandardMaterial({ color: 0x225522, roughness: 0.7, metalness: 0.1 })
    );
    leaves.position.y = 3.25;
    leaves.castShadow = true;
    tree.add(leaves);

    tree.position.set(x, 0, z);
    scene.add(tree);
}

function createCloud(x, y, z) {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.9, 
        metalness: 0.0,
        flatShading: true 
    });
    for (let i = 0; i < 5; i++) {
        const part = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), cloudMat);
        part.position.set(i * 2.2, Math.random() * 0.8, Math.random() * 0.8);
        cloud.add(part);
    }
    cloud.position.set(x, y, z);
    scene.add(cloud);
}

function createTextTexture(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 512; 
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#ff4500";
    ctx.lineWidth = 25;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    ctx.fillStyle = "#111111";
    ctx.font = "Bold 95px Arial"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4; 
    return texture;
}

function spawnTarget() {
    if (!gameActive) return;

    const activeList = wordBank[currentCategory];
    const randomIndex = Math.floor(Math.random() * activeList.length);
    const wordData = activeList[randomIndex];
    
    const textTexture = createTextTexture(wordData.ar);
    const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
    
    const sideMat = new THREE.MeshStandardMaterial({ color: 0xff9900, roughness: 0.3, metalness: 0.2 });
    const textMat = new THREE.MeshStandardMaterial({ map: textTexture, roughness: 0.4, metalness: 0.1 });
    const materials = [sideMat, sideMat, sideMat, sideMat, textMat, sideMat];

    const targetMesh = new THREE.Mesh(geometry, materials);
    
    const x = (Math.random() - 0.5) * 20;
    const y = 2.5 + Math.random() * 2.5; 
    const z = -12 - Math.random() * 10;  
    targetMesh.position.set(x, y, z);
    targetMesh.castShadow = true;
    targetMesh.receiveShadow = true;
    targetMesh.lookAt(camera.position.x, targetMesh.position.y, camera.position.z);

    const baseSpeed = 0.03 + Math.random() * 0.04;

    targetMesh.userData = {
        ...wordData,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: baseSpeed,
        initialY: y
    };

    scene.add(targetMesh);
    targets.push(targetMesh);
}

function createExplosion(position) {
    const particleCount = 20;
    const geometry = new THREE.SphereGeometry(0.15, 6, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff2200, roughness: 0.2 });
    for (let i = 0; i < particleCount; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.userData = {
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.35, (Math.random() - 0.2) * 0.35, (Math.random() - 0.5) * 0.35),
            life: 25
        };
        scene.add(mesh);
        particles.push(mesh);
    }
}

function shoot(event) {
    if (!gameActive) return;
    if (!controls.isLocked && event.target !== renderer.domElement) return;

    const mouse = new THREE.Vector2();
    if (controls.isLocked) {
        mouse.set(0, 0);
    } else {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    playShootSound();

    const gun = document.getElementById("gunHUD");
    if (gun) {
        gun.style.transform = "translateY(35px) scale(0.9) rotate(-6deg)";
        setTimeout(() => { gun.style.transform = "none"; }, 80);
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(targets);

    let targetPoint = new THREE.Vector3();
    if (intersects.length > 0) {
        targetPoint.copy(intersects[0].point);
    } else {
        raycaster.ray.at(40, targetPoint);
    }

    const originPoint = camera.position.clone();
    const offset = new THREE.Vector3(0.3, -0.4, -0.5).applyQuaternion(camera.quaternion);
    originPoint.add(offset);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([originPoint, targetPoint]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff }); 
    const laser = new THREE.Line(lineGeo, lineMat);
    scene.add(laser);

    setTimeout(() => {
        scene.remove(laser);
        lineGeo.dispose();
        lineMat.dispose();
    }, 60);

    if (intersects.length > 0) {
        const hitTarget = intersects[0].object;
        const data = hitTarget.userData;

        score += 10;
        timeLeft += 3; 

        const scoreElem = document.getElementById("score");
        const timerElem = document.getElementById("timerBoard");
        if(scoreElem) scoreElem.innerText = "⭐ Score : " + score;
        if(timerElem) timerElem.innerText = "⏳ ۋاقىت: " + timeLeft;

        const popup = document.getElementById("wordPopup");
        if (popup) {
            const arWord = document.getElementById("arabicWord");
            const uyWord = document.getElementById("uyghurWord");
            if(arWord) arWord.innerText = data.ar;
            if(uyWord) uyWord.innerText = data.uy;
            popup.style.display = "block";
        }

        speakArabic(data.ar);
        playExplosionSound();
        createExplosion(hitTarget.position);
        
        hitTarget.geometry.dispose();
        if (Array.isArray(hitTarget.material)) {
            hitTarget.material.forEach(m => { if(m.map) m.map.dispose(); m.dispose(); });
        } else {
            if (hitTarget.material.map) hitTarget.material.map.dispose();
            hitTarget.material.dispose();
        }

        scene.remove(hitTarget);
        targets = targets.filter(t => t !== hitTarget);

        setTimeout(spawnTarget, 1000);
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (gameActive) {
        skyTime += 0.001; 
        
        sunLight.position.x = Math.cos(skyTime) * 50 + 20;
        sunLight.position.y = Math.sin(skyTime) * 50 + 40;
        
        let cycle = (Math.sin(skyTime) + 1) / 2; 
        let dayColor = new THREE.Color(0xa3e2f7);   
        let nightColor = new THREE.Color(0x080b14); 
        
        scene.background.copy(dayColor).lerp(nightColor, 1 - cycle);
        if (scene.fog) {
            scene.fog.color.copy(dayColor).lerp(nightColor, 1 - cycle);
        }

        sunLight.intensity = cycle * 2.0;

        targets.forEach(t => {
            let currentSpeed = t.userData.speed * (1 + score * 0.006);
            t.position.x += currentSpeed * t.userData.direction;
            
            if (t.position.x > 14 || t.position.x < -14) {
                t.userData.direction *= -1;
            }
            
            t.position.y = t.userData.initialY + Math.sin(Date.now() * 0.003 + t.position.x) * 0.25;
            t.rotation.y += 0.012 * (1 + score * 0.003);
            t.rotation.x += 0.002;
        });
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.add(p.userData.velocity);
        p.userData.life--;
        if (p.userData.life <= 0) {
            p.geometry.dispose();
            p.material.dispose();
            scene.remove(p);
            particles.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}
function createCharacter(wordData) {
    const group = new THREE.Group();
    const type = Math.floor(Math.random() * 3); // 0: مېۋە, 1: ھايۋان, 2: قۇش
    
    if (type === 0) { // مېۋە - شار
        group.add(new THREE.Mesh(new THREE.SphereGeometry(1.2), new THREE.MeshStandardMaterial({color: 0xff4444})));
    } else if (type === 1) { // ھايۋان - سىلىندىر+شار
        group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2), new THREE.MeshStandardMaterial({color: 0x8B4513})));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshStandardMaterial({color: 0x8B4513}));
        head.position.y = 0.8;
        group.add(head);
    } else { // قۇش - كونۇس
        group.add(new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5), new THREE.MeshStandardMaterial({color: 0x3366ff})));
    }
    return group;
}

// 2. ئاۋازنى قوزغىتىش (ئىشلەتكۈچى چېكىش كېرەك)
function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(type === 'hit' ? 600 : 200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start(); osc.stop(audioCtx.currentTime + 0.2);
}
// مائۇسنىڭ ئورنىغا قول بىلەن چېكىش ئىقتىدارى
window.addEventListener("touchstart", (event) => {
    // چېكىلگەن ئورۇننى ئېلىش
    const touch = event.touches[0];
    const mouse = {
        x: (touch.clientX / window.innerWidth) * 2 - 1,
        y: -(touch.clientY / window.innerHeight) * 2 + 1
    };
    
    // ئېتىش فۇنكسىيەسىنى مۇشۇ ئورۇن بىلەن چاقىرىش
    shootAtPosition(mouse); 
});