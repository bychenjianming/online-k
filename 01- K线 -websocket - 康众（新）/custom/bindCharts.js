//var eimgSrc = 'image://./custom/image/' //图片路径地址，此为页面同级下的image目录，注意前面的image:不要删除
var eimgSrc = 'image://./custom/image/';
//var eimgSrc = 'image://../static/web/scripts/custom/image/'; //生产环境中需调整路径
var WebServerURL = 'http://119.23.10.159:9527';
//var WebServerURL = 'http://127.0.0.1:5000'

var websocket_Url = WebServerURL + '/client';
var websocket_realPrice_Url = WebServerURL + '/realPrice';
var webSocket_Client; //
var websocket_realPrice_Client;

//point:小数位数，MaxMinAddVlaue:报表显示时，最大最小值增加的值，放大图表显示区间，优化体验,避免line触碰报表区域头底
var skinBlack = {
	backGroundColor: 'rgba(37, 38, 46, 1)',
	fontColor: 'rgba(255, 255, 255, 0.8)',
	splitLineColor: 'rgba(255, 255, 255, 0.1)',
	tooltip: {
		position: [12, 15]
	},
	grid: {
		left: 10,
		right: 15,
		top: 15,
		bottom: 10,
		containLabel: true,
	},
	lineChart: {
		series: {
			itemStyle: {
				normal: {
					color: 'rgba(33,147,202,1)',
					type: 'solid',

					width: 1,
					curveness: 0
				}
			},
			markLine: {
				lineStyle: {
					normal: {
						color: 'rgba(33,147,202,1)',

					}
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(28,66,88,1)'
					}, {
						offset: 1,
						color: 'rgba(28,66,88,0.2)'
					}])
				}
			},
			markPoint: {
				img: 'right_bgIMG_black.svg',
				symbolSize: [60, 20],
				symbolOffset: [32, 0],
				label: {
					normal: {
						offset: [-3, -3],
						textStyle: {

							color: 'rgba(255,255, 255, 1)',
							fontSize: 10
						}
					}

				},
			},
			effectScatter: {
				itemStyle: {

					normal: {
						color: 'rgba(255, 255, 255, 0.8)',
					}
				}
			}
		}
	},

	Candlestick: {
		series: {
			markPoint: {
				symbolSize: [60, 20],
				symbolOffset: [32, 0],
				label: {
					normal: {
						offset: [-3, -3],
						textStyle: {

							color: 'rgba(255,255, 255, 1)',
							fontSize: 10
						}
					}

				},
			},
		}
	}
};
var skinWhite = {
	backGroundColor: 'rgba(255, 255,255, 0)',
	fontColor: 'rgba(0, 0, 0, 0.8)',
	splitLineColor: 'rgba(212, 212, 212, 1)',
	tooltip: {
		position: [12, 35]
	},
	grid: {
		left: 10,
		right: 15,
		top: 15,
		bottom: 10,
		containLabel: true,
	},
	lineChart: {
		series: {
			itemStyle: {
				normal: {
					color: 'rgba(194,53,49, 1)',
					type: 'solid',
					width: 1,
					curveness: 0
				}
			},
			markLine: {
				lineStyle: {
					normal: {
						color: 'rgba(194,53,49, 0.8)',

					}
				}
			},
			areaStyle: {

			},

			markPoint: {
				img: 'right_bgIMG_white.svg',
				symbolSize: [60, 20],
				symbolOffset: [32, 0],
				label: {
					normal: {
						offset: [-3, -3],
						textStyle: {
							color: 'rgba(255,255, 255, 1)',
							fontSize: 10
						}
					}

				},
			},
			effectScatter: {
				itemStyle: {

					normal: {
						color: 'rgba(175, 0,0, 1)',
					}
				}
			}
		}
	},
	Candlestick: {
		series: {
			markPoint: {
				symbolSize: [60, 20],
				symbolOffset: [32, 0],
				label: {
					normal: {
						offset: [-3, -3],
						textStyle: {
							color: 'rgba(255,255, 255, 1)',
							fontSize: 10
						}
					}

				},
			},
		}
	}

};

var myChart_config = {
	"useRealTime": true,
	'candlestick_canMar': false,
	'skin': skinBlack,
	"symbolList": {
		"GOLD": {
			"point": 2,
			"MaxMinAddVlaue": 15
		},
		"US_OIL": {
			"point": 2,
			"MaxMinAddVlaue": 15
		},
		"UK_OIL": {
			"point": 2,
			"MaxMinAddVlaue": 5
		},
		"XPTUSD": {
			"point": 1,
			"MaxMinAddVlaue": 5
		},
		"XPDUSD": {
			"point": 1,
			"MaxMinAddVlaue": 5
		},
		"COPPER": {
			"point": 2,
			"MaxMinAddVlaue": 5
		},
		"NATGAS": {
			"point": 2,
			"MaxMinAddVlaue": 5
		},
		"SOYBEAN": {
			"point": 2,
			"MaxMinAddVlaue": 5
		},
		"XAGUSD": {
			"point": 3,
			"MaxMinAddVlaue": 5
		}
	}
};
var chart_Dom;

var JoinRoom_Ready = false;
var inBinding = false;
var is_iOS_Mobile = false;
var roomNameNow = "";
var tryCount = 0;

var edataSymbolPoint = 2;
var eMath_X_text_parm;

