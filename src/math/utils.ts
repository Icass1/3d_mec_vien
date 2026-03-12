import { simplify, derivative, type MathNode } from "mathjs";

export class MathUtils {
    private variableRegex: RegExp;
    private variableNames: string[];

    constructor(variableNames: string[]) {
        this.variableNames = variableNames;
        this.variableRegex = new RegExp(
            `(?<!\\\\)(?:${variableNames.join("|")})(\\d+)\\b`,
            "g"
        );
    }

    fullyFactor(expr: string): MathNode {
        return simplify(simplify(expr));
    }

    stripMathrm(tex: string): string {
        return tex.replace(/\\mathrm\{([^}]*)\}/g, (_, inner) => inner);
    }

    convertVariablesToLatex(tex: string): string {
        this.variableNames.forEach((name) => {
            let latexName = name;

            const match = name.match(/^([a-zA-Z]+)(\d+)$/);

            if (match) {
                const [, base, digits] = match;
                latexName = `${base}_{${digits}}`;
            }

            tex = tex.replace(name, latexName);
        });

        return this.stripMathrm(tex);
    }

    factorAndLatex(expr: string) {
        const factored = this.fullyFactor(expr);
        const latexRaw = factored.toTex();
        const latex = this.convertVariablesToLatex(latexRaw);

        return { factored, latexRaw, latex };
    }

    derivativeLatex(expr: string, variable = "t") {
        const d = derivative(expr, variable);
        const latexRaw = d.toTex();
        const latex = this.convertVariablesToLatex(latexRaw);

        return { derivative: d, latex };
    }
}
