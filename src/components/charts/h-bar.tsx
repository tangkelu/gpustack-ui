import { Bar } from '@ant-design/plots';

interface BarChartProps {
  data: any[];
  xField: string;
  yField: string;
  title?: string;
  height?: number;
  group?: boolean;
  colorField?: string;
  seriesField?: string;
  stack?: boolean;
  legend?: any;
}
const BarChart: React.FC<BarChartProps> = (props) => {
  const {
    data,
    xField,
    yField,
    title,
    height,
    group,
    colorField,
    seriesField,
    stack,
    legend = undefined
  } = props;
  const config = {
    data,
    xField,
    yField,
    colorField: colorField || 'name',
    direction: 'vertical',
    seriesField,
    height,
    group,
    stack,
    legend:
      legend === 'undefined'
        ? {
            color: {
              position: 'top',
              layout: {
                justifyContent: 'center'
              }
            }
          }
        : legend,
    scale: {
      x: {
        type: 'band',
        padding: 0.5
      }
    },
    axis: {
      x: {
        xAxis: true,
        tick: false
      },
      y: {
        tick: false
      }
    },
    title: {
      title,
      style: {
        align: 'center',
        titleFontSize: 14,
        titleFill: 'rgba(0,0,0,0.88)',
        titleFontWeight: 500
      }
    },
    split: {
      type: 'line',
      line: {
        style: {
          lineDash: [4, 5]
        }
      }
    },
    markBackground: {},
    style: {
      fill: (params: any) => {
        return (
          params.color ||
          'linear-gradient(90deg,rgba(84, 204, 152,0.8) 0%,rgb(0, 168, 143,.7) 100%)'
        );
      },
      radiusTopLeft: 12,
      radiusTopRight: 12,
      height: 20
    }
  };

  return (
    <>
      <Bar {...config} />
    </>
  );
};

export default BarChart;
