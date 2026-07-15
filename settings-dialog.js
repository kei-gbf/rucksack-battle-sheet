

document.getElementById('openBtn')?.addEventListener('click', async () => {
    console.log("OPEN")
    
    const dialog = document.getElementById('settings-dialog');
    if (dialog) {
        dialog.showModal();
    }

});

class SettingDialogElement extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `        
            <dialog id="settings-dialog"><div class="card-container">
                <section class="card">
                    <h2>グラフ</h2>
                    MIN: <input id="graph-min" type="number" min="0" max="3000" step="100" value="0" />
                    MAX: <input id="graph-max" type="number" min="0" max="3000" step="100" value="1500" />
                    
                </section>
                <section class="card">
                    <h2>クリップボード</h2>
                    <label for="enable-copy-to-clipboard">
                        <p>入力ダイアログ 確定時に 以下の並びでクリップボードにコピーします。</p>
                        <p>用途: 外部スプレッドシートへの行貼付</p>
                        <input type="checkbox" id="enable-copy-to-clipboard" />
                    </label>
                    <input type="text" id="copy-rows" value="job,time,jw,w,rp,rank,totalRp,note" style="width:400px;"/>
                </section>
                <section class="card">
                    <h2>起動時設定</h2>
                    <label for="enable-tour-on-start">
                        <input id="enable-tour-on-start" type="checkbox" />
                        使い方の案内ダイアログを表示する。
                    </label>
                </section>
                <section class="card">
                    <h2>データベース削除</h2>
                    <div class="card-actions">
                        <p>誤操作防止の為「DELETE」と入力してください。</p>
                        <input type="text" id="confirm-delete-text" placeholder="DELETE" inputmode="latin" />
                        <button id="btn-delete-database" disabled>Delete</button>
                    </div>
                </section>
            </div></dialog>

        `;
    }
}
customElements.define('settings-dialog', SettingDialogElement);