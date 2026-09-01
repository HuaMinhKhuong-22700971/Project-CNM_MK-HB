const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../apps/web/src/pages/public/PcBuilderPage.jsx');
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Update import
code = code.replace(
  'import { useEffect, useMemo, useState } from "react";',
  'import { useEffect, useMemo, useRef, useState } from "react";'
);

// 2. Add states & refs
const targetState = `  const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);`;
const newState = `  const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const autoBuildAbortControllerRef = useRef(null);`;

code = code.replace(targetState, newState);

// 3. Update handleAutoRecommend
const oldHandlerStart = `  async function handleAutoRecommend(overrideOptions = null) {
    const targetBudget = Number(
      typeof overrideOptions === "object" && overrideOptions?.budget
        ? overrideOptions.budget
        : typeof overrideOptions === "number"
        ? overrideOptions
        : suggestionForm.budget || 25000000
    );`;

const newHandlerStart = `  async function handleAutoRecommend(overrideOptions = null) {
    if (autoBuildAbortControllerRef.current) {
      autoBuildAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    autoBuildAbortControllerRef.current = abortController;

    setIsAutoBuilding(true);

    const targetBudget = Number(
      typeof overrideOptions === "object" && overrideOptions?.budget
        ? overrideOptions.budget
        : typeof overrideOptions === "number"
        ? overrideOptions
        : suggestionForm.budget || 25000000
    );`;

code = code.replace(oldHandlerStart, newHandlerStart);

// 4. Update suggest API call to include signal
const oldApiCall = `        const apiRes = await httpClient.post("/pc-builder/suggest", {
          budget: targetBudget,
          useCase: purpose,
          resolution,
          preference,
          futureNeed
        });`;

const newApiCall = `        const apiRes = await httpClient.post("/pc-builder/suggest", {
          budget: targetBudget,
          useCase: purpose,
          resolution,
          preference,
          futureNeed
        }, { signal: abortController.signal });`;

code = code.replace(oldApiCall, newApiCall);

// 5. Update error catch & finally
const oldCatch = `      } catch (err) {
        console.warn("Backend suggest API warning, fallback candidates will be generated", err);
      }`;

const newCatch = `      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
          console.log("Previous AI suggest request aborted for newer build trigger.");
          return;
        }
        console.warn("Backend suggest API warning, fallback candidates will be generated", err);
      }`;

code = code.replace(oldCatch, newCatch);

// 6. Update finally block
const oldFinally = `    } finally { setProcessingComponent(""); }`;
const newFinally = `    } finally {
      if (autoBuildAbortControllerRef.current === abortController) {
        setIsAutoBuilding(false);
        setProcessingComponent("");
      }
    }`;

code = code.replace(oldFinally, newFinally);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('✅ Successfully updated handleAutoRecommend with AbortController and isAutoBuilding state!');
