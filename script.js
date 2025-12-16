const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 설정
const TILE_SIZE = 40;
const SCREEN_WIDTH = 1200;
const SCREEN_HEIGHT = 800;

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// 키 상태 관리
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// 플레이어 초기 상태
const player = {
    x: 400,
    y: 300,
    speed: 3,
    color: '#e74c3c', // 빨간색 캐릭터
    width: TILE_SIZE * 0.8,
    height: TILE_SIZE * 0.8,
    direction: 'down'
};

// 맵 데이터 정의
const maps = {
    village: {
        width: 1200,
        height: 1200,
        backgroundColor: '#2ecc71', // 잔디색
        objects: [
            // 내 집 (House)
            { type: 'building', x: 100, y: 100, w: 120, h: 100, color: '#e67e22', name: '집' },
            // 도서관 (Library)
            { type: 'building', x: 400, y: 100, w: 160, h: 120, color: '#9b59b6', name: '도서관' },
            // 교실 (Classroom) - 집과 도서관 사이
            { type: 'building', x: 250, y: 100, w: 120, h: 100, color: '#2d3436', name: '경영관 33201호' },
            // 작업실 (Workshop)
            { type: 'building', x: 700, y: 100, w: 140, h: 100, color: '#34495e', name: '작업실' },
            // 광장 장식 (분수대 등) -> 광장
            { type: 'decoration', x: 400, y: 400, w: 80, h: 80, color: '#3498db', name: '광장' },
            // 나무들 (장식)
            { type: 'tree', x: 50, y: 300, w: 40, h: 60, color: '#27ae60' },
            { type: 'tree', x: 800, y: 300, w: 40, h: 60, color: '#27ae60' },
            { type: 'tree', x: 200, y: 500, w: 40, h: 60, color: '#27ae60' },
            { type: 'text', x: 800, y: 555, w: 0, h: 0, color: 'transparent', name: '산으로 가는 길', textColor: 'white' },
            // 포트폴리오 설명 텍스트 (마을 하단)
            {
                type: 'text', x: -60, y: 700, w: 1000, h: 0, color: 'transparent',
                textColor: 'white',
                name: "기업가정신개론 게임 포트폴리오 설명\n\n기본 조작 :\n방향키 및 스페이스바를 통해 npc, 물건과 상호작용\nesc키를 통해 상호작용 닫기(마우스로 닫기도 가능합니다)\n\n순서 : 장소(상호작용하는것)\n1.집(책상의 일기장) - 2.경영관 33201호 - 3.도서관(책) - 4.작업실(파란색 네모) -\n- 5.광장(npc에게 피드백 수집) - 6.집(침대)- 7.작업실(final project pc) - 8.산으로 가는길"
            }
        ],
        portals: [
            { x: 140, y: 195, w: 40, h: 20, target: 'house', spawnX: 400, spawnY: 500 }, // House bottom is 200
            { x: 460, y: 215, w: 40, h: 20, target: 'library', spawnX: 400, spawnY: 500 }, // Library bottom is 220
            { x: 750, y: 195, w: 40, h: 20, target: 'workshop', spawnX: 400, spawnY: 500 }, // Workshop bottom is 200
            { x: 395, y: 395, w: 90, h: 90, target: 'square', spawnX: 100, spawnY: 300 }, // 광장 영역 (90x90)

            // 교실 포탈 (위치 이동 및 충돌 수정)
            { x: 290, y: 195, w: 40, h: 20, target: 'classroom', spawnX: 400, spawnY: 500 }, // Classroom at 250, bottom 200

            // 산으로 가는 포탈 (위치 이동: 좌측으로)
            { x: 750, y: 550, w: 100, h: 50, target: 'mountain', spawnX: 50, spawnY: 400 }
        ]
    },
    // 다른 맵들은 기본값만 설정 (나중에 상세 구현)
    house: {
        width: 800,
        height: 600,
        backgroundColor: '#d35400', // 마룻바닥 색
        objects: [
            // 침대
            // 침대
            { type: 'furniture', x: 100, y: 100, w: 100, h: 150, color: '#e74c3c', name: 'Bed', interactive: true, action: 'checkSleep' },
            // 베개 (장식)
            { type: 'decoration', x: 110, y: 110, w: 60, h: 30, color: 'white' },
            // 책상
            { type: 'furniture', x: 600, y: 100, w: 140, h: 80, color: '#8e44ad', name: 'Desk' },
            // 일기장 (상호작용 중요)
            { type: 'item', x: 630, y: 110, w: 40, h: 30, color: '#f1c40f', name: 'SPACE바를 눌러 일기열기', interactive: true, action: 'openBrowser', url: 'diary.html', context: 'diary' }
        ],
        portals: [{ x: 380, y: 550, w: 40, h: 20, target: 'village', spawnX: 160, spawnY: 220 }]
    },
    library: {
        width: 800,
        height: 600,
        backgroundColor: '#8e44ad', // 보라색 계열 바닥
        objects: [
            // 책장들
            { type: 'furniture', x: 100, y: 100, w: 100, h: 200, color: '#ecf0f1', name: 'Bookshelf A' },
            { type: 'furniture', x: 350, y: 100, w: 100, h: 200, color: '#ecf0f1', name: 'Bookshelf B' },
            { type: 'furniture', x: 600, y: 100, w: 100, h: 200, color: '#ecf0f1', name: 'Bookshelf C' },
            // 열람실 책상
            { type: 'furniture', x: 250, y: 400, w: 300, h: 80, color: '#f39c12', name: 'Study Table' },
            // 빛나는 책 (상호작용) - Bookshelf B(x:350, y:100) 위로 이동
            { type: 'item', x: 380, y: 180, w: 40, h: 30, color: '#e74c3c', name: '시지프 신화? 한 번 읽어볼까?\nSPACE를 눌러 책 읽기', interactive: true, glow: true, action: 'openBrowser', url: 'ancient_book.html', context: 'ancient_book' }
        ],
        portals: [{ x: 380, y: 560, w: 40, h: 20, target: 'village', spawnX: 480, spawnY: 240 }]
    },
    workshop: {
        width: 800,
        height: 600,
        backgroundColor: '#7f8c8d', // 회색 콘크리트 느낌
        objects: [
            // 작업대들
            { type: 'furniture', x: 200, y: 150, w: 400, h: 80, color: '#3e2723', name: 'Grand Workbench' },
            // 공구함
            { type: 'furniture', x: 100, y: 400, w: 60, h: 80, color: '#c0392b', name: 'Toolbox' },
            // 기계 장치
            { type: 'machine', x: 600, y: 350, w: 100, h: 100, color: '#2c3e50', name: '3D Printer' },
            // 상호작용 가능한 청사진 -> 웹페이지
            { type: 'item', x: 350, y: 160, w: 40, h: 40, color: '#3498db', name: 'SPACE를 눌러 작업하기.', interactive: true, glow: true, textPosition: 'bottom', textColor: 'white', action: 'openBrowser', url: 'work.html', context: 'work' },
            // 최종 프로젝트 PC
            { type: 'machine', x: 600, y: 160, w: 50, h: 40, color: '#e74c3c', name: 'Final Project PC\n(Requires 4 Feedbacks)', interactive: true, glow: true, action: 'checkFinalProject' }
        ],
        portals: [{ x: 380, y: 560, w: 40, h: 20, target: 'village', spawnX: 770, spawnY: 220 }]
    },
    square: {
        width: 800,
        height: 600,
        backgroundColor: '#f1c40f', // 모래/광장 바닥 색
        objects: [
            // 안내 문구 (투명 오브젝트 + 텍스트)
            { type: 'text', x: 400, y: 80, w: 0, h: 0, color: 'transparent', name: '4명의 사람들에게 전부 피드백을 수집하세요.\nspace를 눌러 대화할 수 있습니다.', textColor: 'black' },
            // 중앙 분수대 (크기 축소: 입구 판정 범위 조정) -> 광장 중앙 조형물
            { type: 'decoration', x: 370, y: 270, w: 60, h: 60, color: '#3498db', name: 'Square' },
            // 벤치들
            { type: 'furniture', x: 150, y: 150, w: 80, h: 30, color: '#e67e22' },
            { type: 'furniture', x: 570, y: 150, w: 80, h: 30, color: '#e67e22' },
            // 사람들 (NPC)
            { type: 'npc', x: 200, y: 400, w: 32, h: 32, color: '#9b59b6', name: 'Friend 1', interactive: true, message: "피드백 : UX의 문제\n글이 너무 길어서 가독성이 안좋아 끝까지 읽기 힘들다.", item: '피드백1 메모', feedbackImage: 'pic/피드백1.png' },
            { type: 'npc', x: 250, y: 450, w: 32, h: 32, color: '#1abc9c', name: 'Friend 2', interactive: true, message: "피드백 : UI 문제점\n모바일기기에서 웹페이지 방문 시 레이아웃이 깨지는 현상", item: '피드백2 메모', feedbackImage: 'pic/피드백2.png' },
            { type: 'npc', x: 600, y: 300, w: 32, h: 32, color: '#34495e', name: 'Friend 3', interactive: true, message: "피드백 : 컨텐츠의 문제\n질문지 구성의 문제점, 애매모호한 질문지와 극단적인 글로 인해 안좋아 보이는 선택지가 보이게 되었다.", item: '피드백3 메모', feedbackImage: 'pic/피드백3.png' },
            { type: 'npc', x: 500, y: 500, w: 32, h: 32, color: '#e74c3c', name: 'Kay', interactive: true, message: "피드백 : 프로젝트에서 집중해야 할 부분\n게임의 작동보다는 텍스트 위주의 게임이 만들어지더라도, 어떤 질문을 구성하고 어떤 답변을 받을 것인지에 더 집중하는 것이 좋다.", item: 'Kay의 피드백', feedbackImage: 'pic/피드백4.jpg' }
        ],
        portals: [{ x: 0, y: 280, w: 20, h: 40, target: 'village', spawnX: 450, spawnY: 550 }]
    },
    classroom: {
        width: 800,
        height: 600,
        backgroundColor: '#2d3436', // 칠판 느낌의 어두운 배경
        objects: [
            // 강의탁/칠판 등 장식
            { type: 'furniture', x: 100, y: 50, w: 600, h: 20, color: '#636e72', name: 'Blackboard Frame' },
            { type: 'furniture', x: 350, y: 150, w: 100, h: 60, color: '#d35400', name: 'Lectern' },
            // NPC Kay (Non-interactive)
            { type: 'npc', x: 200, y: 200, w: 32, h: 32, color: '#0984e3', name: 'Kay' }
        ],
        // 집(140)과 도서관(460) 사이인 290 부근으로 스폰
        portals: [{ x: 380, y: 550, w: 40, h: 20, target: 'village', spawnX: 290, spawnY: 230 }]
    },
    mountain: {
        width: 1200,
        height: 800,
        backgroundColor: '#34495e', // 어두운 산 배경
        objects: [
            // 바위들
            { type: 'decoration', x: 200, y: 200, w: 80, h: 60, color: '#7f8c8d' },
            { type: 'decoration', x: 500, y: 100, w: 120, h: 100, color: '#7f8c8d' },
            { type: 'decoration', x: 800, y: 300, w: 60, h: 40, color: '#7f8c8d' },
            // 나무 (산속 느낌)
            { type: 'tree', x: 100, y: 500, w: 40, h: 60, color: '#2ecc71' },
            { type: 'tree', x: 900, y: 600, w: 40, h: 60, color: '#2ecc71' },
            // 추가된 나무들 (숲 느낌)
            { type: 'tree', x: 50, y: 100, w: 50, h: 70, color: '#27ae60' },
            { type: 'tree', x: 150, y: 50, w: 45, h: 65, color: '#2ecc71' },
            { type: 'tree', x: 300, y: 650, w: 50, h: 80, color: '#27ae60' },
            { type: 'tree', x: 550, y: 700, w: 60, h: 90, color: '#229954' },
            { type: 'tree', x: 750, y: 50, w: 50, h: 70, color: '#27ae60' },
            { type: 'tree', x: 1100, y: 200, w: 45, h: 60, color: '#2ecc71' },
            { type: 'tree', x: 1050, y: 700, w: 55, h: 75, color: '#229954' },
            { type: 'tree', x: 400, y: 400, w: 40, h: 50, color: '#27ae60' },
            { type: 'tree', x: 650, y: 250, w: 50, h: 70, color: '#2ecc71' },
            // 정상 혹은 뷰포인트 (시지프 느낌)
            { type: 'decoration', x: 1000, y: 100, w: 150, h: 150, color: '#95a5a6', name: '정상? (Top)' }
        ],
        portals: [
            { x: 0, y: 350, w: 20, h: 100, target: 'village', spawnX: 1100, spawnY: 100 } // 돌아가는 포탈
        ]
    }
};