var eAxisFontSize = 10; //坐标轴文本大小
var eData_Candlestick_ZoomStart = 20; //数据缩放起始值
var eData_Candlestick_ZoomEnd = 100; //缩放比例结束值
var eData_Line_ZoomStart = 0;
var eData_Line_ZoomEnd = 100;
var eData_Sec_ZoomStart = 0; //暂未使用到
var eData_Sec_ZoomEnd = 100; //暂未使用到

var edata_Sec_initData = ""; //秒线原始数据源
var edata_Sec_Datas = []; //秒线数据 数据源
var edata_Sec_dataLen;
var edata_Sec_Index;
var edata_Sec_NowMarkLine = [];
var edata_Sec_NowRightSign = [];
var edata_Sec_NowRoundPoint = [];
var edata_Sec_FrontSec = new Date("2010/01/01"); //上次行情的最后更新时间
var edata_Sec_dataMax; //本商品最大Y值
var edata_Sec_dataMin; //本商品最小Y值

var edata_Line_datas = ""; //绑定line线用数据
var edata_Line_thisRealTimeData = ""; //用于存储上次最新实时数据
var edata_Line_LastHisData = ""; //用于存储上次历史最后一条数据
var edata_Line_NowMarkLine = [];
var edata_Line_NowRightSign = [];
var edata_Line_NowRoundPoint = [];
var edata_Line_dataMax; //本商品最大Y值
var edata_Line_dataMin; //本商品最小Y值

var edata_Candlestick_datas = ""; //绑定K线用数据
var edata_Candlestick_ThisRealTimeData = ""; //用于存储上次最新实时数据
var edata_Candlestick_LastHisData = ""; //用于存储上次历史最后一条数据
var edata_Candlestick_NowMarkLine = [];
var edata_Candlestick_NowRightSign = [];

//注意js的日期在初始化时，在部分浏览器下，不支持如 2011-11-11这样的格式，必须使用.2010/01/01

//判断访问终端
var browser = {
	versions: function() {
		var u = navigator.userAgent,
			app = navigator.appVersion;
		return {
			trident: u.indexOf('Trident') > -1, //IE内核
			presto: u.indexOf('Presto') > -1, //opera内核
			webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
			gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
			mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
			ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
			android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
			iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
			iPad: u.indexOf('iPad') > -1, //是否iPad
			webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
			weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
			qq: u.match(/\sQQ/i) == " qq" //是否QQ
		};
	}(),
	language: (navigator.browserLanguage || navigator.language).toLowerCase()
};

if(browser.versions.ios) {
	is_iOS_Mobile = true;
}

function getLocalTime(t) {
	//参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
	var i = 8;
	if(is_iOS_Mobile) i = 0;
	if(typeof i !== 'number') return;
	var d = new Date(t);
	//得到1970年一月一日到现在的秒数
	var len = d.getTime();
	//本地时间与GMT时间的时间偏移差
	var offset = d.getTimezoneOffset() * 60000;
	//得到现在的格林尼治时间
	var utcTime = len + offset;
	return new Date(utcTime + 3600000 * i);
}

function timeToNum(t) {
	//参数i为时区值数字，比如北京为东八区则输进8,西5输入-5

	var d = new Date(t.substr(0, 4), t.substr(5, 2), t.substr(8, 2), t.substr(11, 2), t.substr(14, 2), t.substr(17, 2));

	return Math.round(d.getTime() / 1000);
}

function bindChart_Sec(result) {
	edata_Sec_initData = result;
	edata_Sec_dataLen = edata_Sec_initData.datas.length;
	edata_Sec_Datas = edata_Sec_initData.datas;
	//备注：此处可以进行数据汇总

	edata_Sec_Index = edata_Sec_initData.dataIndex;

	edata_Sec_dataMax = edata_Sec_initData.dataMax + 1 / Math.pow(10, myChart_config.symbolList[$('#hid_chart_symbol').val()].point) * myChart_config.symbolList[$('#hid_chart_symbol').val()].MaxMinAddVlaue;
	edata_Sec_dataMin = edata_Sec_initData.dataMin - 1 / Math.pow(10, myChart_config.symbolList[$('#hid_chart_symbol').val()].point) * myChart_config.symbolList[$('#hid_chart_symbol').val()].MaxMinAddVlaue;

	edata_Sec_FrontSec = edata_Sec_Datas[edata_Sec_Index].value[0];

	bindData_Sec_NowLine();

	bindChart_Sec_2();

}

