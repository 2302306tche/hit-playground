const gameArea = document.getElementById("gameArea");
const target = document.getElementById("target");

const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");

const startButton = document.getElementById("startButton");
const message = document.getElementById("message");

let score = 0;
let time = 30;

let timer = null;
let playing = false;


// 목표물을 랜덤 위치로 이동
function moveTarget() {

    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    const targetSize = target.offsetWidth;

    const x =
        Math.random() *
        (areaWidth - targetSize) +
        targetSize / 2;

    const y =
        Math.random() *
        (areaHeight - targetSize) +
        targetSize / 2;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
}


// 게임 시작
function startGame() {

    if (playing) {
        return;
    }

    playing = true;

    score = 0;
    time = 30;

    scoreText.textContent = score;
    timeText.textContent = time;

    target.style.display = "block";

    startButton.textContent = "게임 진행 중...";
    startButton.disabled = true;

    message.textContent =
        "🎯 목표물을 클릭해서 점수를 올려보세요!";

    moveTarget();

    timer = setInterval(() => {

        time--;

        timeText.textContent = time;

        if (time <= 0) {
            endGame();
        }

    }, 1000);
}


// 목표물 클릭
target.addEventListener("click", (event) => {

    event.stopPropagation();

    if (!playing) {
        return;
    }

    score++;

    scoreText.textContent = score;

    moveTarget();
});


// 게임 영역 클릭
gameArea.addEventListener("click", () => {

    if (!playing) {
        return;
    }

    message.textContent =
        "❌ 빗나갔어요! 목표물을 클릭하세요.";
});


// 게임 종료
function endGame() {

    playing = false;

    clearInterval(timer);

    target.style.display = "none";

    startButton.textContent = "다시 시작";
    startButton.disabled = false;

    message.textContent =
        `게임 종료! 최종 점수는 ${score}점입니다.`;
}


// 시작 버튼
startButton.addEventListener("click", startGame);