// 현재 씬 (Map)
let currentScene = 'village';

// 카메라 (스크롤링)
const camera = { x: 0, y: 0 };

const contentModal = document.getElementById('content-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalImageContainer = document.getElementById('modal-image-container');
const modalImage = document.getElementById('modal-image');
const modalCloseBtn = document.getElementById('modal-close-btn');

const browserModal = document.getElementById('browser-modal');
const gameBrowser = document.getElementById('game-browser');
const browserCloseBtn = document.getElementById('browser-close-btn');



// UI 요소 복구
const interactionPrompt = document.getElementById('interaction-prompt');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const inventoryList = document.getElementById('inventory-list');

// 인벤토리 데이터
const inventory = [];

function addToInventory(item) {
    if (!inventory.includes(item)) {
        inventory.push(item);
        const li = document.createElement('li');
        li.textContent = item;
        inventoryList.appendChild(li);
        showDialogue(`[${item}]을(를) 획득했습니다!`);

        // Check if all feedback items are collected
        const requiredItems = ['피드백1 메모', '피드백2 메모', '피드백3 메모', 'Kay의 피드백'];
        const allCollected = requiredItems.every(i => inventory.includes(i));

        if (allCollected) {
            setTimeout(() => {
                showDialogue("피드백을 열심히 받았더니 피곤하다... 집으로 돌아가 자고 내일 최종 작업을 시작해야겠어.");
            }, 3000); // Wait for item message to stay a bit
        }
        return true;
    }
    return false;
}

let isPaused = false; // UI가 떴을 때 게임 멈춤용

// 입력 이벤트 리스너
window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        closeUI();
        return;
    }
    if (isPaused) return; // UI 열려있으면 조작 안됨
    if (e.code === 'Space') {
        const wasSpacePressed = keys.Space;
        keys.Space = true;
        if (!wasSpacePressed) handleInteraction();
    } else if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