function bindChart_Sec_2() {

	option = {
		grid: myChart_config.skin.grid,
		backgroundColor: myChart_config.skin.backGroundColor, //背景颜色
		textStyle: {
			// color: 'rgba(255, 255, 255, 0.3)'
			color: myChart_config.skin.fontColor //文字颜色以及透明度
		},
		title: {
			text: ''
		},
		tooltip: { //浮动提示效果
			trigger: 'axis',
			formatter: function(params) {
				params = params[0];

				if(params.value[1] != '') {
					//	console.log(typeof(params.value[1]) )
					return params.value[0] + '，   价格：' + (params.value[1] * 1).toFixed(edataSymbolPoint);

				} else {
					return params.value[0];

				}
			},
			axisPointer: {
				animation: false
			},
			show: true,
			position: myChart_config.skin.tooltip.position
		},

		series: [

			{
				name: '0主场景',
				type: 'line',
				smooth: true,
				itemStyle: myChart_config.skin.lineChart.series.itemStyle,
				areaStyle: myChart_config.skin.lineChart.series.areaStyle,
				showSymbol: false,
				hoverAnimation: false,
				animation: false,
				animationDuration: 500,
				data: edata_Sec_Datas,
				markLine: {
					name: '2',
					silent: true,
					symbol: ['none', 'none'],
					precision: 'auto',
					label: {
						normal: {
							position: '',
							formatter: function(data) {
								return '';
							},
							inside: true,

						},
						emphasis: {
							show: false,
						},
					},

					data: edata_Sec_NowMarkLine,
					lineStyle: myChart_config.skin.lineChart.series.markLine.lineStyle,

				},
				markPoint: {

					symbol: eimgSrc + myChart_config.skin.lineChart.series.markPoint.img,
					symbolSize: myChart_config.skin.lineChart.series.markPoint.symbolSize,
					symbolOffset: myChart_config.skin.lineChart.series.markPoint.symbolOffset,
					data: edata_Sec_NowRightSign,
					animationDuration: 300,
					label: myChart_config.skin.lineChart.series.markPoint.label,
				}

			},

			{
				type: 'effectScatter',
				name: '1',
				zlevel: 11,
				coordinateSystem: 'cartesian2d',
				symbol: 'circle',
				symbolSize: 2,
				animation: false,
				animationDuration: 300,
				data: edata_Sec_NowRoundPoint,
				markPoint: {
					label: '',
				},
				itemStyle: myChart_config.skin.lineChart.series.effectScatter.itemStyle,
				rippleEffect: {
					period: 1.5,
					scale: 10,
					brushType: 'fill',

				}
			},

		],
		xAxis: {
			type: 'time',

			splitLine: {
				show: true,

				lineStyle: {
					type: 'dotted',
					color: myChart_config.skin.splitLineColor
				}
			},
			axisLabel: {
				show: true,
				margin: 4,

				formatter: function(value, index) {

					if(index < 5) {
						return getLocalTime(value).toTimeString().substring(0, 5);

					}
				},
				textStyle: {
					fontSize: eAxisFontSize,
				}
			},

		},
		yAxis: {
			type: 'value',
			boundaryGap: [1, 1],
			splitLine: {
				show: true,
				lineStyle: {
					type: 'dotted',
					color: myChart_config.skin.splitLineColor
				}
			},
			min: edata_Sec_dataMax,
			max: edata_Sec_dataMin,
			position: 'right',
			axisLabel: {
				formatter: function(value, index) {
					return(value).toFixed(edataSymbolPoint);
				},
				inside: false,
				rotate: 0,
				textStyle: {
					fontSize: eAxisFontSize,
				}
			},

		},
	};

	chart_Dom.setOption(option);
}

function bindData_Sec_NowLine() {

	bindData_Sec_NowLine_MarkLine();
	bindData_Sec_NowLine_roundPoint();
	bindData_Sec_NowLine_rightSign();

	function bindData_Sec_NowLine_MarkLine() {

		if(edata_Sec_NowMarkLine.length > 0) edata_Sec_NowMarkLine.shift();
		edata_Sec_NowMarkLine.push({
			xAxis: edata_Sec_Datas[edata_Sec_Index].value[0],
			yAxis: edata_Sec_Datas[edata_Sec_Index].value[1]
		})

	}

	function bindData_Sec_NowLine_roundPoint() {

		if(edata_Sec_NowRoundPoint.length > 0) edata_Sec_NowRoundPoint.shift();
		edata_Sec_NowRoundPoint.push([
			edata_Sec_Datas[edata_Sec_Index].value[0],
			edata_Sec_Datas[edata_Sec_Index].value[1]
		])

	}

	function bindData_Sec_NowLine_rightSign() {

		if(edata_Sec_NowRightSign.length > 0) edata_Sec_NowRightSign.shift();

		edata_Sec_NowRightSign.push({
			coord: [edata_Sec_Datas[edata_Sec_Index].value[0],
				(edata_Sec_Datas[edata_Sec_Index].value[1] * 1).toFixed(edataSymbolPoint)
			]
		});

	}

}

function bindData_Candlestick_NowLine() {

	bindData_Candlestick_NowLine_MarkLine();

	bindData_Candlestick_NowLine_rightSign();
	//console.log(edata_Candlestick_NowRightSign[0].coord)

	function bindData_Candlestick_NowLine_MarkLine() {

		if(edata_Candlestick_NowMarkLine.length > 0) edata_Candlestick_NowMarkLine.shift();
		//		if(edata_Candlestick_ThisRealTimeData == "") {
		//			return
		//		}
		//		edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1]
		if(edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][1] > edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][0]) {
			//阳线
			edata_Candlestick_NowMarkLine.push({
				xAxis: edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1],
				yAxis: edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][1],
				lineStyle: {
					normal: {
						color: 'rgba(194,53,49, 1)',
						type: 'solid',
						width: 1,
						curveness: 0,
						type: 'dashed'
					}
				},
			});

		} else {

			edata_Candlestick_NowMarkLine.push({
				xAxis: edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1],
				yAxis: edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][1],
				lineStyle: {
					normal: {
						color: 'rgba(57,156,13,1)',
						type: 'solid',
						width: 1,
						curveness: 0,
						type: 'dashed'
					}
				},
			})

		}

	}

	function bindData_Candlestick_NowLine_rightSign() {

		if(edata_Candlestick_NowRightSign.length > 0) edata_Candlestick_NowRightSign.shift();

		if(edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][1] > edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][0]) {
			//阳线
			edata_Candlestick_NowRightSign.push({
				coord: [edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1],
					edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][1]
				],
				symbol: eimgSrc + 'yang.svg',
			});
		} else {
			//阴线
			edata_Candlestick_NowRightSign.push({
				coord: [edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1],
					edata_Candlestick_datas.price_data[edata_Candlestick_datas.price_data.length - 1][1]
				],
				symbol: eimgSrc + 'yin.svg',
			});
		}

	}

}

