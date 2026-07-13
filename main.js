
const channel = new BroadcastChannel('db_updates');


const PAGESIZE = 10;
const state = {
    offset: 0,
}
const ui = {
    nextBtn: document.querySelector('.next-btn'),
    prevBtn: document.querySelector('.prev-btn'),
    pageCount: document.querySelector('.page-count'),

    job: document.getElementById('job'),
    time: document.getElementById('time'),
    jw: document.getElementById('jw'),
    w: document.getElementById('w'),
    rp: document.getElementById('rp'),
    rank: document.getElementById('rank'),
    totalRp: document.getElementById('totalRp'),
    note: document.getElementById('note'),
};



// utility functions for css animation

function nextFrame() {
    return new Promise(requestAnimationFrame);
}


function transitionEnd(el){
    return new Promise(resolve=>{
        el.addEventListener("transitionend", resolve, {once:true});
        el.addEventListener("transitioncancel", resolve, {once:true});
    });
}

function _transitionEnd(el, {timeout = 300}) {
    return new Promise(resolve => {

        const done = () => {
            clearTimeout(timer);
            el.removeEventListener("transitionend", onEnd);
            resolve();
        };

        const onEnd = () => done();

        const timer = setTimeout(done, timeout);

        el.addEventListener("transitionend", onEnd, { once: true });
    });
}

// 最終版
function waitTransition(el, timeout = 300) {
    return new Promise(resolve => {

        const done = () => {
            clearTimeout(timer);
            el.removeEventListener("transitionend", onDone);
            el.removeEventListener("transitioncancel", onDone);
            resolve();
        };

        const onDone = () => done();

        const timer = setTimeout(done, timeout);

        el.addEventListener("transitionend", onDone, { once: true });
        el.addEventListener("transitioncancel", onDone, { once: true });
    });
}


let paging = false;

const _tbody = tbody = document.querySelector('#recordTable tbody');

async function changePage(direction, num) {
    // console.log("changePage", paging, direction, num)


    // console.trace("changePage");
    // console.log("enter", paging, performance.now());

    if (paging) {
        // console.log("blocked");

        return;
    }

    paging = true;
    // console.log("locked");

    try {
        switch (direction) {
        case "next":
            state.offset = Math.min((Number(ui.pageCount.dataset.maxPage)-1)*PAGESIZE, state.offset+num);
            break;
        case "prev":
            state.offset = Math.max(0, state.offset-num);
            break;
        }

        _tbody.classList.remove("slide-left", "slide-right");
        _tbody.classList.add(direction === "next" ? "slide-left" : "slide-right");

        // console.log("tbody", _tbody)

        // await transitionEnd(_tbody, {timeout: 300});
        // await transitionEnd(_tbody);
        await waitTransition(_tbody, 500);

        // console.log("transitionEnd")

        render();

        _tbody.classList.remove("slide-left", "slide-right");
        _tbody.classList.add(direction === "next" ? "slide-right" : "slide-left");

        await nextFrame();

    } finally {
        paging = false;
        // console.log("unlock")

        _tbody.classList.remove("slide-left", "slide-right");
    }

}


ui.nextBtn.addEventListener('click', async (e) => {
    // console.log("NEXT", state);
    await changePage("next", PAGESIZE);
})

ui.prevBtn.addEventListener('click', async (e) => {
    // console.log("PREV", state);
    await changePage("prev", PAGESIZE);
})


const db = new Dexie("RankMatchDB");
db.version(1).stores({ records: "++id, job, time, jw, w, rp, rank, totalRp, note" });
const jobs = ["ベルセルク", "クリュサオル", "シールド・スウォーン", "マナダイバー", "カオス・ルーダー", "黒猫導士", "エリュシオン", "ランバー・ジャック", "ライジング・フォース"];

async function resetRecord(force=false) {
    if (!force && !window.confirm("取り消し確認: 入力データをリセットします")) return;
    document.getElementById('jw').value =  0;
    document.getElementById('w').value =  0;
    document.getElementById('rp').value =  0;
    const now = new Date();
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').value = `${HH}:${mm}`;
}

async function saveRecord() {
    await db.records.add({
        job: document.getElementById('job').value,
        time: document.getElementById('time').value,
        jw: parseInt(document.getElementById('jw').value) || 0,
        w: parseInt(document.getElementById('w').value) || 0,
        rp: parseInt(document.getElementById('rp').value) || 0,
        rank: document.getElementById('rank').value,
        totalRp: parseInt(document.getElementById('totalRp').value) || 0,
        note: document.getElementById('note').value
    });
    render();
    resetRecord(true);


    channel.postMessage({ action: 'RELOAD_CHARTS' });
}

async function render() {

    const tbody = document.querySelector('#recordTable tbody');
    tbody.innerHTML = '';
    const records = await db.records.reverse().toArray();
    
    const dash = document.getElementById('dashboard');
    dash.innerHTML = '';
    for (let jobName of jobs) {
        const totalJw = records.filter(r => r.job === jobName).reduce((sum, r) => sum + r.jw, 0);
        const val = Math.min(10 + totalJw, 50);
        dash.innerHTML += `<div class="meter-box">${jobName}: ${val}<meter value="${val}" min="0" max="50"></meter></div>`;
    }
    
    records.slice(state.offset, state.offset+PAGESIZE).forEach(r => {
        tbody.innerHTML += `<tr class="${r.rp > 0 ? 'rp-w': r.rp < 0 ? 'rp-l' : 'rp-d'}"><td class="job job-${jobs.indexOf(r.job)+1}"><span>${r.job}</span></td><td>${r.time}</td><td>${r.jw} / ${r.w}</td><td class="col-rp">${r.rp}</td><td>${r.rank}</td><td>${r.totalRp}</td><td>${r.note}</td><td><button class="del-btn" onclick="deleteRecord(${r.id})">🗑️</button></td></tr>`;
    });

    // for next page block page over
    ui.pageCount.dataset.maxPage = Math.ceil(records.length/PAGESIZE);

    ui.pageCount.textContent = `${state.offset == 0 ? 1 : 1+Math.floor(state.offset/PAGESIZE)} / ${Math.ceil(records.length/PAGESIZE)} pages`
}

async function deleteRecord(id) {
    if (!window.confirm(`削除確認: データを消去します: ${id}`)) return;
    await db.records.delete(id);
    render();

    channel.postMessage({ action: 'RELOAD_CHARTS' });
}
render();

// ホイール操作
document.addEventListener('wheel', (e) => {
    if (e.target.type === 'number') { 
        e.preventDefault(); 
        let val = (parseFloat(e.target.value) || 0) + (e.deltaY > 0 ? -1 : 1);
        // RP欄以外は0未満にならないように制限
        if (e.target.id !== 'rp' && e.target.id !== 'totalRp') {
            val = Math.max(0, val);
        }
        e.target.value = val;
        e.target.dispatchEvent(new Event('input')); 
    }
}, { passive: false });