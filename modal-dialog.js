
// 設定フラグ
const DEBUG_MODE = true; 

let stack = [];
const MAX_LIFE = 5;

function updateUI() {
    const wins = stack.filter(x => x === 'win').length;
    const loses = stack.filter(x => x === 'lose').length;
    const currentLife = Math.max(0, MAX_LIFE - loses);
    // JW計算: 5戦目以降の勝利数
    // stackのインデックス4（＝5戦目）以降の 'win' を数える
    const jw = stack.slice(5-1).filter(s => s === 'win').length;

    // デバッグ表示の切り替え
    const debugEl = document.getElementById('debugStack');
    if (DEBUG_MODE) {
        debugEl.style.display = 'block';
        debugEl.innerHTML = `JW: ${jw} ` + "Stack: " + stack.map(x => 
            x === 'win' ? '<span class="win">★</span>' : '<span class="lose-disabled">❤</span>'
        ).join('');
    } else {
        debugEl.style.display = 'none';
    }

    document.getElementById('winCounter').innerHTML = 
        Array.from({length: 10}, (_, i) => `<span class="${i < wins ? 'win' : 'win-disabled'}">★</span>`).join('');
    
    document.getElementById('loseCounter').innerHTML = 
        Array.from({length: MAX_LIFE}, (_, i) => `<span class="${i < currentLife ? 'lose' : 'lose-disabled'}">❤</span>`).reverse().join('');
}

function addResult(type) {
    // 1. 各タイプの現在の数を取得
    const currentWins = stack.filter(s => s === 'win').length;
    const currentLoses = stack.filter(s => s === 'lose').length;

    // 2. 上限チェック (ガード節)
    if (currentWins >= 10 || currentLoses >= 5) return;

    stack.push(type); updateUI(); }
function undo() { stack.pop(); updateUI(); }

function startGame() {
    if (stack.length >= 14) {
        stack = [];
    }
    updateUI();

    const dialog = document.getElementById('gameDialog');
    dialog.showModal();
    return new Promise((resolve) => { 
        dialog.addEventListener('close', (e) => {
            const ok = dialog.returnValue === 'ok';
            resolve({ ok, stack })
            dialog.returnValue = '';
        }, {once: true})
    });
}

function closeDialog(ok) {
    const dialog = document.getElementById('gameDialog');
    dialog.returnValue = ok ? 'ok' : '';
    dialog.close();
}

document.getElementById('openBtn')?.addEventListener('click', async () => {
    const res = await startGame();
    if (res.ok) console.log("結果:", res.stack);
});

class ModalDialogElement extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `

            <dialog id="gameDialog">
                <div class="modal-header">
                    <button class="icon-btn" onclick="undo()" title="取り消し">↩</button>
                    <button class="icon-btn" onclick="closeDialog(false)" title="閉じる">✕</button>
                </div>
                
                <div class="debug-stack" id="debugStack" style="display: none;"></div>

                <div class="counter-row" id="winCounter"></div>
                <div class="counter-row life-row" id="loseCounter"></div>
                
                <div class="action-row">
                    <button class="btn-lose" onclick="addResult('lose')">Lose</button>
                    <button class="btn-win" onclick="addResult('win')">Win</button>
                </div>
                <button class="main-btn confirm-btn" onclick="closeDialog(true)">確定</button>
            </dialog>
        `
    }
}
customElements.define("modal-dialog", ModalDialogElement);