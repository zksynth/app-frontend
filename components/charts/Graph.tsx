import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { priceData } from './priceData';
import { volumeData } from './volumeData';
import { useContext } from 'react';

const Graph = ({}) => {
	const chartContainerRef = useRef<any>();
	const chart = useRef<any>();
	useEffect(() => {
        if(!chart.current){
		chart.current = createChart(chartContainerRef.current, {
			width: chartContainerRef.current.clientWidth,
			height: chartContainerRef.current.clientHeight,
			layout: {
				backgroundColor: '#2D3748',
				textColor: 'rgba(255, 255, 255, 0.9)',
			},
			grid: {
				vertLines: {
					color: '#334158',
				},
				horzLines: {
					color: '#334158',
				},
			},
			crosshair: {
				mode: CrosshairMode.Normal,
			},
			timeScale: {
				borderColor: '#485c7b',
			},
		});
		const candleSeries = chart.current.addCandlestickSeries({
			upColor: '#4bffb5',
			downColor: '#ff4976',
			borderDownColor: '#ff4976',
			borderUpColor: '#4bffb5',
			wickDownColor: '#838ca1',
			wickUpColor: '#838ca1',
		});
		candleSeries.setData(priceData);
		const volumeSeries = chart.current.addHistogramSeries({
			color: '#182233',
			lineWidth: 2,
			priceFormat: {
				type: 'volume',
			},
			overlay: true,
			scaleMargins: {
				top: 0.8,
				bottom: 0,
			},
		});
		volumeSeries.setData(volumeData);
    }
	}, []);

	return (
			<div
				ref={chartContainerRef}
				className="chart-container"
                style={{ width: '100%', height: '100%' }}
			/>
	);
};

export default Graph;
