import { Chart, registerables } from "chart.js";
import { COLORS } from "./constants";

Chart.register(...registerables);

export class SpeedChart {
    private chart: Chart;
    private readonly maxDataPoints = 500;
    private times: number[] = [];
    private datasets: {
        [key: string]: {
            prevValue: number;
            prevTime: number;
            values: number[];
        };
    } = {};

    constructor(canvas: HTMLCanvasElement) {
        this.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: this.times,
                datasets: [],
            },
            options: {
                responsive: true,
                animation: false,
                scales: {
                    x: {
                        title: { display: true, text: "Time (s)" },
                        ticks: { maxTicksLimit: 10 },
                    },
                    y: {
                        title: { display: true, text: "Speed" },
                    },
                },
            },
        });
    }

    addDataset(name: string) {
        this.datasets[name] = { prevValue: 0, prevTime: 0, values: [] };
        this.chart.config.data.datasets.push({
            label: name,
            data: this.datasets[name].values,
            borderColor: COLORS[Object.entries(this.datasets).length],
            tension: 0.1,
            pointRadius: 0,
            type: "line",
        });
    }

    addValue(dataset: string, timeStamp: number, value: number) {
        const deltaT = timeStamp - this.datasets[dataset].prevTime;
        const deltaValue = value - this.datasets[dataset].prevValue;

        this.datasets[dataset].values.push(deltaValue / deltaT);

        this.datasets[dataset].prevValue = value;
        this.datasets[dataset].prevTime = timeStamp;
    }

    update(timeStamp: number) {
        this.times.push(Math.round(timeStamp) / 1000);

        if (this.times.length > this.maxDataPoints) {
            this.times.shift();
        }
        Object.values(this.datasets).forEach((values) => {
            if (values.values.length > this.maxDataPoints)
                values.values.shift();
        });
        this.chart.update("none");
    }

    getDatasetLatestValue(dataset: string) {
        return this.datasets[dataset].values.at(-1);
    }

    clear(): void {
        this.times = [];
        this.chart.update("none");
    }
}