function bindChart_Line() {

	edata_Line_dataMax = Math.max.apply(null, edata_Line_datas.price_data) + 1 / Math.pow(10, myChart_config.symbolList[$('#hid_chart_symbol').val()].point) * myChart_config.symbolList[$('#hid_chart_symbol').val()].MaxMinAddVlaue;
	edata_Line_dataMin = Math.min.apply(null, edata_Line_datas.price_data) - 1 / Math.pow(10, myChart_config.symbolList[$('#hid_chart_symbol').val()].point) * myChart_config.symbolList[$('#hid_chart_symbol').val()].MaxMinAddVlaue; //本商品最小Y值

	bindData_Line_NowLine();
	try {
		option = {
			grid: myChart_config.skin.grid,
			backgroundColor: myChart_config.skin.backGroundColor,
			textStyle: {

				color: myChart_config.skin.fontColor
			},
			title: {
				text: ''
			},
			tooltip: {
				trigger: 'axis',
				formatter: function(params, ticket, callback) {

					return params[0].name + "：" + (params[0].data).toFixed(edataSymbolPoint);
				},
				axisPointer: {
					type: 'line',
				},
				position: myChart_config.skin.tooltip.position
			},

			toolbox: {
				show: false,
				feature: {
					dataView: {
						show: true,
						readOnly: false
					},
					magicType: {
						show: true,
						type: ['line']
					},
					restore: {
						show: false
					},
					saveAsImage: {
						show: false
					}
				}
			},
			xAxis: {

				type: 'category',
				axisTick: {
					show: true,
					interval: 'auto',
					alignWithLabel: true,
				},
				boundaryGap: false,
				splitLine: {
					show: false,
					lineStyle: {
						type: 'dotted',
						color: myChart_config.skin.splitLineColor
					}
				},
				data: edata_Line_datas.time_data,
				axisLabel: {
					interval: function(index, value) {
						if(index == 0) {
							return true;
						}
						var texts = value.substring(11, 16);
						return math_X_text(texts);
					},
					formatter: function(value, index) {
						if(index == 0) {
							return '';
						}
						var texts = value.substring(11, 16);

						return texts;
					},
					textStyle: {
						fontSize: eAxisFontSize,
					},
					margin: 5
				},

			},
			yAxis: {
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dotted',
						color: myChart_config.skin.splitLineColor
					}
				},
				position: 'right',

				type: 'value',
				max: edata_Line_dataMax,
				min: edata_Line_dataMin,
				axisLabel: {
					formatter: function(value, index) {

						return value.toFixed(edataSymbolPoint);
					},
					textStyle: {
						fontSize: eAxisFontSize,
					}
				},

			},
			dataZoom: [{

				type: 'inside',
				disabled: true,
				start: eData_Line_ZoomStart,
				end: eData_Line_ZoomEnd
			}],
			series: [{
					name: $('#hid_chart_symbol').val(),
					type: 'line',
					smooth: true,
					animation: false,
					symbol: 'none',
					sampling: 'average',
					itemStyle: myChart_config.skin.lineChart.series.itemStyle,
					areaStyle: myChart_config.skin.lineChart.series.areaStyle,

					markLine: {
						name: '2',
						silent: true,
						animation: false,
						symbol: ['none', 'none'],
						precision: 'auto',
						label: {
							normal: {
								position: '',
								formatter: function(data) {
									return '';
								},
								inside: true,

							},
							emphasis: {
								show: false,
							},
						},

						data: edata_Line_NowMarkLine,
						lineStyle: myChart_config.skin.lineChart.series.markLine.lineStyle,

					},
					markPoint: {

						symbol: eimgSrc + myChart_config.skin.lineChart.series.markPoint.img,
						animation: false,
						symbolSize: myChart_config.skin.lineChart.series.markPoint.symbolSize,
						symbolOffset: myChart_config.skin.lineChart.series.markPoint.symbolOffset,
						data: edata_Line_NowRightSign,
						label: myChart_config.skin.lineChart.series.markPoint.label,
					},
					//markPointanimationDuration: 300,

					data: edata_Line_datas.price_data
				},
				{
					type: 'effectScatter',
					name: '1',
					zlevel: 11,
					coordinateSystem: 'cartesian2d',
					symbol: 'circle',
					symbolSize: 2,
					animation: false,
					animationDuration: 300,
					data: edata_Line_NowRoundPoint,
					markPoint: {
						label: '',
					},
					itemStyle: myChart_config.skin.lineChart.series.effectScatter.itemStyle,
					rippleEffect: {
						period: 1.5,
						scale: 10,
						brushType: 'fill',

					}
				},

			]
		};

		chart_Dom.setOption(option);
	} catch(e) {

		console.log("分时图绑定失败,重试...");

		//bindData_chart($('#hid_chart_parm').val());
	}
}

