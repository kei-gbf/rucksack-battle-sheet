const db = new Dexie(DBNAME);

db.version(1).stores({ records: "++id, job, time, jw, w, rp, rank, totalRp, note" });

db.version(2).stores({
  records: "++id, job, jobwin, win, score, rank, point, note"
}).upgrade(tx => {
  // version(2) でリネームと役割の明確化
  return tx.table('records').toCollection().modify(record => {
    record.jobwin = record.jw;
    record.win = record.w;
    record.point = record.totalRp;
    record.score = record.rp; // rp から score へ

    delete record.jw;
    delete record.w;
    delete record.totalRp;
    delete record.rp;
  });
});


/**
 * DexieテーブルからCSVファイルを生成してダウンロードする関数
 * @param {Dexie.Table} table - Dexieのテーブルインスタンス
 * @param {string} fileName - 保存するファイル名 (例: 'data.csv')
 */
async function exportTableToCSV(table, fileName = 'export.csv') {
  // 1. データを全件取得
  const data = await table.toArray();
  if (data.length === 0) {
    console.log('データがありません');
    return;
  }

  // 2. CSVヘッダーの作成 (オブジェクトのキーから取得)
  const headers = Object.keys(data[0]).filter(x => x != "id");
  const csvRows = [];
  csvRows.push(headers.join(','));

  // 3. データの変換
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : row[header];
      // カンマや改行が含まれる場合の簡易エスケープ処理
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // 4. Blobを作成してダウンロード
  const blob = new Blob([['\ufeff', csvRows.join('\n')].join('')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 呼び出し例:
// exportTableToCSV(db.friends, 'friends_data.csv');


/**
 * CSVファイルを選択してデータベースに一括インポートする
 * @param {Event} event - input要素のchangeイベント
 * @param {Dexie.Table} table - Dexieのテーブルインスタンス
 * 
 * 
 * 実行用のイベントリスナー設定
    document.getElementById('file-input').addEventListener('change', (e) => {
      importCSVToTable(e, db.friends); // ここを対象のテーブルに変更
    });
 */
async function importCSVToTable(event, table) {
  const file = event.target.files[0];
  if (!file) return;

  return new Promise((resolve) => {

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // ヘッダー行を取得
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        // XXX: 

        // データ行をオブジェクト配列に変換
        const items = lines.slice(1).map(line => {
        // カンマ分割用の簡易パース（ダブルクォーテーション内カンマに対応）
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
                            .map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        let item = {};
        headers.forEach((header, index) => {
            item[header] = values[index];
        });
        return item;
        });

        const _conv = (r) => ({
            // id: Number(r.id),
            score: Number(r.score),
            point: Number(r.point),
            jobwin: Number(r.jobwin),
            win: Number(r.win),
            rank: r.rank,
            job: r.job,
            note: r.note,
            time: r.time,
        });

        try {
        // 一括追加
        // await table.bulkAdd(items);
            for (const item of items.map(_conv)) {
                await table.add(item);
            }
        console.log(`${items.length} 件のデータをインポートしました！`);
        } catch (err) {
        console.error('インポートエラー:', err);
        console.log('インポートに失敗しました。データ形式を確認してください。');
        }
        resolve();
    };
    reader.readAsText(file); // 文字コード等で化ける場合は encoding 指定が必要
  });
}
