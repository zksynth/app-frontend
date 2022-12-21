import React, { useContext } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Legend } from 'chart.js'
import { AppDataContext } from '../context/AppDataProvider';
import { Box } from '@chakra-ui/react';
Chart.register(ArcElement);

export default function DonutChart({}: any){
  
  const {
		availableToBorrow, totalDebt, totalCollateral
	} = useContext(AppDataContext);
  
  const data = {
    labels: [
      'Red',
      'Blue',
      'Yellow'
    ],
    plugins: {

    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    datasets: [{
      label: 'My First Dataset',
      data: [availableToBorrow(), totalCollateral > 0 ? totalCollateral : 1, totalDebt],
      backgroundColor: [
        '#2CC4FF',
        '#B9FFF1',
        '#3EE6C4'
      ],

    }]
  };
  const Options = {
    plugins: {
      tooltip: {
        enabled: true,
      }
    },
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: false,
  }
  return (
    <>
    <Box>
      <Doughnut
        data={data}
        width={220}
        height={220}
        options={Options}
      />
    </Box>
    </>
  )
}

const dollarFormatter = new Intl.NumberFormat('en-US', {});
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';


const renderActiveShape = (props: any) => {
  
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy-10} dy={8} textAnchor="middle" fill={payload.color} style={{fontSize: '10px'}}>
        {payload.name}
      </text>
        <text x={cx} y={cy+15} textAnchor="middle" fill={payload.color} style={{fontSize: '12px'}}>
        ${dollarFormatter.format(value)}
        </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={payload.color}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      {/* <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" /> */}
      {/* <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" /> */}
      {/* <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text> */}
      {/* <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text> */}
    </g>
  );
};

export function DonutChart2() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const {
		availableToBorrow, totalDebt, totalCollateral, dollarFormatter
	} = useContext(AppDataContext);

  const data = [
    { name: 'Available to Borrow', value: availableToBorrow(), color: '#D8D8D8' },
    { name: 'Total Debt', value: totalDebt, color: '#B9FFF1' },
    { name: 'Total Collateral', value: totalCollateral, color: '#00FFCB' }
  ];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  };

    return (
      <ResponsiveContainer width={'1000px'} height={1000}>
        <PieChart>
          <Pie
          width={1000}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#3EE6C4"
            dataKey="value"
            onMouseEnter={onPieEnter}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  
}
