import type { IMathObject } from "./math-object";
import type { ContextType } from "./contextType";

export type OdeSolverMethod = "euler" | "rk4";

export interface DifferentialEquationConfig {
    stepSize: number;
    startTime: number;
    endTime: number;
    initialValues: ContextType;
    method?: OdeSolverMethod;
}

export interface SolutionPoint {
    t: number;
    values: ContextType;
}

export class DifferentialEquation {
    private _derivatives: Map<string, IMathObject>;
    private _config: DifferentialEquationConfig;

    constructor(
        derivatives: Map<string, IMathObject>,
        config: Partial<DifferentialEquationConfig> & { initialValues: ContextType }
    ) {
        this._derivatives = derivatives;
        this._config = {
            stepSize: 0.01,
            startTime: 0,
            endTime: 1,
            method: "rk4",
            ...config,
        };
    }

    getDerivative(varName: string, context: ContextType): number {
        const deriv = this._derivatives.get(varName);
        if (!deriv) {
            throw `No derivative defined for '${varName}'`;
        }
        return deriv.compute(context);
    }

    private eulerStep(currentValues: ContextType, dt: number): ContextType {
        const newValues: ContextType = { ...currentValues };

        for (const [varName] of this._derivatives) {
            newValues[varName] = currentValues[varName] + this.getDerivative(varName, currentValues) * dt;
        }

        return newValues;
    }

    private rk4Step(currentValues: ContextType, dt: number): ContextType {
        const k1: ContextType = {};
        const k2: ContextType = {};
        const k3: ContextType = {};
        const k4: ContextType = {};

        for (const [varName] of this._derivatives) {
            k1[varName] = this.getDerivative(varName, currentValues);
        }

        const values2: ContextType = {};
        for (const [varName, val] of Object.entries(currentValues)) {
            values2[varName] = val + k1[varName] * dt / 2;
        }
        for (const [varName] of this._derivatives) {
            k2[varName] = this.getDerivative(varName, values2);
        }

        const values3: ContextType = {};
        for (const [varName, val] of Object.entries(currentValues)) {
            values3[varName] = val + k2[varName] * dt / 2;
        }
        for (const [varName] of this._derivatives) {
            k3[varName] = this.getDerivative(varName, values3);
        }

        const values4: ContextType = {};
        for (const [varName, val] of Object.entries(currentValues)) {
            values4[varName] = val + k3[varName] * dt;
        }
        for (const [varName] of this._derivatives) {
            k4[varName] = this.getDerivative(varName, values4);
        }

        const newValues: ContextType = { ...currentValues };
        for (const [varName] of this._derivatives) {
            newValues[varName] = currentValues[varName] + (k1[varName] + 2 * k2[varName] + 2 * k3[varName] + k4[varName]) * dt / 6;
        }

        return newValues;
    }

    solve(): SolutionPoint[] {
        const { stepSize, startTime, endTime, initialValues, method } = this._config;
        const points: SolutionPoint[] = [];
        
        let currentValues = { ...initialValues };
        let t = startTime;

        points.push({ t, values: { ...currentValues } });

        while (t < endTime) {
            const dt = Math.min(stepSize, endTime - t);
            
            if (method === "euler") {
                currentValues = this.eulerStep(currentValues, dt);
            } else {
                currentValues = this.rk4Step(currentValues, dt);
            }

            t += dt;
            points.push({ t, values: { ...currentValues } });
        }

        return points;
    }

    solveIterator(): IterableIterator<SolutionPoint> {
        const { stepSize, startTime, endTime, initialValues, method } = this._config;
        
        let currentValues = { ...initialValues };
        let t = startTime;
        const self = this;

        return {
            [Symbol.iterator]() {
                return this;
            },
            next(): IteratorResult<SolutionPoint> {
                if (t >= endTime) {
                    return { done: true, value: undefined as any };
                }

                const dt = Math.min(stepSize, endTime - t);
                
                if (method === "euler") {
                    currentValues = self.eulerStep(currentValues, dt);
                } else {
                    currentValues = self.rk4Step(currentValues, dt);
                }

                t += dt;
                return { done: false, value: { t, values: { ...currentValues } } };
            }
        };
    }

    get config() {
        return this._config;
    }

    set config(config: Partial<DifferentialEquationConfig>) {
        this._config = { ...this._config, ...config };
    }
}

export function createDifferentialEquation(
    derivatives: Map<string, IMathObject>,
    config: Partial<DifferentialEquationConfig> & { initialValues: ContextType }
): DifferentialEquation {
    const ode = new DifferentialEquation(derivatives, config);
    return ode;
}