// Modal/Browser Close Logic
modalCloseBtn.addEventListener('click', closeUI);
browserCloseBtn.addEventListener('click', closeUI);

// 마지막 상호작용 컨텍스트 저장
let lastInteraction = null;

function closeUI() {
    contentModal.classList.add('hidden');
    browserModal.classList.add('hidden');
    gameBrowser.src = ""; // Stop iframe loading
    isPaused = false;

    // 상호작용 종료 후 콜백 처리
    if (lastInteraction === 'diary') {
        addToInventory('일기장');
        showDialogue("기업가정신개론 수업시간이다. 수업들으러 가보자");
        lastInteraction = null; // Reset
    } else if (lastInteraction === 'classroom') {
        addToInventory('아이디어 메모장');
        showDialogue("여전히 어렵다 자기혁신 프로젝트를 어떻게 할까. 도서관에 가서 책을 읽어보자");
        lastInteraction = null;
    } else if (lastInteraction === 'ancient_book') {
        addToInventory('시지프 신화 책');
        showDialogue("좋았어. 시지프 신화를 모티브로한 게임을 만들어보는거야. 작업실로 가서 작업을 시작하자!");
        lastInteraction = null;
    } else if (lastInteraction === 'ancient_book') {
        addToInventory('시지프 신화 책');
        showDialogue("좋았어. 시지프 신화를 모티브로한 게임을 만들어보는거야. 작업실로 가서 작업을 시작하자!");
        lastInteraction = null;
    } else if (lastInteraction === 'work') {
        addToInventory('qr코드');
        showDialogue("좋았어! qr코드를 가지고 광장으로 가서 친구들에게 가서 한번 피드백을 받아보자.");
        lastInteraction = null;
    } else if (lastInteraction === 'final_project') {
        showDialogue("완성했다. 이제 마을을 나가보자.\n아직 길은 찾지 못했지만, 나아갈 힘은 충분히 얻은 것 같아.\n이제 다시 앞으로 나아갈 차례야.");
        lastInteraction = null;
    }
}

