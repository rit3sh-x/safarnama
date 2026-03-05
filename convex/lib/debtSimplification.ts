export interface Transaction {
    from: string;
    to: string;
    amount: number;
}

const CURRENCY_DECIMALS: Record<string, number> = {
    JPY: 0,
    KRW: 0,
    VND: 0,
    IDR: 0,
    ISK: 0,
    UGX: 0,
    CLP: 0,
    PYG: 0,
    RWF: 0,
    USD: 2,
    EUR: 2,
    GBP: 2,
    AUD: 2,
    CAD: 2,
    CHF: 2,
    CNY: 2,
    INR: 2,
    MXN: 2,
    SGD: 2,
    HKD: 2,
    NOK: 2,
    SEK: 2,
    DKK: 2,
    NZD: 2,
    ZAR: 2,
    BRL: 2,
    AED: 2,
    KWD: 3,
    IQD: 3,
    OMR: 3,
    BHD: 3,
    JOD: 3,
    TND: 3,
};

const DEFAULT_DECIMALS = 2;

function precisionFor(currency: string): number {
    return (
        10 ** (CURRENCY_DECIMALS[currency.toUpperCase()] ?? DEFAULT_DECIMALS)
    );
}

export function simplifyDebts(
    splits: { paidBy: string; owedBy: string; amount: number }[],
    currency: string
): Transaction[] {
    const PRECISION = precisionFor(currency);

    const balance = new Map<string, number>();
    const credit = (id: string, delta: number) =>
        balance.set(id, (balance.get(id) ?? 0) + delta);

    for (const { paidBy, owedBy, amount } of splits) {
        if (paidBy === owedBy || amount <= 0) continue;
        credit(paidBy, +amount);
        credit(owedBy, -amount);
    }

    const pos: { id: string; units: number }[] = [];
    const neg: { id: string; units: number }[] = [];

    for (const [id, net] of balance) {
        const units = Math.round(net * PRECISION);
        if (units > 0) pos.push({ id, units });
        else if (units < 0) neg.push({ id, units: -units });
    }

    pos.sort((a, b) => b.units - a.units);
    neg.sort((a, b) => b.units - a.units);

    const transactions: Transaction[] = [];
    let p = 0;
    let n = 0;

    while (p < pos.length && n < neg.length) {
        const creditor = pos[p];
        const debtor = neg[n];
        const settled = Math.min(creditor.units, debtor.units);

        transactions.push({
            from: debtor.id,
            to: creditor.id,
            amount: settled / PRECISION,
        });

        creditor.units -= settled;
        debtor.units -= settled;

        if (creditor.units === 0) p++;
        if (debtor.units === 0) n++;
    }

    return transactions;
}