function bindData_Line_NowLine() {

	bindData_Line_NowLine_MarkLine();
	bindData_Line_NowLine_roundPoint();
	bindData_Line_NowLine_rightSign();

	function bindData_Line_NowLine_MarkLine() {

		if(edata_Line_NowMarkLine.length > 0) edata_Line_NowMarkLine.shift();
		edata_Line_NowMarkLine.push({
			xAxis: edata_Line_datas.time_data[edata_Line_datas.time_data.length - 1],
			yAxis: edata_Line_datas.price_data[edata_Line_datas.price_data.length - 1]
		});

	}

	function bindData_Line_NowLine_roundPoint() {

		if(edata_Line_NowRoundPoint.length > 0) edata_Line_NowRoundPoint.shift();
		edata_Line_NowRoundPoint.push([
			edata_Line_datas.time_data[edata_Line_datas.time_data.length - 1],
			edata_Line_datas.price_data[edata_Line_datas.price_data.length - 1]
		]);

	}

	function bindData_Line_NowLine_rightSign() {

		if(edata_Line_NowRightSign.length > 0) edata_Line_NowRightSign.shift();

		edata_Line_NowRightSign.push({
			coord: [edata_Line_datas.time_data[edata_Line_datas.time_data.length - 1],
				(edata_Line_datas.price_data[edata_Line_datas.price_data.length - 1]).toFixed(edataSymbolPoint)
			]
		});

	}

}

function bindChart_Candlestick() {
	bindData_Candlestick_NowLine();
	try {
		option = {
			grid: myChart_config.skin.grid,
			backgroundColor: myChart_config.skin.backGroundColor,
			textStyle: {

				color: myChart_config.skin.fontColor //文字颜色以及透明度
			},
			title: {
				text: ''
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				formatter: function(params, ticket, callback) {

					return params[0].name + "<br>" + "开盘：" + params[0].data[0].toFixed(edataSymbolPoint) + "<br>收盘：" + params[0].data[1].toFixed(edataSymbolPoint) + "<br>最低：" + params[0].data[2].toFixed(edataSymbolPoint) + "<br>最高：" + params[0].data[3].toFixed(edataSymbolPoint);
				},
				position: myChart_config.skin.tooltip.position
			},

			xAxis: {
				type: 'category',
				data: edata_Candlestick_datas.time_data,
				boundaryGap: true,
				//				axisLabel: {
				//
				//					formatter: function(value, index) {
				//						if(index == 0) {
				//							return ''
				//						}
				//						var texts = value.substring(11, 16)
				//
				//						return texts;
				//					},
				//					textStyle: {
				//						fontSize: eAxisFontSize,
				//					}
				//				},
				axisLabel: {
					interval: function(index, value) {
						if(index == 0) {
							return true;
						}
						var texts = value.substring(11, 16);
						return math_X_text(texts);
					},
					formatter: function(value, index) {
						if(index == 0) {
							return '';
						}
						var texts = value.substring(11, 16);

						return texts;
					},
					textStyle: {
						fontSize: eAxisFontSize,
					},
					margin: 5
				},
				axisTick: {
					show: true,

					alignWithLabel: true,
				},
				axisLine: {

					onZero: false
				},

				splitLine: {
					show: false,
					lineStyle: {
						type: 'dotted',
						color: myChart_config.skin.splitLineColor
					}
				},
				splitNumber: 20,
				min: 'dataMin',
				max: 'dataMax'
			},
			yAxis: {
				boundaryGap: true,
				position: 'right',
				scale: true,
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dotted',
						color: myChart_config.skin.splitLineColor
					}
				},
				splitArea: {
					show: false
				},
				min: 'dataMin',
				max: 'dataMax',
				axisLabel: {

					formatter: function(value, index) {

						return(value).toFixed(edataSymbolPoint);

					},
					textStyle: {
						fontSize: eAxisFontSize,
					},

				},
			},
			dataZoom: [{
				disabled: true, //类型为inside时，此属性无效，需要设置起止值来判定是否可以缩放
				type: 'inside',
				start: eData_Candlestick_ZoomStart,
				end: eData_Candlestick_ZoomEnd,
				zoomLock: true, //不允许缩放
			}],
			series: [{
					name: '烛线',
					type: 'candlestick',
					animation: false,
					data: edata_Candlestick_datas.price_data,
					itemStyle: {
						normal: {
							color: 'rgba(194,53,49, 0.8)', //阳线
							borderColor: 'rgba(194,53,49, 1)', //阳线
							color0: 'rgba(57,156,13,0.8)', //阴线
							borderColor0: 'rgba(57,156,13,1)', //阴线
						}
					},

					markLine: {
						name: '当前最新价格',
						animation: false,
						silent: true, //是否响应鼠标时间，true为不响应。
						//symbol: ['none', 'triangle'],
						symbol: ['none', 'none'],
						precision: 'auto',
						label: {
							normal: {
								position: '',

								formatter: function(data) {
									//	console.log(data.value);
									//	return data.value;
									return '';
								},
								inside: true,

							},
							emphasis: {
								show: false,
							},
						},
						data: edata_Candlestick_NowMarkLine,

					},
					markPoint: { //最新价格右侧标记
						//symbol: 'rect',
						animation: false,
						symbolSize: myChart_config.skin.Candlestick.series.markPoint.symbolSize,
						symbolOffset: myChart_config.skin.Candlestick.series.markPoint.symbolOffset,
						data: edata_Candlestick_NowRightSign,
						label: myChart_config.skin.Candlestick.series.markPoint.label,
					}
				},

				{
					name: 'MA5',
					type: 'line',
					data: calculateMA(5),
					smooth: true,
					lineStyle: {
						normal: {
							opacity: 0.5
						}
					}
				},
				{
					name: 'MA10',
					type: 'line',
					data: calculateMA(10),
					smooth: true,
					lineStyle: {
						normal: {
							opacity: 0.5
						}
					}
				},
				{
					name: 'MA20',
					type: 'line',
					data: calculateMA(20),
					smooth: true,
					lineStyle: {
						normal: {
							opacity: 0.5
						}
					}
				},

			]
		};
		chart_Dom.setOption(option);
	} catch(e) {
		console.log("蜡烛图绑定失败,重试...");
		//bindData_chart($('#hid_chart_parm').val());
	}
}

