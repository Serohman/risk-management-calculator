"use client";

import {useEffect, useState} from "react";

enum CalculatorParameter {
  HIGH = "high",
  LOW = "low",
}

export default function Std() {
  const LOCAL_STORAGE_KEY = "std/params";
  const defaultFormRaw =
    typeof window === "undefined" ? "{}" : window?.localStorage?.getItem(LOCAL_STORAGE_KEY) || "{}";
  const defaultForm = JSON.parse(defaultFormRaw);

  const [low, setLow] = useState<number>(defaultForm.low);
  const [high, setHigh] = useState(defaultForm.high);
  const [std, setStd] = useState<any>(null);

  const handleFieldChange = (id: CalculatorParameter, evt: any) => {
    const value = Number(evt.target.value);

    if (id === CalculatorParameter.LOW) {
      setLow(value);
      calculateSTDLevels(value, high);
      saveFieldsLocally({low: value});
    } else if (id === CalculatorParameter.HIGH) {
      setHigh(value);
      calculateSTDLevels(low, value);
      saveFieldsLocally({high: value});
    } else {
      throw new Error("Unexpected calculator parameter");
    }
  };

  function calculateSTDLevels(low: number, high: number): void {
    console.log(low, high);
    const range = high - low;
    const mean = (high + low) / 2;
    const stdDev = range / 4;
    const level1 = high + stdDev;
    const level2 = high + 2 * stdDev;
    const level3 = high + 3 * stdDev;
    const minus1 = low - stdDev;
    const minus2 = low - 2 * stdDev;
    const minus3 = low - 3 * stdDev;

    setStd({mean, stdDev, level1, level2, level3, minus1, minus2, minus3});
  }

  const saveFieldsLocally = (overwrite?: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          low,
          high,
          ...overwrite,
        })
      );
    }
  };

  useEffect(() => {
    console.log("effect used");
    if (defaultForm.low && defaultForm.high) {
      calculateSTDLevels(defaultForm.low, defaultForm.high);
    }
  }, [defaultForm.low, defaultForm.high]);

  return (
    <main className="flex min-h-screen p-24">
      {/* Configurable Parameters */}
      <div className="flex flex-col">
        <label className="mb-4 flex flex-col">
          <span>Low</span>
          <input type="number" value={low} onChange={(evt) => handleFieldChange(CalculatorParameter.LOW, evt)} />
        </label>

        <label className="mb-4 flex flex-col">
          <span>High</span>
          <input type="number" value={high} onChange={(evt) => handleFieldChange(CalculatorParameter.HIGH, evt)} />
        </label>
      </div>

      {/* Calculated */}
      {std && (
        <div className="ml-4 flex flex-col border-l border-slate-800 pl-4">
          <label className="mb-4 flex flex-col">
            <span>Standard deviation</span>
            <input type="text" readOnly value={std.stdDev} />
          </label>
          <div>
            <span className="text-slate-500">+1: </span>
            <span>{std.level3}</span>
          </div>
          <div>
            <span className="text-slate-500">+2: </span>
            <span>{std.level2}</span>
          </div>
          <div>
            <span className="text-slate-500">+3: </span>
            <span>{std.level1}</span>
          </div>
          <div>
            <span className="text-slate-500">0: </span>
            <span>{std.mean}</span>
          </div>
          <div>
            <span className="text-slate-500">-1: </span>
            <span>{std.minus1}</span>
          </div>
          <div>
            <span className="text-slate-500">-2: </span>
            <span>{std.minus2}</span>
          </div>
          <div>
            <span className="text-slate-500">-3: </span>
            <span>{std.minus3}</span>
          </div>
        </div>
      )}
    </main>
  );
}
