import * as THREE from "three";
import { type AxisConfig } from "./types";

export class AxisHelper extends THREE.Group {
    constructor(config: AxisConfig) {
        super();

        // X axis
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(config.size, 0, 0),
        ]);
        const xMaterial = new THREE.LineBasicMaterial({
            color: config.colors.x,
        });
        const xLine = new THREE.Line(xGeometry, xMaterial);
        this.add(xLine);

        // Y axis
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, config.size, 0),
        ]);
        const yMaterial = new THREE.LineBasicMaterial({
            color: config.colors.y,
        });
        const yLine = new THREE.Line(yGeometry, yMaterial);
        this.add(yLine);

        // Z axis
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, config.size),
        ]);
        const zMaterial = new THREE.LineBasicMaterial({
            color: config.colors.z,
        });
        const zLine = new THREE.Line(zGeometry, zMaterial);
        this.add(zLine);

        // Add labels (simple text sprites)
        this.addLabel(
            config.labels.x,
            new THREE.Vector3(config.size + 0.5, 0, 0),
            config.colors.x
        );
        this.addLabel(
            config.labels.y,
            new THREE.Vector3(0, config.size + 0.5, 0),
            config.colors.y
        );
        this.addLabel(
            config.labels.z,
            new THREE.Vector3(0, 0, config.size + 0.5),
            config.colors.z
        );
    }

    private addLabel(
        text: string,
        position: THREE.Vector3,
        color: THREE.Color
    ): void {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        context.font = "Bold 20px Arial";
        context.fillStyle = color.getStyle();
        context.fillText(text, 0, 20);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(0.5, 0.25, 1);
        this.add(sprite);
    }
}