function handleInteraction() {
    let checkX = player.x + player.width / 2;
    let checkY = player.y + player.height / 2;
    let reach = 100; // 상호작용 거리 대폭 증가

    // Interaction Box (Rectangle)
    const interactionBox = {
        x: player.x,
        y: player.y,
        w: player.width,
        h: player.height
    };

    if (player.direction === 'up') { interactionBox.y -= reach; interactionBox.h = reach; }
    if (player.direction === 'down') { interactionBox.y += player.height; interactionBox.h = reach; }
    if (player.direction === 'left') { interactionBox.x -= reach; interactionBox.w = reach; }
    if (player.direction === 'right') { interactionBox.x += player.width; interactionBox.w = reach; }

    const map = maps[currentScene];
    let found = false;

    // 오브젝트 상호작용 체크 (영역 겹침)
    for (const obj of map.objects) {
        if (obj.interactive && checkCollision(interactionBox, obj)) {

            if (obj.action === 'openModal') {
                openModal(obj.title, obj.content);
            } else if (obj.action === 'openBrowser') {
                openBrowser(obj.url, obj.context); // Pass context
            } else if (obj.action === 'checkFinalProject') {
                checkFinalProject();
            } else if (obj.action === 'checkSleep') {
                checkSleep();
            } else {
                // 아이템 지급 로직
                if (obj.item) {
                    addToInventory(obj.item);
                }

                // 피드백 이미지가 있으면 모달로 띄우기, 아니면 대화창
                if (obj.feedbackImage) {
                    openModal(obj.name + '의 피드백', obj.message, obj.feedbackImage);
                } else {
                    showDialogue(obj.message);
                }
            }

            found = true;
            break;
        }
    }
}