function bindData() {
	bindData_chart($('#hid_chart_parm').val());
}

function bindData_chart(min) {

	//	alert($('#hid_chart_parm').val())
	edataSymbolPoint = myChart_config.symbolList[$('#hid_chart_symbol').val()].point;
	inBinding = true;

	edata_Candlestick_datas = ""; //绑定K线用数据
	edata_Candlestick_ThisRealTimeData = ""; //用于存储上次最新实时数据
	edata_Candlestick_LastHisData = ""; //用于存储上次历史最后一条数据
	edata_Candlestick_NowMarkLine = [];
	edata_Candlestick_NowRightSign = [];

	edata_Sec_initData = ""; //秒线原始数据源
	edata_Sec_Datas = []; //秒线数据 数据源
	edata_Sec_NowMarkLine = [];
	edata_Sec_NowRightSign = [];
	edata_Sec_NowRoundPoint = [];

	edata_Line_datas = ""; //绑定line线用数据
	edata_Line_thisRealTimeData = ""; //用于存储最新实时数据
	edata_Line_LastHisData = ""; //用于存储上次历史最后一条数据
	edata_Line_NowMarkLine = [];
	edata_Line_NowRightSign = [];
	edata_Line_NowRoundPoint = [];

	$('#hid_chart_parm').val(min);
	eMath_X_text_parm = Math.abs(min);
	chart_Dom = echarts.init(document.getElementById('div_ShowChart'));

	change_room($('#hid_chart_symbol').val() + "#" + $('#hid_chart_parm').val());
	inBinding = false;
}

function math_X_text(data) {

	if(eMath_X_text_parm == 1) {
		if(data.substr(3, 2) % 15 == 0) {

			return true;
		} else {
			return false;

		}
	} else if(eMath_X_text_parm == 3) {
		if(data.substr(3, 2) % 30 == 0) {

			return true;
		} else {
			return false;

		}
	} else if(eMath_X_text_parm == 5) {

		if(data.substr(3, 2) % 60 == 0) {
			return true;
		} else {
			return false;

		}
	} else if(eMath_X_text_parm == 10) {

		if(data.substr(0, 2) % 2 == 0 && data.substr(3, 2) == 00) {

			return true;

		} else {
			return false;
		}
	} else if(eMath_X_text_parm == 15) {
		if(data.substr(0, 2) % 3 == 0 && data.substr(3, 2) == 00) {

			return true;
		} else {
			return false;

		}
	} else if(eMath_X_text_parm == 30) {
		if(data.substr(0, 2) % 4 == 0 && data.substr(3, 2) % 60 == 0) {

			return true;
		} else {
			return false;

		}
	} else if(eMath_X_text_parm == 60) {
		if(data.substr(0, 2) % 12 == 0 && data.substr(3, 2) % 60 == 0) {

			return true;
		} else {
			return false;

		}
	}
	return false;

}

function calculateMA(dayCount) {
	if(!myChart_config.candlestick_canMar) return [];
	var result = [];
	for(var i = 0, len = edata_Candlestick_datas.price_data.length; i < len; i++) {
		if(i < dayCount) {
			result.push('-');
			continue;
		}
		var sum = 0;
		for(var j = 0; j < dayCount; j++) {
			sum += edata_Candlestick_datas.price_data[i - j][1];
		}
		result.push(sum / dayCount);
	}
	return result;
}

function bindData_Symbol(symbol) {

	$('#hid_chart_symbol').val(symbol);

	bindData();
}

function RunWebSocketService() {

	webSocket_Client = io(websocket_Url);
	websocket_realPrice_Client = io(websocket_realPrice_Url);
}
RunWebSocketService();
//下面开始socket.io相关方法。

webSocket_Client.on('connect', function() {
	console.log("socket连接成功");
	webSocket_Client.emit('join_room', $('#hid_chart_symbol').val() + "#" + $('#hid_chart_parm').val(), function(data) {
		if(data == 1) {
			bindData_chart($('#hid_chart_parm').val());
			roomNameNow = $('#hid_chart_symbol').val() + "#" + $('#hid_chart_parm').val();
			console.log('已建立socket_client连接,并加入了默认房间' + $('#hid_chart_symbol').val() + "#" + $('#hid_chart_parm').val());
			JoinRoom_Ready = true;
		}

	});

});

