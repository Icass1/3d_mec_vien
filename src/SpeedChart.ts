import { Chart, registerables } from "chart.js";
import { COLORS } from "./constants";

Chart.register(...registerables);

export class SpeedChart {
    private chart: Chart;
    private readonly maxDataPoints = 1000;
    private times: number[] = [];
    private speeds: number[] = [];
    private datasets: {
        [key: string]: {
            prevValue: number;
            prevTime: number;
            values: number[];
        };
    } = {};
    private startTime: number;

    constructor(canvas: HTMLCanvasElement) {
        this.startTime = Date.now();

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

    addValue(dataset: string, value: number) {
        const deltaT = Date.now() - this.datasets[dataset].prevTime;
        const deltaValue = value - this.datasets[dataset].prevValue;

        this.datasets[dataset].values.push(deltaValue / deltaT);

        this.datasets[dataset].prevValue = value;
        this.datasets[dataset].prevTime = Date.now();
    }

    update() {
        this.times.push(Math.round(Date.now() - this.startTime) / 1000);

        if (this.times.length > this.maxDataPoints) {
            this.times.shift();
            this.speeds.shift();
        }
        this.chart.update("none");
    }

    getDatasetLatestValue(dataset: string) {
        return this.datasets[dataset].values.at(-1);
    }

    clear(): void {
        this.times = [];
        this.speeds = [];
        this.chart.update("none");
    }
}