function openModal(title, content, imageUrl = null) {
    modalTitle.textContent = title;
    // 줄바꿈 처리
    modalBody.innerHTML = content.replace(/\n/g, '<br>');

    if (imageUrl) {
        modalImage.src = imageUrl;
        modalImageContainer.classList.remove('hidden');
    } else {
        modalImageContainer.classList.add('hidden');
    }

    contentModal.classList.remove('hidden');
    isPaused = true; // Pause game input
}

function openBrowser(url, contextId) {
    gameBrowser.src = url;
    browserModal.classList.remove('hidden');
    isPaused = true;
    lastInteraction = contextId; // Set context
}

function checkFinalProject() {
    const requiredItems = ['피드백1 메모', '피드백2 메모', '피드백3 메모', 'Kay의 피드백'];
    const missingItems = requiredItems.filter(item => !inventory.includes(item));

    if (missingItems.length === 0) {
        openBrowser('final_project.html', 'final_project');
    } else {
        showDialogue(`피드백이 부족해... (${missingItems.length}개 남음)`);
    }
}

function checkSleep() {
    const requiredItems = ['피드백1 메모', '피드백2 메모', '피드백3 메모', 'Kay의 피드백'];
    const allCollected = requiredItems.every(item => inventory.includes(item));

    if (allCollected) {
        openBrowser('sleep.html', 'sleep');
    } else {
        showDialogue("아직 잠이 오지 않는다. 할 일이 더 남았어.");
    }
}

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        keys.Space = false;
    } else if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});



function showDialogue(text) {
    dialogueText.textContent = text;
    dialogueBox.classList.remove('hidden');
    setTimeout(() => {
        dialogueBox.classList.add('hidden');
    }, 3000);
}

// Update loop에서 isPaused 체크
function update() {
    if (isPaused) return; // Pause game logic

    let moving = false;
    let nextX = player.x;
    let nextY = player.y;

    // 플레이어 이동 로직
    if (keys.ArrowUp) { nextY -= player.speed; player.direction = 'up'; moving = true; }
    if (keys.ArrowDown) { nextY += player.speed; player.direction = 'down'; moving = true; }
    if (keys.ArrowLeft) { nextX -= player.speed; player.direction = 'left'; moving = true; }
    if (keys.ArrowRight) { nextX += player.speed; player.direction = 'right'; moving = true; }

    // 현재 맵 데이터
    const map = maps[currentScene];

    // 맵 경계 체크
    if (nextX < 0) nextX = 0;
    if (nextY < 0) nextY = 0;
    if (nextX > map.width - player.width) nextX = map.width - player.width;
    if (nextY > map.height - player.height) nextY = map.height - player.height;

    // 충돌 체크 (건물 등) - 간단히 박스 충돌
    let collided = false;
    for (const obj of map.objects) {
        if (checkCollision({ x: nextX, y: nextY, w: player.width, h: player.height }, obj)) {
            collided = true;
            break;
        }
    }

    if (!collided) {
        player.x = nextX;
        player.y = nextY;
    }

    // 포탈 체크
    for (const portal of map.portals) {
        if (checkCollision({ x: player.x, y: player.y, w: player.width, h: player.height }, portal)) {
            switchScene(portal.target, portal.spawnX, portal.spawnY);
            return;
        }
    }

    // 카메라 업데이트 (플레이어를 중앙에)
    camera.x = player.x - SCREEN_WIDTH / 2 + player.width / 2;
    camera.y = player.y - SCREEN_HEIGHT / 2 + player.height / 2;

    // 카메라 경계 체크
    if (camera.x < 0) camera.x = 0;
    if (camera.y < 0) camera.y = 0;
    if (camera.x > map.width - SCREEN_WIDTH) camera.x = map.width - SCREEN_WIDTH;
    if (camera.y > map.height - SCREEN_HEIGHT) camera.y = map.height - SCREEN_HEIGHT;
}