//蜡烛线历史数据
webSocket_Client.on('data_Candlestick_his_getall', function(data) {
	if(data.parm == $('#hid_chart_parm').val() && data.symbol == $('#hid_chart_symbol').val()) {
		inBinding = true;
		//console.log("蜡烛线历史更新" + data.price_data[1][1])
		edata_Candlestick_ThisRealTimeData = "";
		edata_Candlestick_LastHisData = "";

		edata_Candlestick_datas = data;
		bindChart_Candlestick();

		inBinding = false;
	}
});

webSocket_Client.on('data_Candlestick_his_newOne', function(data) {
		if(edata_Candlestick_datas == "") return;
		if(data.parm == $('#hid_chart_parm').val() && data.symbol == $('#hid_chart_symbol').val()) {
			inBinding = true;
			edata_Candlestick_LastHisData = data;
			edata_Candlestick_ThisRealTimeData = "";
			//如果新数据=历史数据的最后一条，则去除历史数据最后一条，将新数据加进数组。
			if(edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1] == edata_Candlestick_LastHisData.time_data) {
				edata_Candlestick_datas.time_data.pop();
				edata_Candlestick_datas.price_data.pop();

			}
			edata_Candlestick_datas.time_data.shift();
			edata_Candlestick_datas.price_data.shift();
			edata_Candlestick_datas.time_data.push(edata_Candlestick_LastHisData.time_data);
			edata_Candlestick_datas.price_data.push(edata_Candlestick_LastHisData.price_data);

			//			console.log(edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1])
			bindChart_Candlestick();
			inBinding = false;
		}

	}

);

//蜡烛线实时更新
webSocket_Client.on('data_Candlestick_now_UP', function(data) {

	if(inBinding || typeof(data) == "undefined" || data == "" || data == null) {
		return;
	} //如果正在刷新数据，则放弃本次更新
	bindData_now_up_Candlestick(data);
});

//秒线历史更新
webSocket_Client.on('data_sec_his_getall', function(data) {
	//	console.log( data.symbol)
	if(data.parm == $('#hid_chart_parm').val() && data.symbol == $('#hid_chart_symbol').val()) {
		inBinding = true;
		edata_Sec_initData = "";
		bindChart_Sec(data);
		inBinding = false;
	}
});

//秒线新数据更新
webSocket_Client.on('data_sec_his_newOne', function(data) {

	if(edata_Sec_initData == "" || inBinding || JoinRoom_Ready == false) {
		return;
	}

	if($('#hid_chart_parm').val() == 0 && data.symbol == $('#hid_chart_symbol').val()) {
		//		console.log(data.value)

		if(edata_Sec_FrontSec == data.value[0] || edata_Sec_initData == "") {
			return;
		}
		edata_Sec_initData.datas.shift();
		edata_Sec_initData.datas.push({
			value: data.value
		});

		edata_Sec_initData.dataMax = data.dataMax;
		edata_Sec_initData.dataMin = data.dataMin;

		bindChart_Sec(edata_Sec_initData);
	}
});

//line线历史更新
webSocket_Client.on('data_line_his_getall', function(data) {

	if(data.parm == $('#hid_chart_parm').val() && data.symbol == $('#hid_chart_symbol').val()) {
		inBinding = true;
		edata_Line_thisRealTimeData = "";
		edata_Line_LastHisData = "";
		edata_Line_datas = data;

		bindChart_Line();
		inBinding = false;
	}
});
//line线历史新增
webSocket_Client.on('data_line_his_newOne', function(data) {
	if(edata_Line_datas == "" || JoinRoom_Ready == false) return;
	if(data.parm == $('#hid_chart_parm').val() && data.symbol == $('#hid_chart_symbol').val()) {
		inBinding = true;
		edata_Line_LastHisData = data;
		edata_Line_thisRealTimeData = "";
		//如果新数据=历史数据的最后一条，则去除历史数据最后一条，将新数据加进数组。
		if(edata_Line_datas.time_data[edata_Line_datas.time_data.length - 1] == edata_Line_LastHisData.time_data) {
			edata_Line_datas.time_data.pop();
			edata_Line_datas.price_data.pop();

		}
		edata_Line_datas.time_data.shift();
		edata_Line_datas.price_data.shift();
		edata_Line_datas.time_data.push(edata_Line_LastHisData.time_data);
		edata_Line_datas.price_data.push(edata_Line_LastHisData.price_data);

		bindChart_Line();
		inBinding = false;
	}

});
//line线实时更新
webSocket_Client.on('data_Line_now_UP', function(data) {

	if(inBinding || typeof(data) == "undefined" || data == "" || data == null) {
		return;
	}

	if(data.parm == $('#hid_chart_parm').val() && data.symbol == $('#hid_chart_symbol').val()) {

		bindData_now_up_Line(data);

	}
});
webSocket_Client.on('data_day_his_getall', function(data) {

	$('#s_closePrice_yed').html(data.closePrice_yed);
	$('#s_maxPrice_today').html(data.maxPrice_today);
	$('#s_minPrice_today').html(data.minPrice_today);
	$('#s_openPrice_today').html(data.openPrice_today);
	$('#s_closePrice_today').html(data.closePrice_today);

	if($('#s_closePrice_yed').html() == "0") {

		$('#s_closePrice_yed').html("--");
	}
	if($('#s_maxPrice_today').html() == "0") {
		$('#s_maxPrice_today').html("--");
	}
	if($('#s_minPrice_today').html() == "0") {
		$('#s_minPrice_today').html("--");
	}
	if($('#s_openPrice_today').html() == "0") {
		$('#s_openPrice_today').html("--");
	}
	if($('#s_closePrice_today').html() == "0") {
		$('#s_closePrice_today').html("--");
	}

});
webSocket_Client.on('nodata', function() {
	console.log('服务端未初始化成功，3秒后重试');
	tryCount++;
	if(tryCount > 4) {
		return;
	}
	setTimeout(function() {
		change_room($('#hid_chart_symbol').val() + "#" + $('#hid_chart_parm').val())

	}, 3000);
});

