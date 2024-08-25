"use client";

import {useState} from "react";

enum CalculatorParameter {
  SIZE = "size",
  RISK = "risk",
  STOP_LOSS = "sl",
  RR_RATIO = "rrr",
}

enum CalculatorRiskToggle {
  PERCENT,
  AMOUNT,
}

export default function Home() {
  const LOCAL_STORAGE_KEY = "risk-calculator/params";
  const defaultFormRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
  const defaultForm = JSON.parse(defaultFormRaw || "{}");

  const [portfolioSize, setPortfolioSize] = useState<number>(defaultForm.portfolioSize);
  const [riskPercent, setRiskPercent] = useState(defaultForm.riskPercent);
  const [riskAmount, setRiskAmount] = useState(defaultForm.riskAmount);
  const [slRisk, setSlRisk] = useState(defaultForm.slRisk);
  const [riskRewardRatio, setRiskRewardRatio] = useState(defaultForm.riskRewardRatio);
  const [riskToggle, setRiskToggle] = useState<CalculatorRiskToggle>(CalculatorRiskToggle.PERCENT);

  const handleFieldChange = (id: CalculatorParameter, evt: any) => {
    const value = Number(evt.target.value);

    if (id === CalculatorParameter.SIZE) {
      setPortfolioSize(value);
      saveFieldsLocally({portfolioSize: value});
    } else if (id === CalculatorParameter.RISK) {
      if (riskToggle === CalculatorRiskToggle.PERCENT) {
        setRiskPercent(value);
        saveFieldsLocally({riskPercent: value});
      } else if (riskToggle === CalculatorRiskToggle.AMOUNT) {
        setRiskAmount(value);
        saveFieldsLocally({riskAmount: value});
      } else {
        throw new Error("Can't set risk. Unexpected risk toggle.");
      }
    } else if (id === CalculatorParameter.STOP_LOSS) {
      setSlRisk(value);
      saveFieldsLocally({slRisk: value});
    } else if (id === CalculatorParameter.RR_RATIO) {
      setRiskRewardRatio(value);
      saveFieldsLocally({riskRewardRatio: value});
    } else {
      throw new Error("Unexpected calculator parameter");
    }
  };

  const saveFieldsLocally = (overwrite?: any) => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        portfolioSize,
        riskPercent,
        riskAmount,
        slRisk,
        riskRewardRatio,
        riskToggle,
        ...overwrite,
      })
    );
  };

  const renderRiskToggle = () => {
    const activeClassname = "text-sm text-slate-800 underline";
    const idleClassname = "hover:text-slate-600 hover:underline cursor-pointer text-sm text-slate-400";

    return (
      <div className="inline-flex" onClick={(evt) => evt.preventDefault()}>
        <span
          onClick={() => setRiskToggle(CalculatorRiskToggle.PERCENT)}
          className={riskToggle === CalculatorRiskToggle.PERCENT ? activeClassname : idleClassname}
        >
          %
        </span>
        <span className="mx-1 text-sm text-slate-400">/</span>
        <span
          onClick={() => setRiskToggle(CalculatorRiskToggle.AMOUNT)}
          className={riskToggle === CalculatorRiskToggle.AMOUNT ? activeClassname : idleClassname}
        >
          $
        </span>
      </div>
    );
  };

  const getProtfolioRisk = () => {
    console.log("Updating risk");
    if (riskToggle === CalculatorRiskToggle.PERCENT) {
      return riskPercent / 100;
    } else if (riskToggle === CalculatorRiskToggle.AMOUNT) {
      return riskAmount / portfolioSize;
    }

    throw new Error("Can't calculate normalized portfolio risk");
  };

  return (
    <main className="flex min-h-screen p-24">
      {/* Configurable Parameters */}
      <div className="flex flex-col">
        <label className="mb-4 flex flex-col">
          <span>Portfolio Size</span>
          <input
            type="number"
            value={portfolioSize}
            onChange={(evt) => handleFieldChange(CalculatorParameter.SIZE, evt)}
          />
        </label>
        <label className="mb-4 flex flex-col">
          <span className="w-100 block">
            Risk per trade <span className="float-right">{renderRiskToggle()}</span>
          </span>

          {riskToggle === CalculatorRiskToggle.PERCENT && (
            <input
              type="number"
              value={riskPercent}
              onChange={(evt) => handleFieldChange(CalculatorParameter.RISK, evt)}
            />
          )}
          {riskToggle === CalculatorRiskToggle.AMOUNT && (
            <input
              type="number"
              value={riskAmount}
              onChange={(evt) => handleFieldChange(CalculatorParameter.RISK, evt)}
            />
          )}
        </label>
        <label className="mb-4 flex flex-col">
          <span>Stop Loss (%)</span>
          <input
            type="number"
            value={slRisk}
            onChange={(evt) => handleFieldChange(CalculatorParameter.STOP_LOSS, evt)}
          />
        </label>
        <label className="mb-4 flex flex-col">
          <span>Reward Ratio</span>
          <input
            type="number"
            value={riskRewardRatio}
            onChange={(evt) => handleFieldChange(CalculatorParameter.RR_RATIO, evt)}
          />
        </label>
      </div>

      {/* Calculated */}
      <div className="ml-4 flex flex-col border-l border-slate-800 pl-4">
        <label className="mb-4 flex flex-col">
          <span>Position Size:</span>
          <input
            type="text"
            readOnly
            value={`\$${((portfolioSize * getProtfolioRisk()) / (slRisk / 100)).toFixed(2)}`}
          />
        </label>
        <label className="mb-4 flex flex-col">
          <span>Leverage:</span>
          <input
            type="text"
            readOnly
            value={`x${((portfolioSize * getProtfolioRisk()) / (slRisk / 100) / portfolioSize).toFixed(2)}`}
          />
        </label>
        {riskToggle === CalculatorRiskToggle.PERCENT && (
          <label className="mb-4 flex flex-col">
            <span>Trade risk:</span>
            <input type="text" readOnly value={`\$${(portfolioSize * (riskPercent / 100)).toFixed(2)}`} />
          </label>
        )}
        {riskToggle === CalculatorRiskToggle.AMOUNT && (
          <label className="mb-4 flex flex-col">
            <span>Trade risk:</span>
            <input type="text" readOnly value={`${((riskAmount / portfolioSize) * 100).toFixed(2)}%`} />
          </label>
        )}
        <label className="mb-4 flex flex-col">
          <span>Reward:</span>
          <input
            type="text"
            readOnly
            value={`\$${(portfolioSize * getProtfolioRisk() * riskRewardRatio).toFixed(2)}`}
          />
        </label>
      </div>
    </main>
  );
}
