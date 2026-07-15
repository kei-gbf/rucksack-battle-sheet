
// TODO: import driverjs as module
// TODO: use import for dexie and charts
// TODO: show tour guide (generate from list of steps)
// 

function createLabelCheckbox(message, checked, func) {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginTop = '10px';
    label.style.fontSize = '12px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.marginRight = '5px';
    checkbox.checked = !checked;
    
    checkbox.addEventListener('change', (e) => {
        func(e.target.checked);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(message));

    return label;
}


const _siteTourSteps = [
    { element: 'header.main-header',
        popover: {
        title: 'メニュー・アイコンの説明',
        description: '',
        side: 'bottom',
        align: 'end',
        }
    },

    { element: 'header.main-header #btn-show-dialog',
        popover: {
        title: '入力支援ダイアログ を開く',
        description: 'ゲーム開始時に、メニューのアイコンもしくは、F キーにより入力ダイアログを開きます。',
        side: 'bottom',
        align: 'end',
        showButtons: [],
        }
    },
    { element: '#gameDialog',
        popover: {
        title: '入力支援ダイアログ',
        description: '',
        side: 'top',
        align: 'start',
        showButtons: []
        }
    },


    { element: 'header.main-header #btn-show-dialog',
        popover: {
        title: '入力支援ダイアログ',
        description: '勝敗入力のダイアログを開きます。<br>F キーでショートカット',
        side: 'bottom',
        align: 'end',
        }
    },
    { element: 'header.main-header #btn-show-graph',
        popover: {
        title: 'グラフ表示 (ページ内)',
        description: 'ランク推移と(ジョブ変後)勝利数を開きます。<br>G キーでショートカット',
        side: 'bottom',
        align: 'end',
        }
    },
    { element: 'header.main-header #btn-show-settings',
        popover: {
        title: '設定画面表示',
        description: 'S キーでショートカット',
        side: 'bottom',
        align: 'end',
        }
    },
    { element: '.dashboard',
        popover: {
        title: 'Dashboardの説明',
        description: '称号用。ジョブ変更後の勝利数カウント',
        }
    },
    { element: '.form-group',
        popover: {
        title: '入力欄',
        description: 'データは自己申告制(手入力)です。<br>ダイアログで集計したデータはここへ入力されます。<br>修正が必要な場合は手作業で',
        }
    },
    { element: '.form-group #job',
        popover: {
        title: '入力欄: ジョブ',
        description: '5戦目に選択したジョブ。途中リタイアは未対応',
        }
    },

    { element: '.form-group #time',
        popover: {
        title: '入力欄: 時刻',
        description: '開始時間を想定。<br>連戦想定なので、記録時に現在時間が次の開始時間として設定されます。<br>日付は記録しません。直近の頻度確認。',
        }
    },
    { element: '.form-group #jobwin',
        popover: {
        title: '入力欄: ジョブ変後の勝利数',
        description: '入力ダイアログにより自動入力。<br>データの手動調整が必要な場合は、手入力でマイナスも出来ます。',
        }
    },
    { element: '.form-group #win',
        popover: {
        title: '入力欄: トータル勝利数',
        description: '',
        }
    },
    { element: '.form-group #score',
        popover: {
        title: '入力欄: 獲得ポイント',
        description: '個々の収支を実質の勝敗として 赤緑 表記を振り分けます。',
        }
    },
    { element: '.form-group #rank',
        popover: {
        title: '入力欄: 現在ランク',
        description: 'マッチ後の現在ランク',
        }
    },
    { element: '.form-group #point',
        popover: {
        title: '入力欄: ランクポイント',
        description: 'マッチ後の最終ポイント',
        }
    },
    { element: '.form-group #note',
        popover: {
        title: '入力欄: メモ',
        description: 'データ調整の記録時にメモを残せます',
        }
    },
    // TODO: 記録
    // TODO: 取消

    // TODO: open input dialog
    
];


const siteTourSteps = [
    { element: '#job',
        popover: {
        title: 'ジョブの選択',
        description: 'まずは使用するジョブを選択。<br>後から変更も可能です',
        }
    },
    { element: '#time',
        popover: {
        title: '時刻の入力',
        description: '開始時刻を入力。日付は記録しません。<br><br>グラフ集計には使われず、<br>直近の頻度を把握する程度。',
        }
    },
    { element: '#btn-show-dialog',
        popover: {
        title: '入力支援ダイアログを開く',
        description: 'メニューアイコンもしくは F キーによりダイアログを開く。',
        showButtons: [],
        }
    },
    { element: '#gameDialog',
        popover: {
        title: '入力支援ダイアログ',
        description: 'lose / win を何度か押して、確定。',
        showButtons: [],
        }
    },
    { element: '.form-group',
        popover: {
        title: 'データベースへ追加',
        description: '「記録」ボタンでデータベースへ追加。<br>入力内容に誤りがある場合はここで修正。<br>ブラウザ内に保存されます。<br>プライバシーモードでは<br>短期間でデータが消えるので注意',
        showButtons: [],
        side: 'top',
        align: 'end',
        }
    },
    { element: '.form-group',
        popover: {
        title: '1ゲーム終了',
        description: '連戦想定なので、現在時間が次の開始時刻に設定されます。<br><br>以上で、基本的な使い方の説明終わり。',
        showButtons: [],
        side: 'bottom',
        align: 'center',
        }
    },

];

const welcomPopover = {
    popover: {
        title: "welcome",
        description: "使い方説明を見る",
        // onPopoverRender でチェックボックスを追加
        onPopoverRender: (popover, { config, state }) => {
            const footer = popover.wrapper.querySelector('.driver-popover-footer');
            const description = popover.wrapper.querySelector('.driver-popover-description');
            
            // チェックボックス用ラベルを作成
            const label = createLabelCheckbox(' 次回以降このダイアログを表示しない',
                settings.enableTourOnStart,
                (checked) => {
                settings.update({
                    enableTourOnStart: !checked
                });
                updateSettingsDialog();
            });

            // footer.prepend(label); // ボタンエリアの上に追加
            // label.after(description) // XXX: label is not mounted on DOM yet
            popover.wrapper.appendChild(label);
        }
    }
};


// Site tour
const driverObj = driver.js.driver();
if (0) {

    const driverObj = driver.js.driver();
    settings.enableTourOnStart && driverObj.highlight({
        ...welcomPopover
    });
}
if (1) {
    driverObj.setConfig({
        showProgress: false,
        steps: [
            {...welcomPopover},
            ...siteTourSteps,
        ]
    });
    settings.enableTourOnStart && driverObj.drive();
}