function switchScene(sceneName, spawnX, spawnY) {
    if (!maps[sceneName]) return; // 없는 맵 방어
    console.log(`Switching to ${sceneName}`);
    currentScene = sceneName;
    player.x = spawnX;
    player.y = spawnY;

    // showDialogue(`${sceneName}에 도착했습니다.`); // User requested to remove this

    // 교실 진입 시 바로 글 보여주기
    if (sceneName === 'classroom') {
        setTimeout(() => {
            openBrowser('classroom.html', 'classroom');
        }, 500); // 0.5초 뒤 자동 실행
    } else if (sceneName === 'mountain') {
        setTimeout(() => {
            openBrowser('reflection.html', 'reflection');
        }, 500);
    }
}

function checkCollision(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y);
}

function draw() {
    const map = maps[currentScene];

    // 배경
    ctx.fillStyle = map.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 전체 덮고 시작

    // 카메라 적용을 위해 save/restore
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 실제 맵 배경 그리기 (맵 크기만큼)
    ctx.fillStyle = map.backgroundColor;
    ctx.fillRect(0, 0, map.width, map.height);

    // 격자 (개발용, 맵 크기만큼)
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    for (let x = 0; x < map.width; x += TILE_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, map.height); ctx.stroke();
    }
    for (let y = 0; y < map.height; y += TILE_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(map.width, y); ctx.stroke();
    }

    // 오브젝트 그리기
    for (const obj of map.objects) {
        // 투명하지 않은 경우에만 본체와 그림자 그리기
        if (obj.color !== 'transparent') {
            ctx.fillStyle = obj.color;
            // 그림자
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(obj.x + 5, obj.y + 5, obj.w, obj.h);

            // 본체
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }

        // 이름 표시
        if (obj.name) {
            ctx.font = '14px Courier';
            ctx.textAlign = 'center';

            const lines = obj.name.split('\n');
            lines.forEach((line, index) => {
                let fillStyle = 'white';
                let font = '14px Courier';

                if (obj.textColor) {
                    fillStyle = obj.textColor;
                    if (obj.textColor === 'white') font = 'bold 14px Courier';
                } else if (line.includes('SPACE') || line.includes('시지프')) {
                    fillStyle = 'black';
                    font = 'bold 14px Courier';
                }

                ctx.fillStyle = fillStyle;
                ctx.font = font;

                let yPos;
                if (obj.textPosition === 'bottom') {
                    // Draw downwards from bottom
                    yPos = obj.y + obj.h + 15 + (index * 15);
                } else {
                    // Draw upwards from top (standard)
                    yPos = obj.y - 5 - (lines.length - 1 - index) * 15;
                }

                ctx.fillText(line, obj.x + obj.w / 2, yPos);
            });
        }

        // Glow Effect
        if (obj.glow) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'yellow';
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
            ctx.shadowBlur = 0; // Reset

            // 반짝이는 애니메이션 (Optional)
            const time = Date.now() / 500;
            const alpha = 0.5 + Math.sin(time) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }
    }

    // 포탈 표시 (디버그용, 혹은 시각적 힌트)
    for (const portal of map.portals) {
        // 포탈 영역 표시 (개발 중에는 보이게, 나중엔 숨길 수도 있음)
        // 입구 느낌
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(portal.x, portal.y, portal.w, portal.h);
    }

    // 플레이어 그리기
    drawPlayer();

    ctx.restore();

    // UI 정보 (Scene Name)
    ctx.fillStyle = 'white';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Map: ${currentScene.toUpperCase()}`, 10, 30);
    ctx.fillText(`Pos: ${Math.round(player.x)}, ${Math.round(player.y)}`, 10, 55);
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 눈 그리기 (방향 확인용)
    ctx.fillStyle = 'white';
    let eyeOffsetX = 0, eyeOffsetY = 0;
    if (player.direction === 'up') eyeOffsetY = -5;
    if (player.direction === 'down') eyeOffsetY = 5;
    if (player.direction === 'left') eyeOffsetX = -5;
    if (player.direction === 'right') eyeOffsetX = 5;

    // 외곽선
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    ctx.fillRect(player.x + player.width / 2 - 8 + eyeOffsetX, player.y + 10 + eyeOffsetY, 5, 5);
    ctx.fillRect(player.x + player.width / 2 + 3 + eyeOffsetX, player.y + 10 + eyeOffsetY, 5, 5);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// 게임 시작
loop();
