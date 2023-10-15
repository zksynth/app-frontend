// TradingViewWidget.jsx

import React, { useEffect, useRef } from "react";

let tvScriptLoadingPromise: Promise<any>;

export default function TradingViewWidget({asset}: any) {
  const onLoadScriptRef = useRef<any>();

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => (onLoadScriptRef.current = null) as any;

    function createWidget() {
      if (document.getElementById("tradingview") && "TradingView" in window) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `PYTH:${asset}USD`,
          interval: "D",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#2B2E32",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: "tradingview",
          height: "100%",
          save_image: false
          
        });
      }
    }
  }, []);

  return (
    <div className="tradingview-widget-container">
      <div id="tradingview" />
    </div>
  );
}