import * as THREE from "three";
import type { Point } from "./Point";

export class VectorPanel {
    private readonly panel: HTMLElement;
    private readonly items: Map<number, HTMLElement> = new Map();

    constructor(container: HTMLElement) {
        this.panel = document.createElement("div");
        this.panel.id = "vector-panel";
        this.panel.innerHTML = `
            <div class="panel-header">
                <span>Values</span>
                <button class="collapse-btn">−</button>
            </div>
            <div class="panel-content"></div>
        `;
        container.appendChild(this.panel);

        const style = document.createElement("style");
        style.textContent = `
            #vector-panel {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(20, 20, 40, 0.9);
                border: 1px solid rgba(100, 150, 255, 0.3);
                border-radius: 8px;
                color: #e0e0e0;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 12px;
                min-width: 220px;
                max-width: 340px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                overflow: hidden;
            }
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(60, 80, 140, 0.4);
                cursor: pointer;
                user-select: none;
            }
            .panel-header span {
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .collapse-btn {
                background: none;
                border: none;
                color: #a0a0c0;
                font-size: 18px;
                cursor: pointer;
                padding: 0 4px;
                line-height: 1;
            }
            .collapse-btn:hover {
                color: #fff;
            }
            .panel-content {
                max-height: 500px;
                overflow-y: auto;
            }
            .panel-content.collapsed {
                display: none;
            }
            .item-row {
                padding: 8px 16px;
                border-bottom: 1px solid rgba(100, 150, 255, 0.1);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .item-row:last-child {
                border-bottom: none;
            }
            .item-color {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .item-label {
                font-weight: 600;
                color: #b0c0e0;
                min-width: 24px;
            }
            .item-values {
                display: flex;
                gap: 12px;
                font-family: monospace;
                font-size: 11px;
                color: #a0a0c0;
            }
            .item-x { color: #ff6b6b; }
            .item-y { color: #6bff6b; }
            .item-z { color: #6b6bff; }
            .item-mag {
                color: #f0c040;
                font-size: 10px;
            }
            ::-webkit-scrollbar {
                width: 6px;
            }
            ::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(100, 150, 255, 0.4);
                border-radius: 3px;
            }
        `;
        document.head.appendChild(style);

        const header = this.panel.querySelector(".panel-header")!;
        const content = this.panel.querySelector(".panel-content")!;
        const collapseBtn = this.panel.querySelector(".collapse-btn")!;

        header.addEventListener("click", () => {
            content.classList.toggle("collapsed");
            collapseBtn.textContent = content.classList.contains("collapsed")
                ? "+"
                : "−";
        });
    }

    updatePoint(point: Point): void {
        const index = point.index;
        const position = point.position;
        const label = Object(point).name;
        const color = point.color;

        const content = this.panel.querySelector(".panel-content")!;

        if (!this.items.has(index)) {
            const item = document.createElement("div");
            item.className = "item-row";
            item.innerHTML = `
                <div class="item-color"></div>
                <div class="item-label"></div>
                <div class="item-values">
                    <span><span class="item-x">x:</span> <span class="val-x"></span></span>
                    <span><span class="item-y">y:</span> <span class="val-y"></span></span>
                    <span><span class="item-z">z:</span> <span class="val-z"></span></span>
                    <span class="item-mag"></span>
                </div>
            `;
            content.appendChild(item);
            this.items.set(index, item);
        }

        const item = this.items.get(index)!;
        const colorEl = item.querySelector(".item-color") as HTMLElement;
        const labelEl = item.querySelector(".item-label") as HTMLElement;
        const valX = item.querySelector(".val-x") as HTMLElement;
        const valY = item.querySelector(".val-y") as HTMLElement;
        const valZ = item.querySelector(".val-z") as HTMLElement;
        const magEl = item.querySelector(".item-mag") as HTMLElement;

        colorEl.style.backgroundColor = color;
        labelEl.textContent = label;
        valX.textContent = position.x.toFixed(3);
        valY.textContent = position.y.toFixed(3);
        valZ.textContent = position.z.toFixed(3);

        const mag = position.length();
        magEl.textContent = `|${label}|=${mag.toFixed(3)}`;
    }

    remove(index: number): void {
        const item = this.items.get(index);
        if (item) {
            item.remove();
            this.items.delete(index);
        }
    }

    clear(): void {
        const content = this.panel.querySelector(".panel-content")!;
        content.innerHTML = "";
        this.items.clear();
    }
}
