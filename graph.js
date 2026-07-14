// chart plugin
    // Chart.js本体の後にこの記述を追加
//Chart.register(ChartDataLabels);

// ここが「今動いているグラフの管理台帳」になります
let rankChartInstance = null;
let jobChartInstance = null;


async function renderChart() {
    if (rankChartInstance) rankChartInstance.destroy();
    if (jobChartInstance) jobChartInstance.destroy();


    const records = await db.records.toArray();

    const data = records.map(r => [0,100,300,600,1000]["DCBAS".indexOf(r.rank)] + r.totalRp)

    // const data = records.map(r => (r.rank === 'S') ? (r.totalRp || 0) + 400 : (r.totalRp || 0));
    
    const dataJw = records.map(r => r.jw);



    // --- 2. ジョブ別勝率の計算 ---
    const jobStats = records.reduce((acc, r) => {
        if (!acc[r.job]) acc[r.job] = { wins: 0, draws: 0, losses: 0 };
            
        if (r.rp > 0) {
            acc[r.job].wins++;
        } else if (r.rp < 0) {
            acc[r.job].losses++;
        } else {
            acc[r.job].draws++; // RP増減なしをドローと定義
        }
        return acc;
    }, {});

    const jobLabels = Object.keys(jobStats);
    const winRates = jobLabels.map(job => (jobStats[job].wins / jobStats[job].total) * 100);

    const winCounts = jobLabels.map(job => jobStats[job].wins);
    const drawData = jobLabels.map(job => jobStats[job].draws);
    const lossCounts = jobLabels.map(job => jobStats[job].losses);
    // 全試合 - 勝ち数 = 負け数

    const ctx = document.getElementById('rankChart').getContext('2d');
    
    rankChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: records.map((_, i) => i + 1),
            datasets: [
                {
                    label: 'RP PERFORMANCE',
                    data: data,
                    borderColor: '#00d4ff', // サイバーシアン
                    backgroundColor: 'rgba(0, 212, 255, 0.05)',
                    borderWidth: 2,
                    pointBackgroundColor: '#00d4ff',
                    pointRadius: 4,
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'JW Count',
                    type: 'bar', // 棒グラフ
                    data: dataJw,
                    backgroundColor: 'rgba(0, 212, 255, 0.3)', // 薄い水色
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // ★重要：アスペクト比を固定しない
            plugins: {
                legend: { display: false },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 1000, yMax: 1000,
                            borderColor: '#58a6ff',
                            borderWidth: 1,
                            borderDash: [4, 4],
                            label: { 
                                display: true, 
                                content: 'S RANK', 
                                backgroundColor: 'transparent',
                                color: '#58a6ff',
                                position: 'start'
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: settings.graphMin,
                    max: settings.graphMax,
                    ticks: { 
                        color: '#8b949e',
                        stepSize: 100,
                        callback: value => (value >= 1000 ? `S ${value - 1000}` : (value >= 600) ? `A ${value - 600}` : (value >= 300) ? `B ${value - 300}` : (value >= 100) ? `C ${value - 100}` : `D ${value}`)
                    },
                    grid: { color: '#30363d' }
                },
                y1: {
                    position: 'right',
                    min: 0, max: 10, // 最大10勝なので固定すると見やすい
                    title: { text: 'JW count per run' }
                },
                x: { 
                    ticks: { color: '#8b949e' }, 
                    grid: { color: '#30363d' } 
                }
            }
        }
    });

    // ジョブ別勝率の棒グラフ
    if (0) {
        jobChartInstance = new Chart(document.getElementById('jobChart'), {
            type: 'bar',
            data: {
                labels: jobLabels,
                datasets: [{
                    label: 'WIN RATE (%)',
                    data: winRates,
                    backgroundColor: '#00d4ff',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y', // 横棒グラフにすると見やすい
                scales: {
                    x: { min: 0, max: 100, ticks: { color: '#8b949e' }, grid: { color: '#30363d' } },
                    y: { ticks: { color: '#c9d1d9' }, grid: { display: false } }
                },
                plugins: { legend: { labels: { color: '#ece8e1' } } }
            }
        });
    }

    jobChartInstance = new Chart(document.getElementById('jobChart'), {
        type: 'bar',
        data: {
            labels: jobLabels,
            datasets: [
                { label: 'WIN', data: winCounts, backgroundColor: '#00d4ff' }, // 勝数
                { label: 'DRAW', data: drawData, backgroundColor: '#768087' }, // 追加
                { label: 'LOSS', data: lossCounts, backgroundColor: '#30363d' }, // 負数

            ]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { stacked: true }, // ここが「同時に見る」ための設定
                y: { stacked: true }
            },
            /*
            plugins: {
                datalabels: {
                    anchor: 'end', // 棒の端に表示
                    align: 'right', // 棒の右側に配置
                    color: '#ece8e1',
                    formatter: (value, context) => {
                        // ここで「合計試合数」や「勝率」を算出
                        const job = jobLabels[context.dataIndex];
                        const total = jobStats[job].total;
                        const wins = jobStats[job].wins;
                        const winRate = ((wins / total) * 100).toFixed(0);

                        // 「WIN」のデータセットの時だけ勝率を表示する設定
                        if (context.dataset.label === 'WIN') {
                            return `${winRate}%`; // ここで「50%」のように表示
                        }
                        return null; // LOSS の時は何も表示しない
                    }
                }
            },
            plugins: [ChartDataLabels]
            */
        }
    });


    // 集計後のデータを確認
    // console.log("Labels:", jobLabels);
    // console.table({ winCounts, lossCounts });
}


class GraphChartElement extends HTMLElement {
    connectedCallback() {
        this.render()
    }

    render() {
        this.innerHTML = `
            <div class="chart-container">
                <canvas id="rankChart"></canvas>
                <div style="height: 40px;"></div>
                <canvas id="jobChart"></canvas>
            </div>
        `;

    }
}
customElements.define('graph-chart', GraphChartElement)