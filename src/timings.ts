// Timing in EDT
export const MARKET_TIMINGS: any = {
	"Stock Exchange": {
		"Monday": {
			"open": "09:30",
			"close": "16:00"
		}, 
		"Tuesday": {
			"open": "09:30",
			"close": "16:00"
		},
		"Wednesday": {
			"open": "09:30",
			"close": "16:00"
		},
		"Thursday": {
			"open": "09:30",
			"close": "16:00"
		},
		"Friday": {
			"open": "09:30",
			"close": "16:00"
		},
		"Saturday": {
			"open": "00:00",
			"close": "00:01"
		},
		"Sunday": {
			"open": "00:00",
			"close": "00:01"
		}
	}, 
	"Crypto Pool": {
		"Monday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Tuesday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Wednesday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Thursday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Friday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Saturday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Sunday": {
			"open": "00:00",
			"close": "23:59"
		},
	},
	"Foreign Exchange": {
		"Monday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Tuesday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Wednesday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Thursday": {
			"open": "00:00",
			"close": "23:59"
		},
		"Friday": {
			"open": "00:00",
			"close": "16:00"
		},
		"Saturday": {
			"open": "00:00",
			"close": "00:01"
		},
		"Sunday": {
			"open": "15:00",
			"close": "23:59"
		},
	},
}

// Check if market is open in EDT
export const isMarketOpen = (marketName: string) => {
	const now = new Date();
	const day = now.toLocaleString("en-US", { timeZone: 'America/New_York', weekday: "long" });
	const time = now.toLocaleString("en-US", { timeZone: 'America/New_York', hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
	if(!MARKET_TIMINGS[marketName]) return true;
	const open = MARKET_TIMINGS[marketName][day]["open"];
	const close = MARKET_TIMINGS[marketName][day]["close"];
	return time >= open && time <= close;
}