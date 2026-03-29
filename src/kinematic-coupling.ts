export type ConstraintType = "holonomic" | "kinematic";

export interface KinematicCouplingConfig {
    wheel1AngularVelocity: number;
    wheel2AngularVelocity: number;
    wheelRadius: number;
    wheelBase: number;
    initialBarX?: number;
    initialBarY?: number;
    initialBarAngle?: number;
    initialWheel1Angle?: number;
    initialWheel2Angle?: number;
}

export interface KinematicState {
    barX: number;
    barY: number;
    barAngle: number;
    wheel1Angle: number;
    wheel1AngularVelocity: number;
    wheel2Angle: number;
    wheel2AngularVelocity: number;
    time: number;
}

export class KinematicCouplingSolver {
    private config: Required<KinematicCouplingConfig>;

    constructor(config: KinematicCouplingConfig) {
        this.config = {
            wheel1AngularVelocity: config.wheel1AngularVelocity,
            wheel2AngularVelocity: config.wheel2AngularVelocity,
            wheelRadius: config.wheelRadius,
            wheelBase: config.wheelBase,
            initialBarX: config.initialBarX ?? 0,
            initialBarY: config.initialBarY ?? 0,
            initialBarAngle: config.initialBarAngle ?? 0,
            initialWheel1Angle: config.initialWheel1Angle ?? 0,
            initialWheel2Angle: config.initialWheel2Angle ?? 0,
        };
    }

    getWheel1AngularVelocity(): number {
        return this.config.wheel1AngularVelocity;
    }

    getWheel2AngularVelocity(): number {
        return this.config.wheel2AngularVelocity;
    }

    getWheelRadius(): number {
        return this.config.wheelRadius;
    }

    getWheelBase(): number {
        return this.config.wheelBase;
    }

    getStateAtTime(time: number): KinematicState {
        const { 
            wheel1AngularVelocity, 
            wheel2AngularVelocity, 
            wheelRadius,
            wheelBase,
            initialBarX, 
            initialBarY,
            initialBarAngle, 
            initialWheel1Angle, 
            initialWheel2Angle 
        } = this.config;

        const r = wheelRadius;
        const L = wheelBase;
        
        const v1 = wheel1AngularVelocity * r;
        const v2 = wheel2AngularVelocity * r;
        
        const v = (v1 + v2) / 2;
        const omega = (v2 - v1) / L;

        return {
            barX: initialBarX + v * Math.cos(initialBarAngle) * time,
            barY: initialBarY + v * Math.sin(initialBarAngle) * time,
            barAngle: initialBarAngle + omega * time,
            wheel1Angle: initialWheel1Angle + wheel1AngularVelocity * time,
            wheel1AngularVelocity: wheel1AngularVelocity,
            wheel2Angle: initialWheel2Angle + wheel2AngularVelocity * time,
            wheel2AngularVelocity: wheel2AngularVelocity,
            time,
        };
    }

    getBarPosition(state: KinematicState): { x: number; y: number; z: number } {
        return {
            x: state.barX,
            y: state.barY,
            z: 0,
        };
    }

    getBarEndPositions(state: KinematicState): { 
        wheel1: { x: number; y: number; z: number };
        wheel2: { x: number; y: number; z: number };
    } {
        const halfBase = this.config.wheelBase / 2;
        const cosTheta = Math.cos(state.barAngle);
        const sinTheta = Math.sin(state.barAngle);
        
        return {
            wheel1: {
                x: state.barX + cosTheta * halfBase,
                y: state.barY + sinTheta * halfBase,
                z: 0,
            },
            wheel2: {
                x: state.barX - cosTheta * halfBase,
                y: state.barY - sinTheta * halfBase,
                z: 0,
            },
        };
    }

    getWheel1CenterPosition(state: KinematicState): { x: number; y: number; z: number } {
        return this.getBarEndPositions(state).wheel1;
    }

    getWheel2CenterPosition(state: KinematicState): { x: number; y: number; z: number } {
        return this.getBarEndPositions(state).wheel2;
    }

    getWheelPointPositions(state: KinematicState, wheelRadius: number, wheelIndex: 1 | 2): { 
        center: { x: number; y: number; z: number }; 
        points: { x: number; y: number; z: number }[] 
    } {
        const center = wheelIndex === 1 
            ? this.getWheel1CenterPosition(state)
            : this.getWheel2CenterPosition(state);
        
        const perpX = -Math.sin(state.barAngle);
        const perpY = Math.cos(state.barAngle);

        const theta = wheelIndex === 1 ? state.wheel1Angle : state.wheel2Angle;

        return {
            center: { ...center, z: wheelRadius },
            points: [
                {
                    x: center.x + perpX * Math.cos(theta) * wheelRadius,
                    y: center.y + perpY * Math.cos(theta) * wheelRadius,
                    z: center.z + Math.sin(theta) * wheelRadius,
                },
                {
                    x: center.x - perpX * Math.cos(theta) * wheelRadius,
                    y: center.y - perpY * Math.cos(theta) * wheelRadius,
                    z: center.z - Math.sin(theta) * wheelRadius,
                },
                {
                    x: center.x + perpX * Math.sin(theta) * wheelRadius,
                    y: center.y + perpY * Math.sin(theta) * wheelRadius,
                    z: center.z - Math.cos(theta) * wheelRadius,
                },
                {
                    x: center.x - perpX * Math.sin(theta) * wheelRadius,
                    y: center.y - perpY * Math.sin(theta) * wheelRadius,
                    z: center.z + Math.cos(theta) * wheelRadius,
                },
            ]
        };
    }

    getBothWheelsPositions(state: KinematicState, wheelRadius: number): { 
        wheel1: { center: { x: number; y: number; z: number }; points: { x: number; y: number; z: number }[] };
        wheel2: { center: { x: number; y: number; z: number }; points: { x: number; y: number; z: number }[] };
    } {
        return {
            wheel1: this.getWheelPointPositions(state, wheelRadius, 1),
            wheel2: this.getWheelPointPositions(state, wheelRadius, 2),
        };
    }
}
