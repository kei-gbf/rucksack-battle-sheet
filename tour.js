// TODO: load from index.html
// TODO: import driverjs as module
// TODO: use import for dexie and charts
// TODO: show tour guide (generate from list of steps)
// 

function createLabelCheckbox(message) {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginTop = '10px';
    label.style.fontSize = '12px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.marginRight = '5px';
    
    checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        localStorage.setItem(STORAGE_KEY, 'true');
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(message));

    return label;
}


const siteTour = {
    showProgress: true,
    steps: [
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
            title: '入力支援ダイアログ',
            description: '勝敗入力のダイアログを開きます。<br>Fキーでショートカット',
            side: 'bottom',
            align: 'end',
            }
        },
        { element: 'header.main-header #btn-show-graph',
            popover: {
            title: 'グラフ表示 (ページ内)',
            description: 'ランク推移と(ジョブ変後)勝利数を開きます。<br>キーでショートカット',
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
        }
    ]
};

// TODO: localStorage flag enableWelcomeTour

// Site tour
// const driverObj = driver.js.driver()
0 && driverObj.highlight({
    popover: {
        title: "Welcome",
        description: "初回起動",
        // onPopoverRender でチェックボックスを追加
        onPopoverRender: (popover, { config, state }) => {
            const footer = popover.wrapper.querySelector('.driver-popover-footer');
            const description = popover.wrapper.querySelector('.driver-popover-description');
            
            // チェックボックス用ラベルを作成
            const label = createLabelCheckbox(' 次回以降表示しない');

            // footer.prepend(label); // ボタンエリアの上に追加
            // label.after(description) // XXX: label is not mounted on DOM yet
            popover.wrapper.appendChild(label);

        }
    }
})
