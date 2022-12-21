import React, { PureComponent } from 'react';
import {
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	ReferenceLine,
	Brush,
} from 'recharts';
import { useEffect } from 'react';

const COLORS = [
	'#CDE7CA',
	'#5CB450',
	'#228B22',
	'#50C878',
	'#454B1B',
	'#7FFFD4',
	'#00A36C',
	'#E4D00A',
];


const PoolDailyVolume = ({ data, poolSynths }: any) => {
	return (
		<>
			{poolSynths && data.length > 0 ? (
				<>
					<ResponsiveContainer width="100%" height="90%">
						<BarChart
							data={data}
							margin={{
								top: 5,
								right: 0,
								left: 0,
								bottom: 5,
							}}
							barSize={20}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="dayId"
								padding={{ left: 10, right: 10 }}
							/>
							<YAxis />
							<Tooltip />
							<Legend
								verticalAlign="top"
								wrapperStyle={{ lineHeight: '40px' }}
							/>
							<ReferenceLine y={0} stroke="#000" />
							<Brush
								dataKey="dayId"
								height={30}
								stroke="#50C878"
								fill="#000"
							/>
							{poolSynths.map((synth: any, index: number) => {
								return (
									<Bar
										key={index}
										dataKey={synth.symbol}
										stackId="a"
										// fill={'#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}
										// fill="#8884d8"
										fill={COLORS[index % COLORS.length]}
										maxBarSize={20}
									/>
								);
							})}
						</BarChart>
					</ResponsiveContainer>					
				</>
			) : (
				<>Loading</>
			)}
		</>
	);
};

export default PoolDailyVolume;