webSocket_Client.on('disconnect', function() {

	console.log("客户端连接中断");
});

function change_room(roomName) {

	if(JoinRoom_Ready == false) {
		return;
	} else if(roomNameNow == roomName) {
		webSocket_Client.emit('re_room', roomName);

	} else {
		// edata_Candlestick_ThisRealTimeData = ""; //将最后一次最新数据初始化为空
		webSocket_Client.emit('change_room', roomName);
		roomNameNow = roomName;
	}
	//	console.log('更换房间为:' + roomName)
}

function bindData_now_up_Candlestick(data) {

	if(edata_Candlestick_datas == "") return;

	//console.log('edata_Candlestick_LastHisData:'+edata_Candlestick_LastHisData)
	//如果历史数据未更新过，或最新的数据大于历史数据最后更新时间
	if((edata_Candlestick_LastHisData == "" || timeToNum(data.time_data) > timeToNum(edata_Candlestick_LastHisData.time_data)) && (timeToNum(data.time_data) >= timeToNum(edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1]))) {
		edata_Candlestick_ThisRealTimeData = data;

		//			alert(new Date(data.time_data).getTime() )

		//如果新数据=历史数据的最后一条，则去除历史数据最后一条，将新数据加进数组。
		if(edata_Candlestick_datas.time_data[edata_Candlestick_datas.time_data.length - 1] == edata_Candlestick_ThisRealTimeData.time_data) {
			//console.log('删除了')
			edata_Candlestick_datas.time_data.pop();
			edata_Candlestick_datas.price_data.pop();
		}

		edata_Candlestick_datas.time_data.push(edata_Candlestick_ThisRealTimeData.time_data);
		edata_Candlestick_datas.price_data.push(edata_Candlestick_ThisRealTimeData.price_data);
		bindChart_Candlestick();

		//其他情况不处理，因为可能网络延迟导致新数据其实是老数据，老数据则自动过滤掉。
	}
}

function bindData_now_up_Line(data) {
	if(edata_Line_datas == "") return;

	//console.log('edata_Candlestick_LastHisData:'+edata_Candlestick_LastHisData)
	//如果历史数据未更新过，或最新的数据大于历史数据最后更新时间
	if((edata_Line_LastHisData == "" || timeToNum(data.time_data) > ntimeToNum(edata_Line_LastHisData.time_data)) && (timeToNum(data.time_data) >= timeToNum(edata_Line_datas.time_data[edata_Line_datas.time_data.length - 1]))) {
		edata_Line_thisRealTimeData = data;

		//如果新数据=历史数据的最后一条，则去除历史数据最后一条，将新数据加进数组。
		if(edata_Line_datas.time_data[edata_Line_datas.time_data.length - 1] == edata_Line_thisRealTimeData.time_data) {

			edata_Line_datas.time_data.pop();
			edata_Line_datas.price_data.pop();

		}

		edata_Line_datas.time_data.push(edata_Line_thisRealTimeData.time_data);
		edata_Line_datas.price_data.push(edata_Line_thisRealTimeData.price_data);
		bindChart_Line();

	}

}

function bindData_now_up_day(price) {
	$('#s_closePrice_today').html(price);

	if($('#s_minPrice_today').html() == '--') {

		$('#s_minPrice_today').html(price);
	}
	if($('#s_maxPrice_today').html() == '--') {

		$('#s_maxPrice_today').html(price);
	}

	if(price < $('#s_minPrice_today').html()) {

		$('#s_minPrice_today').html(price);

	}
	if(price > $('#s_maxPrice_today').html()) {

		$('#s_maxPrice_today').html(price);

	}

}

//下面开始socket.io相关方法。

websocket_realPrice_Client.on('connect', function() {

	console.log('已建立socket_realPrice连接');
});

websocket_realPrice_Client.on('data_realPrice', function(data) {
	//console.log(data.symbol)
	if(data.symbol == $('#hid_chart_symbol').val()) {

		bindData_now_up_day(data.price);
	}

	//以下品种需根据具体客户品种自行配置
	bindData_realPrice(data);
});
websocket_realPrice_Client.on('disconnect', function() {
	JoinRoom_Ready = false;
	console.log('已断开socket_realPrice连接');
});

function bindSkin(data) {
	if(data == 0) {
		myChart_config.skin = skinWhite;
		bindData();

	} else {
		myChart_config.skin = skinBlack;
		bindData();
	}
}

function bindData_realPrice(data) {

	 
try{
	realTimePrice_Bind(data.symbol,data.price);
}
catch(e){}
	 

}